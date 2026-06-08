<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResourceItem;
use App\Models\ResourceBooking;
use App\Models\ResourceAvailabilityBlock;
use App\Models\BikeRentalBooking;
use App\Models\CyclingEvent;
use App\Services\ResourceInventoryService;
use App\Services\ResourcePricingService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ResourceBookingController extends Controller
{
    /**
     * Create a new resource booking
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'resource_code' => 'required|string|exists:resource_items,resource_code',
            'start_datetime' => 'required|date|after:now',
            'end_datetime' => 'required|date|after:start_datetime',
            'quantity' => 'integer|min:1|max:100',
            'event_id' => 'nullable|exists:cycling_events,id',
            'bike_rental_booking_id' => 'nullable|exists:bike_rental_bookings,id',
            'payment_method' => 'required|in:mpesa,card,cod',
            'notes' => 'nullable|string',
        ]);

        $resource = ResourceItem::where('resource_code', $validated['resource_code'])->firstOrFail();

        // Check if resource is available
        $quantity = $validated['quantity'] ?? 1;
        $availability = ResourceInventoryService::checkAvailability(
            $resource->id,
            $validated['start_datetime'],
            $validated['end_datetime'],
            $quantity
        );

        if (!$availability['available'] && !$availability['is_backorder']) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not available for selected dates',
                'data' => $availability,
            ], 422);
        }

        // Calculate pricing
        $pricing = ResourcePricingService::calculatePrice(
            $resource->id,
            $validated['start_datetime'],
            $validated['end_datetime'],
            $quantity
        );

        // Generate booking code
        $bookingCode = $this->generateBookingCode();

        $booking = DB::transaction(function () use ($validated, $resource, $quantity, $pricing, $bookingCode, $availability) {
            // Create booking
            $booking = ResourceBooking::create([
                'booking_code' => $bookingCode,
                'resource_item_id' => $resource->id,
                'user_id' => auth()->id(),
                'event_id' => $validated['event_id'] ?? null,
                'bike_rental_booking_id' => $validated['bike_rental_booking_id'] ?? null,
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'quantity_booked' => $quantity,
                'duration_days' => Carbon::parse($validated['start_datetime'])->diffInDays(Carbon::parse($validated['end_datetime'])) + 1,
                'unit_price' => $pricing['current_price'],
                'surge_multiplier_applied' => $pricing['surge_multiplier'],
                'total_price' => $pricing['total'],
                'platform_fee' => round($pricing['total'] * 0.15, 2),
                'grand_total' => round($pricing['total'] * 1.15, 2),
                'status' => 'pending_payment',
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
            ]);

            // Create availability block (atomic)
            if (!$availability['is_backorder']) {
                ResourceInventoryService::createBookingBlock(
                    $resource->id,
                    $validated['start_datetime'],
                    $validated['end_datetime'],
                    $booking->id,
                    $quantity,
                    auth()->id()
                );
            }

            AuditService::log([
                'event_type' => 'resource_booking_created',
                'event_category' => 'resource_booking',
                'action' => 'created',
                'model_type' => 'ResourceBooking',
                'model_id' => $booking->id,
                'description' => "Resource booking created: {$booking->booking_code} for {$resource->name}",
                'severity' => 'low',
            ]);

            return $booking;
        });

        return response()->json([
            'success' => true,
            'data' => $booking->fresh(['resourceItem', 'user']),
            'pricing' => $pricing,
            'availability' => $availability,
            'message' => $availability['is_backorder'] ? 'Booking created (backorder)' : 'Booking created successfully',
        ], 201);
    }

    /**
     * Link resource booking to bike rental booking
     */
    public function linkToBikeRental(Request $request)
    {
        $validated = $request->validate([
            'resource_booking_id' => 'required|exists:resource_bookings,id',
            'bike_rental_booking_id' => 'required|exists:bike_rental_bookings,id',
        ]);

        $resourceBooking = ResourceBooking::where('id', $validated['resource_booking_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $bikeBooking = BikeRentalBooking::findOrFail($validated['bike_rental_booking_id']);

        // Sync dates with bike rental
        $resourceBooking->update([
            'bike_rental_booking_id' => $bikeBooking->id,
            'start_datetime' => $bikeBooking->start_datetime,
            'end_datetime' => $bikeBooking->end_datetime,
        ]);

        // Update availability block dates
        ResourceAvailabilityBlock::where('booking_id', $resourceBooking->id)
            ->where('block_type', 'booking')
            ->update([
                'start_datetime' => $bikeBooking->start_datetime,
                'end_datetime' => $bikeBooking->end_datetime,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource linked to bike rental',
            'data' => $resourceBooking->fresh(),
        ]);
    }

    /**
     * Link resource booking to event
     */
    public function linkToEvent(Request $request)
    {
        $validated = $request->validate([
            'resource_booking_id' => 'required|exists:resource_bookings,id',
            'event_id' => 'required|exists:cycling_events,id',
        ]);

        $resourceBooking = ResourceBooking::where('id', $validated['resource_booking_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $event = CyclingEvent::findOrFail($validated['event_id']);

        $resourceBooking->update([
            'event_id' => $event->id,
            'start_datetime' => $event->start_datetime,
            'end_datetime' => $event->end_datetime,
        ]);

        // Update availability block dates
        ResourceAvailabilityBlock::where('booking_id', $resourceBooking->id)
            ->where('block_type', 'booking')
            ->update([
                'start_datetime' => $event->start_datetime,
                'end_datetime' => $event->end_datetime,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource linked to event',
            'data' => $resourceBooking->fresh(),
        ]);
    }

    /**
     * Get my bookings
     */
    public function myBookings(Request $request)
    {
        $query = ResourceBooking::with(['resourceItem', 'event'])
            ->where('user_id', auth()->id());

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('resource_type')) {
            $query->whereHas('resourceItem', function ($q) use ($request) {
                $q->where('resource_type', $request->resource_type);
            });
        }

        $perPage = $request->get('per_page', 20);
        $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get booking details
     */
    public function show($bookingCode)
    {
        $booking = ResourceBooking::with(['resourceItem', 'user', 'event', 'bikeRentalBooking'])
            ->where('booking_code', $bookingCode)
            ->firstOrFail();

        if ($booking->user_id !== auth()->id() && !auth()->user()->can('viewAny', ResourceBooking::class)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Cancel booking
     */
    public function cancel(Request $request, $bookingCode)
    {
        $booking = ResourceBooking::where('booking_code', $bookingCode)->firstOrFail();

        if ($booking->user_id !== auth()->id() && !auth()->user()->can('update', $booking)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        if (!in_array($booking->status, ['pending_payment', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be cancelled at this stage',
            ], 422);
        }

        DB::transaction(function () use ($booking, $validated) {
            $booking->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['reason'],
                'payment_status' => $booking->payment_status === 'paid' ? 'refunded' : 'pending',
            ]);

            ResourceInventoryService::removeBookingBlock($booking->id, $booking->quantity_booked);

            AuditService::log([
                'event_type' => 'resource_booking_cancelled',
                'event_category' => 'resource_booking',
                'action' => 'cancelled',
                'model_type' => 'ResourceBooking',
                'model_id' => $booking->id,
                'description' => "Resource booking cancelled: {$booking->booking_code}",
                'severity' => 'medium',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
        ]);
    }

    /**
     * Update booking status (admin/staff)
     */
    public function updateStatus(Request $request, $bookingCode)
    {
        $booking = ResourceBooking::where('booking_code', $bookingCode)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:pending_payment,confirmed,picked_up,active,returned,completed,cancelled,no_show',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $booking->status;

        DB::transaction(function () use ($booking, $validated) {
            $updateData = ['status' => $validated['status']];

            switch ($validated['status']) {
                case 'picked_up':
                    $updateData['picked_up_at'] = now();
                    $updateData['picked_up_by'] = auth()->id();
                    break;
                case 'returned':
                    $updateData['returned_at'] = now();
                    $updateData['returned_to'] = auth()->id();
                    $updateData['return_notes'] = $validated['notes'] ?? null;
                    ResourceInventoryService::removeBookingBlock($booking->id, $booking->quantity_booked);
                    break;
                case 'completed':
                    if ($booking->status !== 'returned') {
                        throw new \Exception('Booking must be returned before completing');
                    }
                    $updateData['recirculated'] = true;
                    $updateData['recirculated_at'] = now();
                    $updateData['recirculated_by'] = auth()->id();
                    break;
                case 'cancelled':
                    $updateData['cancelled_at'] = now();
                    $updateData['cancellation_reason'] = $validated['notes'] ?? 'Cancelled by admin';
                    ResourceInventoryService::removeBookingBlock($booking->id, $booking->quantity_booked);
                    break;
            }

            $booking->update($updateData);

            AuditService::log([
                'event_type' => 'resource_booking_status_changed',
                'event_category' => 'resource_booking',
                'action' => 'updated',
                'model_type' => 'ResourceBooking',
                'model_id' => $booking->id,
                'description' => "Booking status changed from {$oldStatus} to {$validated['status']}",
                'old_values' => ['status' => $oldStatus],
                'new_values' => ['status' => $validated['status']],
                'severity' => 'low',
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $booking->fresh(),
            'message' => 'Status updated successfully',
        ]);
    }

    /**
     * Generate unique booking code
     */
    protected function generateBookingCode(): string
    {
        $prefix = 'RBK';
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $suffix = '';

        for ($i = 0; $i < 8; $i++) {
            $suffix .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $code = $prefix . '-' . $suffix;

        if (ResourceBooking::where('booking_code', $code)->exists()) {
            return $this->generateBookingCode();
        }

        return $code;
    }
}
