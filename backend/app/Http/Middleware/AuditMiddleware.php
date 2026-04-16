<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use App\Services\AuditService;
use App\Services\AuditContextService;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Generate correlation ID if not present
        if (!$request->hasHeader('X-Correlation-ID')) {
            $correlationId = (string) \Illuminate\Support\Str::uuid();
            $request->headers->set('X-Correlation-ID', $correlationId);
        }

        // Store in request attributes for easy access
        $request->attributes->set('correlation_id', $request->header('X-Correlation-ID'));
        $request->attributes->set('request_id', (string) \Illuminate\Support\Str::uuid());
        $request->attributes->set('audit_timestamp', now()->toIso8601String());
        $request->attributes->set('audit_start_time', $startTime);

        // Initialize audit context
        AuditContextService::initialize();

        // Process the request
        $response = $next($request);

        // Calculate duration
        $duration = round((microtime(true) - $startTime) * 1000, 2); // milliseconds
        
        // Update context with duration
        AuditContextService::set('request_duration_ms', $duration);

        // Add audit headers to response
        $response->headers->set('X-Correlation-ID', $request->header('X-Correlation-ID'));
        $response->headers->set('X-Request-ID', $request->attributes->get('request_id'));
        $response->headers->set('X-Response-Time', $duration . 'ms');

        // Log the request using structured audit service
        $this->logRequest($request, $response, $duration);

        return $response;
    }

    /**
     * Log the HTTP request and response using AuditService
     */
    private function logRequest(Request $request, Response $response, float $duration): void
    {
        // Skip logging for health checks and certain public endpoints
        if ($this->shouldSkipLogging($request)) {
            return;
        }

        try {
            $user = \Illuminate\Support\Facades\Auth::user();
            $statusCode = $response->getStatusCode();
            
            // Determine severity based on response status
            $severity = match(true) {
                $statusCode >= 500 => 'high',
                $statusCode >= 400 => 'medium',
                default => 'low',
            };

            // SAMPLING: For high-frequency low-value endpoints, only log 10% of requests
            $samplingPaths = [
                'notifications/unread-count',
                'notifications',
                'user/preferences',
                'user/stats',
                'dashboard',
            ];
            
            $path = $request->path();
            foreach ($samplingPaths as $samplingPath) {
                if (str_contains($path, $samplingPath) && $severity === 'low') {
                    // Only log 10% of these requests (1 in 10)
                    if (rand(1, 10) !== 1) {
                        return; // Skip logging this request
                    }
                    break;
                }
            }

            // Build metadata
            $metadata = [
                'request_method' => $request->method(),
                'request_path' => $request->path(),
                'route_name' => $request->route()?->getName(),
                'response_status' => $statusCode,
                'response_duration_ms' => $duration,
                'response_size_bytes' => strlen($response->getContent()),
                'request_headers' => $this->filterSensitiveHeaders($request->headers->all()),
                'correlation_id' => $request->header('X-Correlation-ID'),
                'request_id' => $request->attributes->get('request_id'),
            ];

            // Add request body for state-changing requests (filter sensitive data)
            if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                $metadata['request_body'] = $this->filterSensitiveData($request->all());
            }

            // Determine event type based on response status
            $eventType = match(true) {
                $statusCode >= 500 => 'API_ERROR_SERVER',
                $statusCode === 429 => 'API_RATE_LIMITED',
                $statusCode >= 400 => 'API_ERROR_CLIENT',
                default => 'API_REQUEST',
            };

            // Use AuditService for structured logging
            AuditService::log([
                'event_type' => $eventType,
                'event_category' => 'api',
                'action' => strtolower($request->method()),
                'model_type' => 'ApiRequest',
                'model_id' => $request->attributes->get('request_id'),
                'description' => "{$request->method()} {$request->path()} - {$statusCode} ({$duration}ms)",
                'severity' => $severity,
                'metadata' => $metadata,
                'payload' => [
                    'path' => $request->path(),
                    'status' => $statusCode,
                    'duration_ms' => $duration,
                    'user_id' => $user?->id,
                ],
            ]);

        } catch (\Exception $e) {
            // Fallback to Laravel log if AuditService fails
            Log::error('Audit middleware logging failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
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
            'up',
            'notifications/unread-count',
            'audit-logs',
            'audit-logs/stats',
            'audit-logs/archives',
        ];

        $path = $request->path();

        foreach ($skipPaths as $skipPath) {
            if (str_contains($path, $skipPath)) {
                return true;
            }
        }

        // DEDUPLICATION: Check if we've already logged this exact request recently
        $requestFingerprint = $this->getRequestFingerprint($request);
        $cacheKey = "audit:req:{$requestFingerprint}";
        
        if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
            return true;
        }
        
        // Mark as logged for 60 seconds (longer cooldown for same requests)
        \Illuminate\Support\Facades\Cache::put($cacheKey, true, 60);

        // SAMPLING: For GET requests, only log 20% of the time (1 in 5)
        if ($request->isMethod('GET') && rand(1, 5) !== 1) {
            return true;
        }

        return false;
    }

    /**
     * Generate a fingerprint for the request to detect duplicates
     */
    private function getRequestFingerprint(Request $request): string
    {
        $userId = \Illuminate\Support\Facades\Auth::id() ?? 'guest';
        $path = $request->path();
        $method = $request->method();
        
        // For GET requests, include query params in fingerprint
        $queryHash = $method === 'GET' 
            ? md5(serialize($request->query())) 
            : '';
            
        return md5("{$userId}:{$method}:{$path}:{$queryHash}");
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