<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserPreferenceController extends Controller
{
    /**
     * Get user preferences
     * GET /api/v1/user/preferences
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        $preferences = UserPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'language' => 'en',
                'currency' => 'KES',
                'email_notifications' => true,
                'sms_notifications' => true,
                'order_updates' => true,
                'promotional_emails' => true,
                'new_arrivals' => false,
                'price_drop_alerts' => true,
                'newsletter' => true,
                'two_factor_auth' => false,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $preferences->only([
                'language', 'currency', 'email_notifications', 'sms_notifications',
                'order_updates', 'promotional_emails', 'new_arrivals', 
                'price_drop_alerts', 'newsletter', 'two_factor_auth'
            ])
        ]);
    }

    /**
     * Update user preferences
     * PUT /api/v1/user/preferences
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'language' => 'sometimes|in:en,sw',
            'currency' => 'sometimes|in:KES,USD,EUR',
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'order_updates' => 'sometimes|boolean',
            'promotional_emails' => 'sometimes|boolean',
            'new_arrivals' => 'sometimes|boolean',
            'price_drop_alerts' => 'sometimes|boolean',
            'newsletter' => 'sometimes|boolean',
            'two_factor_auth' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        $preferences = UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            $validator->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
            'data' => $preferences->only([
                'language', 'currency', 'email_notifications', 'sms_notifications',
                'order_updates', 'promotional_emails', 'new_arrivals', 
                'price_drop_alerts', 'newsletter', 'two_factor_auth'
            ])
        ]);
    }
}
