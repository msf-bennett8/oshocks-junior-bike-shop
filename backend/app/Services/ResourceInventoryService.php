<?php

namespace App\Services;

use App\Models\ResourceItem;
use App\Models\ResourceBooking;
use App\Models\ResourceAvailabilityBlock;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResourceInventoryService
{
    /**
     * Check if a resource has sufficient available quantity for a date range
     * Returns availability status and remaining quantity
     */
    public static function checkAvailability(int $resourceItemId, string $start, string $end, int $requestedQuantity = 1, ?int $excludeBookingId = null): array
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        $resource = ResourceItem::find($resourceItemId);
        if (!$resource) {
            return [
                'available' => false,
                'reason' => 'Resource not found',
                'available_quantity' => 0,
                'requested_quantity' => $requestedQuantity,
            ];
        }

        // Get all active blocks during this period
        $query = ResourceAvailabilityBlock::where('resource_item_id', $resourceItemId)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('start_datetime', '<', $endDate)
                  ->where('end_datetime', '>', $startDate);
            })
            ->whereIn('block_type', ['booking', 'maintenance', 'out_of_service', 'event_reserved', 'blackout']);

        if ($excludeBookingId) {
            $query->where(function ($q) use ($excludeBookingId) {
                $q->whereNull('booking_id')
                  ->orWhere('booking_id', '!=', $excludeBookingId);
            });
        }

        $blocks = $query->get();

        // Calculate maximum concurrent blocked quantity
        $maxBlocked = self::calculateMaxConcurrentBlocked($blocks, $startDate, $endDate);

        $availableQuantity = max(0, $resource->total_quantity - $maxBlocked);

        // Check if requested quantity can be satisfied
        $canFulfill = $availableQuantity >= $requestedQuantity;

        // If not enough, check if backorder is allowed
        if (!$canFulfill && $resource->allow_backorder) {
            $canFulfill = true; // Allow booking but mark as backorder
        }

        return [
            'available' => $canFulfill,
            'reason' => $canFulfill ? null : 'Insufficient quantity available',
            'available_quantity' => $availableQuantity,
            'requested_quantity' => $requestedQuantity,
            'max_blocked' => $maxBlocked,
            'total_quantity' => $resource->total_quantity,
            'is_backorder' => !$canFulfill && $resource->allow_backorder,
            'blocks' => $blocks->map(fn($b) => [
                'type' => $b->block_type,
                'from' => $b->start_datetime->format('Y-m-d H:i'),
                'until' => $b->end_datetime->format('Y-m-d H:i'),
                'quantity_blocked' => $b->quantity_blocked,
                'reason' => $b->reason,
            ]),
        ];
    }

    /**
     * Calculate maximum quantity blocked at any point during the period
     */
    protected static function calculateMaxConcurrentBlocked($blocks, Carbon $startDate, Carbon $endDate): int
    {
        if ($blocks->isEmpty()) {
            return 0;
        }

        // Create timeline points
        $points = [];
        foreach ($blocks as $block) {
            $blockStart = max($startDate, $block->start_datetime);
            $blockEnd = min($endDate, $block->end_datetime);
            $points[] = ['time' => $blockStart, 'delta' => $block->quantity_blocked, 'type' => 'start'];
            $points[] = ['time' => $blockEnd, 'delta' => -$block->quantity_blocked, 'type' => 'end'];
        }

        // Sort by time
        usort($points, fn($a, $b) => $a['time'] <=> $b['time']);

        $maxBlocked = 0;
        $currentBlocked = 0;

        foreach ($points as $point) {
            $currentBlocked += $point['delta'];
            $maxBlocked = max($maxBlocked, $currentBlocked);
        }

        return $maxBlocked;
    }

    /**
     * Create availability block for a booking (atomic - prevents race conditions)
     */
    public static function createBookingBlock(int $resourceItemId, string $start, string $end, int $bookingId, int $quantity, int $createdBy): ResourceAvailabilityBlock
    {
        return DB::transaction(function () use ($resourceItemId, $start, $end, $bookingId, $quantity, $createdBy) {
            // Lock the resource row to prevent race conditions
            $resource = ResourceItem::lockForUpdate()->find($resourceItemId);

            if (!$resource) {
                throw new \Exception('Resource not found');
            }

            // Verify availability again under lock
            $availability = self::checkAvailability($resourceItemId, $start, $end, $quantity);

            if (!$availability['available'] && !$availability['is_backorder']) {
                throw new \Exception('Resource no longer available: ' . $availability['reason']);
            }

            // Decrement available quantity
            $resource->decrementAvailability($quantity);

            // Create the block
            $block = ResourceAvailabilityBlock::create([
                'resource_item_id' => $resourceItemId,
                'block_type' => 'booking',
                'start_datetime' => $start,
                'end_datetime' => $end,
                'quantity_blocked' => $quantity,
                'booking_id' => $bookingId,
                'reason' => 'Booking #' . $bookingId,
                'created_by' => $createdBy,
            ]);

            // Update resource pricing based on new availability
            $resource->updateCurrentPrice();

            return $block;
        });
    }

    /**
     * Remove availability block and restore inventory (for cancellations/returns)
     */
    public static function removeBookingBlock(int $bookingId, ?int $quantity = null): void
    {
        DB::transaction(function () use ($bookingId, $quantity) {
            $blocks = ResourceAvailabilityBlock::where('booking_id', $bookingId)
                ->where('block_type', 'booking')
                ->get();

            foreach ($blocks as $block) {
                $restoreQty = $quantity ?? $block->quantity_blocked;

                // Restore inventory
                $resource = ResourceItem::lockForUpdate()->find($block->resource_item_id);
                if ($resource) {
                    $resource->restoreToInventory($restoreQty);
                    $resource->updateCurrentPrice();
                }

                // Delete or reduce the block
                if ($quantity && $quantity < $block->quantity_blocked) {
                    $block->decrement('quantity_blocked', $quantity);
                } else {
                    $block->delete();
                }
            }
        });
    }

    /**
     * Get all resources with availability info for a date range
     */
    public static function getAvailableResourcesWithInfo(string $start, string $end, array $filters = [], int $requestedQuantity = 1): array
    {
        $startDate = Carbon::parse($start);
        $endDate = Carbon::parse($end);

        $query = ResourceItem::with(['uploadedBy', 'pricingRules'])
            ->where('status', 'approved')
            ->where('is_active', true);

        // Apply filters
        if (!empty($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (!empty($filters['event_id'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('event_id', $filters['event_id'])
                  ->orWhereNull('event_id');
            });
        }

        $resources = $query->get();

        return $resources->map(function ($resource) use ($startDate, $endDate, $requestedQuantity) {
            $availability = self::checkAvailability($resource->id, $startDate, $endDate, $requestedQuantity);

            return [
                'id' => $resource->id,
                'resource_code' => $resource->resource_code,
                'resource_type' => $resource->resource_type,
                'category' => $resource->category,
                'name' => $resource->name,
                'slug' => $resource->slug,
                'description' => $resource->description,
                'brand' => $resource->brand,
                'model' => $resource->model,
                'base_price' => $resource->base_price,
                'current_price' => $resource->current_price,
                'surge_multiplier' => $resource->surge_multiplier,
                'images' => $resource->images,
                'total_quantity' => $resource->total_quantity,
                'available_quantity' => $resource->available_quantity,
                'reserved_quantity' => $resource->reserved_quantity,
                'low_stock_threshold' => $resource->low_stock_threshold,
                'allow_backorder' => $resource->allow_backorder,
                'is_available' => $availability['available'],
                'available_for_request' => $availability['available_quantity'],
                'is_backorder' => $availability['is_backorder'] ?? false,
                'remaining_alert' => $resource->remaining_alert,
                'stock_status' => $resource->stock_status,
                'dynamic_pricing_enabled' => $resource->dynamic_pricing_enabled,
                'status' => $resource->status,
                'is_verified' => $resource->is_verified,
                'uploader_name' => $resource->uploader_name,
                'event_id' => $resource->event_id,
                'watermark' => $availability['available'] ? null : 'Fully booked for selected dates',
            ];
        })->toArray();
    }

    /**
     * Get quantity available for a specific resource at a specific time
     */
    public static function getAvailableQuantityAt(int $resourceItemId, string $datetime): int
    {
        $dt = Carbon::parse($datetime);

        $blocks = ResourceAvailabilityBlock::where('resource_item_id', $resourceItemId)
            ->where('start_datetime', '<=', $dt)
            ->where('end_datetime', '>', $dt)
            ->whereIn('block_type', ['booking', 'maintenance', 'out_of_service', 'event_reserved'])
            ->get();

        $blocked = $blocks->sum('quantity_blocked');
        $resource = ResourceItem::find($resourceItemId);

        return $resource ? max(0, $resource->total_quantity - $blocked) : 0;
    }

    /**
     * Update resource availability after booking status change
     */
    public static function syncAvailabilityFromBookings(int $resourceItemId): void
    {
        $resource = ResourceItem::find($resourceItemId);
        if (!$resource) return;

        // Count active reservations
        $reserved = ResourceBooking::where('resource_item_id', $resourceItemId)
            ->whereIn('status', ['confirmed', 'active', 'picked_up'])
            ->sum('quantity_booked');

        // Count active blocks
        $blocked = ResourceAvailabilityBlock::where('resource_item_id', $resourceItemId)
            ->where('block_type', '!=', 'blackout')
            ->where('end_datetime', '>', now())
            ->sum('quantity_blocked');

        $totalReserved = max($reserved, $blocked);

        DB::transaction(function () use ($resource, $totalReserved) {
            $resource->update([
                'reserved_quantity' => $totalReserved,
                'available_quantity' => max(0, $resource->total_quantity - $totalReserved),
            ]);
            $resource->updateCurrentPrice();
        });
    }
}
