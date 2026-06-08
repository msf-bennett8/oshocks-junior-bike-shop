<?php

namespace App\Services;

use App\Models\BikeRental;
use App\Models\BikeAvailabilityBlock;
use App\Models\BikeRentalBooking;
use App\Models\CyclingEventRegistration;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BikeAvailabilityService
{
    /**
     * Check if a bike is available for a given date range
     * Returns availability status and next available date if booked
     */
    public static function checkAvailability(int $bikeRentalId, string $start, string $end, ?int $excludeBookingId = null): array
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        // Check availability blocks (bookings + maintenance + out_of_service)
        $query = BikeAvailabilityBlock::where('bike_rental_id', $bikeRentalId)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('start_datetime', '<', $endDate)
                  ->where('end_datetime', '>', $startDate);
            })
            ->whereIn('block_type', ['booking', 'maintenance', 'out_of_service', 'blackout']);

        if ($excludeBookingId) {
            $query->where('booking_id', '!=', $excludeBookingId);
        }

        $conflicts = $query->orderBy('end_datetime', 'desc')->get();

        if ($conflicts->isEmpty()) {
            return [
                'available' => true,
                'next_available_after' => null,
                'conflicts' => [],
            ];
        }

        // Find the latest end date among conflicts
        $latestConflict = $conflicts->sortByDesc('end_datetime')->first();

        return [
            'available' => false,
            'next_available_after' => $latestConflict->end_datetime->format('Y-m-d H:i:s'),
            'conflicts' => $conflicts->map(fn($c) => [
                'type' => $c->block_type,
                'from' => $c->start_datetime->format('Y-m-d H:i'),
                'until' => $c->end_datetime->format('Y-m-d H:i'),
                'reason' => $c->reason,
            ]),
        ];
    }

    /**
     * Get all bikes with availability info for a date range
     * Includes watermark data for booked bikes
     */
    public static function getAvailableBikesWithConflictResolution(string $start, string $end, array $filters = []): array
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        $query = BikeRental::with(['owner'])
            ->where('listing_status', 'approved')
            ->where('is_active', true);

        // Apply filters
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (!empty($filters['owner_type'])) {
            $query->where('owner_type', $filters['owner_type']);
        }

        $bikes = $query->get();

        return $bikes->map(function ($bike) use ($startDate, $endDate) {
            try {
                $availability = self::checkAvailability($bike->id, $startDate, $endDate);

                // Format next_available_after nicely for frontend
                $nextAvailable = $availability['next_available_after']
                    ? Carbon::parse($availability['next_available_after'])->format('Y-m-d H:i:s')
                    : null;

                return [
                    'id' => $bike->id,
                    'listing_code' => $bike->listing_code,
                    'name' => $bike->name,
                    'brand' => $bike->brand,
                    'model' => $bike->model,
                    'category' => $bike->category,
                    'daily_rate' => $bike->daily_rate,
                    'hourly_rate' => $bike->hourly_rate,
                    'weekly_rate' => $bike->weekly_rate,
                    'monthly_rate' => $bike->monthly_rate,
                    'security_deposit' => $bike->security_deposit,
                    'images' => $bike->images,
                    'condition' => $bike->condition,
                    'features' => $bike->features,
                    'owner_name' => $bike->owner_name,
                    'owner_avatar' => $bike->owner_avatar,
                    'owner_initials' => $bike->owner_initials,
                    'is_available' => $availability['available'],
                    'next_available_after' => $nextAvailable,
                    'watermark' => $availability['available'] ? null : 'Booked until ' . ($nextAvailable ? Carbon::parse($nextAvailable)->format('M j, Y g:i A') : 'unknown'),
                    'location_address' => $bike->location_address,
                    'pickup_type' => $bike->pickup_type,
                    'delivery_fee' => $bike->delivery_fee,
                    'insurance_included' => $bike->insurance_included,
                    'recirculation_status' => $bike->recirculation_status,
                    'listing_status' => $bike->listing_status,
                    'is_available' => $availability['available'],
                ];
            } catch (\Exception $e) {
                // If availability check fails for one bike, return it as unavailable rather than failing all
                \Illuminate\Support\Facades\Log::warning('Bike availability check failed', [
                    'bike_id' => $bike->id,
                    'error' => $e->getMessage(),
                ]);
                return [
                    'id' => $bike->id,
                    'listing_code' => $bike->listing_code,
                    'name' => $bike->name,
                    'brand' => $bike->brand,
                    'model' => $bike->model,
                    'category' => $bike->category,
                    'daily_rate' => $bike->daily_rate,
                    'hourly_rate' => $bike->hourly_rate,
                    'weekly_rate' => $bike->weekly_rate,
                    'monthly_rate' => $bike->monthly_rate,
                    'security_deposit' => $bike->security_deposit,
                    'images' => $bike->images,
                    'condition' => $bike->condition,
                    'features' => $bike->features,
                    'owner_name' => $bike->owner_name,
                    'owner_avatar' => $bike->owner_avatar,
                    'owner_initials' => $bike->owner_initials,
                    'is_available' => false,
                    'next_available_after' => null,
                    'watermark' => 'Availability check failed',
                    'location_address' => $bike->location_address,
                    'pickup_type' => $bike->pickup_type,
                    'delivery_fee' => $bike->delivery_fee,
                    'insurance_included' => $bike->insurance_included,
                    'recirculation_status' => $bike->recirculation_status,
                    'listing_status' => $bike->listing_status,
                    'is_available' => $availability['available'],
                ];
            }
        })->filter()->values()->toArray();
    }

    /**
     * Prevent double booking by creating atomic availability block
     */
    public static function createBookingBlock(int $bikeRentalId, string $start, string $end, int $bookingId, int $createdBy): BikeAvailabilityBlock
    {
        return BikeAvailabilityBlock::create([
            'bike_rental_id' => $bikeRentalId,
            'block_type' => 'booking',
            'start_datetime' => $start,
            'end_datetime' => $end,
            'booking_id' => $bookingId,
            'reason' => 'Rental booking #' . $bookingId,
            'created_by' => $createdBy,
        ]);
    }

    /**
     * Remove availability block (for cancellations)
     */
    public static function removeBookingBlock(int $bookingId): void
    {
        BikeAvailabilityBlock::where('booking_id', $bookingId)->delete();
    }

    /**
     * Check event registration conflicts for a bike
     */
    public static function checkEventConflicts(int $bikeRentalId, string $start, string $end): array
    {
        // Check if bike is registered for any event during this period
        $eventConflicts = CyclingEventRegistration::whereHas('event', function ($q) use ($start, $end) {
            $q->where('start_datetime', '<', $end)
              ->where('end_datetime', '>', $start);
        })->whereHas('bikeRentals', function ($q) use ($bikeRentalId) {
            $q->where('bike_rental_id', $bikeRentalId);
        })->get();

        return [
            'has_conflict' => $eventConflicts->isNotEmpty(),
            'events' => $eventConflicts->map(fn($reg) => [
                'event_title' => $reg->event->title,
                'event_start' => $reg->event->start_datetime,
                'event_end' => $reg->event->end_datetime,
            ]),
        ];
    }
}
