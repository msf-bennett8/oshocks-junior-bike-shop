<?php

namespace App\Services;

use App\Models\BikeRentalBooking;
use App\Models\PlatformFineSetting;
use Carbon\Carbon;

class LateReturnFineService
{
    /**
     * Apply late return fine to a booking
     */
    public static function applyFine(int $bookingId, ?float $overrideAmount = null): array
    {
        $booking = BikeRentalBooking::findOrFail($bookingId);

        if ($booking->status !== 'active' && $booking->status !== 'returned') {
            return [
                'success' => false,
                'message' => 'Fine can only be applied to active or returned bookings',
            ];
        }

        $fineAmount = $overrideAmount;

        if ($fineAmount === null) {
            // Get admin-configured fine
            $fineAmount = PlatformFineSetting::getLateReturnFine();
        }

        if ($fineAmount === null || $fineAmount <= 0) {
            return [
                'success' => false,
                'message' => 'No fine configured. Set fine amount in admin settings or provide override.',
            ];
        }

        // Calculate hours late
        $dueDate = Carbon::parse($booking->end_datetime);
        $returnedAt = $booking->returned_at ? Carbon::parse($booking->returned_at) : now();
        $hoursLate = max(0, $dueDate->diffInHours($returnedAt));

        if ($hoursLate <= 0) {
            return [
                'success' => false,
                'message' => 'Booking is not late. No fine applied.',
            ];
        }

        $totalFine = $fineAmount * ceil($hoursLate / 24); // Per day late

        $booking->update([
            'late_return_fine' => $totalFine,
            'fine_applied_at' => now(),
        ]);

        return [
            'success' => true,
            'fine_amount' => $totalFine,
            'hours_late' => $hoursLate,
            'booking' => $booking->fresh(),
            'message' => "Late return fine of KSh {$totalFine} applied for {$hoursLate} hours late",
        ];
    }

    /**
     * Remove fine from a booking
     */
    public static function removeFine(int $bookingId): array
    {
        $booking = BikeRentalBooking::findOrFail($bookingId);

        $booking->update([
            'late_return_fine' => null,
            'fine_applied_at' => null,
        ]);

        return [
            'success' => true,
            'message' => 'Late return fine removed',
            'booking' => $booking->fresh(),
        ];
    }

    /**
     * Check and auto-apply fines for all overdue bookings
     */
    public static function autoApplyFines(): array
    {
        $fineAmount = PlatformFineSetting::getLateReturnFine();

        if ($fineAmount === null) {
            return [
                'applied_count' => 0,
                'message' => 'Auto-fine is disabled (no fine amount set)',
            ];
        }

        $overdueBookings = BikeRentalBooking::where('status', 'active')
            ->where('end_datetime', '<', now())
            ->whereNull('late_return_fine')
            ->get();

        $applied = [];

        foreach ($overdueBookings as $booking) {
            $result = self::applyFine($booking->id, $fineAmount);
            if ($result['success']) {
                $applied[] = [
                    'booking_code' => $booking->booking_code,
                    'fine' => $result['fine_amount'],
                ];
            }
        }

        return [
            'applied_count' => count($applied),
            'applied' => $applied,
        ];
    }
}
