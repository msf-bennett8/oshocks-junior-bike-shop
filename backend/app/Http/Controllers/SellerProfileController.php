<?php

namespace App\Http\Controllers;

use App\Models\SellerProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SellerProfileController extends Controller
{
    /**
     * Display a listing of sellers
     */
    public function index(Request $request)
    {
        $query = SellerProfile::with('user');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by business name
        if ($request->has('search')) {
            $query->where('business_name', 'like', '%' . $request->search . '%');
        }

        $sellers = $query->paginate(15);

        return response()->json($sellers);
    }

    /**
     * Display the specified seller
     */
    public function show($id)
    {
        $seller = SellerProfile::with('user')->findOrFail($id);

        return response()->json($seller);
    }

    /**
     * Get seller's products
     */
    public function products($id)
    {
        $seller = SellerProfile::findOrFail($id);
        $products = $seller->products()->paginate(20);

        return response()->json($products);
    }

    /**
     * Get seller availability for a specific date
     * GET /api/v1/sellers/{id}/availability?date=YYYY-MM-DD
     */
    public function getAvailability(Request $request, $id): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());
        $dayOfWeek = date('w', strtotime($date));

        // Get regular weekly availability
        $regularSlots = \App\Models\SellerAvailability::where('seller_id', $id)
            ->where('day_of_week', $dayOfWeek)
            ->whereNull('specific_date')
            ->where('is_available', true)
            ->get();

        // Get date-specific overrides
        $overrideSlots = \App\Models\SellerAvailability::where('seller_id', $id)
            ->where('specific_date', $date)
            ->get();

        // If overrides exist, use them; otherwise use regular slots
        $slots = $overrideSlots->isNotEmpty() ? $overrideSlots : $regularSlots;

        // Check existing bookings for conflicts
        $existingBookings = \App\Models\ServiceBooking::where('seller_id', $id)
            ->whereDate('confirmed_date', $date)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->get();

        $slotsWithAvailability = $slots->map(function ($slot) use ($existingBookings) {
            $slotStart = $slot->start_time ? substr($slot->start_time, 0, 5) : '09:00';
            $bookingsAtSlot = $existingBookings->filter(function ($booking) use ($slotStart) {
                $bookingTime = $booking->confirmed_date ? substr($booking->confirmed_date, 11, 5) : null;
                return $bookingTime === $slotStart;
            })->count();

            $maxBookings = $slot->max_bookings ?? 1;

            return [
                'id' => $slot->id,
                'start_time' => $slotStart,
                'end_time' => $slot->end_time ? substr($slot->end_time, 0, 5) : '17:00',
                'is_available' => $bookingsAtSlot < $maxBookings,
                'max_bookings' => $maxBookings,
                'current_bookings' => $bookingsAtSlot,
                'day_of_week' => $slot->day_of_week,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $slotsWithAvailability,
            'date' => $date,
            'seller_id' => $id,
        ]);
    }
}

