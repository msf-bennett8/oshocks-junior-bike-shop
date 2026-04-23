<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LegalController extends Controller
{
    /**
     * Record legal document acceptance
     */
    public function recordAcceptance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'terms_version' => 'required|string',
            'privacy_version' => 'required|string',
            'cookie_version' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $user->update([
            'terms_version' => $request->terms_version,
            'privacy_version' => $request->privacy_version,
            'cookie_version' => $request->cookie_version,
            'legal_accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Legal acceptance recorded successfully',
        ]);
    }

    /**
     * Get legal acceptance status
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'terms_version' => $user->terms_version,
                'privacy_version' => $user->privacy_version,
                'cookie_version' => $user->cookie_version,
                'legal_accepted_at' => $user->legal_accepted_at,
                'has_accepted' => !is_null($user->legal_accepted_at),
            ],
        ]);
    }
}
