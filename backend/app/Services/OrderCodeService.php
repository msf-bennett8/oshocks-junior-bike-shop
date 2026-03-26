<?php

namespace App\Services;

use Illuminate\Support\Str;

class OrderCodeService
{
    private BennettFibonacci36thCodec $codec;
    
    public function __construct()
    {
        $this->codec = new BennettFibonacci36thCodec();
    }
    
    /**
     * Generate raw order code: YMDHM + random
     * Format: ACQPFDAQ7P (10 chars)
     * A=Year(2026), C=Month(3), Q=Day(27), P=Hour(15), F=MinuteBlock(50-59), A=ExactMin(0-9), Q7P=Random
     */
    public function generateOrderCode(): string
    {
        $now = now();
        
        // Year: 2026 = A (offset so that 2026 is the base year)
        $year = $this->toBase36($now->year - 2026); // 2026-2026=0=A, 2027=1=B, etc.
        
        // Month: 1-12 mapped to A-L (1=A, 2=B, 3=C, etc.)
        $month = $this->toBase36($now->month - 1); // 0-11 -> A-L
        
        // Day: 1-31 mapped using 0-9,A-Z alphabet (1=1, 10=A, 26=Q, 31=V)
        $day = $this->toBase36WithNumbers($now->day); // 1-31 -> 1-9,A-V
        
        // Hour: 0-23 mapped to A-X (0=A, 1=B, ... 23=X)
        $hour = $this->toBase36($now->hour); // 0-23 -> A-X
        
        // Minute block: A(0-9), B(10-19), C(20-29), D(30-39), E(40-49), F(50-59)
        $minute = $now->minute;
        $minuteBlock = match(true) {
            $minute < 10 => 'A',
            $minute < 20 => 'B',
            $minute < 30 => 'C',
            $minute < 40 => 'D',
            $minute < 50 => 'E',
            default => 'F',
        };
        
        // Exact minute within block (0-9) mapped to A-J
        $exactMinute = $minute % 10;
        $exactMinuteChar = $this->toBase36($exactMinute); // 0=A, 1=B, 2=C, ..., 9=J
        
        // Random 4 chars (letters preferred, max 2 numbers in last 4)
        $random = $this->generateRandom(4);
        
        return $year . $month . $day . $hour . $minuteBlock . $exactMinuteChar . $random;
    }
    
    /**
     * Generate transaction code (same format as order code)
     */
    public function generateTransactionCode(): string
    {
        return $this->generateOrderCode();
    }
    
    /**
     * Encode order code for display
     */
    public function encodeForDisplay(string $orderCode): string
    {
        return $this->codec->encode($orderCode);
    }
    
    /**
     * Decode display code back to order code
     */
    public function decodeDisplay(string $encoded): string
    {
        return $this->codec->decode($encoded);
    }
    
    /**
     * Generate routing ID: ROLE-DIRECTION-METHOD
     * Examples: SA-PIN-STK, DA-PIN-COD, CU-PIN-CRD
     */
    public function generateRoutingId(string $role, string $direction, string $method): string
    {
        $roleCode = match($role) {
            'delivery_agent' => 'DA',
            'shop_attendant' => 'SA',
            'seller' => 'SL',
            'system' => 'SY',
            'customer' => 'CU',
            default => 'UN',
        };
        
        $directionCode = match($direction) {
            'purchase' => 'PUR',
            'pay_in' => 'PIN',
            'payout' => 'POT',
            'refund' => 'REF',
            default => 'UNK',
        };
        
        $methodCode = match($method) {
            'mpesa', 'mpesa_stk' => 'STK',
            'card' => 'CRD',
            'cod', 'cash' => 'COD',
            'bank_transfer' => 'BNK',
            default => 'UNK',
        };
        
        return "{$roleCode}{$directionCode}{$methodCode}";
    }
    
    /**
     * Parse routing ID
     */
    public function parseRoutingId(string $routingId): array
    {
        if (strlen($routingId) !== 9) {
            return ['role' => 'UN', 'direction' => 'UNK', 'method' => 'UNK'];
        }
        
        return [
            'role' => substr($routingId, 0, 2),
            'direction' => substr($routingId, 2, 3),
            'method' => substr($routingId, 5, 3),
        ];
    }
    
    /**
     * Generate full purchase ID
     */
    public function generatePurchaseId(
        string $orderDisplay,
        string $transactionId,
        string $routingId,
        string $locationCode
    ): string {
        return "{$orderDisplay}-{$transactionId}-{$routingId}-{$locationCode}";
    }
    
    /**
     * Convert number to Base36 using A-Z only encoding
     * 0=A, 1=B, 2=C, ... 25=Z
     * For year, month, hour, minute (values 0-25 max)
     */
    private function toBase36(int $num): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Ensure number is within 0-25 range for single character A-Z
        $num = $num % 26;
        
        return $alphabet[$num];
    }
    
    /**
     * Convert number to Base36 using 0-9,A-Z alphabet
     * 0=0, 1=1, ... 9=9, 10=A, 11=B, ... 35=Z
     * For day (1-31) which needs values up to 31
     */
    private function toBase36WithNumbers(int $num): string
    {
        $alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        // Ensure single character (0-35 range)
        $num = max(0, min(35, $num));
        
        return $alphabet[$num];
    }
    
    /**
     * Generate random string (letters preferred, max 2 numbers in last 4)
     */
    private function generateRandom(int $length): string
    {
        $letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $numbers = '0123456789';
        $all = $letters . $numbers;
        
        $result = '';
        $numberCount = 0;
        
        for ($i = 0; $i < $length; $i++) {
            // Prefer letters for first chars, allow numbers in last 2 positions
            if ($i < $length - 2) {
                $result .= $letters[random_int(0, 25)];
            } else {
                // Last 2 can be numbers or letters
                $char = $all[random_int(0, 35)];
                $result .= $char;
                if (is_numeric($char)) {
                    $numberCount++;
                }
            }
        }
        
        return $result;
    }
}