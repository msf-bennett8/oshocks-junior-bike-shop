<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRentalPayout;
use App\Services\ListerPayoutService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BikeListerPayoutController extends Controller
{
    /**
     * Get lister payout dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();
        $seller = $user->sellerProfile;

        if (!$seller) {
            return response()->json([
                'success' => false,
                'message' => 'No seller profile found',
            ], 404);
        }

        $dashboard = ListerPayoutService::getListerDashboard($seller->id);

        return response()->json([
            'success' => true,
            'data' => $dashboard,
        ]);
    }

    /**
     * Request payout
     */
    public function requestPayout(int $payoutId)
    {
        $user = Auth::user();
        $payout = BikeRentalPayout::findOrFail($payoutId);

        // Verify ownership
        if ($payout->seller_id !== $user->sellerProfile?->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payout = ListerPayoutService::requestPayout($payoutId);

        return response()->json([
            'success' => true,
            'data' => $payout,
            'message' => 'Payout requested successfully',
        ]);
    }

    /**
     * Get payout history
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $seller = $user->sellerProfile;

        if (!$seller) {
            return response()->json([
                'success' => false,
                'message' => 'No seller profile found',
            ], 404);
        }

        $payouts = BikeRentalPayout::where('seller_id', $seller->id)
            ->with('booking.bike')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }

    /**
     * Update payout preference (weekly/monthly)
     */
    public function updatePreference(Request $request)
    {
        $user = Auth::user();
        $seller = $user->sellerProfile;

        if (!$seller) {
            return response()->json([
                'success' => false,
                'message' => 'No seller profile found',
            ], 404);
        }

        $validated = $request->validate([
            'payout_period' => 'required|in:weekly,monthly',
        ]);

        $seller->update([
            'payout_period' => $validated['payout_period'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $seller->fresh(),
            'message' => 'Payout preference updated to ' . $validated['payout_period'],
        ]);
    }
}
