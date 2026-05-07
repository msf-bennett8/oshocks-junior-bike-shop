<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * Support Case ID Generator using Bennett-Fibonacci-36th Codec principles
 * 
 * Format: AETRUHB7KPL (10 characters + 3 random alpha = 13 chars)
 * 
 * Position breakdown:
 * A = Year (A=2026, B=2027, C=2028...)
 * E = Month (A=Jan, B=Feb, C=Mar, D=Apr, E=May...)
 * T = Date (1-31 mapped to A-Z, AA, AB...)
 * R = Hour (00=A, 01=B... 23=X)
 * U = Minute tens (0=A, 1=B, 2=C, 3=D, 4=E, 5=F)
 * H = Minute ones (0=A, 1=B... 9=J)
 * B = Last digit of minute (0-9)
 * 7 = Case type (7=Order, 5=Account, 3=Report, 8=Delivery)
 * KPL = Random 3-letter alphabet suffix
 */
class SupportCaseIdService
{
    /**
     * Case type digit mappings
     */
    public const CASE_TYPE_DIGITS = [
        'order_issue'       => '7',
        'account_help'      => '5',
        'report_problem'    => '3',
        'delivery_question' => '8',
    ];

    /**
     * Generate a unique support case ID
     */
    public function generate(string $caseType, ?Carbon $timestamp = null): string
    {
        $ts = $timestamp ?? now();

        // Validate case type
        if (!isset(self::CASE_TYPE_DIGITS[$caseType])) {
            throw new \InvalidArgumentException("Invalid case type: {$caseType}");
        }

        $yearCode      = $this->encodeYear($ts->year);
        $monthCode     = $this->encodeMonth($ts->month);
        $dateCode      = $this->encodeDate($ts->day);
        $hourCode      = $this->encodeHour($ts->hour);
        $minuteTens    = $this->encodeMinuteTens(intdiv($ts->minute, 10));
        $minuteOnes    = $this->encodeMinuteOnes($ts->minute % 10);
        $lastDigit     = (string)($ts->minute % 10);
        $typeDigit     = self::CASE_TYPE_DIGITS[$caseType];
        $randomSuffix  = $this->generateRandomAlpha(3);

        return "{$yearCode}{$monthCode}{$dateCode}{$hourCode}{$minuteTens}{$minuteOnes}{$lastDigit}{$typeDigit}{$randomSuffix}";
    }

    /**
     * Year: 2026=A, 2027=B, 2028=C...
     */
    private function encodeYear(int $year): string
    {
        $offset = $year - 2026;
        if ($offset < 0 || $offset > 25) {
            throw new \InvalidArgumentException("Year {$year} out of supported range (2026-2051)");
        }
        return chr(ord('A') + $offset);
    }

    /**
     * Month: Jan=A, Feb=B, Mar=C...
     */
    private function encodeMonth(int $month): string
    {
        if ($month < 1 || $month > 12) {
            throw new \InvalidArgumentException("Invalid month: {$month}");
        }
        return chr(ord('A') + ($month - 1));
    }

    /**
     * Date: 1=A, 2=B... 26=Z, 27=AA, 28=AB, 29=AC, 30=AD, 31=AE
     */
    private function encodeDate(int $day): string
    {
        if ($day < 1 || $day > 31) {
            throw new \InvalidArgumentException("Invalid day: {$day}");
        }

        // Simple base-26 encoding for dates
        if ($day <= 26) {
            return chr(ord('A') + ($day - 1));
        }

        // 27+ = AA, AB, AC...
        $first = chr(ord('A')); // 'A'
        $second = chr(ord('A') + ($day - 27));
        return $first . $second;
    }

    /**
     * Hour: 00=A, 01=B... 23=X
     */
    private function encodeHour(int $hour): string
    {
        if ($hour < 0 || $hour > 23) {
            throw new \InvalidArgumentException("Invalid hour: {$hour}");
        }
        return chr(ord('A') + $hour);
    }

    /**
     * Minute tens: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F
     */
    private function encodeMinuteTens(int $tens): string
    {
        if ($tens < 0 || $tens > 5) {
            throw new \InvalidArgumentException("Invalid minute tens: {$tens}");
        }
        return chr(ord('A') + $tens);
    }

    /**
     * Minute ones: 0=A, 1=B... 9=J
     */
    private function encodeMinuteOnes(int $ones): string
    {
        if ($ones < 0 || $ones > 9) {
            throw new \InvalidArgumentException("Invalid minute ones: {$ones}");
        }
        return chr(ord('A') + $ones);
    }

    /**
     * Generate random alphabetic suffix
     */
    private function generateRandomAlpha(int $length): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $result = '';
        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[random_int(0, 25)];
        }
        return $result;
    }

    /**
     * Parse a case ID to extract metadata
     */
    public function parse(string $caseId): array
    {
        if (strlen($caseId) !== 13) {
            throw new \InvalidArgumentException("Invalid case ID length");
        }

        $yearOffset = ord($caseId[0]) - ord('A');
        $year = 2026 + $yearOffset;

        $month = (ord($caseId[1]) - ord('A')) + 1;

        // Date parsing (handle single or double char)
        $datePart = substr($caseId, 2, 2);
        if (strlen($datePart) === 2 && $datePart[0] === 'A' && ord($datePart[1]) >= ord('A')) {
            $day = 27 + (ord($datePart[1]) - ord('A'));
        } else {
            $day = (ord($caseId[2]) - ord('A')) + 1;
        }

        $hour = ord($caseId[3]) - ord('A');
        $minuteTens = ord($caseId[4]) - ord('A');
        $minuteOnes = ord($caseId[5]) - ord('A');
        $lastDigit = (int)$caseId[6];
        $typeDigit = $caseId[7];

        $typeMap = array_flip(self::CASE_TYPE_DIGITS);
        $caseType = $typeMap[$typeDigit] ?? 'unknown';

        return [
            'year' => $year,
            'month' => $month,
            'day' => $day,
            'hour' => $hour,
            'minute' => ($minuteTens * 10) + $minuteOnes,
            'case_type' => $caseType,
            'type_digit' => $typeDigit,
            'random_suffix' => substr($caseId, 8),
            'timestamp_approx' => sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, ($minuteTens * 10) + $minuteOnes),
        ];
    }

    /**
     * Check if case ID format is valid
     */
    public function isValid(string $caseId): bool
    {
        if (strlen($caseId) !== 13) return false;
        
        // Check positions 0-6 are letters (A-Z)
        for ($i = 0; $i <= 6; $i++) {
            if (!ctype_alpha($caseId[$i])) return false;
        }
        
        // Position 6 is actually a digit (last digit of minute)
        if (!ctype_digit($caseId[6])) return false;
        
        // Position 7 is case type digit
        if (!isset(array_flip(self::CASE_TYPE_DIGITS)[$caseId[7]])) return false;
        
        // Positions 8-10 are letters
        for ($i = 8; $i <= 10; $i++) {
            if (!ctype_alpha($caseId[$i])) return false;
        }
        
        return true;
    }
}
