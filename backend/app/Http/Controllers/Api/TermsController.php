<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TermsEnforcementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TermsController extends Controller
{
    /**
     * Get user's terms acceptance status
     */
    public function status()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'data' => TermsEnforcementService::getUserTermsStatus($user->id),
        ]);
    }

    /**
     * Accept terms
     */
    public function accept(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'terms_type' => 'required|in:renting,listing,seller_payments',
        ]);

        $result = TermsEnforcementService::acceptTerms($user->id, $validated['terms_type']);

        return response()->json($result);
    }

    /**
     * Check if terms are accepted (for frontend validation)
     */
    public function check(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'terms_type' => 'required|in:renting,listing,seller_payments',
        ]);

        $check = TermsEnforcementService::checkTermsAcceptance($user->id, $validated['terms_type']);

        return response()->json([
            'success' => true,
            'data' => $check,
        ]);
    }
}
