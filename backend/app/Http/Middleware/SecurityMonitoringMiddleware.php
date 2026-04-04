<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use App\Services\DeviceFingerprintService;
use App\Services\VelocityCheckService;
use Closure;
use Illuminate\Http\Request;

class SecurityMonitoringMiddleware
{
    /**
     * Sensitive resources requiring audit
     */
    protected array $sensitiveResources = [
        'orders' => ['read', 'download', 'export', 'admin'],
        'users' => ['read', 'download', 'export', 'admin'],
        'payments' => ['read', 'download', 'export', 'admin'],
        'products' => ['read', 'download', 'export', 'admin'],
    ];

    /**
     * Handle security monitoring
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $path = $request->path();
        $method = $request->method();

        // Skip if no authenticated user
        if (!$user) {
            return $next($request);
        }

        // 1. Device fingerprint check
        $this->checkDeviceFingerprint($request, $user);

        // 2. Velocity check
        $this->checkVelocity($request, $user);

        // 3. Resource access audit
        $this->auditResourceAccess($request, $user);

        // 4. Check for data exfiltration patterns
        $this->checkDataExfiltration($request, $user);

        return $next($request);
    }

    /**
     * Check and log device fingerprint
     */
    private function checkDeviceFingerprint(Request $request, $user): void
    {
        $fingerprintData = DeviceFingerprintService::generate($request);
        $fingerprint = $fingerprintData['hash'];

        // Check for mismatch
        $mismatchCheck = DeviceFingerprintService::checkMismatch($user->id, $fingerprint);

        if ($mismatchCheck['is_new']) {
            // First time seeing this device
            DeviceFingerprintService::store($user->id, $fingerprint);
            
            AuditService::logDeviceFingerprintCreated($user, [
                'fingerprint_hash' => $fingerprint,
                'device_characteristics' => $fingerprintData['components'],
                'confidence_score' => $fingerprintData['confidence_score'],
            ]);
        } elseif (!$mismatchCheck['match']) {
            // Device mismatch detected
            AuditService::logDeviceFingerprintMismatch($user, [
                'expected_fingerprint' => $mismatchCheck['expected_fingerprint'],
                'actual_fingerprint' => $mismatchCheck['actual_fingerprint'],
                'similarity_score' => $mismatchCheck['similarity_score'],
                'confidence_score' => $mismatchCheck['confidence_score'],
                'action_taken' => DeviceFingerprintService::isTrusted($user->id, $fingerprint) ? 'allowed_trusted' : 'alerted',
            ]);

            // If not trusted, require additional verification
            if (!DeviceFingerprintService::isTrusted($user->id, $fingerprint)) {
                // Could trigger MFA challenge here
            }
        }
    }

    /**
     * Check velocity limits
     */
    private function checkVelocity(Request $request, $user): void
    {
        // Determine check type based on endpoint
        $checkType = $this->determineCheckType($request);

        $velocityResult = VelocityCheckService::check($user->id, $checkType, [
            'ip' => $request->ip(),
            'endpoint' => $request->path(),
        ]);

        if ($velocityResult['triggered']) {
            AuditService::logVelocityCheckTriggered($user, [
                'check_type' => $checkType,
                'threshold' => $velocityResult['threshold'],
                'actual_value' => $velocityResult['actual_value'],
                'time_window' => $velocityResult['time_window'],
                'action_taken' => $velocityResult['action'],
                'correlation_window_id' => $velocityResult['window_id'],
            ]);

            // Take action if needed
            if ($velocityResult['action'] === 'block') {
                abort(429, 'Too many requests. Please try again later.');
            }
        }
    }

