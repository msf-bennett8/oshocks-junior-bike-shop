<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Booking ID Generator
 * Format: AEMUEE2KPLX (11 characters)
 *
 * Position breakdown:
 * A = Year (A=2026, B=2027...)
 * E = Month (A=Jan, B=Feb, C=Mar, D=Apr, E=May...)
 * M = Date (1=A, 2=B... 26=Z, 27=AA, 28=AB, 29=AC, 30=AD, 31=AE)
 * U = Hour (00=A, 01=B... 23=X)
 * E = Minute tens (0=A, 1=B, 2=C, 3=D, 4=E, 5=F)
 * E = Minute ones (0=A, 1=B... 9=J)
 * 2 = Type digit (2=services_booking)
 * KPLX = Random 4-letter alphabet suffix
 */
class BookingIdService
{
    /**
     * Generate a unique booking ID
     */
    public function generate(?Carbon $timestamp = null): string
    {
        $ts = $timestamp ?? now();

        $yearCode     = $this->encodeYear($ts->year);
        $monthCode    = $this->encodeMonth($ts->month);
        $dateCode     = $this->encodeDate($ts->day);
        $hourCode     = $this->encodeHour($ts->hour);
        $minuteTens   = $this->encodeMinuteTens(intdiv($ts->minute, 10));
        $minuteOnes   = $this->encodeMinuteOnes($ts->minute % 10);
        $typeDigit    = '2'; // Always '2' for service bookings
        $randomSuffix = $this->generateRandomAlpha(4);

        $id = "{$yearCode}{$monthCode}{$dateCode}{$hourCode}{$minuteTens}{$minuteOnes}{$typeDigit}{$randomSuffix}";

        // Collision check with retry
        if (DB::table('service_bookings')->where('id', $id)->exists()) {
            return $this->generate($ts->copy()->addSecond());
        }

        return $id;
    }

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
        $first = chr(ord('A'));
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
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $result = '';
        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[random_int(0, 25)];
        }
        return $result;
    }

    /**
     * Parse a booking ID to extract metadata
     */
    public function parse(string $bookingId): array
    {
        if (strlen($bookingId) !== 11) {
            throw new \InvalidArgumentException("Invalid booking ID length: expected 11, got " . strlen($bookingId));
        }

        $yearOffset = ord($bookingId[0]) - ord('A');
        $year = 2026 + $yearOffset;

        $month = (ord($bookingId[1]) - ord('A')) + 1;

        // Date parsing
        $datePart = substr($bookingId, 2, 2);
        if (strlen($datePart) === 2 && $datePart[0] === 'A' && ord($datePart[1]) >= ord('A')) {
            $day = 27 + (ord($datePart[1]) - ord('A'));
        } else {
            $day = (ord($bookingId[2]) - ord('A')) + 1;
        }

        $hour = ord($bookingId[3]) - ord('A');
        $minuteTens = ord($bookingId[4]) - ord('A');
        $minuteOnes = ord($bookingId[5]) - ord('A');

        return [
            'year' => $year,
            'month' => $month,
            'day' => $day,
            'hour' => $hour,
            'minute' => ($minuteTens * 10) + $minuteOnes,
            'type_digit' => $bookingId[6],
            'random_suffix' => substr($bookingId, 7),
            'timestamp_approx' => sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, ($minuteTens * 10) + $minuteOnes),
        ];
    }

    /**
     * Check if booking ID format is valid
     */
    public function isValid(string $bookingId): bool
    {
        if (strlen($bookingId) !== 11) return false;

        // Positions 0-5 must be letters (A-Z)
        for ($i = 0; $i <= 5; $i++) {
            if (!ctype_alpha($bookingId[$i])) return false;
        }

        // Position 6 is type digit (always '2' for bookings)
        if ($bookingId[6] !== '2') return false;

        // Positions 7-10 are letters
        for ($i = 7; $i <= 10; $i++) {
            if (!ctype_alpha($bookingId[$i])) return false;
        }

        return true;
    }

    /**
     * Generate a unique bike rental booking ID
     * Format: BKB-XXXXXX (BKB prefix + 6 random alphanumeric)
     */
    public function generateBikeBookingId(): string
    {
        $prefix = 'BKB';
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $suffix = '';

        for ($i = 0; $i < 6; $i++) {
            $suffix .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $bookingId = $prefix . '-' . $suffix;

        // Collision check with retry
        if (DB::table('bike_rental_bookings')->where('booking_code', $bookingId)->exists()) {
            return $this->generateBikeBookingId();
        }

        return $bookingId;
    }
}

