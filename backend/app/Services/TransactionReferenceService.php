<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionReferenceService
{
    /**
     * Generate a unique transaction reference
     * Format: {METHOD}-{RECORDER_CODE}-{COUNTY}-{ZONE}-{YYYYMMDD}-{HHMMSS}-{SEQ}
     * Example: CASH-DA001-NAIROBI-UpperHill-20231104-143052-001
     * 
     * @param string $paymentMethod (cash, mpesa_manual, bank_transfer, mpesa_stk, flutterwave)
     * @param string $recorderCode (e.g., DA001, SA005, SL023)
     * @param string $county (e.g., Nairobi County, Kiambu County)
     * @param string $zone (e.g., Upper Hill, Westlands, Kahawa West)
     * @return string
     */
    public static function generate(
        string $paymentMethod,
        string $recorderCode,
        string $county,
        string $zone
    ): string {
        // Format date and time
        $date = Carbon::now();
        $dateStr = $date->format('Ymd'); // 20231104
        $timeStr = $date->format('His'); // 143052
        
        // Get daily sequence number for this recorder
        $sequence = self::getDailySequence($recorderCode, $date);
        
        // Map payment method to short code
        $methodCode = self::getMethodCode($paymentMethod);
        
        // Clean county name (remove "County" suffix)
        $countyClean = self::cleanCountyName($county);
        
        // Clean zone name (remove special characters, keep alphanumeric)
        $zoneClean = self::cleanZoneName($zone);
        
        // Build transaction reference
        return sprintf(
            '%s-%s-%s-%s-%s-%s-%s',
            $methodCode,
            $recorderCode,
            $countyClean,
            $zoneClean,
            $dateStr,
            $timeStr,
            $sequence
        );
    }
    
    /**
     * Get the daily sequence number for a recorder
     * 
     * @param string $recorderCode
     * @param Carbon $date
     * @return string (zero-padded 3 digits)
     */
    private static function getDailySequence(string $recorderCode, Carbon $date): string
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();
        
        // Count payments today by this recorder
        $count = Payment::whereHas('recordedBy.paymentRecorder', function($query) use ($recorderCode) {
            $query->where('recorder_code', $recorderCode);
        })
        ->whereBetween('created_at', [$startOfDay, $endOfDay])
        ->count();
        
        // Return next sequence (padded to 3 digits)
        return str_pad($count + 1, 3, '0', STR_PAD_LEFT);
    }
    
    /**
     * Map payment method to short code
     * 
     * @param string $paymentMethod
     * @return string
     */
    private static function getMethodCode(string $paymentMethod): string
    {
        $methodMap = [
            'cash' => 'CASH',
            'mpesa_manual' => 'MPESA',
            'mpesa_stk' => 'MPESA',
            'bank_transfer' => 'BANK',
            'flutterwave' => 'CARD',
            'card' => 'CARD',
        ];
        
        return $methodMap[$paymentMethod] ?? 'OTHER';
    }
    
    /**
     * Clean county name for transaction reference
     * Remove "County" suffix and spaces
     * 
     * @param string $county
     * @return string
     */
    private static function cleanCountyName(string $county): string
    {
        // Remove "County" suffix
        $clean = str_replace(' County', '', $county);
        
        // Remove spaces and convert to uppercase
        $clean = strtoupper(str_replace(' ', '', $clean));
        
        // Handle special cases
        $countyMap = [
            'NAIROBI' => 'NAIROBI',
            'KIAMBU' => 'KIAMBU',
            'MACHAKOS' => 'MACHAKOS',
            'KAJIADO' => 'KAJIADO',
            'OTHER(ARRANGEOWNCOURIER)' => 'OTHER',
        ];
        
        return $countyMap[$clean] ?? $clean;
    }
    
    /**
     * Clean zone name for transaction reference
     * Remove special characters, keep only alphanumeric
     * 
     * @param string $zone
     * @return string
     */
    private static function cleanZoneName(string $zone): string
    {
        // If zone contains " - ", extract the location name after it
        if (strpos($zone, ' - ') !== false) {
            $parts = explode(' - ', $zone);
            $zone = $parts[1] ?? $parts[0]; // Use location name if available
        }
        
        // Remove anything in parentheses (e.g., "Zone 1 (0-5km)" -> "Zone 1")
        $zone = preg_replace('/\s*\([^)]*\)/', '', $zone);
        
        // Remove special characters, keep only alphanumeric and spaces
        $zone = preg_replace('/[^a-zA-Z0-9\s]/', '', $zone);
        
        // Remove spaces and convert to PascalCase for readability
        $zone = str_replace(' ', '', ucwords(strtolower($zone)));
        
        // Limit to 15 characters to keep reference manageable
        return substr($zone, 0, 15);
    }
    
    /**
     * Validate that a transaction reference is unique
     * 
     * @param string $reference
     * @return bool
     */
    public static function isUnique(string $reference): bool
    {
        return !Payment::where('transaction_reference', $reference)->exists();
    }
    
    /**
     * Parse a transaction reference into its components
     * 
     * @param string $reference
     * @return array
     */
    public static function parse(string $reference): array
    {
        $parts = explode('-', $reference);
        
        if (count($parts) < 7) {
            return [
                'valid' => false,
                'error' => 'Invalid reference format'
            ];
        }
        
        return [
            'valid' => true,
            'method' => $parts[0],
            'recorder_code' => $parts[1],
            'county' => $parts[2],
            'zone' => $parts[3],
            'date' => $parts[4],
            'time' => $parts[5],
            'sequence' => $parts[6],
        ];
    }
}