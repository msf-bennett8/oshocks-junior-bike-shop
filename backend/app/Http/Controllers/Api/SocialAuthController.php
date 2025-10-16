<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
            Log::info('🔵 Google OAuth Request:', [
                'has_code' => $request->has('code'),
                'code_length' => $request->code ? strlen($request->code) : 0
            ]);

            $request->validate([
                'code' => 'required|string',
            ]);

            // Exchange code for access token
            Log::info('🔄 Exchanging Google code for token...');
            
            $tokenResponse = Socialite::driver('google')
                ->stateless()
                ->getAccessTokenResponse($request->code);

            Log::info('✅ Google token received');

            // Get user info with the access token
            $googleUser = Socialite::driver('google')
                ->userFromToken($tokenResponse['access_token']);

            Log::info('✅ Google user info retrieved:', [
                'email' => $googleUser->getEmail(),
                'name' => $googleUser->getName()
            ]);

            // Find or create user
            $user = $this->findOrCreateUser($googleUser, 'google');

            // Generate Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('✅ Google authentication successful', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

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
            Log::error('❌ Google OAuth Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
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
            Log::info('🟠 Strava OAuth Request:', [
                'has_code' => $request->has('code'),
                'code_length' => $request->code ? strlen($request->code) : 0
            ]);

            $request->validate([
                'code' => 'required|string',
            ]);

            // Exchange code for access token
            Log::info('🔄 Exchanging Strava code for token...');
            
            $tokenResponse = Socialite::driver('strava')
                ->stateless()
                ->getAccessTokenResponse($request->code);

            Log::info('✅ Strava token received');

            // Get user info with the access token
            $stravaUser = Socialite::driver('strava')
                ->userFromToken($tokenResponse['access_token']);

            Log::info('✅ Strava user info retrieved:', [
                'id' => $stravaUser->getId(),
                'name' => $stravaUser->getName()
            ]);

            // Find or create user
            $user = $this->findOrCreateUser($stravaUser, 'strava');

            // Generate Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('✅ Strava authentication successful', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

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
            Log::error('❌ Strava OAuth Error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
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
        $email = $providerUser->getEmail() ?? null; // Explicitly set to null if missing
        $name = $providerUser->getName() ?? $providerUser->getNickname() ?? 'User';
        $avatar = $providerUser->getAvatar() ?? null;

        Log::info("🔍 Finding/creating user for {$provider}:", [
            'email' => $email,
            'provider_id' => $providerUser->getId()
        ]);

        // Check if user exists by provider ID
        $user = User::where($providerIdField, $providerUser->getId())->first();

        if ($user) {
            Log::info('✅ User found by provider ID, updating info');
            $user->update([
                'name' => $name,
                'avatar' => $avatar,
            ]);
            return $user;
        }

        // Check if user exists by email (only if email is provided)
        if ($email) {
            $user = User::where('email', $email)->first();

            if ($user) {
                Log::info('✅ User found by email, linking provider');
                $user->update([
                    $providerIdField => $providerUser->getId(),
                    'provider' => $provider,
                    'avatar' => $avatar,
                ]);
                return $user;
            }
        }

        // Create new user
        Log::info('✨ Creating new user');
        
        $user = User::create([
            'name' => $name,
            'email' => $email, // Will be null for Strava
            'password' => Hash::make(Str::random(32)),
            $providerIdField => $providerUser->getId(),
            'provider' => $provider,
            'avatar' => $avatar,
            'role' => 'buyer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        Log::info('✅ New user created:', ['user_id' => $user->id]);

        return $user;
    }
}