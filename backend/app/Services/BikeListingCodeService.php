<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Bike Listing Code Generator using Bennett Fibonacci 36th Codec
 * Format: AFBDTJQI5NJX (12 characters, no prefix)
 *
 * Position breakdown (before encoding):
 * 0     = Year (A=2026, B=2027...)
 * 1     = Month (A=Jan, B=Feb, C=Mar, D=Apr, E=May...)
 * 2-3   = Date (A=1, B=2... Z=26, AA=27, AB=28, AC=29, AD=30, AE=31)
 * 4     = Hour (A=00, B=01... X=23)
 * 5     = Minute tens (0=A, 1=B, 2=C, 3=D, 4=E, 5=F)
 * 6     = Minute ones (0=A, 1=B... 9=J)
 * 7     = Type digit (6=bike_listing)
 * 8-11  = Random 4-char suffix (A-Z, 0-9)
 */
class BikeListingCodeService
{
    private BennettFibonacci36thCodec $codec;

    public function __construct()
    {
        $this->codec = new BennettFibonacci36thCodec();
    }

    public function generate(?Carbon $timestamp = null): string
    {
        $ts = $timestamp ?? now();

        $yearCode     = $this->encodeYear($ts->year);
        $monthCode    = $this->encodeMonth($ts->month);
        $dateCode     = $this->encodeDate($ts->day);
        $hourCode     = $this->encodeHour($ts->hour);
        $minuteTens   = $this->encodeMinuteTens(intdiv($ts->minute, 10));
        $minuteOnes   = $this->encodeMinuteOnes($ts->minute % 10);
        $typeDigit    = '6'; // Always '6' for bike listings
        $randomSuffix = $this->generateRandomAlpha(4);

        // Raw 12-character input for Bennett codec
        $rawInput = "{$yearCode}{$monthCode}{$dateCode}{$hourCode}{$minuteTens}{$minuteOnes}{$typeDigit}{$randomSuffix}";

        // Encode via Bennett Fibonacci 36th
        $listingCode = $this->codec->encode($rawInput);

        // Collision check with retry
        if (DB::table('products')->where('listing_code', $listingCode)->exists()) {
            return $this->generate($ts->copy()->addSecond());
        }

        return $listingCode;
    }

    public function parse(string $listingCode): array
    {
        if (strlen($listingCode) !== 12) {
            throw new \InvalidArgumentException("Invalid listing code length: expected 12, got " . strlen($listingCode));
        }

        $decoded = $this->codec->decode($listingCode);

        $yearOffset = ord($decoded[0]) - ord('A');
        $year = 2026 + $yearOffset;
        $month = (ord($decoded[1]) - ord('A')) + 1;

        $datePart = substr($decoded, 2, 2);
        if (strlen($datePart) === 2 && $datePart[0] === 'A' && ctype_alpha($datePart[1])) {
            $day = 27 + (ord($datePart[1]) - ord('A'));
        } else {
            $day = (ord($decoded[2]) - ord('A')) + 1;
        }

        $hour = ord($decoded[4]) - ord('A');
        $minuteTens = ord($decoded[5]) - ord('A');
        $minuteOnes = ord($decoded[6]) - ord('A');

        return [
            'year' => $year,
            'month' => $month,
            'day' => $day,
            'hour' => $hour,
            'minute' => ($minuteTens * 10) + $minuteOnes,
            'type_digit' => $decoded[7],
            'random_suffix' => substr($decoded, 8),
            'timestamp_approx' => sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, ($minuteTens * 10) + $minuteOnes),
        ];
    }

    public function isValid(string $listingCode): bool
    {
        if (strlen($listingCode) !== 12) return false;
        if (!ctype_alnum($listingCode)) return false;
        return true;
    }

    // --- Encoding helpers ---

    private function encodeYear(int $year): string
    {
        $offset = $year - 2026;
        if ($offset < 0 || $offset > 25) {
            throw new \InvalidArgumentException("Year {$year} out of supported range (2026-2051)");
        }
        return chr(ord('A') + $offset);
    }

    private function encodeMonth(int $month): string
    {
        if ($month < 1 || $month > 12) {
            throw new \InvalidArgumentException("Invalid month: {$month}");
        }
        return chr(ord('A') + ($month - 1));
    }

    private function encodeDate(int $day): string
    {
        if ($day < 1 || $day > 31) {
            throw new \InvalidArgumentException("Invalid day: {$day}");
        }
        if ($day <= 26) {
            return chr(ord('A') + ($day - 1));
        }
        $first = 'A';
        $second = chr(ord('A') + ($day - 27));
        return $first . $second;
    }

    private function encodeHour(int $hour): string
    {
        if ($hour < 0 || $hour > 23) {
            throw new \InvalidArgumentException("Invalid hour: {$hour}");
        }
        return chr(ord('A') + $hour);
    }

    private function encodeMinuteTens(int $tens): string
    {
        if ($tens < 0 || $tens > 5) {
            throw new \InvalidArgumentException("Invalid minute tens: {$tens}");
        }
        return chr(ord('A') + $tens);
    }

    private function encodeMinuteOnes(int $ones): string
    {
        if ($ones < 0 || $ones > 9) {
            throw new \InvalidArgumentException("Invalid minute ones: {$ones}");
        }
        return chr(ord('A') + $ones);
    }

    private function generateRandomAlpha(int $length): string
    {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $result = '';
        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[random_int(0, 35)];
        }
        return $result;
    }
}
