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
use Illuminate\Support\Facades\DB;

class SocialAuthController extends Controller
{
    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        Log::info('========== GOOGLE OAUTH START ==========');
        Log::info('📥 Raw Request Data:', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'all_inputs' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        try {
            // Step 1: Validate request
            Log::info('🔍 Step 1: Validating request...');
            Log::info('Has code?', [
                'has_code' => $request->has('code'),
                'code_value' => $request->code ? substr($request->code, 0, 20) . '...' : 'null',
                'code_length' => $request->code ? strlen($request->code) : 0
            ]);

            $request->validate([
                'code' => 'required|string',
            ]);
            Log::info('✅ Step 1: Validation passed');

            // Step 2: Check environment variables
            Log::info('🔍 Step 2: Checking Google OAuth config...');
            Log::info('Google Config:', [
                'client_id_set' => !empty(config('services.google.client_id')),
                'client_secret_set' => !empty(config('services.google.client_secret')),
                'redirect_uri' => config('services.google.redirect'),
                'client_id_first_10' => substr(config('services.google.client_id'), 0, 10),
            ]);

            // Step 3: Exchange code for token
            Log::info('🔍 Step 3: Exchanging Google code for access token...');
            
            try {
                $tokenResponse = Socialite::driver('google')
                    ->stateless()
                    ->getAccessTokenResponse($request->code);
                
                Log::info('✅ Step 3: Token received successfully', [
                    'has_access_token' => isset($tokenResponse['access_token']),
                    'token_type' => $tokenResponse['token_type'] ?? 'unknown',
                    'expires_in' => $tokenResponse['expires_in'] ?? 'unknown',
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 3 FAILED: Token exchange error', [
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                ]);
                throw $e;
            }

            // Step 4: Get user info
            Log::info('🔍 Step 4: Fetching Google user info...');
            
            try {
                $googleUser = Socialite::driver('google')
                    ->userFromToken($tokenResponse['access_token']);

                Log::info('✅ Step 4: Google user info retrieved', [
                    'id' => $googleUser->getId(),
                    'email' => $googleUser->getEmail(),
                    'name' => $googleUser->getName(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 4 FAILED: User info retrieval error', [
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                ]);
                throw $e;
            }

            // Step 5: Find or create user
            Log::info('🔍 Step 5: Finding or creating user...');
            
            try {
                $user = $this->findOrCreateUser($googleUser, 'google');
                Log::info('✅ Step 5: User ready', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'is_new' => $user->wasRecentlyCreated ?? false,
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 5 FAILED: User creation error', [
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                ]);
                throw $e;
            }

            // Step 6: Generate token
            Log::info('🔍 Step 6: Generating Sanctum token...');
            
            try {
                $token = $user->createToken('auth_token')->plainTextToken;
                Log::info('✅ Step 6: Token generated', [
                    'token_length' => strlen($token),
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 6 FAILED: Token generation error', [
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                ]);
                throw $e;
            }

            Log::info('🎉 GOOGLE OAUTH SUCCESS', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            Log::info('========== GOOGLE OAUTH END ==========');

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
            Log::error('💥 GOOGLE OAUTH FATAL ERROR', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'code' => $e->getCode(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            Log::info('========== GOOGLE OAUTH END (ERROR) ==========');
            
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed',
                'error' => $e->getMessage(),
                'debug' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'class' => get_class($e),
                ],
            ], 500);
        }
    }

    /**
     * Handle Strava OAuth callback
     */
    public function handleStravaCallback(Request $request)
    {
        Log::info('========== STRAVA OAUTH START ==========');
        Log::info('📥 Raw Request Data:', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'all_inputs' => $request->all(),
        ]);

