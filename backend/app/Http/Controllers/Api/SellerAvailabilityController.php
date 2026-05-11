<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerAvailability;
use App\Models\SellerProfile;
use App\Models\ServiceBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class SellerAvailabilityController extends Controller
{
    /**
     * Get seller availability for a specific date
     * GET /api/v1/sellers/{seller}/availability?date=2026-05-15
     */
    public function getAvailability(Request $request, $sellerId)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid date parameter',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = Carbon::parse($request->date);
        $dayOfWeek = strtolower($date->format('l')); // monday, tuesday, etc.

        // Get seller's configured availability for this day
        $availabilitySlots = SellerAvailability::where('seller_id', $sellerId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get();

        if ($availabilitySlots->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No availability configured for this day'
            ]);
        }

        // Get existing bookings for this date to check conflicts
        $existingBookings = ServiceBooking::where('seller_id', $sellerId)
            ->whereDate('confirmed_date', $date->toDateString())
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->get();

        // Build time slots with availability status
        $slots = $availabilitySlots->map(function ($slot) use ($existingBookings, $date) {
            $slotStart = Carbon::parse("{$date->toDateString()} {$slot->start_time}");
            $slotEnd = Carbon::parse("{$date->toDateString()} {$slot->end_time}");

            // Count bookings in this time slot
            $bookingsInSlot = $existingBookings->filter(function ($booking) use ($slotStart, $slotEnd) {
                if (!$booking->confirmed_date) return false;
                $bookingTime = Carbon::parse($booking->confirmed_date);
                return $bookingTime->between($slotStart, $slotEnd) || 
                       $bookingTime->equalTo($slotStart);
            })->count();

            $isAvailable = $bookingsInSlot < $slot->max_bookings;

            return [
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'is_available' => $isAvailable,
                'max_bookings' => $slot->max_bookings,
                'current_bookings' => $bookingsInSlot,
                'slot_duration_minutes' => $slot->slot_duration_minutes ?? 60,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $slots,
            'seller_id' => (int) $sellerId,
            'date' => $date->toDateString(),
            'day_of_week' => $dayOfWeek,
        ]);
    }

    /**
     * Get sellers available for service on a specific date/time
     * GET /api/v1/sellers/available-for-service?date=2026-05-15&time=14:00&service_type=bike_repair
     */
    public function getAvailableForService(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'time' => 'nullable|date_format:H:i',
            'service_type' => 'nullable|string|in:bike_repair,custom_assembly,e_bike_service,annual_service,express_service,pre_purchase_inspection',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid parameters',
                'errors' => $validator->errors()
            ], 422);
        }

        $date = Carbon::parse($request->date);
        $dayOfWeek = strtolower($date->format('l'));
        $time = $request->time;

        $query = SellerAvailability::with('seller')
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true);

        if ($time) {
            $query->where('start_time', '<=', $time)
                  ->where('end_time', '>', $time);
        }

        $availabilities = $query->get();

        // Filter sellers who have capacity
        $availableSellers = $availabilities->filter(function ($avail) use ($date, $time) {
            $existingBookings = ServiceBooking::where('seller_id', $avail->seller_id)
                ->whereDate('confirmed_date', $date->toDateString())
                ->whereNotIn('status', ['cancelled', 'no_show']);

            if ($time) {
                $existingBookings->whereTime('confirmed_date', '>=', $avail->start_time)
                                ->whereTime('confirmed_date', '<', $avail->end_time);
            }

            $bookingsCount = $existingBookings->count();
            return $bookingsCount < $avail->max_bookings;
        })->map(function ($avail) {
            return [
                'seller_id' => $avail->seller_id,
                'shop_name' => $avail->seller->shop_name ?? null,
                'name' => $avail->seller->user->name ?? null,
                'specialty' => $avail->seller->specialty ?? null,
                'location' => $avail->seller->location ?? null,
                'phone' => $avail->seller->phone ?? null,
                'start_time' => $avail->start_time,
                'end_time' => $avail->end_time,
                'max_bookings' => $avail->max_bookings,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $availableSellers,
            'date' => $date->toDateString(),
            'time' => $time,
        ]);
    }
}
