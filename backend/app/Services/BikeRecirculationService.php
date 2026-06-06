<?php

namespace App\Services;

use App\Models\BikeRental;
use App\Models\BikeRentalBooking;
use App\Models\BikeAvailabilityBlock;
use Carbon\Carbon;

class BikeRecirculationService
{
    /**
     * Mark a bike as returned and recirculate it
     */
    public static function markAsReturned(int $bookingId, int $adminId): array
    {
        $booking = BikeRentalBooking::findOrFail($bookingId);
        $bike = BikeRental::findOrFail($booking->bike_rental_id);

        // Update booking status
        $booking->update([
            'status' => 'returned',
            'returned_at' => now(),
            'recirculated' => true,
            'recirculated_at' => now(),
            'recirculated_by' => $adminId,
        ]);

        // Remove availability block
        BikeAvailabilityBlock::where('booking_id', $bookingId)->delete();

        // Update bike recirculation status
        $bike->update([
            'recirculation_status' => 'available',
            'next_available_at' => null,
        ]);

        // Check if deposit should be refunded
        $shouldRefundDeposit = true; // Admin can override this later

        return [
            'success' => true,
            'booking' => $booking->fresh(),
            'bike' => $bike->fresh(),
            'deposit_refund_eligible' => $shouldRefundDeposit,
            'message' => 'Bike marked as returned and recirculated successfully',
        ];
    }

    /**
     * Auto-recirculate bikes when event ends or booking expires
     */
    public static function autoRecirculate(): array
    {
        $now = now();

        // Find expired normal bookings
        $expiredBookings = BikeRentalBooking::where('status', 'active')
            ->where('end_datetime', '<', $now)
            ->where('recirculated', false)
            ->get();

        // Find event bookings where event has ended
        $eventBookings = BikeRentalBooking::where('status', 'active')
            ->whereHas('bike.availabilityBlocks', function ($q) use ($now) {
                $q->where('block_type', 'booking')
                  ->where('end_datetime', '<', $now);
            })
            ->where('recirculated', false)
            ->get();

        $recirculated = [];

        foreach ($expiredBookings as $booking) {
            $result = self::markAsReturned($booking->id, 0); // System user
            $recirculated[] = [
                'booking_code' => $booking->booking_code,
                'type' => 'normal_expired',
                'result' => $result,
            ];
        }

        return [
            'recirculated_count' => count($recirculated),
            'recirculated' => $recirculated,
        ];
    }

    /**
     * Get bikes pending recirculation (for admin dashboard)
     */
    public static function getPendingRecirculation(): array
    {
        $now = now();

        $pending = BikeRentalBooking::whereIn('status', ['active', 'returned'])
            ->where('end_datetime', '<', $now)
            ->where('recirculated', false)
            ->with(['bike', 'renter'])
            ->get();

        return $pending->map(fn($booking) => [
            'booking_code' => $booking->booking_code,
            'bike_name' => $booking->bike->name,
            'bike_listing_code' => $booking->bike->listing_code,
            'renter_name' => $booking->renter->name,
            'end_datetime' => $booking->end_datetime->format('Y-m-d H:i'),
            'hours_overdue' => $now->diffInHours($booking->end_datetime),
            'status' => $booking->status,
            'can_recirculate' => true,
        ])->toArray();
    }

    /**
     * Check if a bike needs recirculation button
     */
    public static function needsRecirculation(int $bookingId): bool
    {
        $booking = BikeRentalBooking::find($bookingId);
        if (!$booking) return false;

        return $booking->status === 'active' 
            && $booking->end_datetime < now() 
            && !$booking->recirculated;
    }
}