        try {
            // Step 1: Validate
            Log::info('🔍 Step 1: Validating request...');
            Log::info('Has code?', [
                'has_code' => $request->has('code'),
                'code_length' => $request->code ? strlen($request->code) : 0
            ]);

            $request->validate([
                'code' => 'required|string',
            ]);
            Log::info('✅ Step 1: Validation passed');

            // Step 2: Check config
            Log::info('🔍 Step 2: Checking Strava OAuth config...');
            Log::info('Strava Config:', [
                'client_id' => config('services.strava.client_id'),
                'client_secret_set' => !empty(config('services.strava.client_secret')),
                'redirect_uri' => config('services.strava.redirect'),
            ]);

            // Step 3: Exchange code
            Log::info('🔍 Step 3: Exchanging Strava code for token...');
            
            try {
                $tokenResponse = Socialite::driver('strava')
                    ->stateless()
                    ->getAccessTokenResponse($request->code);
                
                Log::info('✅ Step 3: Token received', [
                    'has_access_token' => isset($tokenResponse['access_token']),
                    'athlete_id' => $tokenResponse['athlete']['id'] ?? 'unknown',
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 3 FAILED: Token exchange error', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }

            // Step 4: Get user info
            Log::info('🔍 Step 4: Fetching Strava user info...');
            
            try {
                $stravaUser = Socialite::driver('strava')
                    ->userFromToken($tokenResponse['access_token']);

                Log::info('✅ Step 4: Strava user info retrieved', [
                    'id' => $stravaUser->getId(),
                    'name' => $stravaUser->getName(),
                    'email' => $stravaUser->getEmail(),
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 4 FAILED: User info error', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }

            // Step 5: Find/create user
            Log::info('🔍 Step 5: Finding or creating user...');
            
            try {
                $user = $this->findOrCreateUser($stravaUser, 'strava');
                Log::info('✅ Step 5: User ready', [
                    'user_id' => $user->id,
                ]);
            } catch (Exception $e) {
                Log::error('❌ Step 5 FAILED: User creation error', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }

            // Step 6: Generate token
            Log::info('🔍 Step 6: Generating token...');
            
            try {
                $token = $user->createToken('auth_token')->plainTextToken;
                Log::info('✅ Step 6: Token generated');
            } catch (Exception $e) {
                Log::error('❌ Step 6 FAILED: Token error', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }

            Log::info('🎉 STRAVA OAUTH SUCCESS', [
                'user_id' => $user->id,
            ]);
            Log::info('========== STRAVA OAUTH END ==========');

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
            Log::error('💥 STRAVA OAUTH FATAL ERROR', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            Log::info('========== STRAVA OAUTH END (ERROR) ==========');
            
            return response()->json([
                'success' => false,
                'message' => 'Strava authentication failed',
                'error' => $e->getMessage(),
                'debug' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ],
            ], 500);
        }
    }

    /**
     * Find or create user from OAuth provider
     */
    private function findOrCreateUser($providerUser, $provider)
    {
        Log::info("🔍 findOrCreateUser START for {$provider}");
        
        $providerIdField = $provider . '_id';
        $email = $providerUser->getEmail() ?? null;
        $name = $providerUser->getName() ?? $providerUser->getNickname() ?? 'User';
        $avatar = $providerUser->getAvatar() ?? null;

        Log::info("📋 Provider user data:", [
            'provider' => $provider,
            'provider_id' => $providerUser->getId(),
            'email' => $email,
            'name' => $name,
            'has_avatar' => !empty($avatar),
        ]);

        // Step 1: Check by provider ID
        Log::info("🔍 Step 1: Searching by {$providerIdField}...");
        
        try {
            $user = User::where($providerIdField, $providerUser->getId())->first();
            
            if ($user) {
                Log::info('✅ User found by provider ID', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
                
                Log::info('🔄 Updating user info...');
                $user->update([
                    'name' => $name,
                    'avatar' => $avatar,
                ]);
                Log::info('✅ User updated');
                
                return $user;
            }
            
            Log::info('❌ No user found by provider ID');
        } catch (Exception $e) {
            Log::error('❌ Error searching by provider ID', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }

        // Step 2: Check by email (if provided)
        if ($email) {
            Log::info('🔍 Step 2: Searching by email...');
            
            try {
                $user = User::where('email', $email)->first();

                if ($user) {
                    Log::info('✅ User found by email', [
                        'user_id' => $user->id,
                    ]);
                    
                    Log::info('🔗 Linking provider to existing user...');
                    $user->update([
                        $providerIdField => $providerUser->getId(),
                        'provider' => $provider,
                        'avatar' => $avatar,
                    ]);
                    Log::info('✅ Provider linked');
                    
                    return $user;
                }
                
                Log::info('❌ No user found by email');
            } catch (Exception $e) {
                Log::error('❌ Error searching by email', [
                    'error' => $e->getMessage(),
                ]);
                throw $e;
            }
        } else {
            Log::info('⏭️  Step 2: Skipped (no email provided)');
        }

        // Step 3: Create new user
        Log::info('✨ Step 3: Creating new user...');
        
        $userData = [
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(Str::random(32)),
            $providerIdField => $providerUser->getId(),
            'provider' => $provider,
            'avatar' => $avatar,
            'role' => 'buyer',
            'is_active' => true,
            'email_verified_at' => now(),
        ];
        
        Log::info('📝 User data to create:', array_merge($userData, [
            'password' => '[HIDDEN]',
        ]));

        try {
            // Check database connection
            Log::info('🔌 Testing database connection...');
            DB::connection()->getPdo();
            Log::info('✅ Database connected');
            
            $user = User::create($userData);
            
            Log::info('🎉 New user created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            return $user;
        } catch (Exception $e) {
            Log::error('💥 FATAL: User creation failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'sql_state' => $e->getCode(),
            ]);
            throw $e;
        }
    }
}