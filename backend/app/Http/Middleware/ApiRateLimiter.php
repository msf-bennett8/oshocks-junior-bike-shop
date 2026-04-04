<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

class ApiRateLimiter
{
    /**
     * Handle rate limiting with audit logging
     */
    public function handle(Request $request, Closure $next)
    {
        $key = $this->resolveRequestSignature($request);
        
        // Different limits for different key types
        $maxAttempts = $this->getMaxAttempts($request);
        $decayMinutes = 1;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            // Log rate limit trigger
            $this->logRateLimitTriggered($request, $key, $maxAttempts);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many requests',
                'retry_after_seconds' => $retryAfter,
            ], 429);
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers
        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => max(0, $maxAttempts - RateLimiter::attempts($key)),
        ]);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting
     */
    private function resolveRequestSignature(Request $request): string
    {
        // Use API key if available, otherwise IP
        $apiKey = $request->header('X-API-Key');
        if ($apiKey) {
            return 'api_key:' . hash('sha256', $apiKey);
        }

        return 'ip:' . $request->ip();
    }

    /**
     * Get max attempts based on request type
     */
    private function getMaxAttempts(Request $request): int
    {
        $apiKey = $request->header('X-API-Key');
        
        if ($apiKey) {
            // Authenticated API keys get higher limits
            return 1000; // 1000 requests per minute
        }

        // Unauthenticated/IP-based limits
        return 60; // 60 requests per minute
    }

    /**
     * Log rate limit trigger
     */
    private function logRateLimitTriggered(Request $request, string $key, int $threshold): void
    {
        $apiKeyId = $request->attributes->get('api_key_id');
        $actualRate = RateLimiter::attempts($key);

        AuditService::logApiRateLimitTriggered(
            $apiKeyId ? \App\Models\ApiKey::where('key_id', $apiKeyId)->first() : null,
            [
                'endpoint' => $request->path(),
                'limit_type' => $apiKeyId ? 'authenticated' : 'ip_based',
                'threshold' => $threshold,
                'actual_rate' => $actualRate,
                'ip_address' => $request->ip(),
                'action_taken' => 'throttle',
            ]
        );
    }
}