    /**
     * Audit resource access
     */
    private function auditResourceAccess(Request $request, $user): void
    {
        $resourceType = $this->extractResourceType($request);
        $accessType = $this->determineAccessType($request);

        if (!$resourceType || !isset($this->sensitiveResources[$resourceType])) {
            return;
        }

        // Check if access type is sensitive
        if (!in_array($accessType, $this->sensitiveResources[$resourceType])) {
            return;
        }

        // Check permissions
        $hasPermission = $this->checkPermission($user, $resourceType, $accessType);

        if (!$hasPermission) {
            AuditService::logResourceAccessDenied($user, [
                'resource_type' => $resourceType,
                'resource_id' => $request->route('id') ?? 'unknown',
                'attempted_access_type' => $accessType,
                'denial_reason' => 'permission',
                'ip_address' => $request->ip(),
            ]);

            abort(403, 'Access denied');
        }

        // Log successful access
        $dataFields = $request->all();
        // Sanitize sensitive fields
        unset($dataFields['password'], $dataFields['token']);

        AuditService::logResourceAccessed($user, [
            'resource_type' => $resourceType,
            'resource_id' => $request->route('id') ?? 'unknown',
            'access_type' => $accessType,
            'ip_address' => $request->ip(),
            'session_id' => $request->bearerToken() ? hash('sha256', substr($request->bearerToken(), 0, 20)) : null,
            'data_fields_accessed' => array_keys($dataFields),
            'correlation_id' => $request->header('X-Correlation-ID') ?? uniqid(),
        ]);
    }

    /**
     * Check for data exfiltration patterns
     */
    private function checkDataExfiltration(Request $request, $user): void
    {
        // Check for bulk export patterns
        if ($request->has('export') && $request->has('all')) {
            $recordsAttempted = $request->input('limit', 1000);
            
            if ($recordsAttempted > 100) {
                AuditService::logDataExfiltrationAttempt($user, [
                    'data_type' => $this->extractResourceType($request) ?? 'unknown',
                    'records_attempted' => $recordsAttempted,
                    'destination_ip' => $request->ip(),
                    'blocked' => $recordsAttempted > 1000, // Block if > 1000
                    'method' => 'bulk_export',
                ]);

                if ($recordsAttempted > 1000) {
                    abort(403, 'Bulk export limit exceeded');
                }
            }
        }

        // Check for unusual API patterns (scraping)
        $userAgent = $request->userAgent() ?? '';
        if (str_contains(strtolower($userAgent), 'bot') || str_contains(strtolower($userAgent), 'scrape')) {
            AuditService::logSuspiciousActivity("Potential scraping detected", [
                'user_id' => $user->id,
                'activity_type' => 'suspicious_user_agent',
                'risk_score' => 40,
                'action_taken' => 'logged',
            ]);
        }
    }

    /**
     * Determine check type from request
     */
    private function determineCheckType(Request $request): string
    {
        $path = $request->path();

        if (str_contains($path, 'login')) return 'login';
        if (str_contains($path, 'payment')) return 'payment';
        if (str_contains($path, 'order')) return 'order';
        
        return 'api_request';
    }

    /**
     * Extract resource type from request path
     */
    private function extractResourceType(Request $request): ?string
    {
        $path = $request->path();
        
        if (str_contains($path, 'orders')) return 'orders';
        if (str_contains($path, 'users')) return 'users';
        if (str_contains($path, 'payments')) return 'payments';
        if (str_contains($path, 'products')) return 'products';
        
        return null;
    }

    /**
     * Determine access type from request
     */
    private function determineAccessType(Request $request): string
    {
        $method = $request->method();

        return match($method) {
            'GET' => $request->has('export') ? 'export' : 'read',
            'POST', 'PUT', 'PATCH' => 'admin',
            'DELETE' => 'admin',
            default => 'read',
        };
    }

    /**
     * Check if user has permission
     */
    private function checkPermission($user, string $resourceType, string $accessType): bool
    {
        // Admin access for sensitive operations
        if ($accessType === 'admin') {
            return $user->hasAdminAccess();
        }

        // Export requires admin or specific permission
        if ($accessType === 'export') {
            return $user->hasAdminAccess() || $user->hasSellerAccess();
        }

        // Read access based on resource
        return match($resourceType) {
            'orders' => $user->hasSellerAccess() || $user->hasAdminAccess(),
            'users' => $user->hasAdminAccess(),
            'payments' => $user->hasAdminAccess(),
            'products' => true, // Public read
            default => false,
        };
    }
}
