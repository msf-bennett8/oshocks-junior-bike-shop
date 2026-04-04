<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralCode;
use App\Services\BusinessOperationsService;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    /**
     * Get or generate referral code
     * GET /api/v1/referrals/code
     */
    public function getCode(Request $request)
    {
        $user = $request->user();

        $code = ReferralCode::firstOrCreate(
            ['user_id' => $user->id],
            ['is_active' => true]
        );

        // Generate if new
        if (!$code->referral_code) {
            $code = BusinessOperationsService::generateReferralCode($user);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'referral_code' => $code->referral_code,
                'total_uses' => $code->total_uses,
                'successful_referrals' => $code->successful_referrals,
                'rewards_earned' => $code->rewards_earned,
            ]
        ]);
    }

    /**
     * Apply referral code during registration/order
     * POST /api/v1/referrals/apply
     */
    public function apply(Request $request)
    {
        $code = $request->input('code');
        
        $referralCode = ReferralCode::where('referral_code', $code)
            ->where('is_active', true)
            ->first();

        if (!$referralCode) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid referral code'
            ], 400);
        }

        // Store in session for post-registration/order completion
        session(['applied_referral_code' => $code]);

        return response()->json([
            'success' => true,
            'message' => 'Referral code applied'
        ]);
    }

    /**
     * Get referral history
     * GET /api/v1/referrals/history
     */
    public function history(Request $request)
    {
        $code = ReferralCode::where('user_id', $request->user()->id)->first();

        if (!$code) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $history = $code->usages()
            ->with('referee:id,name', 'order:id,order_id,total_amount')
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }
}
