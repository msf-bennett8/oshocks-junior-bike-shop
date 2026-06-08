<?php

namespace App\Services;

use App\Models\ResourceItem;
use App\Models\ResourceBooking;
use App\Models\ResourceAvailabilityBlock;
use App\Models\CyclingEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResourceRecirculationService
{
    /**
     * Mark a resource booking as returned and recirculate inventory
     */
    public static function markAsReturned(int $bookingId, int $adminId, ?string $notes = null): array
    {
        return DB::transaction(function () use ($bookingId, $adminId, $notes) {
            $booking = ResourceBooking::lockForUpdate()->findOrFail($bookingId);
            $resource = ResourceItem::lockForUpdate()->findOrFail($booking->resource_item_id);

            if (!in_array($booking->status, ['active', 'picked_up'])) {
                return [
                    'success' => false,
                    'message' => 'Booking must be active or picked up before marking as returned',
                ];
            }

            // Update booking status
            $booking->update([
                'status' => 'returned',
                'returned_at' => now(),
                'returned_to' => $adminId,
                'return_notes' => $notes,
            ]);

            // Remove availability block
            ResourceAvailabilityBlock::where('booking_id', $bookingId)
                ->where('block_type', 'booking')
                ->delete();

            // Restore inventory
            $resource->restoreToInventory($booking->quantity_booked);

            // Reset price to base (or recalculate)
            $resource->updateCurrentPrice();

            return [
                'success' => true,
                'booking' => $booking->fresh(),
                'resource' => $resource->fresh(),
                'message' => 'Resource marked as returned. Awaiting inspection before recirculation.',
            ];
        });
    }

    /**
     * Complete recirculation - return resource to active inventory after inspection
     */
    public static function completeRecirculation(int $bookingId, int $adminId): array
    {
        return DB::transaction(function () use ($bookingId, $adminId) {
            $booking = ResourceBooking::lockForUpdate()->findOrFail($bookingId);

            if ($booking->status !== 'returned') {
                return [
                    'success' => false,
                    'message' => 'Booking must be marked as returned before completing recirculation',
                ];
            }

            $booking->update([
                'status' => 'completed',
                'recirculated' => true,
                'recirculated_at' => now(),
                'recirculated_by' => $adminId,
            ]);

            return [
                'success' => true,
                'booking' => $booking->fresh(),
                'message' => 'Resource recirculated and returned to inventory successfully',
            ];
        });
    }

    /**
     * Auto-recirculate all resources when event ends
     */
    public static function autoRecirculateForEvent(int $eventId): array
    {
        $event = CyclingEvent::find($eventId);
        if (!$event) {
            return ['success' => false, 'message' => 'Event not found'];
        }

        if ($event->end_datetime > now()) {
            return ['success' => false, 'message' => 'Event has not ended yet'];
        }

        $bookings = ResourceBooking::where('event_id', $eventId)
            ->whereIn('status', ['active', 'picked_up'])
            ->where('recirculated', false)
            ->where('auto_returned', false)
            ->get();

        $recirculated = [];

        foreach ($bookings as $booking) {
            // Mark as auto-returned first
            $booking->update([
                'status' => 'returned',
                'returned_at' => now(),
                'auto_returned' => true,
                'auto_returned_at' => now(),
            ]);

            // Remove availability block
            ResourceAvailabilityBlock::where('booking_id', $booking->id)
                ->where('block_type', 'booking')
                ->delete();

            // Restore inventory
            $resource = ResourceItem::find($booking->resource_item_id);
            if ($resource) {
                $resource->restoreToInventory($booking->quantity_booked);
                $resource->updateCurrentPrice();
            }

            // Complete recirculation
            $booking->update([
                'status' => 'completed',
                'recirculated' => true,
                'recirculated_at' => now(),
            ]);

            $recirculated[] = [
                'booking_code' => $booking->booking_code,
                'resource_name' => $resource?->name,
                'quantity' => $booking->quantity_booked,
            ];
        }

        return [
            'success' => true,
            'event_id' => $eventId,
            'event_title' => $event->title,
            'recirculated_count' => count($recirculated),
            'recirculated' => $recirculated,
            'message' => count($recirculated) . ' resources auto-recirculated after event end',
        ];
    }

    /**
     * Auto-recirculate all expired bookings (run via scheduled command)
     */
    public static function autoRecirculateExpired(): array
    {
        $now = now();

        // Find expired bookings that haven't been recirculated
        $expiredBookings = ResourceBooking::whereIn('status', ['active', 'picked_up'])
            ->where('end_datetime', '<', $now)
            ->where('recirculated', false)
            ->where('auto_returned', false)
            ->get();

        $recirculated = [];

        foreach ($expiredBookings as $booking) {
            // Auto-return
            $booking->update([
                'status' => 'returned',
                'returned_at' => $now,
                'auto_returned' => true,
                'auto_returned_at' => $now,
            ]);

            // Remove availability block
            ResourceAvailabilityBlock::where('booking_id', $booking->id)
                ->where('block_type', 'booking')
                ->delete();

            // Restore inventory
            $resource = ResourceItem::find($booking->resource_item_id);
            if ($resource) {
                $resource->restoreToInventory($booking->quantity_booked);
                $resource->updateCurrentPrice();
            }

            // Complete recirculation
            $booking->update([
                'status' => 'completed',
                'recirculated' => true,
                'recirculated_at' => $now,
            ]);

            $recirculated[] = [
                'booking_code' => $booking->booking_code,
                'resource_name' => $resource?->name,
                'quantity' => $booking->quantity_booked,
                'event_id' => $booking->event_id,
            ];
        }

        return [
            'recirculated_count' => count($recirculated),
            'recirculated' => $recirculated,
            'timestamp' => $now->toDateTimeString(),
        ];
    }

    /**
     * Get bookings pending recirculation (for admin dashboard)
     */
    public static function getPendingRecirculation(): array
    {
        $now = now();

        $pending = ResourceBooking::where('status', 'returned')
            ->where('recirculated', false)
            ->with(['resourceItem', 'user'])
            ->get();

        return $pending->map(fn($booking) => [
            'booking_code' => $booking->booking_code,
            'resource_name' => $booking->resourceItem?->name,
            'resource_code' => $booking->resourceItem?->resource_code,
            'user_name' => $booking->user?->name,
            'quantity' => $booking->quantity_booked,
            'returned_at' => $booking->returned_at?->format('Y-m-d H:i'),
            'hours_since_return' => $booking->returned_at ? $now->diffInHours($booking->returned_at) : null,
            'status' => $booking->status,
            'can_complete' => true,
        ])->toArray();
    }

    /**
     * Get bookings pending auto-return (event ended or expired)
     */
    public static function getPendingAutoReturn(): array
    {
        $now = now();

        $pending = ResourceBooking::whereIn('status', ['active', 'picked_up'])
            ->where('end_datetime', '<', $now)
            ->where('recirculated', false)
            ->where('auto_returned', false)
            ->with(['resourceItem', 'user', 'event'])
            ->get();

        return $pending->map(fn($booking) => [
            'booking_code' => $booking->booking_code,
            'resource_name' => $booking->resourceItem?->name,
            'user_name' => $booking->user?->name,
            'end_datetime' => $booking->end_datetime->format('Y-m-d H:i'),
            'hours_overdue' => $now->diffInHours($booking->end_datetime),
            'event_title' => $booking->event?->title,
            'is_event_booking' => !is_null($booking->event_id),
            'can_auto_return' => true,
        ])->toArray();
    }

    /**
     * Check if a booking needs recirculation action
     */
    public static function needsRecirculation(int $bookingId): bool
    {
        $booking = ResourceBooking::find($bookingId);
        if (!$booking) return false;

        return $booking->status === 'returned' && !$booking->recirculated;
    }

    /**
     * Batch recirculate multiple bookings
     */
    public static function batchRecirculate(array $bookingIds, int $adminId): array
    {
        $results = [];
        foreach ($bookingIds as $bookingId) {
            $result = self::completeRecirculation($bookingId, $adminId);
            $results[] = [
                'booking_id' => $bookingId,
                'success' => $result['success'],
                'message' => $result['message'] ?? null,
            ];
        }

        return [
            'processed' => count($results),
            'successful' => count(array_filter($results, fn($r) => $r['success'])),
            'failed' => count(array_filter($results, fn($r) => !$r['success'])),
            'details' => $results,
        ];
    }
}
