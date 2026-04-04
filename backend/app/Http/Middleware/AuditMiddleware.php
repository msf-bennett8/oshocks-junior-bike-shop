<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Generate correlation ID if not present
        if (!$request->hasHeader('X-Correlation-ID')) {
            $correlationId = (string) Str::uuid();
            $request->headers->set('X-Correlation-ID', $correlationId);
        }

        // Store in request attributes for easy access
        $request->attributes->set('correlation_id', $request->header('X-Correlation-ID'));
        $request->attributes->set('request_id', (string) Str::uuid());
        $request->attributes->set('audit_timestamp', now()->toIso8601String());

        // Add to response headers
        $response = $next($request);
        $response->headers->set('X-Correlation-ID', $request->header('X-Correlation-ID'));
        $response->headers->set('X-Request-ID', $request->attributes->get('request_id'));

        return $response;
    }

    /**
     * Terminate middleware - log request completion
     */
    public function terminate(Request $request, $response): void
    {
        // This runs after response is sent - good for fire-and-forget audit logging
        if (config('audit.queue.enabled')) {
            // Queue-based logging would go here
        }
    }
}
