<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class SocialAuthController extends Controller
{
    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
            ]);

            // Get user from Google
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            // Find or create user
            $user = $this->findOrCreateUser($googleUser, 'google');

            // Generate Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Successfully authenticated with Google',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Strava OAuth callback
     */
    public function handleStravaCallback(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string',
            ]);

            // Get user from Strava
            $stravaUser = Socialite::driver('strava')
                ->stateless()
                ->user();

            // Find or create user
            $user = $this->findOrCreateUser($stravaUser, 'strava');

            // Generate Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Successfully authenticated with Strava',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer',
                ],
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Strava authentication failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Find or create user from OAuth provider
     */
    private function findOrCreateUser($providerUser, $provider)
    {
        $providerIdField = $provider . '_id';

        // Check if user exists by provider ID
        $user = User::where($providerIdField, $providerUser->id)->first();

        if ($user) {
            // Update user info
            $user->update([
                'name' => $providerUser->name ?? $providerUser->nickname,
                'avatar' => $providerUser->avatar ?? $providerUser->avatar_original,
            ]);
            return $user;
        }

        // Check if user exists by email
        $user = User::where('email', $providerUser->email)->first();

        if ($user) {
            // Link OAuth account to existing user
            $user->update([
                $providerIdField => $providerUser->id,
                'provider' => $provider,
                'avatar' => $providerUser->avatar ?? $providerUser->avatar_original,
            ]);
            return $user;
        }

        // Create new user
        $user = User::create([
            'name' => $providerUser->name ?? $providerUser->nickname,
            'email' => $providerUser->email,
            'password' => Hash::make(Str::random(32)), // Random password for OAuth users
            $providerIdField => $providerUser->id,
            'provider' => $provider,
            'avatar' => $providerUser->avatar ?? $providerUser->avatar_original,
            'role' => 'buyer', // Default role
            'is_active' => true,
            'email_verified_at' => now(), // OAuth emails are verified
        ]);

        return $user;
    }
}