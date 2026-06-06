<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BikeRentalBooking;
use App\Models\BikeRental;
use App\Services\BikeRecirculationService;
use App\Services\LateReturnFineService;
use App\Services\ListerPayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BikeBookingModerationController extends Controller
{
    /**
     * Get all bookings for moderation
     */
    public function index(Request $request)
    {
        $query = BikeRentalBooking::with(['bike', 'renter', 'owner'])
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('listing_code')) {
            $query->whereHas('bike', function ($q) use ($request) {
                $q->where('listing_code', $request->listing_code);
            });
        }

        $bookings = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get booking stats for dashboard
     */
    public function stats()
    {
        $now = now();

        $stats = [
            'total_bookings' => BikeRentalBooking::count(),
            'active_rentals' => BikeRentalBooking::where('status', 'active')->count(),
            'pending_payment' => BikeRentalBooking::where('status', 'pending_payment')->count(),
            'completed' => BikeRentalBooking::where('status', 'completed')->count(),
            'overdue' => BikeRentalBooking::where('status', 'active')->where('end_datetime', '<', $now)->count(),
            'pending_recirculation' => BikeRentalBooking::where('status', 'active')
                ->where('end_datetime', '<', $now)
                ->where('recirculated', false)
                ->count(),
            'total_revenue' => BikeRentalBooking::where('status', 'completed')->sum('grand_total'),
            'total_commission' => BikeRentalBooking::where('status', 'completed')->sum('platform_fee'),
            'best_rented_bikes' => BikeRental::selectRaw('id, name, listing_code, total_rentals')
                ->orderBy('total_rentals', 'desc')
                ->limit(5)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Mark bike as returned and recirculate
     */
    public function recirculate(Request $request, string $bookingCode)
    {
        $user = Auth::user();
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        $result = BikeRecirculationService::markAsReturned($booking->id, $user->id);

        return response()->json([
            'success' => $result['success'],
            'data' => $result,
            'message' => $result['message'],
        ]);
    }

    /**
     * Apply late return fine
     */
    public function applyFine(Request $request, string $bookingCode)
    {
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
        ]);

        $result = LateReturnFineService::applyFine($booking->id, $validated['amount'] ?? null);

        return response()->json($result);
    }

    /**
     * Remove late return fine
     */
    public function removeFine(string $bookingCode)
    {
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        $result = LateReturnFineService::removeFine($booking->id);

        return response()->json($result);
    }

    /**
     * Refund security deposit
     */
    public function refundDeposit(Request $request, string $bookingCode)
    {
        $user = Auth::user();
        $booking = BikeRentalBooking::where('booking_code', $bookingCode)->firstOrFail();

        if (!$booking->returned_at) {
            return response()->json([
                'success' => false,
                'message' => 'Bike must be marked as returned before refunding deposit',
            ], 400);
        }

        $booking->update([
            'deposit_refunded' => true,
            'deposit_refunded_at' => now(),
            'deposit_refunded_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Security deposit refunded successfully',
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Get pending recirculation list
     */
    public function pendingRecirculation()
    {
        $pending = BikeRecirculationService::getPendingRecirculation();

        return response()->json([
            'success' => true,
            'data' => $pending,
        ]);
    }

    /**
     * Process lister payout
     */
    public function processPayout(Request $request, int $payoutId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'method' => 'required|string|in:mpesa,bank_transfer',
            'reference' => 'required|string',
        ]);

        $payout = ListerPayoutService::processPayout($payoutId, $user->id, $validated['method'], $validated['reference']);

        return response()->json([
            'success' => true,
            'data' => $payout,
            'message' => 'Payout processed successfully',
        ]);
    }

    /**
     * Delay lister payout
     */
    public function delayPayout(Request $request, int $payoutId)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'notes' => 'required|string|max:500',
        ]);

        $payout = ListerPayoutService::delayPayout($payoutId, $user->id, $validated['notes']);

        return response()->json([
            'success' => true,
            'data' => $payout,
            'message' => 'Payout delayed with watermark',
        ]);
    }
}
