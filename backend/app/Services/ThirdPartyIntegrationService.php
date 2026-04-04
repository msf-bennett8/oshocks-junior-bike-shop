<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ThirdPartyIntegrationService
{
    protected array $serviceHealth = [];
    protected string $correlationId;

    public function __construct()
    {
        $this->correlationId = uniqid('corr_', true);
    }

    /**
     * Make monitored HTTP request to third-party service
     */
    public function request(string $serviceName, string $method, string $endpoint, array $options = []): array
    {
        $startTime = microtime(true);
        $fullUrl = $this->getServiceBaseUrl($serviceName) . $endpoint;
        
        try {
            $response = Http::withTimeout($options['timeout'] ?? 30)
                ->withHeaders(array_merge(
                    $this->getServiceHeaders($serviceName),
                    $options['headers'] ?? []
                ))
                ->{$method}($fullUrl, $options['body'] ?? []);

            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            if ($response->successful()) {
                // Update health status
                $this->recordSuccess($serviceName, $endpoint, $duration);
                
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'response_time_ms' => $duration,
                ];
            }

            throw new \Exception("HTTP Error: " . $response->status());

        } catch (\Exception $e) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            // Log integration error
            $this->logIntegrationError($serviceName, $endpoint, $method, $e, $duration);
            
            // Attempt recovery if configured
            if ($this->shouldAttemptRecovery($serviceName)) {
                return $this->attemptRecovery($serviceName, $method, $endpoint, $options, $e);
            }

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'service' => $serviceName,
                'correlation_id' => $this->correlationId,
            ];
        }
    }

    /**
     * Log third-party integration error
     */
    protected function logIntegrationError(string $serviceName, string $endpoint, string $method, \Exception $e, float $duration): void
    {
        $errorCode = $this->categorizeError($e);
        $impactLevel = $this->assessImpact($serviceName, $errorCode);
        
        // Determine if retry was attempted
        $retryAttempted = in_array($errorCode, ['timeout', 'rate_limit', 'server_error']);

        AuditService::logThirdPartyIntegrationError(null, [
            'service_name' => $serviceName,
            'endpoint' => $endpoint,
            'operation' => $method,
            'error_code' => $errorCode,
            'error_message' => $e->getMessage(),
            'impact_level' => $impactLevel,
            'retry_attempted' => $retryAttempted,
            'correlation_id' => $this->correlationId,
            'duration_ms' => $duration,
        ]);

        Log::error("Third-party integration error", [
            'service' => $serviceName,
            'endpoint' => $endpoint,
            'error' => $e->getMessage(),
            'correlation_id' => $this->correlationId,
            'impact' => $impactLevel,
        ]);

        // Update health tracking
        $this->recordFailure($serviceName, $errorCode);
    }

    /**
     * Attempt recovery from integration failure
     */
    protected function attemptRecovery(string $serviceName, string $method, string $endpoint, array $options, \Exception $originalError): array
    {
        $recoveryStart = microtime(true);
        
        // Strategy 1: Retry with exponential backoff
        $maxRetries = 3;
        for ($i = 1; $i <= $maxRetries; $i++) {
            $delay = pow(2, $i) * 100; // 200ms, 400ms, 800ms
            usleep($delay * 1000); // Convert to microseconds
            
            try {
                $response = Http::withTimeout($options['timeout'] ?? 30)
                    ->{$method}($this->getServiceBaseUrl($serviceName) . $endpoint, $options['body'] ?? []);
                
                if ($response->successful()) {
                    $recoveryDuration = round((microtime(true) - $recoveryStart) * 1000, 2);
                    
                    AuditService::logThirdPartyIntegrationRecovery(null, [
                        'service_name' => $serviceName,
                        'endpoint' => $endpoint,
                        'recovery_method' => 'retry_with_backoff',
                        'retry_count' => $i,
                        'downtime_duration_ms' => $recoveryDuration,
                    ]);

                    return [
                        'success' => true,
                        'data' => $response->json(),
                        'recovered' => true,
                        'retry_count' => $i,
                    ];
                }
            } catch (\Exception $retryError) {
                continue;
            }
        }

        // Strategy 2: Fallback to cached data (if applicable)
        $cacheKey = "integration_fallback:{$serviceName}:" . md5($endpoint);
        if ($cached = Cache::get($cacheKey)) {
            AuditService::logThirdPartyIntegrationRecovery(null, [
                'service_name' => $serviceName,
                'endpoint' => $endpoint,
                'recovery_method' => 'cache_fallback',
                'cache_age_minutes' => Cache::get($cacheKey . ':age') ?? 'unknown',
            ]);

            return [
                'success' => true,
                'data' => $cached,
                'recovered' => true,
                'source' => 'cache_fallback',
            ];
        }

        // Strategy 3: Circuit breaker pattern
        $this->tripCircuitBreaker($serviceName);

        return [
            'success' => false,
            'error' => 'Service unavailable after recovery attempts',
            'original_error' => $originalError->getMessage(),
            'correlation_id' => $this->correlationId,
        ];
    }

    /**
     * Categorize error type
     */
    protected function categorizeError(\Exception $e): string
    {
        $message = strtolower($e->getMessage());
        
        if (str_contains($message, 'timeout')) return 'timeout';
        if (str_contains($message, 'could not resolve host')) return 'dns_error';
        if (str_contains($message, 'ssl')) return 'ssl_error';
        if (str_contains($message, '429')) return 'rate_limit';
        if (str_contains($message, '500')) return 'server_error';
        if (str_contains($message, '503')) return 'service_unavailable';
        
        return 'unknown';
    }

    /**
     * Assess impact level
     */
    protected function assessImpact(string $serviceName, string $errorCode): string
    {
        $criticalServices = ['payment', 'mpesa', 'paystack'];
        $isCritical = in_array($serviceName, $criticalServices);
        
        if ($isCritical && in_array($errorCode, ['timeout', 'server_error', 'service_unavailable'])) {
            return 'critical';
        }
        
        if ($isCritical || $errorCode === 'rate_limit') {
            return 'high';
        }
        
        if ($errorCode === 'timeout') {
            return 'medium';
        }
        
        return 'low';
    }

    /**
     * Check if recovery should be attempted
     */
    protected function shouldAttemptRecovery(string $serviceName): bool
    {
        // Check circuit breaker
        $failures = Cache::get("circuit_breaker:{$serviceName}", 0);
        return $failures < 5; // Don't retry if 5+ recent failures
    }

    /**
     * Trip circuit breaker
     */
    protected function tripCircuitBreaker(string $serviceName): void
    {
        Cache::increment("circuit_breaker:{$serviceName}");
        Cache::expire("circuit_breaker:{$serviceName}", 300); // 5 minute window
        
        Log::warning("Circuit breaker tripped for service", [
            'service' => $serviceName,
            'correlation_id' => $this->correlationId,
        ]);
    }

    /**
     * Record successful request
     */
    protected function recordSuccess(string $serviceName, string $endpoint, float $duration): void
    {
        // Reset circuit breaker on success
        Cache::forget("circuit_breaker:{$serviceName}");
        
        // Track health metrics
        $key = "health:{$serviceName}";
        $metrics = Cache::get($key, ['success' => 0, 'failures' => 0, 'avg_response_time' => 0]);
        $metrics['success']++;
        $metrics['avg_response_time'] = ($metrics['avg_response_time'] + $duration) / 2;
        Cache::put($key, $metrics, 3600);
    }

    /**
     * Record failed request
     */
    protected function recordFailure(string $serviceName, string $errorCode): void
    {
        $key = "health:{$serviceName}";
        $metrics = Cache::get($key, ['success' => 0, 'failures' => 0]);
        $metrics['failures']++;
        Cache::put($key, $metrics, 3600);
    }

    /**
     * Get service base URL
     */
    protected function getServiceBaseUrl(string $serviceName): string
    {
        return match($serviceName) {
            'paystack' => config('services.paystack.base_url', 'https://api.paystack.co'),
            'mpesa' => config('services.mpesa.base_url', 'https://api.safaricom.co.ke'),
            'flutterwave' => config('services.flutterwave.base_url', 'https://api.flutterwave.com/v3'),
            'cloudinary' => 'https://api.cloudinary.com/v1_1',
            default => throw new \Exception("Unknown service: {$serviceName}"),
        };
    }

    /**
     * Get service headers
     */
    protected function getServiceHeaders(string $serviceName): array
    {
        return match($serviceName) {
            'paystack' => ['Authorization' => 'Bearer ' . config('services.paystack.secret_key')],
            'mpesa' => ['Authorization' => 'Bearer ' . $this->getMpesaToken()],
            'flutterwave' => ['Authorization' => 'Bearer ' . config('services.flutterwave.secret_key')],
            'cloudinary' => [],
            default => [],
        };
    }

    /**
     * Get M-Pesa access token
     */
    protected function getMpesaToken(): string
    {
        // Implementation would fetch from cache or generate new token
        return Cache::remember('mpesa_access_token', 3500, function() {
            // Token generation logic
            return 'dummy_token';
        });
    }
}
