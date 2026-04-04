<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiKeyController extends Controller
{
    /**
     * Generate a cryptographically secure API key
     */
    private function generateApiKey(): array
    {
        $prefix = 'os_live_' . Str::random(4);
        $rawKey = $prefix . '_' . Str::random(32);
        $keyHash = hash('sha256', $rawKey);
        
        return [
            'raw_key' => $rawKey,
            'prefix' => substr($rawKey, 0, 10),
            'key_hash' => $keyHash,
        ];
    }

    /**
     * Create new API key
     * POST /api/v1/api-keys
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'permissions_scope' => 'required|array',
            'permissions_scope.*' => 'in:read:products,write:products,read:orders,write:orders,read:users,admin',
            'environment' => 'required|in:production,staging,development',
            'expires_at' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $keyData = $this->generateApiKey();

        $apiKey = ApiKey::create([
            'user_id' => $user->id,
            'key_id' => 'key_' . Str::random(16),
            'key_hash' => $keyData['key_hash'],
            'prefix' => $keyData['prefix'],
            'name' => $request->name,
            'permissions_scope' => $request->permissions_scope,
            'environment' => $request->environment,
            'created_by' => $user->id,
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        // Log API key creation
        AuditService::logApiKeyCreated($user, $apiKey, [
            'key_hash_truncated' => substr($keyData['key_hash'], 0, 16) . '...',
            'service_name' => $request->name,
        ]);

        // Return the raw key ONLY ONCE
        return response()->json([
            'success' => true,
            'message' => 'API key created successfully. Store this key securely - it will not be shown again.',
            'data' => [
                'api_key' => $keyData['raw_key'], // SHOW ONCE
                'key_id' => $apiKey->key_id,
                'name' => $apiKey->name,
                'prefix' => $apiKey->prefix,
                'permissions_scope' => $apiKey->permissions_scope,
                'environment' => $apiKey->environment,
                'expires_at' => $apiKey->expires_at,
                'created_at' => $apiKey->created_at,
            ],
            'warning' => 'This is the only time you will see the full API key. Store it securely.'
        ], 201);
    }

    /**
     * List API keys (without showing full keys)
     * GET /api/v1/api-keys
     */
    public function index(Request $request)
    {
        $keys = ApiKey::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->select(['key_id', 'name', 'prefix', 'permissions_scope', 'environment', 'last_used_at', 'expires_at', 'created_at'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $keys
        ]);
    }

    /**
     * Rotate API key (graceful rotation with overlap)
     * POST /api/v1/api-keys/{keyId}/rotate
     */
    public function rotate(Request $request, $keyId)
    {
        $oldKey = ApiKey::where('key_id', $keyId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$oldKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
            'grace_period_hours' => 'nullable|integer|min:0|max:168', // Max 7 days
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $newKeyData = $this->generateApiKey();

        // Create new key
        $newKey = ApiKey::create([
            'user_id' => $user->id,
            'key_id' => 'key_' . Str::random(16),
            'key_hash' => $newKeyData['key_hash'],
            'prefix' => $newKeyData['prefix'],
            'name' => $oldKey->name . ' (rotated)',
            'permissions_scope' => $oldKey->permissions_scope,
            'environment' => $oldKey->environment,
            'created_by' => $user->id,
            'expires_at' => $oldKey->expires_at,
            'is_active' => true,
            'rotated_from' => $oldKey->key_id,
        ]);

        // Schedule old key deactivation
        $gracePeriod = $request->grace_period_hours ?? 24;
        $oldKey->update([
            'scheduled_deactivation' => now()->addHours($gracePeriod),
            'rotation_reason' => $request->reason ?? 'scheduled_rotation',
        ]);

        // Log rotation
        AuditService::logApiKeyRotated($user, $oldKey, $newKey, [
            'old_key_hash_truncated' => substr($oldKey->key_hash, 0, 16) . '...',
            'new_key_hash_truncated' => substr($newKeyData['key_hash'], 0, 16) . '...',
            'reason' => $request->reason ?? 'scheduled_rotation',
        ]);

        return response()->json([
            'success' => true,
            'message' => "API key rotated successfully. Old key will expire in {$gracePeriod} hours.",
            'data' => [
                'new_api_key' => $newKeyData['raw_key'], // SHOW ONCE
                'new_key_id' => $newKey->key_id,
                'old_key_id' => $oldKey->key_id,
                'grace_period_hours' => $gracePeriod,
                'old_key_expires_at' => $oldKey->scheduled_deactivation,
            ],
            'warning' => 'Store the new key securely. The old key remains active during the grace period.'
        ]);
    }

    /**
     * Revoke API key immediately
     * DELETE /api/v1/api-keys/{keyId}
     */
    public function revoke(Request $request, $keyId)
    {
        $key = ApiKey::where('key_id', $keyId)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$key) {
            return response()->json([
                'success' => false,
                'message' => 'API key not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Count active requests using this key (if trackable)
        $activeRequests = 0; // Would query request logs in production

        $key->update([
            'is_active' => false,
            'revoked_at' => now(),
            'revocation_reason' => $request->reason,
        ]);

        // Log revocation
        AuditService::logApiKeyRevoked($request->user(), $key, [
            'reason' => $request->reason,
            'active_requests_terminated' => $activeRequests,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'API key revoked successfully',
            'data' => [
                'key_id' => $key->key_id,
                'revoked_at' => now()->toIso8601String(),
                'reason' => $request->reason,
            ]
        ]);
    }

    /**
     * Cleanup expired keys (system job)
     */
    public function cleanupExpiredKeys(): void
    {
        $expiredKeys = ApiKey::where('is_active', true)
            ->whereNotNull('scheduled_deactivation')
            ->where('scheduled_deactivation', '<=', now())
            ->get();

        foreach ($expiredKeys as $key) {
            $key->update([
                'is_active' => false,
                'revoked_at' => now(),
                'revocation_reason' => 'grace_period_expired',
            ]);

            \Log::info("API key {$key->key_id} deactivated after grace period");
        }
    }
}
