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

        // Only mark as physically returned — do NOT recirculate yet
        $booking->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        // Update bike to show it's back but pending inspection
        $bike->update([
            'recirculation_status' => 'pending_return',
        ]);

        return [
            'success' => true,
            'booking' => $booking->fresh(),
            'bike' => $bike->fresh(),
            'deposit_refund_eligible' => false,
            'message' => 'Bike marked as returned. Awaiting inspection before returning to fleet.',
        ];
    }

   /**
     * Complete inspection and return bike to fleet/circulation
     * This should be called after admin inspects returned bike
     */
    public static function returnToFleet(int $bookingId, int $adminId): array
    {
        $booking = BikeRentalBooking::findOrFail($bookingId);
        $bike = BikeRental::findOrFail($booking->bike_rental_id);

        if ($booking->status !== 'returned') {
            return [
                'success' => false,
                'message' => 'Bike must be marked as returned before returning to fleet',
            ];
        }

        // Update booking to completed and record recirculation
        $booking->update([
            'status' => 'completed',
            'recirculated' => true,
            'recirculated_at' => now(),
            'recirculated_by' => $adminId,
        ]);

        // Remove availability block — bike is now free to book again
        BikeAvailabilityBlock::where('booking_id', $bookingId)->delete();

        // Update bike recirculation status
        $bike->update([
            'recirculation_status' => 'available',
            'next_available_at' => null,
        ]);

        return [
            'success' => true,
            'booking' => $booking->fresh(),
            'bike' => $bike->fresh(),
            'deposit_refund_eligible' => true,
            'message' => 'Bike inspected and returned to fleet successfully',
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
            // For expired bookings, auto-mark returned then immediately return to fleet
            self::markAsReturned($booking->id, 0);
            $result = self::returnToFleet($booking->id, 0);
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

        $pending = BikeRentalBooking::where('status', 'returned')
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

        return $booking->status === 'returned'
            && !$booking->recirculated;
    }
}
