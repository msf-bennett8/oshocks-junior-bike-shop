<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRental;
use App\Models\BikeRentalBooking;
use App\Models\BikeAvailabilityBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BikeRentalBookingController extends Controller
{
    /**
     * Generate unique booking code
     */
    protected function generateBookingCode(): string
    {
        return 'BK' . strtoupper(Str::random(10));
    }

    /**
     * Create a booking with race-condition protection
     * Uses atomic lock + DB transaction to prevent double-booking
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'listing_code' => 'required|string',
            'start_datetime' => 'required|date|after:now',
            'end_datetime' => 'required|date|after:start_datetime',
            'duration_days' => 'required|integer|min:1',
            'duration_type' => 'required|in:hourly,daily,weekly,monthly',
            'duration_hours' => 'nullable|integer|min:1',
            'add_ons' => 'nullable|array',
            'insurance_opt_in' => 'boolean',
            'delivery_opt_in' => 'boolean',
            'payment_method' => 'required|string|in:mpesa,card,cod',
        ]);

        $listing = BikeRental::where('listing_code', $validated['listing_code'])
            ->where('listing_status', 'approved')
            ->where('is_active', true)
            ->firstOrFail();

        // Check terms acceptance for renters
        try {
            \App\Services\TermsEnforcementService::enforceTerms($user->id, 'renting');
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'code' => 'TERMS_NOT_ACCEPTED',
            ], 403);
        }

        // Check if user is trying to book their own bike (I remember ann btw😂😂)
        if ($listing->owner_id === $user->id) {
            return response()->json(['error' => 'Cannot book your own bike vro 😂😂'], 400);
        }

        $start = $validated['start_datetime'];
        $end = $validated['end_datetime'];

        // === RACE CONDITION PROTECTION ===
        // Use cache lock keyed by bike ID + date range hash
        $lockKey = "bike-booking-{$listing->id}-" . md5("{$start}-{$end}");
        $lock = Cache::lock($lockKey, 15); // 15-second lock

        if (!$lock->get()) {
            return response()->json([
                'error' => 'This bike is being booked by another user. Please try again.',
                'code' => 'CONCURRENT_BOOKING',
            ], 409);
        }

        try {
            return DB::transaction(function () use ($listing, $validated, $user, $start, $end) {

                // Re-check availability inside transaction with FOR UPDATE
                $overlapExists = BikeAvailabilityBlock::where('bike_rental_id', $listing->id)
                    ->where(function ($q) use ($start, $end) {
                        $q->where('start_datetime', '<', $end)
                          ->where('end_datetime', '>', $start);
                    })
                    ->lockForUpdate()
                    ->exists();

                if ($overlapExists) {
                    return response()->json([
                        'error' => 'This bike is no longer available for the selected dates.',
                        'code' => 'BIKE_UNAVAILABLE',
                    ], 409);
                }

                // Calculate pricing
                $durationDays = $validated['duration_days'];
                $dailyRate = $listing->daily_rate;
                $baseRental = $dailyRate * $durationDays;
                $securityDeposit = $listing->security_deposit;
                $deliveryFee = ($validated['delivery_opt_in'] ?? false) ? ($listing->delivery_fee ?? 0) : 0;
                $insuranceFee = ($validated['insurance_opt_in'] ?? false) ? (200 * $durationDays) : 0;

                $addOns = $validated['add_ons'] ?? [];
                $addOnsFee = 0;
                $addOnPrices = ['helmet' => 200, 'lights' => 150, 'lock' => 100, 'repair_kit' => 100, 'water_bottle' => 50, 'gloves' => 150];
                foreach ($addOns as $addon) {
                    $addOnsFee += $addOnPrices[$addon] ?? 0;
                }

                $platformFee = round($baseRental * 0.15, 2);
                $ownerPayout = round($baseRental * 0.85, 2);
                $grandTotal = $baseRental + $securityDeposit + $deliveryFee + $insuranceFee + $addOnsFee + $platformFee;

                $bookingCode = $this->generateBookingCode();

                // Create the booking
                $booking = BikeRentalBooking::create([
                    'booking_code' => $bookingCode,
                    'bike_rental_id' => $listing->id,
                    'renter_id' => $user->id,
                    'owner_id' => $listing->owner_id,
                    'start_datetime' => $start,
                    'end_datetime' => $end,
                    'duration_days' => $durationDays,
                    'duration_type' => $validated['duration_type'],
                    'duration_hours' => $validated['duration_hours'] ?? null,
                    'daily_rate' => $dailyRate,
                    'total_rental_fee' => $baseRental,
                    'security_deposit' => $securityDeposit,
                    'delivery_fee' => $deliveryFee,
                    'insurance_fee' => $insuranceFee,
                    'add_ons_fee' => $addOnsFee,
                    'platform_fee' => $platformFee,
                    'owner_payout' => $ownerPayout,
                    'grand_total' => $grandTotal,
                    'add_ons' => $addOns,
                    'status' => 'pending_payment',
                    'payment_method' => $validated['payment_method'],
                ]);

                // Create availability block to prevent other bookings
                BikeAvailabilityBlock::create([
                    'bike_rental_id' => $listing->id,
                    'block_type' => 'booking',
                    'start_datetime' => $start,
                    'end_datetime' => $end,
                    'booking_id' => $booking->id,
                    'reason' => 'Rental booking ' . $bookingCode,
                    'created_by' => $user->id,
                ]);

                // Increment total rentals on listing
                $listing->increment('total_rentals');

                Log::info('Bike rental booking created', [
                    'booking_code' => $bookingCode,
                    'bike_id' => $listing->id,
                    'renter_id' => $user->id,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Booking created. Proceed to payment.',
                    'data' => [
                        'booking' => $booking,
                        'booking_code' => $bookingCode,
                        'payment_amount' => $grandTotal,
                        'payment_reference' => $bookingCode,
                    ],
                ], 201);

            }, 3); // 3 retry attempts for deadlocks
        } finally {
            $lock->release();
        }
    }

    /**
     * Get my bookings (as renter)
     */
    public function myBookings(Request $request)
    {
        $user = Auth::user();
        $bookings = BikeRentalBooking::where('renter_id', $user->id)
            ->with(['bike:id,name,listing_code,photos,daily_rate', 'bike.owner:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get bookings for my listings (as owner)
     */
    public function ownerBookings(Request $request)
    {
        $user = Auth::user();
        $bookings = BikeRentalBooking::where('owner_id', $user->id)
            ->with(['bike:id,name,listing_code', 'renter:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get single booking
     */
    public function show(string $bookingCode)
    {
        $user = Auth::user();
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)
            ->with(['bike', 'renter:id,name,avatar,phone', 'owner:id,name,avatar,phone'])
            ->firstOrFail();

        if ($booking->renter_id !== $user->id && $booking->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Update booking status (owner/admin)
     */
    public function updateStatus(Request $request, string $bookingCode)
    {
        $user = Auth::user();
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        $isOwner = $booking->owner_id === $user->id;
        $isAdmin = $user->hasAdminAccess();

        if (!$isOwner && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:confirmed,active,returned,completed,cancelled,disputed',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $booking->status;
        $newStatus = $validated['status'];

        // Status transition validation
        $validTransitions = [
            'pending_payment' => ['confirmed', 'cancelled'],
            'confirmed' => ['active', 'cancelled'],
            'active' => ['returned', 'disputed'],
            'returned' => ['completed', 'disputed'],
            'disputed' => ['completed', 'refunded'],
        ];

        if (!in_array($newStatus, $validTransitions[$oldStatus] ?? [])) {
            return response()->json([
                'error' => "Cannot transition from {$oldStatus} to {$newStatus}",
            ], 400);
        }

        $updateData = ['status' => $newStatus];

        if ($newStatus === 'active') {
            // Update bike recirculation status
            $bike = BikeRental::find($booking->bike_rental_id);
            if ($bike) {
                $bike->update([
                    'recirculation_status' => 'rented',
                    'last_rented_at' => now(),
                    'next_available_at' => $booking->end_datetime,
                ]);
            }
            $updateData['picked_up_at'] = now();
        }
        if ($newStatus === 'returned') {
            $updateData['returned_at'] = now();
        }
        if ($newStatus === 'completed') {
            $updateData['returned_at'] = $updateData['returned_at'] ?? now();
            $updateData['recirculated'] = true;
            $updateData['recirculated_at'] = now();
            $updateData['recirculated_by'] = $user->id;

            // Update bike recirculation status
            $bike = BikeRental::find($booking->bike_rental_id);
            if ($bike) {
                $bike->update([
                    'recirculation_status' => 'available',
                    'next_available_at' => null,
                ]);
            }
        }
        if ($newStatus === 'cancelled') {
            $updateData['cancelled_at'] = now();
            // Remove availability block
            BikeAvailabilityBlock::where('booking_id', $booking->id)->delete();

            // Update bike recirculation status
            $bike = BikeRental::find($booking->bike_rental_id);
            if ($bike) {
                $bike->update([
                    'recirculation_status' => 'available',
                    'next_available_at' => null,
                ]);
            }
        }

        if (!empty($validated['notes'])) {
            if ($newStatus === 'returned' || $newStatus === 'disputed') {
                $updateData['return_notes'] = $validated['notes'];
            } else {
                $updateData['pickup_notes'] = $validated['notes'];
            }
        }

        $booking->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Booking status updated to {$newStatus}",
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Cancel booking (renter)
     */
    public function cancel(Request $request, string $bookingCode)
    {
        $user = Auth::user();
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        if ($booking->renter_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!in_array($booking->status, ['pending_payment', 'confirmed'])) {
            return response()->json([
                'error' => 'Cannot cancel booking with status: ' . $booking->status,
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['reason'] ?? null,
        ]);

        // Remove availability block
        BikeAvailabilityBlock::where('booking_id', $booking->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled',
        ]);
    }

    /**
     * Get availability calendar for a bike
     */
    public function availabilityCalendar(Request $request, string $listingCode)
    {
        $validated = $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);

        $listing = BikeRental::where('listing_code', $listingCode)
            ->where('listing_status', 'approved')
            ->firstOrFail();

        $startOfMonth = \Carbon\Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $blocks = BikeAvailabilityBlock::where('bike_rental_id', $listing->id)
            ->where(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('start_datetime', [$startOfMonth, $endOfMonth])
                  ->orWhereBetween('end_datetime', [$startOfMonth, $endOfMonth])
                  ->orWhere(function ($sq) use ($startOfMonth, $endOfMonth) {
                      $sq->where('start_datetime', '<=', $startOfMonth)
                         ->where('end_datetime', '>=', $endOfMonth);
                  });
            })
            ->get(['start_datetime', 'end_datetime', 'block_type', 'reason']);

        return response()->json([
            'success' => true,
            'data' => [
                'month' => $validated['month'],
                'blocks' => $blocks,
            ],
        ]);
    }

    /**
     * Get payout records for a booking
     */
    public function getPayouts(Request $request)
    {
        $bookingId = $request->get('booking_id');
        $payouts = BikeRentalPayout::where('booking_id', $bookingId)
            ->with('seller', 'paidBy', 'delayedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }

    /**
     * Create payout record for a booking
     */
    public function createPayout(Request $request, string $bookingCode)
    {
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        // Check if payout already exists
        $existing = BikeRentalPayout::where('booking_id', $booking->id)->first();
        if ($existing) {
            return response()->json([
                'success' => true,
                'data' => $existing,
                'message' => 'Payout record already exists',
            ]);
        }

        $payout = ListerPayoutService::createPayout($booking);

        return response()->json([
            'success' => true,
            'data' => $payout,
            'message' => 'Payout record created',
        ]);
    }
}
