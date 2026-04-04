<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;

class ApiKeyAuth
{
    /**
     * Handle API key authentication
     */
    public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('X-API-Key');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key required'
            ], 401);
        }

        // Hash the provided key for lookup
        $keyHash = hash('sha256', $apiKey);

        $keyRecord = ApiKey::where('key_hash', $keyHash)
            ->where('is_active', true)
            ->first();

        if (!$keyRecord) {
            // Log failed authentication attempt
            AuditService::log([
                'event_type' => 'api_key_auth_failed',
                'event_category' => 'security',
                'actor_type' => 'API_KEY',
                'action' => 'authentication_failed',
                'description' => 'Invalid API key used',
                'severity' => 'HIGH',
                'metadata' => [
                    'ip_address' => $request->ip(),
                    'key_prefix' => substr($apiKey, 0, 10),
                ],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid API key'
            ], 401);
        }

        // Check expiration
        if ($keyRecord->expires_at && $keyRecord->expires_at->isPast()) {
            AuditService::log([
                'event_type' => 'api_key_expired',
                'event_category' => 'security',
                'actor_type' => 'API_KEY',
                'user_id' => $keyRecord->user_id,
                'action' => 'authentication_failed',
                'description' => 'Expired API key used',
                'severity' => 'HIGH',
                'metadata' => [
                    'key_id' => $keyRecord->key_id,
                    'expired_at' => $keyRecord->expires_at,
                ],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'API key expired'
            ], 401);
        }

        // Update last used timestamp
        $keyRecord->update(['last_used_at' => now()]);

        // Attach key info to request for downstream use
        $request->attributes->add([
            'api_key_id' => $keyRecord->key_id,
            'api_key_user_id' => $keyRecord->user_id,
            'api_key_scopes' => $keyRecord->permissions_scope,
        ]);

        // Log API request (async in production)
        AuditService::logApiRequestReceived($keyRecord, [
            'endpoint' => $request->path(),
            'method' => $request->method(),
            'ip_address' => $request->ip(),
            'request_size' => strlen($request->getContent()),
            'correlation_id' => $request->header('X-Correlation-ID') ?? uniqid(),
        ]);

        return $next($request);
    }
}
