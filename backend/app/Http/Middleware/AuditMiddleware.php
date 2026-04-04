<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Generate correlation ID if not present
        if (!$request->hasHeader('X-Correlation-ID')) {
            $correlationId = (string) \Illuminate\Support\Str::uuid();
            $request->headers->set('X-Correlation-ID', $correlationId);
        }

        // Store in request attributes for easy access
        $request->attributes->set('correlation_id', $request->header('X-Correlation-ID'));
        $request->attributes->set('request_id', (string) \Illuminate\Support\Str::uuid());
        $request->attributes->set('audit_timestamp', now()->toIso8601String());

        // Process the request
        $response = $next($request);

        // Add audit headers to response
        $response->headers->set('X-Correlation-ID', $request->header('X-Correlation-ID'));
        $response->headers->set('X-Request-ID', $request->attributes->get('request_id'));

        // Log the request (but don't let it break the response)
        $this->logRequest($request, $response);

        return $response;
    }

    /**
     * Log the HTTP request and response
     */
    private function logRequest(Request $request, Response $response): void
    {
        // Skip logging for health checks and certain public endpoints
        if ($this->shouldSkipLogging($request)) {
            return;
        }

        try {
            $user = \Illuminate\Support\Facades\Auth::user();
            
            // Build context data
            $context = [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'path' => $request->path(),
                'route_name' => $request->route()?->getName(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'request_headers' => $this->filterSensitiveHeaders($request->headers->all()),
                'response_status' => $response->getStatusCode(),
            ];

            // Add request body for non-GET requests (filter sensitive data)
            if (!in_array($request->method(), ['GET', 'HEAD'])) {
                $context['request_body'] = $this->filterSensitiveData($request->all());
            }

            // Log based on response status
            if ($response->getStatusCode() >= 500) {
                Log::error('API Server Error', $context);
            } elseif ($response->getStatusCode() >= 400) {
                Log::warning('API Client Error', $context);
            } else {
                Log::info('API Request', $context);
            }

        } catch (\Exception $e) {
            // Don't let audit logging break the application
            Log::error('Audit middleware logging failed: ' . $e->getMessage());
        }
    }

    /**
     * Check if this request should skip logging
     */
    private function shouldSkipLogging(Request $request): bool
    {
        $skipPaths = [
            'health',
            'system/metrics',
            'api/health',
            'notifications/pixel',
            'marketing/pixel',
            '_debugbar',
            'up', // Laravel health check
        ];

        $path = $request->path();

        foreach ($skipPaths as $skipPath) {
            if (str_contains($path, $skipPath)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Filter sensitive data from request/response
     */
    private function filterSensitiveData(array $data): array
    {
        $sensitiveKeys = [
            'password',
            'password_confirmation',
            'current_password',
            'new_password',
            'token',
            'access_token',
            'refresh_token',
            'authorization',
            'credit_card',
            'card_number',
            'cvv',
            'cvc',
            'pin',
            'secret',
            'api_key',
            'api_secret',
            'private_key',
        ];

        $filtered = [];

        foreach ($data as $key => $value) {
            $isSensitive = false;
            foreach ($sensitiveKeys as $sensitiveKey) {
                if (stripos($key, $sensitiveKey) !== false) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $filtered[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $filtered[$key] = $this->filterSensitiveData($value);
            } else {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }

    /**
     * Filter sensitive headers
     */
    private function filterSensitiveHeaders(array $headers): array
    {
        $sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-api-secret',
            'x-auth-token',
        ];

        $filtered = [];

        foreach ($headers as $name => $values) {
            if (in_array(strtolower($name), $sensitiveHeaders)) {
                $filtered[$name] = ['[REDACTED]'];
            } else {
                $filtered[$name] = $values;
            }
        }

        return $filtered;
    }
}