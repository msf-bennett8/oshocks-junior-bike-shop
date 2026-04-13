<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class NotificationRateLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return $next($request);
        }

        // Rate limit key: notification_api_{user_id}
        $key = "notification_api:{$user->id}";

        // Max 60 API calls per minute per user for notification endpoints
        if (RateLimiter::tooManyAttempts($key, 60)) {
            // Log rate limit hit
            AuditService::log([
                'event_type' => 'NOTIFICATION_RATE_LIMIT_HIT',
                'event_category' => 'security',
                'actor_type' => 'USER',
                'user_id' => $user->id,
                'action' => 'rate_limited',
                'description' => 'User hit notification API rate limit',
                'severity' => 'MEDIUM',
                'tier' => 'TIER_2_OPERATIONAL',
                'metadata' => [
                    'endpoint' => $request->path(),
                    'method' => $request->method(),
                    'retry_after' => RateLimiter::availableIn($key),
                ],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please slow down.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, 60); // Decay for 60 seconds

        return $next($request);
    }
}