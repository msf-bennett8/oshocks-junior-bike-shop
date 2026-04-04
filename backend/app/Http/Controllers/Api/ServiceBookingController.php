<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceBooking;
use App\Services\BusinessOperationsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceBookingController extends Controller
{
    /**
     * Create service booking
     * POST /api/v1/service-bookings
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'service_type' => 'required|in:tune_up,repair,fitting,maintenance',
            'mechanic_id' => 'nullable|exists:users,id',
            'product_id' => 'nullable|exists:products,id',
            'scheduled_date' => 'required|date|after:today',
            'scheduled_time' => 'required',
            'duration_minutes' => 'integer|min:30',
            'location_id' => 'required|exists:addresses,id',
            'price_estimate' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = BusinessOperationsService::bookService($request->user(), $request->all());

        return response()->json([
            'success' => true,
            'data' => $booking
        ], 201);
    }

    /**
     * Reschedule booking
     * POST /api/v1/service-bookings/{id}/reschedule
     */
    public function reschedule(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'scheduled_date' => 'required|date|after:today',
            'scheduled_time' => 'required',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = ServiceBooking::where('booking_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        $newBooking = BusinessOperationsService::rescheduleService(
            $booking,
            $request->only(['scheduled_date', 'scheduled_time']),
            $request->reason
        );

        return response()->json([
            'success' => true,
            'data' => $newBooking
        ]);
    }

    /**
     * Cancel booking
     * POST /api/v1/service-bookings/{id}/cancel
     */
    public function cancel(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = ServiceBooking::where('booking_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        BusinessOperationsService::cancelService(
            $booking,
            $request->reason,
            'customer',
            $request->refund_requested ?? false
        );

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled'
        ]);
    }

    /**
     * Mark no-show (mechanic/admin only)
     * POST /api/v1/service-bookings/{id}/no-show
     */
    public function markNoShow(Request $request, $id)
    {
        $booking = ServiceBooking::where('booking_id', $id)->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }

        BusinessOperationsService::markNoShow(
            $booking,
            $request->party ?? 'customer',
            $request->offer_reschedule ?? false
        );

        return response()->json([
            'success' => true,
            'message' => 'No-show recorded'
        ]);
    }
}
