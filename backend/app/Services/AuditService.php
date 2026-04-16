<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class AuditService
{
    /**
     * Log a generic audit event (backward compatible)
     */
    public static function log(array $data): ?AuditLog
    {
        try {
            $context = AuditContextService::getContext();
            
            // Determine tier based on category
            $tier = self::determineTier($data['event_category'] ?? 'general', $data['event_type'] ?? '');
            
            // Build payload for structured logging
            $payload = self::buildPayload($data);
            
            // Calculate integrity hash for TIER_1
            $integrityHash = null;
            $previousHash = null;
            if ($tier === 'TIER_1_IMMUTABLE') {
                $integrityHash = self::calculateIntegrityHash($data, $context);
                $previousHash = AuditLog::getPreviousHash();
            }
            
            // Get geolocation from context
            $geolocation = $context['geolocation'] ?? null;
            
            // Safely get request data (null when in queue/CLI context)
            $request = request();
            $requestMethod = $request?->method() ?? ($context['request_method'] ?? 'CLI');
            $requestUrl = $request?->fullUrl() ?? ($context['request_url'] ?? 'queue/job');
            $userAgent = $request?->userAgent() ?? ($context['user_agent'] ?? 'queue-worker');
            $ipAddress = $context['ip_address'] ?? ($request?->ip() ?? '127.0.0.1');
            
            // Build metadata with geolocation and context data
            $metadata = array_merge($data['metadata'] ?? [], [
                'geolocation' => $geolocation,
                'request_id' => $context['request_id'] ?? null,
                'correlation_id' => $context['correlation_id'] ?? null,
                'session_id' => $context['session_id'] ?? null,
                'ip_address' => $ipAddress,
                'user_agent' => substr($userAgent, 0, 500),
                'referrer' => $context['referrer'] ?? ($request?->header('referer') ?? null),
                'request_duration_ms' => $context['request_duration_ms'] ?? null,
            ]);

            $auditData = [
                // Identification
                'event_uuid' => (string) Uuid::uuid4(),
                'event_type' => strtoupper($data['event_type'] ?? 'UNKNOWN'),
                'event_category' => $data['event_category'] ?? 'general',
                
                // Actor
                'actor_type' => $data['actor_type'] ?? self::determineActorType(),
                'user_id' => $data['user_id'] ?? Auth::id(),
                'user_role' => $data['user_role'] ?? Auth::user()?->role,
                'on_behalf_of' => $data['on_behalf_of'] ?? null,
                
                // Action
                'action' => $data['action'] ?? 'unknown',
                'model_type' => $data['model_type'] ?? null,
                'model_id' => self::sanitizeModelId($data['model_id'] ?? null),
                'description' => $data['description'] ?? '',
                
                // Data
                'old_values' => $data['old_values'] ?? null,
                'new_values' => $data['new_values'] ?? null,
                'metadata' => $metadata, // Now includes geolocation
                'payload' => $payload,
                
                // Context
                'ip_address' => $context['ip_address'] ?? self::hashIp(self::getRealClientIp($request)),
                'user_agent' => $context['user_agent'] ?? substr($userAgent, 0, 500),
                'device_fingerprint' => $data['device_fingerprint'] ?? null,
                'geolocation' => $context['geolocation'] ?? null,
                'request_method' => $requestMethod,
                'request_url' => substr($requestUrl, 0, 2048),
                'session_id' => $context['session_id'] ?? null,
                'correlation_id' => $context['correlation_id'] ?? (string) Str::uuid(),
                
                // Classification
                'severity' => $data['severity'] ?? 'low',
                'tier' => $tier,
                'is_suspicious' => $data['is_suspicious'] ?? false,
                
                // Integrity
                'integrity_hash' => $integrityHash,
                'previous_hash' => $previousHash,
                'schema_version' => '2024.04.04-v1',
                
                // Environment
                'environment' => config('app.env', 'production'),
                'service_version' => config('app.version', '1.0.0'),
                
                // Timing
                'occurred_at' => $data['occurred_at'] ?? now(),
                'processed_at' => now(),
            ];

            // Use queue for async processing if enabled
            if (config('audit.queue.enabled') && $tier !== 'TIER_3_ANALYTICS') {
                \App\Jobs\ProcessAuditLog::dispatch($auditData)
                    ->onConnection(config('audit.queue.connection'))
                    ->onQueue(config('audit.queue.queue'));
                
                return null; // Return null since it's queued
            }

            // Synchronous processing for TIER_3 or when queue disabled
            $log = AuditLog::create($auditData);

            // Phase 8:(Notifications) Trigger notifications for critical events
            self::notifyIfCritical($auditData, $log);
            
            // Update cache with latest hash for chaining
            if ($tier === 'TIER_1_IMMUTABLE' && $integrityHash) {
                Cache::put('audit:last_hash', $integrityHash, 3600);
            }
            
            return $log;
            
        } catch (\Exception $e) {
            // Never break business operations for audit failures
            Log::error('Audit log creation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);
            
            // Write to fallback log
            self::fallbackLog($data);
            
            return null;
        }
    }

    // ==================== PHASE 1: AUTH & SECURITY EVENTS ====================

    /**
     * LOGIN_SUCCESS - User successfully authenticated
     */
    public static function logLoginSuccess($user, array $context = []): ?AuditLog
    {
        $loginMethod = $context['login_method'] ?? 'password';
        $oauthProvider = $context['oauth_provider'] ?? null;
        
        // Build description with OAuth info if present
        $description = $oauthProvider 
            ? "User {$user->email} logged in via {$oauthProvider} OAuth"
            : "User {$user->email} logged in successfully";
        
        return self::log([
            'event_type' => 'LOGIN_SUCCESS',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'authenticated',
            'description' => $description,
            'severity' => 'CRITICAL',
            'metadata' => [
                'login_method' => $loginMethod,
                'oauth_provider' => $oauthProvider, // google, strava, etc.
                'oauth_scopes' => $context['oauth_scopes'] ?? null,
                'mfa_used' => $context['mfa_used'] ?? false,
                'device_info' => $context['device_info'] ?? null,
                'location' => $context['location'] ?? null,
                'session_id' => $context['session_id'] ?? null,
                'auth_timestamp' => $context['auth_timestamp'] ?? now()->toIso8601String(),
            ],
            'payload' => [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
                'role' => $user->role,
                'login_method' => $loginMethod,
                'oauth_provider' => $oauthProvider,
                'mfa_used' => $context['mfa_used'] ?? false,
            ],
        ]);
    }

    /**
     * LOGIN_FAILED - Authentication attempt failed
     */
    public static function logLoginFailed(string $identifier, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'LOGIN_FAILED',
            'event_category' => 'security',
            'actor_type' => 'ANONYMOUS',
            'user_id' => $context['user_id'] ?? null,
            'action' => 'failed',
            'description' => "Failed login attempt for: {$identifier}",
            'severity' => 'CRITICAL',
            'is_suspicious' => ($context['failure_count'] ?? 0) > 3,
            'metadata' => [
                'identifier_attempted' => hash('sha256', $identifier),
                'login_field' => $context['login_field'] ?? 'unknown',
                'failure_reason' => $context['failure_reason'] ?? 'invalid_credentials',
                'failure_count' => $context['failure_count'] ?? 1,
            ],
            'payload' => [
                'identifier_hash' => hash('sha256', $identifier),
                'failure_reason' => $context['failure_reason'] ?? 'invalid_credentials',
                'failure_count' => $context['failure_count'] ?? 1,
            ],
        ]);
    }

    /**
     * LOGOUT - User logged out
     */
    public static function logLogout($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'LOGOUT',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'logged_out',
            'description' => "User {$user->email} logged out",
            'severity' => 'CRITICAL',
            'metadata' => [
                'session_id' => $context['session_id'] ?? null,
                'session_duration_seconds' => $context['session_duration'] ?? null,
                'logout_reason' => $context['logout_reason'] ?? 'explicit',
            ],
            'payload' => [
                'user_id' => $user->id,
                'session_duration' => $context['session_duration'] ?? null,
                'logout_reason' => $context['logout_reason'] ?? 'explicit',
            ],
        ]);
    }

    /**
     * SESSION_REVOKED - Session invalidated (admin action or security)
     */
    public static function logSessionRevoked($targetUser, $revokedBy, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SESSION_REVOKED',
            'event_category' => 'security',
            'actor_type' => $revokedBy ? 'USER' : 'SYSTEM',
            'user_id' => $revokedBy?->id,
            'user_role' => $revokedBy?->role,
            'on_behalf_of' => $targetUser->id,
            'action' => 'revoked',
            'description' => "Session revoked for {$targetUser->email}" . 
                ($revokedBy ? " by {$revokedBy->email}" : " by system"),
            'severity' => 'CRITICAL',
            'metadata' => [
                'target_user_id' => $targetUser->id,
                'session_id' => $context['session_id'] ?? null,
                'reason' => $context['reason'] ?? 'security',
                'revoked_by_session' => $context['revoked_by_session'] ?? null,
            ],
            'payload' => [
                'target_user_id' => $targetUser->id,
                'reason' => $context['reason'] ?? 'security',
            ],
        ]);
    }

    /**
     * PASSWORD_CHANGED - User changed password
     */
    public static function logPasswordChanged($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PASSWORD_CHANGED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Password changed for {$user->email}",
            'severity' => 'CRITICAL',
            'metadata' => [
                'changed_by' => $context['changed_by'] ?? 'self',
                'method' => $context['method'] ?? 'direct',
            ],
            'payload' => [
                'changed_by' => $context['changed_by'] ?? 'self',
                'method' => $context['method'] ?? 'direct',
            ],
        ]);
    }

    /**
     * PASSWORD_RESET_REQUESTED - Password reset flow initiated
     */
    public static function logPasswordResetRequested($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PASSWORD_RESET_REQUESTED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user?->id,
            'action' => 'requested',
            'description' => "Password reset requested for " . ($user?->email ?? 'unknown'),
            'severity' => 'CRITICAL',
            'metadata' => [
                'delivery_method' => $context['delivery_method'] ?? 'email',
                'token_hash' => isset($context['token']) ? hash('sha256', $context['token']) : null,
            ],
            'payload' => [
                'delivery_method' => $context['delivery_method'] ?? 'email',
                'user_id' => $user?->id,
            ],
        ]);
    }

    /**
     * PASSWORD_RESET_COMPLETED - Password reset successful
     */
    public static function logPasswordResetCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PASSWORD_RESET_COMPLETED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'completed',
            'description' => "Password reset completed for {$user->email}",
            'severity' => 'CRITICAL',
            'metadata' => [
                'reset_method' => $context['reset_method'] ?? 'token',
            ],
            'payload' => [
                'reset_method' => $context['reset_method'] ?? 'token',
            ],
        ]);
    }

    /**
     * PASSWORD_RESET_FAILED - Password reset attempt failed
     */
    public static function logPasswordResetFailed(string $identifier, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PASSWORD_RESET_FAILED',
            'event_category' => 'security',
            'actor_type' => 'ANONYMOUS',
            'action' => 'failed',
            'description' => "Password reset failed for: {$identifier}",
            'severity' => 'CRITICAL',
            'is_suspicious' => true,
            'metadata' => [
                'failure_reason' => $context['failure_reason'] ?? 'invalid_token',
            ],
            'payload' => [
                'identifier_hash' => hash('sha256', $identifier),
                'failure_reason' => $context['failure_reason'] ?? 'invalid_token',
            ],
        ]);
    }

    /**
     * TWO_FACTOR_ENABLED - 2FA/MFA enabled
     */
    public static function logTwoFactorEnabled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'TWO_FACTOR_ENABLED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'enabled',
            'description' => "Two-factor authentication enabled for {$user->email}",
            'severity' => 'CRITICAL',
            'metadata' => [
                'method_type' => $context['method_type'] ?? 'app',
                'verified' => $context['verified'] ?? true,
            ],
            'payload' => [
                'method_type' => $context['method_type'] ?? 'app',
                'verified' => $context['verified'] ?? true,
            ],
        ]);
    }

    /**
     * TWO_FACTOR_DISABLED - 2FA/MFA disabled
     */
    public static function logTwoFactorDisabled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'TWO_FACTOR_DISABLED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'disabled',
            'description' => "Two-factor authentication disabled for {$user->email}",
            'severity' => 'CRITICAL',
            'metadata' => [
                'method_type' => $context['method_type'] ?? 'app',
                'reason' => $context['reason'] ?? 'user_request',
            ],
            'payload' => [
                'method_type' => $context['method_type'] ?? 'app',
                'reason' => $context['reason'] ?? 'user_request',
            ],
        ]);
    }

    /**
     * TWO_FACTOR_CHALLENGE - 2FA verification attempt
     */
    public static function logTwoFactorChallenge($user, bool $success, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'TWO_FACTOR_CHALLENGE',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => $success ? 'passed' : 'failed',
            'description' => "Two-factor challenge " . ($success ? "passed" : "failed") . 
                " for {$user->email}",
            'severity' => 'CRITICAL',
            'is_suspicious' => !$success,
            'metadata' => [
                'method_type' => $context['method_type'] ?? 'app',
                'success' => $success,
            ],
            'payload' => [
                'method_type' => $context['method_type'] ?? 'app',
                'success' => $success,
            ],
        ]);
    }

    /**
     * ACCOUNT_LOCKED - Account locked due to security
     */
    public static function logAccountLocked($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_LOCKED',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'locked',
            'description' => "Account locked for {$user->email}",
            'severity' => 'CRITICAL',
            'is_suspicious' => true,
            'metadata' => [
                'reason' => $context['reason'] ?? 'brute_force',
                'triggered_by' => $context['triggered_by'] ?? 'system',
                'lock_duration' => $context['lock_duration'] ?? 3600,
                'unlock_at' => $context['unlock_at'] ?? now()->addHour(),
            ],
            'payload' => [
                'reason' => $context['reason'] ?? 'brute_force',
                'lock_duration' => $context['lock_duration'] ?? 3600,
            ],
        ]);
    }

    /**
     * ACCOUNT_UNLOCKED - Account unlocked
     */
    public static function logAccountUnlocked($user, $unlockedBy, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_UNLOCKED',
            'event_category' => 'security',
            'actor_type' => $unlockedBy ? 'USER' : 'SYSTEM',
            'user_id' => $unlockedBy?->id,
            'user_role' => $unlockedBy?->role,
            'on_behalf_of' => $user->id,
            'action' => 'unlocked',
            'description' => "Account unlocked for {$user->email}" .
                ($unlockedBy ? " by {$unlockedBy->email}" : " by system"),
            'severity' => 'CRITICAL',
            'metadata' => [
                'reason' => $context['reason'] ?? 'manual',
                'previous_lock_duration' => $context['previous_lock_duration'] ?? null,
            ],
            'payload' => [
                'target_user_id' => $user->id,
                'reason' => $context['reason'] ?? 'manual',
            ],
        ]);
    }

    /**
     * SUSPICIOUS_ACTIVITY_DETECTED - Security alert
     */
    public static function logSuspiciousActivity(string $description, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SUSPICIOUS_ACTIVITY_DETECTED',
            'event_category' => 'security',
            'actor_type' => $context['actor_type'] ?? 'ANONYMOUS',
            'user_id' => $context['user_id'] ?? null,
            'action' => 'detected',
            'description' => $description,
            'severity' => 'CRITICAL',
            'is_suspicious' => true,
            'metadata' => [
                'activity_type' => $context['activity_type'] ?? 'unknown',
                'risk_score' => $context['risk_score'] ?? 50,
                'device_fingerprint' => $context['device_fingerprint'] ?? null,
                'action_taken' => $context['action_taken'] ?? 'logged',
                'correlation_events' => $context['correlation_events'] ?? [],
            ],
            'payload' => [
                'activity_type' => $context['activity_type'] ?? 'unknown',
                'risk_score' => $context['risk_score'] ?? 50,
                'action_taken' => $context['action_taken'] ?? 'logged',
            ],
        ]);
    }

    // ==================== LEGACY METHODS (Backward Compatible) ====================

    /**
     * Legacy: Log payment event
     */
    public static function logPayment($payment, $action = 'created'): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_RECORDED',
            'event_category' => 'payment',
            'action' => $action,
            'model_type' => 'Payment',
            'model_id' => $payment->id,
            'description' => "Payment {$action}: {$payment->transaction_reference} - KES {$payment->amount}",
            'new_values' => [
                'amount' => $payment->amount,
                'seller_id' => $payment->seller_id,
                'commission' => $payment->platform_commission_amount,
            ],
            'severity' => 'HIGH',
        ]);
    }

    /**
     * Legacy: Log payout event
     */
    public static function logPayout($payout, $action = 'created'): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYOUT_' . strtoupper($action),
            'event_category' => 'payout',
            'action' => $action,
            'model_type' => 'SellerPayout',
            'model_id' => $payout->id,
            'description' => "Payout {$action} for seller #{$payout->seller_id} - KES {$payout->amount}",
            'new_values' => [
                'amount' => $payout->amount,
                'seller_id' => $payout->seller_id,
                'status' => $payout->status,
            ],
            'severity' => 'HIGH',
        ]);
    }

    /**
     * Legacy: Log login attempt
     */
    public static function logLogin($user, $success = true): ?AuditLog
    {
        if ($success) {
            return self::logLoginSuccess($user);
        } else {
            return self::logLoginFailed($user->email ?? 'unknown', [
                'user_id' => $user->id ?? null,
                'failure_reason' => 'invalid_credentials',
            ]);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Determine tier based on category and event type
     */
    private static function determineTier(string $category, string $eventType): string
    {
        $tier1Categories = config('audit.tiers.tier_1.categories', ['auth', 'financial', 'privacy', 'admin', 'security']);
        $tier2Categories = config('audit.tiers.tier_2.categories', ['order', 'inventory', 'api', 'system', 'config']);
        
        // Auth events are always TIER_1
        if ($category === 'security' || in_array(strtolower($eventType), [
            'login_success', 'login_failed', 'logout', 'password_changed'
        ])) {
            return 'TIER_1_IMMUTABLE';
        }
        
        if (in_array(strtolower($category), $tier1Categories)) {
            return 'TIER_1_IMMUTABLE';
        }
        
        if (in_array(strtolower($category), $tier2Categories)) {
            return 'TIER_2_OPERATIONAL';
        }
        
        return 'TIER_3_ANALYTICS';
    }

    /**
     * Determine actor type from current context
     */
    private static function determineActorType(): string
    {
        if (Auth::check()) {
            return 'USER';
        }
        
        if (request()->hasHeader('X-API-Key')) {
            return 'API_KEY';
        }
        
        return 'ANONYMOUS';
    }

    /**
     * Build structured payload
     */
    private static function buildPayload(array $data): array
    {
        $payload = [];
        
        // Include specific payload fields if provided
        if (isset($data['payload'])) {
            $payload = is_array($data['payload']) ? $data['payload'] : json_decode($data['payload'], true);
        }
        
        // Add standard fields
        $payload['source_ip'] = request()->ip();
        $payload['user_agent_hash'] = hash('sha256', request()->userAgent() ?? '');
        $payload['timestamp_utc'] = now()->toIso8601String();
        
        return $payload;
    }

    /**
     * Calculate SHA-256 integrity hash for TIER_1 events
     */
    private static function calculateIntegrityHash(array $data, array $context): string
    {
        $hashData = [
            'event_type' => strtoupper($data['event_type'] ?? 'UNKNOWN'),
            'actor_type' => $data['actor_type'] ?? self::determineActorType(),
            'user_id' => $data['user_id'] ?? Auth::id(),
            'timestamp' => $context['timestamp'] ?? now()->toIso8601String(),
            'correlation_id' => $context['correlation_id'] ?? (string) Str::uuid(),
            'payload_hash' => hash('sha256', json_encode($data['payload'] ?? [])),
        ];
        
        return hash('sha256', json_encode($hashData) . config('app.key'));
    }

    /**
     * Hash IP address for privacy
     */
    private static function hashIp(?string $ip): ?string
    {
        if (!$ip) return null;
        
        if (!config('audit.pii.hash_ips', true)) {
            return $ip;
        }
        
        // Anonymize: mask last 2 octets
        $parts = explode('.', $ip);
        if (count($parts) === 4) {
            return $parts[0] . '.' . $parts[1] . '.x.x';
        }
        
        return hash('sha256', $ip . config('app.key'));
    }

    /**
     * Sanitize header value to prevent header injection attacks
     * Removes newlines and null bytes that could be used for response splitting
     */
    private static function sanitizeHeaderValue(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        
        // Remove CRLF, LF, CR, and null bytes
        $value = str_replace(["\r\n", "\n", "\r", "\0"], '', $value);
        
        // Also remove other control characters except tab
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
        
        return $value;
    }

        /**
     * Get the real client IP from forwarded headers
     */
    private static function getRealClientIp($request): ?string
    {
        $headers = ['X-Forwarded-For', 'X-Real-IP', 'CF-Connecting-IP', 'True-Client-IP'];
        
        foreach ($headers as $header) {
            $value = $request->header($header);
            if ($value) {
                if ($header === 'X-Forwarded-For') {
                    $ips = explode(',', $value);
                    $clientIp = trim($ips[0]);
                    if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
                        return $clientIp;
                    }
                } else {
                    if (filter_var($value, FILTER_VALIDATE_IP)) {
                        return $value;
                    }
                }
            }
        }
        
        return $request->ip();
    }

    /**
     * Sanitize model_id to ensure it fits database column
     */
    private static function sanitizeModelId($modelId): ?string
    {
        if ($modelId === null) {
            return null;
        }
        
        // Convert to string
        $modelId = (string) $modelId;
        
        // If it's 'unknown' or similar placeholder, convert to null
        if (in_array($modelId, ['unknown', 'null', ''])) {
            return null;
        }
        
        // If numeric, return as-is
        if (is_numeric($modelId)) {
            return $modelId;
        }
        
        // If longer than 64 chars, hash it
        if (strlen($modelId) > 64) {
            return substr(hash('sha256', $modelId), 0, 32);
        }
        
        return $modelId;
    }

    // ==================== PHASE 2: ORDER LIFECYCLE EVENTS ====================

    /**
     * CART_CREATED - New cart initialized
     */
    public static function logCartCreated($cart, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CART_CREATED',
            'event_category' => 'order',
            'actor_type' => $context['actor_type'] ?? (auth()->check() ? 'USER' : 'ANONYMOUS'),
            'user_id' => $cart->user_id,
            'action' => 'created',
            'model_type' => 'Cart',
            'model_id' => $cart->id,
            'description' => "Cart created: {$cart->id}",
            'severity' => 'MEDIUM',
            'metadata' => [
                'source' => $context['source'] ?? 'direct', // direct, wishlist, abandoned_recovery
                'session_id' => $cart->session_id,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'source' => $context['source'] ?? 'direct',
                'user_id' => $cart->user_id,
            ],
        ]);
    }

    /**
     * CART_ITEM_ADDED - Item added to cart
     */
    public static function logCartItemAdded($cart, $product, $quantity, $price, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CART_ITEM_ADDED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $cart->user_id ?? auth()->id(),
            'action' => 'added',
            'model_type' => 'CartItem',
            'model_id' => $cart->id,
            'description' => "Added {$product->name} (x{$quantity}) to cart",
            'severity' => 'LOW',
            'metadata' => [
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity' => $quantity,
                'unit_price' => $price,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity' => $quantity,
                'unit_price' => $price,
            ],
        ]);
    }

    /**
     * CART_ITEM_REMOVED - Item removed from cart
     */
    public static function logCartItemRemoved($cart, $product, $quantity, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CART_ITEM_REMOVED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $cart->user_id ?? auth()->id(),
            'action' => 'removed',
            'model_type' => 'CartItem',
            'model_id' => $cart->id,
            'description' => "Removed {$product->name} (x{$quantity}) from cart",
            'severity' => 'LOW',
            'metadata' => [
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity' => $quantity,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity' => $quantity,
            ],
        ]);
    }

    /**
     * CART_ABANDONED - Cart abandoned by user
     */
    public static function logCartAbandoned($cart, array $context = []): ?AuditLog
    {
        $cartValue = $context['cart_value'] ?? 0;
        $itemsCount = $context['items_count'] ?? 0;
        
        return self::log([
            'event_type' => 'CART_ABANDONED',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $cart->user_id,
            'action' => 'abandoned',
            'model_type' => 'Cart',
            'model_id' => $cart->id,
            'description' => "Cart abandoned: {$cart->id} - Value: KES {$cartValue}",
            'severity' => 'MEDIUM',
            'metadata' => [
                'cart_id' => $cart->id,
                'cart_value' => $cartValue,
                'items_count' => $itemsCount,
                'abandonment_duration' => $context['abandonment_duration'] ?? null,
                'recovery_email_sent' => $context['recovery_email_sent'] ?? false,
                'recovery_token' => isset($context['recovery_token']) ? hash('sha256', $context['recovery_token']) : null,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'cart_value' => $cartValue,
                'items_count' => $itemsCount,
                'abandonment_duration' => $context['abandonment_duration'] ?? null,
            ],
        ]);
    }

    /**
     * CHECKOUT_STEP_STARTED - User began checkout step
     */
    public static function logCheckoutStepStarted($cart, int $stepNumber, string $stepName, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHECKOUT_STEP_STARTED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $cart->user_id ?? auth()->id(),
            'action' => 'started',
            'model_type' => 'Cart',
            'model_id' => $cart->id,
            'description' => "Checkout step {$stepNumber} ({$stepName}) started",
            'severity' => 'LOW',
            'metadata' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
                'session_duration_so_far' => $context['session_duration_so_far'] ?? null,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
            ],
        ]);
    }

    /**
     * CHECKOUT_STEP_COMPLETED - User completed checkout step
     */
    public static function logCheckoutStepCompleted($cart, int $stepNumber, string $stepName, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHECKOUT_STEP_COMPLETED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $cart->user_id ?? auth()->id(),
            'action' => 'completed',
            'model_type' => 'Cart',
            'model_id' => $cart->id,
            'description' => "Checkout step {$stepNumber} ({$stepName}) completed",
            'severity' => 'LOW',
            'metadata' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
                'time_spent_seconds' => $context['time_spent_seconds'] ?? null,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
                'time_spent_seconds' => $context['time_spent_seconds'] ?? null,
            ],
        ]);
    }

    /**
     * CHECKOUT_STEP_ABANDONED - User left checkout
     */
    public static function logCheckoutStepAbandoned($cart, int $stepNumber, string $stepName, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHECKOUT_STEP_ABANDONED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $cart->user_id ?? auth()->id(),
            'action' => 'abandoned',
            'model_type' => 'Cart',
            'model_id' => $cart->id,
            'description' => "Checkout abandoned at step {$stepNumber} ({$stepName})",
            'severity' => 'MEDIUM',
            'metadata' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
                'time_spent_seconds' => $context['time_spent_seconds'] ?? null,
                'exit_point' => $context['exit_point'] ?? null,
            ],
            'payload' => [
                'cart_id' => $cart->id,
                'step_number' => $stepNumber,
                'step_name' => $stepName,
                'exit_point' => $context['exit_point'] ?? null,
            ],
        ]);
    }

    /**
     * INVENTORY_RESERVED - Stock reserved for order
     */
    public static function logInventoryReserved($order, $product, int $quantity, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_RESERVED',
            'event_category' => 'inventory',
            'actor_type' => 'SYSTEM',
            'action' => 'reserved',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Reserved {$quantity} units of {$product->name} for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_reserved' => $quantity,
                'reservation_expiry' => $context['reservation_expiry'] ?? now()->addMinutes(30),
                'reservation_token' => $context['reservation_token'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_reserved' => $quantity,
                'reservation_expiry' => $context['reservation_expiry'] ?? now()->addMinutes(30)->toIso8601String(),
            ],
        ]);
    }

    /**
     * INVENTORY_RESERVATION_EXPIRED - Reservation timed out
     */
    public static function logInventoryReservationExpired($product, int $quantity, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_RESERVATION_EXPIRED',
            'event_category' => 'inventory',
            'actor_type' => 'SYSTEM',
            'action' => 'expired',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Reservation expired for {$quantity} units of {$product->name}",
            'severity' => 'MEDIUM',
            'metadata' => [
                'order_id' => $context['order_id'] ?? null,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_released' => $quantity,
            ],
            'payload' => [
                'order_id' => $context['order_id'] ?? null,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_released' => $quantity,
            ],
        ]);
    }

    /**
     * INVENTORY_RELEASED - Stock released back to inventory
     */
    public static function logInventoryReleased($order, $product, int $quantity, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_RELEASED',
            'event_category' => 'inventory',
            'actor_type' => 'SYSTEM',
            'action' => 'released',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Released {$quantity} units of {$product->name} - Reason: {$reason}",
            'severity' => 'MEDIUM',
            'metadata' => [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_released' => $quantity,
                'reason' => $reason, // expired, cancelled, payment_failed, manual
            ],
            'payload' => [
                'order_id' => $order->id,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_released' => $quantity,
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * ORDER_PLACED - Order successfully created
     */
    public static function logOrderPlaced($order, array $context = []): ?AuditLog
    {
        $items = $context['items'] ?? [];
        
        return self::log([
            'event_type' => 'ORDER_PLACED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $order->user_id,
            'action' => 'placed',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order placed: {$order->order_number} - KES {$order->total}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_number' => $order->order_number,
                'cart_id' => $context['cart_id'] ?? null,
                'items' => $items,
                'total_amount' => $order->total,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping_fee,
                'discount' => $order->discount,
                'payment_method' => $order->payment_method,
            ],
            'payload' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'cart_id' => $context['cart_id'] ?? null,
                'items' => $items,
                'total_amount' => $order->total,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping_fee,
                'discount' => $order->discount,
                'payment_method' => $order->payment_method,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'shipping_address_id' => $order->address_id,
                'billing_address_id' => $context['billing_address_id'] ?? $order->address_id,
            ],
        ]);
    }

    /**
     * ORDER_FAILED - Order creation failed
     */
    public static function logOrderFailed($cart, string $failureReason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_FAILED',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => auth()->id(),
            'action' => 'failed',
            'model_type' => 'Order',
            'model_id' => null,
            'description' => "Order failed: {$failureReason}",
            'severity' => 'HIGH',
            'is_suspicious' => true,
            'metadata' => [
                'cart_id' => $cart->id ?? null,
                'cart_snapshot' => $context['cart_snapshot'] ?? null,
                'failure_reason' => $failureReason,
                'payment_status' => $context['payment_status'] ?? 'failed',
                'error_code' => $context['error_code'] ?? null,
            ],
            'payload' => [
                'cart_id' => $cart->id ?? null,
                'failure_reason' => $failureReason,
                'payment_status' => $context['payment_status'] ?? 'failed',
                'error_code' => $context['error_code'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_PAYMENT_PENDING - Async payment initiated
     */
    public static function logOrderPaymentPending($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_PAYMENT_PENDING',
            'event_category' => 'order',
            'actor_type' => auth()->check() ? 'USER' : 'ANONYMOUS',
            'user_id' => $order->user_id,
            'action' => 'pending',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Payment pending for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
            ],
            'payload' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
            ],
        ]);
    }

    /**
     * ORDER_PAYMENT_PROCESSING - Payment being processed
     */
    public static function logOrderPaymentProcessing($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_PAYMENT_PROCESSING',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'processing',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Payment processing for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_STATUS_CHANGED - Order status transition
     */
    public static function logOrderStatusChanged($order, string $oldStatus, string $newStatus, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_STATUS_CHANGED',
            'event_category' => 'order',
            'actor_type' => $context['changed_by'] ? 'USER' : 'SYSTEM',
            'user_id' => $context['changed_by'] ?? null,
            'action' => 'updated',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} status: {$oldStatus} → {$newStatus}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $context['changed_by'] ?? null,
                'reason' => $context['reason'] ?? null,
                'automatic' => $context['automatic'] ?? false,
            ],
            'payload' => [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $context['reason'] ?? null,
                'automatic' => $context['automatic'] ?? false,
            ],
        ]);
    }

    /**
     * ORDER_SHIPPED - Order dispatched
     */
    public static function logOrderShipped($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_SHIPPED',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'shipped',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} shipped via " . ($context['carrier'] ?? 'Unknown'),
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'shipment_id' => $context['shipment_id'] ?? null,
                'tracking_number' => $context['tracking_number'] ?? null,
                'carrier' => $context['carrier'] ?? null,
                'service_level' => $context['service_level'] ?? null,
                'items_shipped' => $context['items_shipped'] ?? [],
                'estimated_delivery' => $context['estimated_delivery'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'shipment_id' => $context['shipment_id'] ?? null,
                'tracking_number' => $context['tracking_number'] ?? null,
                'carrier' => $context['carrier'] ?? null,
                'service_level' => $context['service_level'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_DELIVERED - Order received by customer
     */
    public static function logOrderDelivered($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_DELIVERED',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'delivered',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} delivered",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'shipment_id' => $context['shipment_id'] ?? null,
                'delivery_method' => $context['delivery_method'] ?? null,
                'delivered_at' => $context['delivered_at'] ?? now(),
                'signature_confirmed' => $context['signature_confirmed'] ?? false,
            ],
            'payload' => [
                'order_id' => $order->id,
                'shipment_id' => $context['shipment_id'] ?? null,
                'delivery_method' => $context['delivery_method'] ?? null,
                'delivered_at' => $context['delivered_at'] ?? now()->toIso8601String(),
                'signature_confirmed' => $context['signature_confirmed'] ?? false,
            ],
        ]);
    }

    /**
     * ORDER_CANCELLED - Order cancelled
     */
    public static function logOrderCancelled($order, string $reason, $cancelledBy, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_CANCELLED',
            'event_category' => 'order',
            'actor_type' => $cancelledBy ? 'USER' : 'SYSTEM',
            'user_id' => $cancelledBy?->id,
            'action' => 'cancelled',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} cancelled - Reason: {$reason}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'reason' => $reason,
                'cancelled_by' => $cancelledBy?->id,
                'refund_initiated' => $context['refund_initiated'] ?? false,
                'inventory_released' => $context['inventory_released'] ?? true,
            ],
            'payload' => [
                'order_id' => $order->id,
                'reason' => $reason,
                'cancelled_by' => $cancelledBy?->id,
                'refund_initiated' => $context['refund_initiated'] ?? false,
                'inventory_released' => $context['inventory_released'] ?? true,
            ],
        ]);
    }

    /**
     * ORDER_RETURN_REQUESTED - Customer requested return
     */
    public static function logOrderReturnRequested($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_RETURN_REQUESTED',
            'event_category' => 'order',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'action' => 'return_requested',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Return requested for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'reason' => $context['reason'] ?? null,
                'items_requested' => $context['items_requested'] ?? [],
                'requested_by' => auth()->id(),
            ],
            'payload' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'reason' => $context['reason'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_RETURN_APPROVED - Return request approved
     */
    public static function logOrderReturnApproved($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_RETURN_APPROVED',
            'event_category' => 'order',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'action' => 'return_approved',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Return approved for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'approved_items' => $context['approved_items'] ?? [],
                'return_shipping_label' => $context['return_shipping_label'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_RETURN_RECEIVED - Return items received
     */
    public static function logOrderReturnReceived($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_RETURN_RECEIVED',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'return_received',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Return received for order {$order->order_number}",
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'items_received' => $context['items_received'] ?? [],
                'condition_assessment' => $context['condition_assessment'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'condition_assessment' => $context['condition_assessment'] ?? null,
            ],
        ]);
    }

    /**
     * ORDER_RETURN_COMPLETED - Return processed, refund issued
     */
    public static function logOrderReturnCompleted($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_RETURN_COMPLETED',
            'event_category' => 'order',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'return_completed',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Return completed for order {$order->order_number} - Refund: KES " . ($context['refund_amount'] ?? 0),
            'severity' => 'HIGH',
            'metadata' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'refund_method' => $context['refund_method'] ?? null,
                'processed_by' => $context['processed_by'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'return_id' => $context['return_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'refund_method' => $context['refund_method'] ?? null,
            ],
        ]);
    }

    // ==================== PHASE 2: FINANCIAL EVENTS (TIER_1_IMMUTABLE) ====================

    /**
     * PAYMENT_METHOD_ADDED - New payment method saved
     */
    public static function logPaymentMethodAdded($user, $paymentMethod, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_METHOD_ADDED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'added',
            'model_type' => 'PaymentMethod',
            'model_id' => $paymentMethod->id ?? null,
            'description' => "Payment method added for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'payment_method_id' => $paymentMethod->id ?? null,
                'method_type' => $context['method_type'] ?? 'card',
                'last_four_digits' => $context['last_four'] ?? null,
                'expiry_month' => $context['expiry_month'] ?? null,
                'expiry_year' => $context['expiry_year'] ?? null,
                'billing_address_id' => $context['billing_address_id'] ?? null,
                'verified' => $context['verified'] ?? false,
            ],
            'payload' => [
                'payment_method_id' => $paymentMethod->id ?? null,
                'method_type' => $context['method_type'] ?? 'card',
                'last_four_hash' => isset($context['last_four']) ? hash('sha256', $context['last_four']) : null,
                'expiry_month' => $context['expiry_month'] ?? null,
                'expiry_year' => $context['expiry_year'] ?? null,
            ],
        ]);
    }

    /**
     * PAYMENT_METHOD_REMOVED - Payment method deleted
     */
    public static function logPaymentMethodRemoved($user, $paymentMethod, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_METHOD_REMOVED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'removed',
            'model_type' => 'PaymentMethod',
            'model_id' => $paymentMethod->id ?? null,
            'description' => "Payment method removed for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'payment_method_id' => $paymentMethod->id ?? null,
                'method_type' => $context['method_type'] ?? 'card',
                'last_four_digits' => $context['last_four'] ?? null,
            ],
            'payload' => [
                'payment_method_id' => $paymentMethod->id ?? null,
                'method_type' => $context['method_type'] ?? 'card',
            ],
        ]);
    }

    /**
     * PAYMENT_METHOD_DEFAULT_CHANGED - Default payment updated
     */
    public static function logPaymentMethodDefaultChanged($user, $oldDefault, $newDefault, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_METHOD_DEFAULT_CHANGED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'updated',
            'model_type' => 'PaymentMethod',
            'model_id' => $newDefault->id ?? null,
            'description' => "Default payment method changed for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'old_default_id' => $oldDefault?->id,
                'new_default_id' => $newDefault?->id,
            ],
            'payload' => [
                'old_default_id' => $oldDefault?->id,
                'new_default_id' => $newDefault?->id,
            ],
        ]);
    }

    /**
     * PAYMENT_INTENT_CREATED - Payment intent initiated (Stripe/Paystack style)
     */
    public static function logPaymentIntentCreated($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_INTENT_CREATED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'created',
            'model_type' => 'Payment',
            'model_id' => $context['payment_intent_id'] ?? null,
            'description' => "Payment intent created for order {$order->order_number}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
                'currency' => $context['currency'] ?? 'KES',
                'payment_method_id' => $context['payment_method_id'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
                'currency' => $context['currency'] ?? 'KES',
                'payment_method_id' => $context['payment_method_id'] ?? null,
            ],
        ]);
    }

    /**
     * PAYMENT_SUCCESSFUL - Payment completed successfully
     */
    public static function logPaymentSuccessful($payment, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_SUCCESSFUL',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $payment->order?->user_id,
            'action' => 'completed',
            'model_type' => 'Payment',
            'model_id' => $payment->id,
            'description' => "Payment successful: {$payment->transaction_reference} - KES {$payment->amount}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $payment->order_id,
                'payment_intent_id' => $context['payment_intent_id'] ?? $payment->transaction_reference,
                'amount' => $payment->amount,
                'currency' => $context['currency'] ?? 'KES',
                'payment_method_type' => $payment->payment_method,
                'transaction_id' => $payment->transaction_id,
                'processor_response_code' => $context['processor_response_code'] ?? null,
                'settlement_date' => $context['settlement_date'] ?? null,
            ],
            'payload' => [
                'order_id' => $payment->order_id,
                'payment_intent_id' => $context['payment_intent_id'] ?? $payment->transaction_reference,
                'amount' => $payment->amount,
                'currency' => $context['currency'] ?? 'KES',
                'payment_method_type' => $payment->payment_method,
                'transaction_id' => $payment->transaction_id,
                'platform_commission' => $payment->platform_commission_amount,
                'seller_payout' => $payment->seller_payout_amount,
            ],
        ]);
    }

    /**
     * PAYMENT_FAILED - Payment attempt failed
     */
    public static function logPaymentFailed($order, string $failureReason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_FAILED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'failed',
            'model_type' => 'Payment',
            'model_id' => $context['payment_intent_id'] ?? null,
            'description' => "Payment failed for order {$order->order_number}: {$failureReason}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'is_suspicious' => ($context['failure_count'] ?? 0) > 3,
            'metadata' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
                'payment_method_id' => $context['payment_method_id'] ?? null,
                'failure_reason' => $failureReason,
                'processor_error_code' => $context['processor_error_code'] ?? null,
                'retryable' => $context['retryable'] ?? true,
                'failure_count' => $context['failure_count'] ?? 1,
            ],
            'payload' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'amount' => $order->total,
                'failure_reason' => $failureReason,
                'retryable' => $context['retryable'] ?? true,
                'failure_count' => $context['failure_count'] ?? 1,
            ],
        ]);
    }

    /**
     * PAYMENT_RETRIED - Payment retry attempted
     */
    public static function logPaymentRetried($order, int $attemptNumber, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_RETRIED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'retried',
            'model_type' => 'Payment',
            'model_id' => $context['payment_intent_id'] ?? null,
            'description' => "Payment retry #{$attemptNumber} for order {$order->order_number}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'attempt_number' => $attemptNumber,
            ],
            'payload' => [
                'order_id' => $order->id,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'attempt_number' => $attemptNumber,
            ],
        ]);
    }

    /**
     * PAYMENT_DISPUTE_OPENED - Chargeback/dispute initiated
     */
    public static function logPaymentDisputeOpened($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_DISPUTE_OPENED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'dispute_opened',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Payment dispute opened for order {$order->order_number}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'is_suspicious' => true,
            'metadata' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'dispute_reason' => $context['dispute_reason'] ?? 'unknown',
                'amount_disputed' => $context['amount_disputed'] ?? $order->total,
                'evidence_due_date' => $context['evidence_due_date'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'dispute_reason' => $context['dispute_reason'] ?? 'unknown',
                'amount_disputed' => $context['amount_disputed'] ?? $order->total,
            ],
        ]);
    }

    /**
     * PAYMENT_DISPUTE_UPDATED - Dispute status changed
     */
    public static function logPaymentDisputeUpdated($order, string $statusUpdate, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_DISPUTE_UPDATED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'dispute_updated',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Payment dispute updated for order {$order->order_number}: {$statusUpdate}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'status_update' => $statusUpdate,
            ],
            'payload' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'status_update' => $statusUpdate,
            ],
        ]);
    }

    /**
     * PAYMENT_DISPUTE_RESOLVED - Dispute concluded
     */
    public static function logPaymentDisputeResolved($order, string $resolution, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PAYMENT_DISPUTE_RESOLVED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'dispute_resolved',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Payment dispute resolved for order {$order->order_number}: {$resolution}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'resolution' => $resolution, // won, lost
                'amount_recovered' => $context['amount_recovered'] ?? 0,
                'resolved_by' => $context['resolved_by'] ?? 'system',
            ],
            'payload' => [
                'order_id' => $order->id,
                'dispute_id' => $context['dispute_id'] ?? null,
                'resolution' => $resolution,
                'amount_recovered' => $context['amount_recovered'] ?? 0,
            ],
        ]);
    }

    /**
     * CHARGEBACK_RECEIVED - Chargeback from bank
     */
    public static function logChargebackReceived($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHARGEBACK_RECEIVED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'chargeback_received',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Chargeback received for order {$order->order_number}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'is_suspicious' => true,
            'metadata' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'payment_intent_id' => $context['payment_intent_id'] ?? null,
                'bank_reason_code' => $context['bank_reason_code'] ?? null,
                'amount' => $context['amount'] ?? $order->total,
                'representment_eligible' => $context['representment_eligible'] ?? true,
            ],
            'payload' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'bank_reason_code' => $context['bank_reason_code'] ?? null,
                'amount' => $context['amount'] ?? $order->total,
            ],
        ]);
    }

    /**
     * CHARGEBACK_CONTESTED - Chargeback challenged
     */
    public static function logChargebackContested($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHARGEBACK_CONTESTED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'action' => 'chargeback_contested',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Chargeback contested for order {$order->order_number}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'evidence_submitted_at' => $context['evidence_submitted_at'] ?? now(),
                'evidence_summary' => $context['evidence_summary'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'evidence_submitted_at' => $context['evidence_submitted_at'] ?? now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * CHARGEBACK_RESOLVED - Chargeback concluded
     */
    public static function logChargebackResolved($order, string $outcome, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHARGEBACK_RESOLVED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'chargeback_resolved',
            'model_type' => 'Payment',
            'model_id' => $order->payment?->id,
            'description' => "Chargeback resolved for order {$order->order_number}: {$outcome}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'outcome' => $outcome, // won, lost
                'final_amount' => $context['final_amount'] ?? 0,
            ],
            'payload' => [
                'order_id' => $order->id,
                'chargeback_id' => $context['chargeback_id'] ?? null,
                'outcome' => $outcome,
                'final_amount' => $context['final_amount'] ?? 0,
            ],
        ]);
    }

    /**
     * REFUND_REQUESTED - Refund initiated by customer/admin
     */
    public static function logRefundRequested($order, float $amount, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REFUND_REQUESTED',
            'event_category' => 'financial',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id() ?? $context['requested_by'],
            'action' => 'refund_requested',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Refund requested for order {$order->order_number}: KES {$amount}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'amount_requested' => $amount,
                'reason' => $reason,
                'requested_by' => auth()->id() ?? $context['requested_by'],
            ],
            'payload' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'amount_requested' => $amount,
                'reason' => $reason,
            ],
        ]);
    }

    /**
     * REFUND_PROCESSED - Refund completed
     */
    public static function logRefundProcessed($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REFUND_PROCESSED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'refund_processed',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Refund processed for order {$order->order_number}: KES " . ($context['refund_amount'] ?? 0),
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'transaction_id' => $context['transaction_id'] ?? null,
                'processed_by' => $context['processed_by'] ?? null,
                'settlement_date' => $context['settlement_date'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'transaction_id' => $context['transaction_id'] ?? null,
            ],
        ]);
    }

    /**
     * PARTIAL_REFUND_PROCESSED - Partial refund completed
     */
    public static function logPartialRefundProcessed($order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PARTIAL_REFUND_PROCESSED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $order->user_id,
            'action' => 'partial_refund_processed',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Partial refund processed for order {$order->order_number}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'remaining_order_value' => $context['remaining_order_value'] ?? 0,
                'items_refunded' => $context['items_refunded'] ?? [],
                'reason' => $context['reason'] ?? null,
            ],
            'payload' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'refund_amount' => $context['refund_amount'] ?? 0,
                'remaining_order_value' => $context['remaining_order_value'] ?? 0,
            ],
        ]);
    }

    /**
     * REFUND_REJECTED - Refund request denied
     */
    public static function logRefundRejected($order, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REFUND_REJECTED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'action' => 'refund_rejected',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Refund rejected for order {$order->order_number}: {$reason}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'reason' => $reason,
                'reviewed_by' => auth()->id(),
                'rejection_category' => $context['rejection_category'] ?? 'policy',
            ],
            'payload' => [
                'order_id' => $order->id,
                'refund_id' => $context['refund_id'] ?? null,
                'reason' => $reason,
                'rejection_category' => $context['rejection_category'] ?? 'policy',
            ],
        ]);
    }

    /**
     * POINTS_EARNED - Loyalty points credited
     */
    public static function logPointsEarned($user, int $points, string $source, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'POINTS_EARNED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'points_earned',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User earned {$points} points from {$source}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'source' => $source, // order, referral, promo
                'source_id' => $context['source_id'] ?? null,
                'expiry_date' => $context['expiry_date'] ?? null,
            ],
            'payload' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'source' => $source,
                'source_id' => $context['source_id'] ?? null,
                'expiry_date' => $context['expiry_date'] ?? null,
            ],
        ]);
    }

    /**
     * POINTS_REDEEMED - Loyalty points used
     */
    public static function logPointsRedeemed($user, int $points, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'POINTS_REDEEMED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'points_redeemed',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User redeemed {$points} points",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'reward_type' => $context['reward_type'] ?? 'discount',
                'order_id' => $context['order_id'] ?? null,
            ],
            'payload' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'reward_type' => $context['reward_type'] ?? 'discount',
                'order_id' => $context['order_id'] ?? null,
            ],
        ]);
    }

    /**
     * POINTS_EXPIRED - Loyalty points lapsed
     */
    public static function logPointsExpired($user, int $points, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'POINTS_EXPIRED',
            'event_category' => 'financial',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'points_expired',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User {$points} points expired",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'original_earned_date' => $context['original_earned_date'] ?? null,
                'source' => $context['source'] ?? null,
            ],
            'payload' => [
                'user_id' => $user->id,
                'points_amount' => $points,
                'original_earned_date' => $context['original_earned_date'] ?? null,
            ],
        ]);
    }

    /**
     * POINTS_ADJUSTED - Manual points adjustment
     */
    public static function logPointsAdjusted($user, int $pointsChange, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'POINTS_ADJUSTED',
            'event_category' => 'financial',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'action' => 'points_adjusted',
            'model_type' => 'User',
            'model_id' => $user->id,
            'on_behalf_of' => $user->id,
            'description' => "Points adjusted for {$user->email}: {$pointsChange} - {$reason}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'target_user_id' => $user->id,
                'points_change' => $pointsChange,
                'reason' => $reason,
                'adjustment_type' => $context['adjustment_type'] ?? 'manual', // manual, system
            ],
            'payload' => [
                'target_user_id' => $user->id,
                'points_change' => $pointsChange,
                'reason' => $reason,
                'adjustment_type' => $context['adjustment_type'] ?? 'manual',
            ],
        ]);
    }

    // ==================== INVENTORY EVENTS ====================

    /**
     * INVENTORY_UPDATED - Manual inventory adjustment
     */
    public static function logInventoryUpdated($product, int $adjustment, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_UPDATED',
            'event_category' => 'inventory',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id(),
            'action' => 'updated',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Inventory updated for {$product->name}: {$adjustment}",
            'severity' => 'HIGH',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'old_quantity' => $context['old_quantity'] ?? null,
                'new_quantity' => $context['new_quantity'] ?? null,
                'adjustment' => $adjustment,
                'reason' => $context['reason'] ?? 'manual_adjustment',
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'old_quantity' => $context['old_quantity'] ?? null,
                'new_quantity' => $context['new_quantity'] ?? null,
                'adjustment' => $adjustment,
                'reason' => $context['reason'] ?? 'manual_adjustment',
            ],
        ]);
    }

    /**
     * INVENTORY_AUTO_ADJUSTED - System inventory adjustment
     */
    public static function logInventoryAutoAdjusted($product, int $adjustment, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_AUTO_ADJUSTED',
            'event_category' => 'inventory',
            'actor_type' => 'SYSTEM',
            'action' => 'auto_adjusted',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Auto inventory adjustment for {$product->name}: {$adjustment}",
            'severity' => 'MEDIUM',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'adjustment' => $adjustment,
                'new_quantity' => $product->quantity,
                'trigger' => $context['trigger'] ?? 'unknown', // order_id, reservation_id
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'adjustment' => $adjustment,
                'new_quantity' => $product->quantity,
                'trigger' => $context['trigger'] ?? 'unknown',
            ],
        ]);
    }

    /**
     * INVENTORY_LOW_THRESHOLD_TRIGGERED - Low stock alert
     */
    public static function logInventoryLowThresholdTriggered($product, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_LOW_THRESHOLD_TRIGGERED',
            'event_category' => 'inventory',
            'actor_type' => 'SYSTEM',
            'action' => 'alert_triggered',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Low stock alert for {$product->name}: {$product->quantity} remaining",
            'severity' => 'HIGH',
            'is_suspicious' => $product->quantity === 0,
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'current_quantity' => $product->quantity,
                'threshold' => $product->low_stock_threshold,
                'reorder_point' => $context['reorder_point'] ?? null,
                'alert_sent' => $context['alert_sent'] ?? false,
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'current_quantity' => $product->quantity,
                'threshold' => $product->low_stock_threshold,
            ],
        ]);
    }

    // ==================== PHASE 3: ADMIN & SYSTEM CONTROL EVENTS ====================

    /**
     * USER_ROLE_CHANGED - Admin changes user role
     */
    public static function logUserRoleChanged($targetUser, string $oldRole, string $newRole, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'USER_ROLE_CHANGED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'on_behalf_of' => $targetUser->id,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $targetUser->id,
            'description' => "Role changed for {$targetUser->email}: {$oldRole} → {$newRole}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'target_user_id' => $targetUser->id,
                'old_role' => $oldRole,
                'new_role' => $newRole,
                'changed_by' => $context['changed_by'] ?? auth()->id(),
                'reason' => $context['reason'] ?? null,
            ],
            'payload' => [
                'target_user_id' => $targetUser->id,
                'old_role' => $oldRole,
                'new_role' => $newRole,
                'reason' => $context['reason'] ?? null,
            ],
        ]);
    }

    /**
     * PERMISSIONS_UPDATED - User permissions modified
     */
    public static function logPermissionsUpdated($targetUser, array $permissionsAdded, array $permissionsRemoved, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PERMISSIONS_UPDATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'on_behalf_of' => $targetUser->id,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $targetUser->id,
            'description' => "Permissions updated for {$targetUser->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'target_user_id' => $targetUser->id,
                'permissions_added' => $permissionsAdded,
                'permissions_removed' => $permissionsRemoved,
                'changed_by' => $context['changed_by'] ?? auth()->id(),
                'reason' => $context['reason'] ?? null,
            ],
            'payload' => [
                'target_user_id' => $targetUser->id,
                'permissions_added' => $permissionsAdded,
                'permissions_removed' => $permissionsRemoved,
                'reason' => $context['reason'] ?? null,
            ],
        ]);
    }

    /**
     * ADMIN_IMPERSONATION_STARTED - Support tool impersonation
     */
    public static function logAdminImpersonationStarted($targetUser, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ADMIN_IMPERSONATION_STARTED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'on_behalf_of' => $targetUser->id,
            'action' => 'impersonation_started',
            'model_type' => 'User',
            'model_id' => $targetUser->id,
            'description' => "Admin started impersonating {$targetUser->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'target_user_id' => $targetUser->id,
                'impersonation_token' => isset($context['impersonation_token']) ? hash('sha256', $context['impersonation_token']) : null,
                'reason' => $context['reason'] ?? 'support',
                'session_id' => session()->getId(),
            ],
            'payload' => [
                'target_user_id' => $targetUser->id,
                'reason' => $context['reason'] ?? 'support',
            ],
        ]);
    }

    /**
     * ADMIN_IMPERSONATION_ENDED - Impersonation session end
     */
    public static function logAdminImpersonationEnded($targetUser, int $durationSeconds, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ADMIN_IMPERSONATION_ENDED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'on_behalf_of' => $targetUser->id,
            'action' => 'impersonation_ended',
            'model_type' => 'User',
            'model_id' => $targetUser->id,
            'description' => "Admin stopped impersonating {$targetUser->email} after {$durationSeconds}s",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'target_user_id' => $targetUser->id,
                'duration_seconds' => $durationSeconds,
                'actions_taken_summary' => $context['actions_taken_summary'] ?? [],
            ],
            'payload' => [
                'target_user_id' => $targetUser->id,
                'duration_seconds' => $durationSeconds,
            ],
        ]);
    }

    /**
     * PRODUCT_CREATED - New product added (upgraded from basic log)
     */
    public static function logProductCreated($product, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRODUCT_CREATED',
            'event_category' => 'admin',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id() ?? $product->seller_id,
            'user_role' => auth()->user()?->role ?? 'seller',
            'action' => 'created',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Product created: {$product->name} (SKU: {$product->sku})",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'initial_data' => [
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $product->quantity,
                    'type' => $product->type,
                    'category_id' => $product->category_id,
                    'seller_id' => $product->seller_id,
                ],
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $product->quantity,
                'type' => $product->type,
            ],
        ]);
    }

    /**
     * PRODUCT_UPDATED - Product modified (upgraded from basic log)
     */
    public static function logProductUpdated($product, array $oldValues, array $newValues, array $context = []): ?AuditLog
    {
        // Calculate diff
        $changes = [];
        foreach ($newValues as $key => $value) {
            if (isset($oldValues[$key]) && $oldValues[$key] !== $value) {
                $changes[$key] = [
                    'old' => $oldValues[$key],
                    'new' => $value,
                ];
            }
        }

        return self::log([
            'event_type' => 'PRODUCT_UPDATED',
            'event_category' => 'admin',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id() ?? $product->seller_id,
            'user_role' => auth()->user()?->role ?? 'seller',
            'action' => 'updated',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Product updated: {$product->name} - Fields: " . implode(', ', array_keys($changes)),
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'changes' => $changes,
                'old_values' => $oldValues,
                'new_values' => $newValues,
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'changed_fields' => array_keys($changes),
            ],
        ]);
    }

    /**
     * PRODUCT_DELETED - Product removed (upgraded from basic log)
     */
    public static function logProductDeleted($product, string $deletionReason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRODUCT_DELETED',
            'event_category' => 'admin',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id() ?? $product->seller_id,
            'user_role' => auth()->user()?->role ?? 'seller',
            'action' => 'deleted',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Product deleted: {$product->name} (SKU: {$product->sku}) - Reason: {$deletionReason}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'deletion_reason' => $deletionReason,
                'archive_location' => $context['archive_location'] ?? null,
                'final_data' => [
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $product->quantity,
                    'type' => $product->type,
                ],
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'deletion_reason' => $deletionReason,
            ],
        ]);
    }

    /**
     * PRODUCT_PRICE_MODIFIED - Price change with reason
     */
    public static function logProductPriceModified($product, float $oldPrice, float $newPrice, string $reason, array $context = []): ?AuditLog
    {
        $priceChangePercent = $oldPrice > 0 ? round((($newPrice - $oldPrice) / $oldPrice) * 100, 2) : 0;

        return self::log([
            'event_type' => 'PRODUCT_PRICE_MODIFIED',
            'event_category' => 'admin',
            'actor_type' => auth()->check() ? 'USER' : 'SYSTEM',
            'user_id' => auth()->id() ?? $product->seller_id,
            'user_role' => auth()->user()?->role ?? 'seller',
            'action' => 'price_changed',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Price changed for {$product->name}: KES {$oldPrice} → KES {$newPrice} ({$priceChangePercent}%)",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'currency' => $context['currency'] ?? 'KES',
                'modified_by' => auth()->id() ?? $product->seller_id,
                'reason' => $reason,
                'effective_date' => $context['effective_date'] ?? now()->toIso8601String(),
                'price_change_percent' => $priceChangePercent,
            ],
            'payload' => [
                'product_id' => $product->id,
                'sku' => $product->sku,
                'old_price' => $oldPrice,
                'new_price' => $newPrice,
                'reason' => $reason,
                'effective_date' => $context['effective_date'] ?? now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * BULK_PRODUCT_PRICE_UPDATED - Mass price updates
     */
    public static function logBulkProductPriceUpdated(string $ruleId, array $filterCriteria, string $oldFormula, string $newFormula, int $affectedCount, array $affectedSkus, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'BULK_PRODUCT_PRICE_UPDATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'action' => 'bulk_updated',
            'model_type' => 'Product',
            'model_id' => null,
            'description' => "Bulk price update executed: {$affectedCount} products affected",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'rule_id' => $ruleId,
                'filter_criteria' => $filterCriteria,
                'old_formula' => $oldFormula,
                'new_formula' => $newFormula,
                'affected_count' => $affectedCount,
                'affected_skus_sample' => array_slice($affectedSkus, 0, 10), // First 10 only
                'execution_time_ms' => $context['execution_time_ms'] ?? null,
            ],
            'payload' => [
                'rule_id' => $ruleId,
                'affected_count' => $affectedCount,
                'old_formula' => $oldFormula,
                'new_formula' => $newFormula,
            ],
        ]);
    }

    /**
     * INVENTORY_TRANSFER_INITIATED - Stock transfer started
     */
    public static function logInventoryTransferInitiated($product, string $fromLocation, string $toLocation, int $quantity, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'INVENTORY_TRANSFER_INITIATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'action' => 'transfer_initiated',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Inventory transfer initiated for {$product->name}: {$quantity} units from {$fromLocation} to {$toLocation}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'transfer_id' => $context['transfer_id'] ?? null,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'from_location' => $fromLocation,
                'to_location' => $toLocation,
                'quantity' => $quantity,
            ],
            'payload' => [
                'transfer_id' => $context['transfer_id'] ?? null,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'from_location' => $fromLocation,
                'to_location' => $toLocation,
                'quantity' => $quantity,
            ],
        ]);
    }

    /**
     * INVENTORY_TRANSFER_COMPLETED - Stock transfer finished
     */
    public static function logInventoryTransferCompleted($product, string $transferId, int $quantityReceived, array $context = []): ?AuditLog
    {
        $discrepancy = ($context['expected_quantity'] ?? 0) - $quantityReceived;

        return self::log([
            'event_type' => 'INVENTORY_TRANSFER_COMPLETED',
            'event_category' => 'admin',
            'actor_type' => 'SYSTEM',
            'action' => 'transfer_completed',
            'model_type' => 'Product',
            'model_id' => $product->id,
            'description' => "Inventory transfer completed for {$product->name}: {$quantityReceived} units received" . ($discrepancy !== 0 ? " (discrepancy: {$discrepancy})" : ""),
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'transfer_id' => $transferId,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'from_location' => $context['from_location'] ?? null,
                'to_location' => $context['to_location'] ?? null,
                'quantity_received' => $quantityReceived,
                'discrepancy' => $discrepancy,
            ],
            'payload' => [
                'transfer_id' => $transferId,
                'product_id' => $product->id,
                'sku' => $product->sku,
                'quantity_received' => $quantityReceived,
                'discrepancy' => $discrepancy,
            ],
        ]);
    }

    /**
     * ORDER_STATUS_MANUALLY_CHANGED - Admin order override
     */
    public static function logOrderStatusManuallyChanged($order, string $oldStatus, string $newStatus, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ORDER_STATUS_MANUALLY_CHANGED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => auth()->id(),
            'user_role' => auth()->user()?->role,
            'on_behalf_of' => $order->user_id,
            'action' => 'status_overridden',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} status manually changed: {$oldStatus} → {$newStatus}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'order_id' => $order->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => auth()->id(),
                'reason' => $reason,
                'customer_notified' => $context['customer_notified'] ?? false,
            ],
            'payload' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $reason,
                'customer_notified' => $context['customer_notified'] ?? false,
            ],
        ]);
    }

    // ==================== PHASE 4: USER DATA & COMPLIANCE EVENTS ====================

    /**
     * ACCOUNT_CREATED - New user registration
     */
    public static function logAccountCreated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_CREATED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'created',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Account created: {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'registration_method' => $context['registration_method'] ?? 'standard',
                'email' => hash('sha256', $user->email),
                'email_verified' => $user->email_verified_at ? true : false,
                'referral_code_used' => $context['referral_code'] ?? null,
                'ip_address' => $context['ip_address'] ?? request()->ip(),
            ],
            'payload' => [
                'user_id' => $user->id,
                'registration_method' => $context['registration_method'] ?? 'standard',
                'email_hash' => hash('sha256', $user->email),
                'email_verified' => $user->email_verified_at ? true : false,
            ],
        ]);
    }

    /**
     * EMAIL_VERIFICATION_SENT - Verification email dispatched
     */
    public static function logEmailVerificationSent($user, string $token, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'EMAIL_VERIFICATION_SENT',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'sent',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Email verification sent to {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'email' => hash('sha256', $user->email),
                'token_hash' => hash('sha256', $token),
                'delivery_status' => $context['delivery_status'] ?? 'queued',
            ],
            'payload' => [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
            ],
        ]);
    }

    /**
     * EMAIL_VERIFIED - Email successfully verified
     */
    public static function logEmailVerified($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'EMAIL_VERIFIED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'verified',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Email verified: {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'email' => hash('sha256', $user->email),
                'verification_method' => $context['verification_method'] ?? 'token',
            ],
            'payload' => [
                'user_id' => $user->id,
                'email_hash' => hash('sha256', $user->email),
                'verified_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * PROFILE_UPDATED - User profile changes
     */
    public static function logProfileUpdated($user, array $changedFields, array $oldValues, array $newValues, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PROFILE_UPDATED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Profile updated: " . implode(', ', $changedFields),
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'changed_fields' => $changedFields,
                'old_values' => $oldValues,
                'new_values' => $newValues,
            ],
            'payload' => [
                'user_id' => $user->id,
                'changed_fields' => $changedFields,
            ],
        ]);
    }

    /**
     * EMAIL_CHANGED - Email address updated
     */
    public static function logEmailChanged($user, string $oldEmail, string $newEmail, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'EMAIL_CHANGED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Email changed for user {$user->id}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'old_email' => hash('sha256', $oldEmail),
                'new_email' => hash('sha256', $newEmail),
                'verification_status' => $context['verification_status'] ?? 'pending',
            ],
            'payload' => [
                'user_id' => $user->id,
                'old_email_hash' => hash('sha256', $oldEmail),
                'new_email_hash' => hash('sha256', $newEmail),
            ],
        ]);
    }

    /**
     * PHONE_CHANGED - Phone number updated
     */
    public static function logPhoneChanged($user, ?string $oldPhone, ?string $newPhone, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PHONE_CHANGED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Phone changed for user {$user->id}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'old_phone_hash' => $oldPhone ? hash('sha256', $oldPhone) : null,
                'new_phone_hash' => $newPhone ? hash('sha256', $newPhone) : null,
                'verification_status' => $context['verification_status'] ?? 'pending',
            ],
            'payload' => [
                'user_id' => $user->id,
                'phone_changed' => true,
            ],
        ]);
    }

    /**
     * ADDRESS_ADDED - New address saved
     */
    public static function logAddressAdded($user, $address, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ADDRESS_ADDED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'created',
            'model_type' => 'Address',
            'model_id' => $address->id,
            'description' => "Address added for user {$user->id}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'address_id' => $address->id,
                'address_type' => $address->type ?? 'shipping',
                'city' => $address->city,
                'country' => $address->country,
            ],
            'payload' => [
                'user_id' => $user->id,
                'address_id' => $address->id,
                'address_type' => $address->type ?? 'shipping',
            ],
        ]);
    }

    /**
     * ADDRESS_UPDATED - Address modified
     */
    public static function logAddressUpdated($user, $address, array $changes, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ADDRESS_UPDATED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'updated',
            'model_type' => 'Address',
            'model_id' => $address->id,
            'description' => "Address updated for user {$user->id}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'address_id' => $address->id,
                'address_type' => $address->type,
                'changes' => $changes,
            ],
            'payload' => [
                'user_id' => $user->id,
                'address_id' => $address->id,
                'changed_fields' => array_keys($changes),
            ],
        ]);
    }

    /**
     * ADDRESS_DELETED - Address removed
     */
    public static function logAddressDeleted($user, $address, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ADDRESS_DELETED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'deleted',
            'model_type' => 'Address',
            'model_id' => $address->id,
            'description' => "Address deleted for user {$user->id}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'address_id' => $address->id,
                'address_type' => $address->type,
            ],
            'payload' => [
                'user_id' => $user->id,
                'address_id' => $address->id,
            ],
        ]);
    }

    /**
     * ACCOUNT_DEACTIVATED - User deactivated account
     */
    public static function logAccountDeactivated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_DEACTIVATED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'deactivated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Account deactivated: {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'reason' => $context['reason'] ?? 'user_request',
                'deactivated_by' => $context['deactivated_by'] ?? $user->id,
                'reactivation_eligible_date' => $context['reactivation_eligible_date'] ?? now()->addDays(30),
            ],
            'payload' => [
                'user_id' => $user->id,
                'reason' => $context['reason'] ?? 'user_request',
                'reactivation_eligible_date' => $context['reactivation_eligible_date'] ?? now()->addDays(30)->toIso8601String(),
            ],
        ]);
    }

    /**
     * ACCOUNT_REACTIVATED - User reactivated account
     */
    public static function logAccountReactivated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_REACTIVATED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'reactivated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Account reactivated: {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'reactivation_method' => $context['reactivation_method'] ?? 'self_service',
            ],
            'payload' => [
                'user_id' => $user->id,
                'reactivation_method' => $context['reactivation_method'] ?? 'self_service',
                'reactivated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * ACCOUNT_DELETED - User deleted account (GDPR Right to Erasure)
     */
    public static function logAccountDeleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'ACCOUNT_DELETED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'deleted',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Account deleted: {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'deleted_by' => $context['deleted_by'] ?? $user->id,
                'reason' => $context['reason'] ?? 'user_request',
                'deletion_type' => $context['deletion_type'] ?? 'GDPR',
                'data_retention_expiry' => $context['data_retention_expiry'] ?? now()->addYears(7),
            ],
            'payload' => [
                'user_id' => $user->id,
                'reason' => $context['reason'] ?? 'user_request',
                'deletion_type' => $context['deletion_type'] ?? 'GDPR',
                'data_retention_expiry' => $context['data_retention_expiry'] ?? now()->addYears(7)->toIso8601String(),
            ],
        ]);
    }

    /**
     * DATA_ANONYMIZED - User data anonymized
     */
    public static function logDataAnonymized($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_ANONYMIZED',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => null, // Original user ID no longer exists
            'action' => 'anonymized',
            'model_type' => 'User',
            'model_id' => null,
            'description' => "User data anonymized: {$context['anonymized_user_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'original_user_id_hash' => hash('sha256', $user->id),
                'anonymized_user_id' => $context['anonymized_user_id'],
                'retention_reason' => $context['retention_reason'] ?? 'legal', // legal, tax, fraud
                'orders_retained' => $context['orders_retained'] ?? [],
                'anonymization_job_id' => $context['job_id'] ?? null,
            ],
            'payload' => [
                'anonymized_user_id' => $context['anonymized_user_id'],
                'retention_reason' => $context['retention_reason'] ?? 'legal',
            ],
        ]);
    }

    // ==================== DATA EXPORT EVENTS ====================

    /**
     * DATA_EXPORT_REQUESTED - GDPR Article 15/20 request
     */
    public static function logDataExportRequested($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_EXPORT_REQUESTED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'requested',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Data export requested for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'export_type' => $context['export_type'] ?? 'full', // full, partial
                'formats' => $context['formats'] ?? ['JSON'],
                'status' => 'pending',
                'deadline' => $context['deadline'] ?? now()->addDays(30),
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'export_type' => $context['export_type'] ?? 'full',
                'deadline' => $context['deadline'] ?? now()->addDays(30)->toIso8601String(),
            ],
        ]);
    }

    /**
     * DATA_EXPORT_GENERATED - Export file created
     */
    public static function logDataExportGenerated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_EXPORT_GENERATED',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'generated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Data export generated for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'file_size' => $context['file_size'],
                'checksum' => $context['checksum'],
                'expiry_date' => $context['expiry_date'] ?? now()->addDays(7),
                'download_url_hash' => $context['download_url_hash'],
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'file_size' => $context['file_size'],
                'checksum' => $context['checksum'],
                'expiry_date' => $context['expiry_date'] ?? now()->addDays(7)->toIso8601String(),
            ],
        ]);
    }

    /**
     * DATA_EXPORT_DOWNLOADED - User downloaded export
     */
    public static function logDataExportDownloaded($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_EXPORT_DOWNLOADED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'downloaded',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Data export downloaded for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'ip_address' => $context['ip_address'] ?? request()->ip(),
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'downloaded_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * DATA_EXPORT_EXPIRED - Export link expired
     */
    public static function logDataExportExpired($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_EXPORT_EXPIRED',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'expired',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Data export expired for {$user->email}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'expired_at' => $context['expired_at'] ?? now(),
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'expired_at' => $context['expired_at'] ?? now()->toIso8601String(),
            ],
        ]);
    }

    // ==================== CONSENT & PRIVACY EVENTS ====================

    /**
     * CONSENT_GIVEN - User granted consent
     */
    public static function logConsentGiven($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CONSENT_GIVEN',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'consent_given',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Consent given: {$context['consent_type']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'consent_type' => $context['consent_type'], // marketing, analytics, cookies, location
                'version' => $context['version'],
                'ip_address' => $context['ip_address'] ?? request()->ip(),
                'user_agent_hash' => isset($context['user_agent']) ? hash('sha256', $context['user_agent']) : null,
                'consent_management_platform_id' => $context['cmp_id'] ?? null,
            ],
            'payload' => [
                'consent_type' => $context['consent_type'],
                'version' => $context['version'],
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * CONSENT_WITHDRAWN - User revoked consent
     */
    public static function logConsentWithdrawn($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CONSENT_WITHDRAWN',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'consent_withdrawn',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Consent withdrawn: {$context['consent_type']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'consent_type' => $context['consent_type'],
                'version' => $context['version'],
                'ip_address' => $context['ip_address'] ?? request()->ip(),
                'withdrawal_method' => $context['withdrawal_method'] ?? 'api',
            ],
            'payload' => [
                'consent_type' => $context['consent_type'],
                'version' => $context['version'],
                'withdrawn_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * CONSENT_PREFERENCES_EXPORTED - User exported consent history
     */
    public static function logConsentPreferencesExported($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CONSENT_PREFERENCES_EXPORTED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'exported',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Consent preferences exported for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'export_format' => $context['export_format'] ?? 'JSON',
            ],
            'payload' => [
                'export_format' => $context['export_format'] ?? 'JSON',
                'exported_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * PRIVACY_REQUEST_RECEIVED - GDPR/CCPA request submitted
     */
    public static function logPrivacyRequestReceived($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVACY_REQUEST_RECEIVED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'received',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Privacy request received: {$context['request_type']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'request_type' => $context['request_type'], // deletion, access, portability, restriction, objection
                'channel' => $context['channel'] ?? 'web', // web, email, phone
                'deadline' => $context['deadline'],
                'jurisdiction' => $context['jurisdiction'] ?? 'GDPR', // GDPR, CCPA
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'request_type' => $context['request_type'],
                'deadline' => $context['deadline']->toIso8601String(),
                'jurisdiction' => $context['jurisdiction'] ?? 'GDPR',
            ],
        ]);
    }

    /**
     * PRIVACY_REQUEST_ACKNOWLEDGED - Request acknowledged
     */
    public static function logPrivacyRequestAcknowledged($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVACY_REQUEST_ACKNOWLEDGED',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'acknowledged',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Privacy request acknowledged: {$context['request_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'acknowledgment_sent' => $context['acknowledgment_sent'] ?? true,
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'acknowledged_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * PRIVACY_REQUEST_FULFILLED - Request completed
     */
    public static function logPrivacyRequestFulfilled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVACY_REQUEST_FULFILLED',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'fulfilled',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Privacy request fulfilled: {$context['request_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'fulfilled_at' => $context['fulfilled_at'] ?? now(),
                'method' => $context['method'] ?? 'automated',
                'data_location_summary' => $context['data_location_summary'] ?? 'all_systems',
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'fulfilled_at' => ($context['fulfilled_at'] ?? now())->toIso8601String(),
            ],
        ]);
    }

    /**
     * PRIVACY_REQUEST_REJECTED - Request denied
     */
    public static function logPrivacyRequestRejected($user, string $reason, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVACY_REQUEST_REJECTED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => auth()->id(), // Admin who rejected
            'on_behalf_of' => $user->id,
            'action' => 'rejected',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Privacy request rejected: {$context['request_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'request_id' => $context['request_id'],
                'rejection_reason' => $reason,
                'legal_basis' => $context['legal_basis'] ?? 'legitimate_interest',
                'appeal_process_explained' => $context['appeal_process_explained'] ?? true,
            ],
            'payload' => [
                'request_id' => $context['request_id'],
                'rejection_reason' => $reason,
                'legal_basis' => $context['legal_basis'] ?? 'legitimate_interest',
            ],
        ]);
    }

    /**
     * DATA_TRANSFERRED_CROSS_BORDER - International data transfer
     */
    public static function logDataTransferredCrossBorder($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_TRANSFERRED_CROSS_BORDER',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'transferred',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Data transferred: {$context['from_region']} → {$context['to_region']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'data_type' => $context['data_type'],
                'from_region' => $context['from_region'],
                'to_region' => $context['to_region'],
                'transfer_mechanism' => $context['transfer_mechanism'], // SCCs, BCRs, adequacy
                'legal_basis' => $context['legal_basis'],
                'data_categories' => $context['data_categories'] ?? [],
            ],
            'payload' => [
                'from_region' => $context['from_region'],
                'to_region' => $context['to_region'],
                'transfer_mechanism' => $context['transfer_mechanism'],
            ],
        ]);
    }

    /**
     * AUTOMATED_DECISION_MADE - Algorithmic decision (GDPR Article 22)
     */
    public static function logAutomatedDecisionMade($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'AUTOMATED_DECISION_MADE',
            'event_category' => 'privacy',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'decision_made',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Automated decision: {$context['decision_type']} - {$context['outcome']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'decision_id' => $context['decision_id'],
                'decision_type' => $context['decision_type'], // pricing, fraud, risk
                'algorithm_version' => $context['algorithm_version'],
                'input_features' => $context['input_features'] ?? [],
                'outcome' => $context['outcome'],
                'confidence_score' => $context['confidence_score'] ?? null,
                'human_review_available' => $context['human_review_available'] ?? true,
                'explanation_provided' => $context['explanation_provided'] ?? false,
                'order_id' => $context['order_id'] ?? null,
            ],
            'payload' => [
                'decision_id' => $context['decision_id'],
                'decision_type' => $context['decision_type'],
                'outcome' => $context['outcome'],
                'human_review_available' => $context['human_review_available'] ?? true,
            ],
        ]);
    }

    /**
     * AUTOMATED_DECISION_CONTESTED - User challenges decision
     */
    public static function logAutomatedDecisionContested($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'AUTOMATED_DECISION_CONTESTED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'contested',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Automated decision contested: {$context['decision_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'decision_id' => $context['decision_id'],
                'contest_reason' => $context['contest_reason'],
                'human_review_requested' => $context['human_review_requested'] ?? true,
            ],
            'payload' => [
                'decision_id' => $context['decision_id'],
                'contest_reason' => $context['contest_reason'],
                'contested_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * AUTOMATED_DECISION_REVIEWED - Human review completed
     */
    public static function logAutomatedDecisionReviewed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'AUTOMATED_DECISION_REVIEWED',
            'event_category' => 'privacy',
            'actor_type' => 'USER',
            'user_id' => auth()->id(), // Reviewer
            'on_behalf_of' => $user->id,
            'action' => 'reviewed',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Automated decision reviewed: {$context['decision_id']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'decision_id' => $context['decision_id'],
                'original_outcome' => $context['original_outcome'],
                'reviewed_outcome' => $context['reviewed_outcome'],
                'reviewer_id' => auth()->id(),
                'overturn_reason' => $context['overturn_reason'] ?? null,
            ],
            'payload' => [
                'decision_id' => $context['decision_id'],
                'original_outcome' => $context['original_outcome'],
                'reviewed_outcome' => $context['reviewed_outcome'],
                'reviewed_at' => now()->toIso8601String(),
            ],
        ]);
    }

    // ==================== REFERRAL EVENTS (Business Logic) ====================

    /**
     * REFERRAL_CODE_GENERATED - User created referral code
     */
    public static function logReferralCodeGenerated($user, string $referralCode, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REFERRAL_CODE_GENERATED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'generated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Referral code generated for {$user->email}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'referral_code' => $referralCode,
            ],
            'payload' => [
                'referral_code' => $referralCode,
                'generated_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * REFERRAL_COMPLETED - Referral successful
     */
    public static function logReferralCompleted($referrer, $referee, string $referralCode, $order, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REFERRAL_COMPLETED',
            'event_category' => 'business',
            'actor_type' => 'SYSTEM',
            'user_id' => $referrer->id,
            'action' => 'completed',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Referral completed: {$referrer->email} referred {$referee->email}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'referrer_user_id' => $referrer->id,
                'referee_user_id' => $referee->id,
                'referral_code' => $referralCode,
                'order_id' => $order->id,
                'reward_issued' => $context['reward_issued'] ?? false,
            ],
            'payload' => [
                'referrer_user_id' => $referrer->id,
                'referee_user_id' => $referee->id,
                'referral_code' => $referralCode,
                'order_id' => $order->id,
                'reward_issued' => $context['reward_issued'] ?? false,
            ],
        ]);
    }

    // ==================== PHASE 5: API & INTEGRATION EVENTS ====================

    /**
     * API_KEY_CREATED - New API key generated
     */
    public static function logApiKeyCreated($user, $apiKey, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'API_KEY_CREATED',
            'event_category' => 'api',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'created',
            'model_type' => 'ApiKey',
            'model_id' => $apiKey->key_id,
            'description' => "API key created: {$apiKey->name}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'key_id' => $apiKey->key_id,
                'key_hash_truncated' => $context['key_hash_truncated'] ?? substr($apiKey->key_hash, 0, 16),
                'service_name' => $context['service_name'] ?? $apiKey->name,
                'permissions_scope' => $apiKey->permissions_scope,
                'environment' => $apiKey->environment,
                'created_by' => $apiKey->created_by,
                'expiry_date' => $apiKey->expires_at,
            ],
            'payload' => [
                'key_id' => $apiKey->key_id,
                'environment' => $apiKey->environment,
                'permissions_scope' => $apiKey->permissions_scope,
            ],
        ]);
    }

    /**
     * API_KEY_ROTATED - Key rotation performed
     */
    public static function logApiKeyRotated($user, $oldKey, $newKey, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'API_KEY_ROTATED',
            'event_category' => 'api',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'rotated',
            'model_type' => 'ApiKey',
            'model_id' => $newKey->key_id,
            'description' => "API key rotated: {$oldKey->key_id} → {$newKey->key_id}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'old_key_id' => $oldKey->key_id,
                'new_key_id' => $newKey->key_id,
                'old_key_hash_truncated' => $context['old_key_hash_truncated'] ?? substr($oldKey->key_hash, 0, 16),
                'new_key_hash_truncated' => $context['new_key_hash_truncated'] ?? substr($newKey->key_hash, 0, 16),
                'rotated_by' => $user->id,
                'reason' => $context['reason'] ?? 'scheduled_rotation',
            ],
            'payload' => [
                'old_key_id' => $oldKey->key_id,
                'new_key_id' => $newKey->key_id,
                'reason' => $context['reason'] ?? 'scheduled_rotation',
            ],
        ]);
    }

    /**
     * API_KEY_REVOKED - API key deactivated
     */
    public static function logApiKeyRevoked($user, $apiKey, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'API_KEY_REVOKED',
            'event_category' => 'api',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'revoked',
            'model_type' => 'ApiKey',
            'model_id' => $apiKey->key_id,
            'description' => "API key revoked: {$apiKey->key_id}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'key_id' => $apiKey->key_id,
                'revoked_by' => $user->id,
                'reason' => $context['reason'] ?? 'user_request',
                'active_requests_terminated' => $context['active_requests_terminated'] ?? 0,
            ],
            'payload' => [
                'key_id' => $apiKey->key_id,
                'reason' => $context['reason'] ?? 'user_request',
                'revoked_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * API_REQUEST_RECEIVED - API call authenticated
     */
    public static function logApiRequestReceived($apiKey, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'API_REQUEST_RECEIVED',
            'event_category' => 'api',
            'actor_type' => 'API_KEY',
            'user_id' => $apiKey->user_id ?? null,
            'action' => 'request',
            'model_type' => 'ApiKey',
            'model_id' => $apiKey->key_id ?? null,
            'description' => "API request via key: {$apiKey->key_id}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'key_id' => $apiKey->key_id,
                'endpoint' => $context['endpoint'],
                'method' => $context['method'],
                'ip_address' => $context['ip_address'] ?? request()->ip(),
                'request_size' => $context['request_size'] ?? 0,
                'correlation_id' => $context['correlation_id'] ?? uniqid(),
            ],
            'payload' => [
                'key_id' => $apiKey->key_id,
                'endpoint' => $context['endpoint'],
                'method' => $context['method'],
            ],
        ]);
    }

    /**
     * API_RATE_LIMIT_TRIGGERED - Rate limit exceeded
     */
    public static function logApiRateLimitTriggered($apiKey, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'API_RATE_LIMIT_TRIGGERED',
            'event_category' => 'api',
            'actor_type' => $apiKey ? 'API_KEY' : 'ANONYMOUS',
            'user_id' => $apiKey->user_id ?? null,
            'action' => 'rate_limited',
            'model_type' => 'ApiKey',
            'model_id' => $apiKey->key_id ?? null,
            'description' => "Rate limit triggered for key: {$apiKey?->key_id}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'key_id' => $apiKey?->key_id,
                'endpoint' => $context['endpoint'],
                'limit_type' => $context['limit_type'],
                'threshold' => $context['threshold'],
                'actual_rate' => $context['actual_rate'],
                'ip_address' => $context['ip_address'] ?? request()->ip(),
                'action_taken' => $context['action_taken'] ?? 'throttle',
            ],
            'payload' => [
                'key_id' => $apiKey?->key_id,
                'threshold' => $context['threshold'],
                'actual_rate' => $context['actual_rate'],
            ],
        ]);
    }

    /**
     * WEBHOOK_SUBSCRIPTION_CREATED - New webhook registered
     */
    public static function logWebhookSubscriptionCreated($user, $subscription, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WEBHOOK_SUBSCRIPTION_CREATED',
            'event_category' => 'api',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'created',
            'model_type' => 'WebhookSubscription',
            'model_id' => $subscription->subscription_id,
            'description' => "Webhook subscription created: {$subscription->endpoint_url}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'subscription_id' => $subscription->subscription_id,
                'endpoint_url' => $subscription->endpoint_url,
                'event_types' => $subscription->event_types,
                'secret_hash_truncated' => $context['secret_hash_truncated'] ?? null,
            ],
            'payload' => [
                'subscription_id' => $subscription->subscription_id,
                'endpoint_url' => $subscription->endpoint_url,
                'event_types' => $subscription->event_types,
            ],
        ]);
    }

    /**
     * WEBHOOK_DELIVERED - Successful webhook delivery
     */
    public static function logWebhookDelivered($subscription, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WEBHOOK_DELIVERED',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'action' => 'delivered',
            'model_type' => 'WebhookSubscription',
            'model_id' => $subscription->subscription_id,
            'description' => "Webhook delivered to {$subscription->endpoint_url}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'subscription_id' => $subscription->subscription_id,
                'endpoint_url' => $subscription->endpoint_url,
                'event_type' => $context['event_type'],
                'event_id' => $context['event_id'],
                'payload_size' => $context['payload_size'] ?? 0,
                'http_status' => $context['http_status'],
                'response_time_ms' => $context['response_time_ms'],
                'delivery_attempt' => $context['delivery_attempt'] ?? 1,
            ],
            'payload' => [
                'subscription_id' => $subscription->subscription_id,
                'event_id' => $context['event_id'],
                'event_type' => $context['event_type'],
                'response_time_ms' => $context['response_time_ms'],
            ],
        ]);
    }

    /**
     * WEBHOOK_FAILED - Failed webhook delivery
     */
    public static function logWebhookFailed($subscription, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WEBHOOK_FAILED',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'action' => 'failed',
            'model_type' => 'WebhookSubscription',
            'model_id' => $subscription->subscription_id,
            'description' => "Webhook delivery failed: {$subscription->endpoint_url}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'subscription_id' => $subscription->subscription_id,
                'endpoint_url' => $subscription->endpoint_url,
                'event_type' => $context['event_type'],
                'event_id' => $context['event_id'],
                'http_status' => $context['http_status'],
                'error_message' => $context['error_message'],
                'delivery_attempt' => $context['delivery_attempt'] ?? 1,
                'will_retry' => $context['will_retry'] ?? true,
            ],
            'payload' => [
                'subscription_id' => $subscription->subscription_id,
                'event_id' => $context['event_id'],
                'error_message' => $context['error_message'],
                'will_retry' => $context['will_retry'] ?? true,
            ],
        ]);
    }

    /**
     * WEBHOOK_RETRY_SCHEDULED - Retry queued
     */
    public static function logWebhookRetryScheduled($subscription, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WEBHOOK_RETRY_SCHEDULED',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'action' => 'retry_scheduled',
            'model_type' => 'WebhookSubscription',
            'model_id' => $subscription->subscription_id,
            'description' => "Webhook retry scheduled for {$subscription->endpoint_url}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'subscription_id' => $subscription->subscription_id,
                'event_id' => $context['event_id'],
                'event_type' => $context['event_type'],
                'next_attempt_at' => $context['next_attempt_at'],
                'attempt_number' => $context['attempt_number'],
            ],
            'payload' => [
                'subscription_id' => $subscription->subscription_id,
                'event_id' => $context['event_id'],
                'next_attempt_at' => $context['next_attempt_at']->toIso8601String(),
                'attempt_number' => $context['attempt_number'],
            ],
        ]);
    }

    /**
     * WEBHOOK_DISABLED - Subscription auto-disabled
     */
    public static function logWebhookDisabled($subscription, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WEBHOOK_DISABLED',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'action' => 'disabled',
            'model_type' => 'WebhookSubscription',
            'model_id' => $subscription->subscription_id,
            'description' => "Webhook subscription disabled: {$subscription->endpoint_url}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'subscription_id' => $subscription->subscription_id,
                'reason' => $context['reason'],
                'failure_threshold_reached' => $context['failure_threshold_reached'] ?? 100,
                'recent_failures' => $context['recent_failures'] ?? 0,
            ],
            'payload' => [
                'subscription_id' => $subscription->subscription_id,
                'reason' => $context['reason'],
                'disabled_at' => now()->toIso8601String(),
            ],
        ]);
    }

    /**
     * THIRD_PARTY_INTEGRATION_ERROR - External service failure
     */
    public static function logThirdPartyIntegrationError($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'THIRD_PARTY_INTEGRATION_ERROR',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'integration_error',
            'model_type' => 'ThirdPartyService',
            'model_id' => $context['service_name'],
            'description' => "Integration error: {$context['service_name']} - {$context['error_code']}",
            'severity' => $context['impact_level'] === 'critical' ? 'CRITICAL' : 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'service_name' => $context['service_name'],
                'endpoint' => $context['endpoint'],
                'operation' => $context['operation'],
                'error_code' => $context['error_code'],
                'error_message' => $context['error_message'],
                'impact_level' => $context['impact_level'],
                'retry_attempted' => $context['retry_attempted'] ?? false,
                'correlation_id' => $context['correlation_id'] ?? uniqid(),
                'duration_ms' => $context['duration_ms'] ?? 0,
            ],
            'payload' => [
                'service_name' => $context['service_name'],
                'error_code' => $context['error_code'],
                'impact_level' => $context['impact_level'],
                'correlation_id' => $context['correlation_id'] ?? uniqid(),
            ],
        ]);
    }

    /**
     * THIRD_PARTY_INTEGRATION_RECOVERY - Service recovered
     */
    public static function logThirdPartyIntegrationRecovery($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'THIRD_PARTY_INTEGRATION_RECOVERY',
            'event_category' => 'api',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'recovered',
            'model_type' => 'ThirdPartyService',
            'model_id' => $context['service_name'],
            'description' => "Integration recovered: {$context['service_name']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'service_name' => $context['service_name'],
                'endpoint' => $context['endpoint'],
                'recovery_method' => $context['recovery_method'],
                'retry_count' => $context['retry_count'] ?? 0,
                'downtime_duration_ms' => $context['downtime_duration_ms'] ?? 0,
            ],
            'payload' => [
                'service_name' => $context['service_name'],
                'recovery_method' => $context['recovery_method'],
                'downtime_duration_ms' => $context['downtime_duration_ms'] ?? 0,
            ],
        ]);
    }

    // ==================== PHASE 6: SYSTEM HEALTH EVENTS ====================

    /**
     * DATABASE_BACKUP_STARTED - Backup initiated
     */
    public static function logDatabaseBackupStarted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATABASE_BACKUP_STARTED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'backup_started',
            'model_type' => 'Database',
            'model_id' => $context['backup_id'],
            'description' => "Database backup started: {$context['backup_type']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'backup_id' => $context['backup_id'],
                'backup_type' => $context['backup_type'], // full, incremental
                'storage_target' => $context['storage_target'],
                'started_at' => $context['started_at'],
            ],
            'payload' => [
                'backup_id' => $context['backup_id'],
                'backup_type' => $context['backup_type'],
                'storage_target' => $context['storage_target'],
            ],
        ]);
    }

    /**
     * DATABASE_BACKUP_COMPLETED - Backup successful
     */
    public static function logDatabaseBackupCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATABASE_BACKUP_COMPLETED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'backup_completed',
            'model_type' => 'Database',
            'model_id' => $context['backup_id'],
            'description' => "Database backup completed: {$context['backup_id']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'backup_id' => $context['backup_id'],
                'size_gb' => $context['size_gb'],
                'storage_location' => $context['storage_location'],
                'checksum' => $context['checksum'],
                'duration_seconds' => $context['duration_seconds'],
            ],
            'payload' => [
                'backup_id' => $context['backup_id'],
                'size_gb' => $context['size_gb'],
                'checksum' => $context['checksum'],
                'duration_seconds' => $context['duration_seconds'],
            ],
        ]);
    }

    /**
     * DATABASE_BACKUP_FAILED - Backup error
     */
    public static function logDatabaseBackupFailed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATABASE_BACKUP_FAILED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'backup_failed',
            'model_type' => 'Database',
            'model_id' => $context['backup_id'],
            'description' => "Database backup failed: {$context['failure_reason']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'backup_id' => $context['backup_id'],
                'failure_reason' => $context['failure_reason'],
                'error_code' => $context['error_code'],
                'retry_scheduled' => $context['retry_scheduled'] ?? true,
            ],
            'payload' => [
                'backup_id' => $context['backup_id'],
                'error_code' => $context['error_code'],
                'retry_scheduled' => $context['retry_scheduled'] ?? true,
            ],
        ]);
    }

    /**
     * DATABASE_RESTORE_REQUESTED - Restore initiated
     */
    public static function logDatabaseRestoreRequested($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATABASE_RESTORE_REQUESTED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'restore_requested',
            'model_type' => 'Database',
            'model_id' => $context['restore_id'],
            'description' => "Database restore requested for {$context['target_environment']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'restore_id' => $context['restore_id'],
                'backup_id' => $context['backup_id'],
                'target_environment' => $context['target_environment'],
                'reason' => $context['reason'],
                'approval_required' => $context['approval_required'] ?? false,
                'requested_by' => $user?->id,
            ],
            'payload' => [
                'restore_id' => $context['restore_id'],
                'backup_id' => $context['backup_id'],
                'target_environment' => $context['target_environment'],
                'reason' => $context['reason'],
            ],
        ]);
    }

    /**
     * DATABASE_RESTORE_COMPLETED - Restore successful
     */
    public static function logDatabaseRestoreCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATABASE_RESTORE_COMPLETED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'restore_completed',
            'model_type' => 'Database',
            'model_id' => $context['restore_id'],
            'description' => "Database restore completed for {$context['target_environment']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'restore_id' => $context['restore_id'],
                'backup_id' => $context['backup_id'],
                'target_environment' => $context['target_environment'],
                'duration_seconds' => $context['duration_seconds'],
                'restored_by' => $user?->id,
            ],
            'payload' => [
                'restore_id' => $context['restore_id'],
                'backup_id' => $context['backup_id'],
                'duration_seconds' => $context['duration_seconds'],
            ],
        ]);
    }

    /**
     * SCHEDULED_JOB_STARTED - Job execution began
     */
    public static function logScheduledJobStarted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SCHEDULED_JOB_STARTED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'job_started',
            'model_type' => 'ScheduledJob',
            'model_id' => $context['job_id'],
            'description' => "Scheduled job started: {$context['job_name']}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'cron_expression' => $context['cron_expression'],
                'scheduled_time' => $context['scheduled_time'],
                'actual_start_time' => $context['actual_start_time'],
            ],
            'payload' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'cron_expression' => $context['cron_expression'],
            ],
        ]);
    }

    /**
     * SCHEDULED_JOB_COMPLETED - Job finished successfully
     */
    public static function logScheduledJobCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SCHEDULED_JOB_COMPLETED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'job_completed',
            'model_type' => 'ScheduledJob',
            'model_id' => $context['job_id'],
            'description' => "Scheduled job completed: {$context['job_name']}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'execution_time_ms' => $context['execution_time_ms'],
                'records_processed' => $context['records_processed'],
                'next_run_time' => $context['next_run_time'] ?? null,
            ],
            'payload' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'execution_time_ms' => $context['execution_time_ms'],
                'records_processed' => $context['records_processed'],
            ],
        ]);
    }

    /**
     * SCHEDULED_JOB_FAILED - Job error
     */
    public static function logScheduledJobFailed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SCHEDULED_JOB_FAILED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'job_failed',
            'model_type' => 'ScheduledJob',
            'model_id' => $context['job_id'],
            'description' => "Scheduled job failed: {$context['job_name']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'execution_time_ms' => $context['execution_time_ms'],
                'error_message' => $context['error_message'],
                'stack_trace_hash' => $context['stack_trace_hash'],
                'retry_count' => $context['retry_count'],
                'alert_sent' => $context['alert_sent'] ?? false,
            ],
            'payload' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'error_message' => substr($context['error_message'], 0, 200),
                'retry_count' => $context['retry_count'],
            ],
        ]);
    }

    /**
     * SCHEDULED_JOB_TIMEOUT - Job exceeded time limit
     */
    public static function logScheduledJobTimeout($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SCHEDULED_JOB_TIMEOUT',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'job_timeout',
            'model_type' => 'ScheduledJob',
            'model_id' => $context['job_id'],
            'description' => "Scheduled job timed out: {$context['job_name']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'timeout_threshold' => $context['timeout_threshold'],
                'actual_duration' => $context['actual_duration'],
                'termination_method' => $context['termination_method'] ?? 'graceful_shutdown',
            ],
            'payload' => [
                'job_name' => $context['job_name'],
                'job_id' => $context['job_id'],
                'timeout_threshold' => $context['timeout_threshold'],
                'actual_duration' => $context['actual_duration'],
            ],
        ]);
    }

    /**
     * CACHE_INVALIDATION - Cache cleared
     */
    public static function logCacheInvalidation($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CACHE_INVALIDATION',
            'event_category' => 'system',
            'actor_type' => $user ? 'USER' : 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'cache_invalidated',
            'model_type' => 'Cache',
            'model_id' => $context['cache_key_pattern'],
            'description' => "Cache invalidated: {$context['cache_key_pattern']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'cache_key_pattern' => $context['cache_key_pattern'],
                'invalidated_by' => $context['invalidated_by'],
                'reason' => $context['reason'],
                'affected_entries_count' => $context['affected_entries_count'] ?? 0,
                'cache_tier' => $context['cache_tier'] ?? 'application',
            ],
            'payload' => [
                'cache_key_pattern' => $context['cache_key_pattern'],
                'reason' => $context['reason'],
                'affected_entries_count' => $context['affected_entries_count'] ?? 0,
            ],
        ]);
    }

    /**
     * CACHE_WARMUP_COMPLETED - Cache warmed
     */
    public static function logCacheWarmupCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CACHE_WARMUP_COMPLETED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'cache_warmed',
            'model_type' => 'Cache',
            'model_id' => $context['warmup_id'],
            'description' => "Cache warmup completed: {$context['keys_warmed']} keys",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'warmup_id' => $context['warmup_id'],
                'keys_warmed' => $context['keys_warmed'],
                'duration_seconds' => $context['duration_seconds'],
                'tier' => $context['tier'] ?? 'application',
            ],
            'payload' => [
                'warmup_id' => $context['warmup_id'],
                'keys_warmed' => $context['keys_warmed'],
                'duration_seconds' => $context['duration_seconds'],
            ],
        ]);
    }

    /**
     * SEARCH_INDEX_UPDATED - Search index refreshed
     */
    public static function logSearchIndexUpdated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SEARCH_INDEX_UPDATED',
            'event_category' => 'system',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'index_updated',
            'model_type' => 'SearchIndex',
            'model_id' => $context['index_name'],
            'description' => "Search index updated: {$context['index_name']}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'index_name' => $context['index_name'],
                'documents_updated' => $context['documents_updated'],
                'duration_ms' => $context['duration_ms'] ?? 0,
                'index_type' => $context['index_type'] ?? 'products',
            ],
            'payload' => [
                'index_name' => $context['index_name'],
                'documents_updated' => $context['documents_updated'],
                'duration_ms' => $context['duration_ms'] ?? 0,
            ],
        ]);
    }

    // ==================== PHASE 7: SECURITY MONITORING EVENTS ====================

    /**
     * RESOURCE_ACCESSED - Sensitive data access
     */
    public static function logResourceAccessed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'RESOURCE_ACCESSED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'accessed',
            'model_type' => $context['resource_type'],
            'model_id' => is_numeric($context['resource_id']) ? $context['resource_id'] : null,
            'description' => "Resource accessed: {$context['resource_type']}/{$context['resource_id']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'resource_type' => $context['resource_type'],
                'resource_id' => $context['resource_id'],
                'access_type' => $context['access_type'],
                'ip_address' => $context['ip_address'],
                'session_id' => $context['session_id'],
                'data_fields_accessed' => $context['data_fields_accessed'],
                'correlation_id' => $context['correlation_id'],
            ],
            'payload' => [
                'resource_type' => $context['resource_type'],
                'resource_id' => $context['resource_id'],
                'access_type' => $context['access_type'],
            ],
        ]);
    }

    /**
     * RESOURCE_ACCESS_DENIED - Access blocked
     */
    public static function logResourceAccessDenied($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'RESOURCE_ACCESS_DENIED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user?->id,
            'action' => 'access_denied',
            'model_type' => $context['resource_type'],
            'model_id' => $context['resource_id'],
            'description' => "Resource access denied: {$context['resource_type']}/{$context['resource_id']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'resource_type' => $context['resource_type'],
                'resource_id' => $context['resource_id'],
                'attempted_access_type' => $context['attempted_access_type'],
                'denial_reason' => $context['denial_reason'],
                'ip_address' => $context['ip_address'],
            ],
            'payload' => [
                'resource_type' => $context['resource_type'],
                'denial_reason' => $context['denial_reason'],
            ],
        ]);
    }

    /**
     * PRIVILEGED_QUERY_EXECUTED - Admin SQL query
     */
    public static function logPrivilegedQueryExecuted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVILEGED_QUERY_EXECUTED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'query_executed',
            'model_type' => 'DatabaseQuery',
            'model_id' => $context['query_hash'],
            'description' => "Privileged query executed by {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'query_hash' => $context['query_hash'],
                'query_type' => $context['query_type'],
                'target_tables' => $context['target_tables'],
                'rows_affected' => $context['rows_affected'],
                'execution_time_ms' => $context['execution_time_ms'],
                'justification' => $context['justification'],
                'session_id' => $context['session_id'],
                'approval_ticket_id' => $context['approval_ticket_id'],
            ],
            'payload' => [
                'query_hash' => $context['query_hash'],
                'query_type' => $context['query_type'],
                'target_tables' => $context['target_tables'],
            ],
        ]);
    }

    /**
     * PRIVILEGED_QUERY_BLOCKED - Dangerous query prevented
     */
    public static function logPrivilegedQueryBlocked($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRIVILEGED_QUERY_BLOCKED',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'query_blocked',
            'model_type' => 'DatabaseQuery',
            'model_id' => $context['query_hash'],
            'description' => "Privileged query blocked",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'query_hash' => $context['query_hash'],
                'query_type' => $context['query_type'],
                'block_reason' => $context['block_reason'],
                'timestamp' => $context['timestamp'],
                'attempted_by' => $context['attempted_by'],
            ],
            'payload' => [
                'query_hash' => $context['query_hash'],
                'block_reason' => $context['block_reason'],
            ],
        ]);
    }

    /**
     * VELOCITY_CHECK_TRIGGERED - Rate anomaly detected
     */
    public static function logVelocityCheckTriggered($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'VELOCITY_CHECK_TRIGGERED',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'velocity_triggered',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Velocity check triggered: {$context['check_type']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'check_type' => $context['check_type'],
                'threshold' => $context['threshold'],
                'actual_value' => $context['actual_value'],
                'time_window' => $context['time_window'],
                'action_taken' => $context['action_taken'],
                'correlation_window_id' => $context['correlation_window_id'],
            ],
            'payload' => [
                'check_type' => $context['check_type'],
                'threshold' => $context['threshold'],
                'actual_value' => $context['actual_value'],
                'action_taken' => $context['action_taken'],
            ],
        ]);
    }

    /**
     * DEVICE_FINGERPRINT_CREATED - New device registered
     */
    public static function logDeviceFingerprintCreated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DEVICE_FINGERPRINT_CREATED',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'fingerprint_created',
            'model_type' => 'Device',
            'model_id' => null, // Fingerprint hash too long, stored in metadata
            'description' => "New device fingerprint created for {$user->email}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'fingerprint_hash' => $context['fingerprint_hash'],
                'device_characteristics' => $context['device_characteristics'],
                'confidence_score' => $context['confidence_score'],
            ],
            'payload' => [
                'fingerprint_hash' => $context['fingerprint_hash'],
                'confidence_score' => $context['confidence_score'],
            ],
        ]);
    }

    /**
     * DEVICE_FINGERPRINT_MISMATCH - Unrecognized device
     */
    public static function logDeviceFingerprintMismatch($user, array $context = []): ?AuditLog
    {
        // DEDUPLICATION: Check if we already logged this exact mismatch recently
        $fingerprintHash = isset($context['actual_fingerprint']) ? md5($context['actual_fingerprint']) : 'unknown';
        $cacheKey = "audit:fp_mismatch:{$user->id}:" . $fingerprintHash;
        if (Cache::has($cacheKey)) {
            return null; // Skip duplicate logging
        }
        
        // Mark as logged (10 minute cooldown for same fingerprint)
        Cache::put($cacheKey, true, 600); // 10 minutes

        return self::log([
            'event_type' => 'DEVICE_FINGERPRINT_MISMATCH',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'fingerprint_mismatch',
            'model_type' => 'Device',
            'model_id' => $fingerprintHash, // Use hashed value, not full fingerprint
            'description' => "Device fingerprint mismatch for {$user->email}",
            'severity' => 'HIGH',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'expected_fingerprint' => $context['expected_fingerprint'] ?? null,
                'actual_fingerprint' => $context['actual_fingerprint'] ?? null,
                'similarity_score' => $context['similarity_score'] ?? 0,
                'confidence_score' => $context['confidence_score'] ?? 70,
                'action_taken' => $context['action_taken'] ?? 'logged',
            ],
            'payload' => [
                'similarity_score' => $context['similarity_score'],
                'action_taken' => $context['action_taken'],
            ],
        ]);
    }

    /**
     * DEVICE_TRUSTED - Device marked as trusted
     */
    public static function logDeviceTrusted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DEVICE_TRUSTED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'device_trusted',
            'model_type' => 'Device',
            'model_id' => $context['fingerprint_hash'],
            'description' => "Device marked as trusted for {$user->email}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'fingerprint_hash' => $context['fingerprint_hash'],
                'trust_method' => $context['trust_method'],
                'expiry_date' => $context['expiry_date'],
            ],
            'payload' => [
                'trust_method' => $context['trust_method'],
                'expiry_date' => $context['expiry_date'],
            ],
        ]);
    }

    /**
     * SUSPICIOUS_IP_DETECTED - Threat intelligence alert
     */
    public static function logSuspiciousIpDetected($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SUSPICIOUS_IP_DETECTED',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'suspicious_ip',
            'model_type' => 'IpAddress',
            'model_id' => $context['ip_address'],
            'description' => "Suspicious IP detected: {$context['ip_address']}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'ip_address' => $context['ip_address'],
                'threat_type' => $context['threat_type'],
                'risk_score' => $context['risk_score'],
                'action_taken' => $context['action_taken'] ?? 'logged',
            ],
            'payload' => [
                'ip_address' => $context['ip_address'],
                'threat_type' => $context['threat_type'],
                'risk_score' => $context['risk_score'],
            ],
        ]);
    }

    /**
     * GEOLOCATION_ANOMALY - Impossible travel detected
     */
    public static function logGeolocationAnomaly($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'GEOLOCATION_ANOMALY',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'geolocation_anomaly',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Geolocation anomaly for {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'expected_location' => $context['expected_location'],
                'actual_location' => $context['actual_location'],
                'distance_km' => $context['distance_km'],
                'impossible_travel' => $context['impossible_travel'],
                'action_taken' => $context['action_taken'] ?? 'alerted',
            ],
            'payload' => [
                'distance_km' => $context['distance_km'],
                'impossible_travel' => $context['impossible_travel'],
            ],
        ]);
    }

    /**
     * DATA_EXFILTRATION_ATTEMPT - Bulk data access detected
     */
    public static function logDataExfiltrationAttempt($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DATA_EXFILTRATION_ATTEMPT',
            'event_category' => 'security',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'exfiltration_attempt',
            'model_type' => 'DataExport',
            'model_id' => $context['data_type'],
            'description' => "Potential data exfiltration attempt by {$user->email}",
            'severity' => 'CRITICAL',
            'tier' => 'TIER_1_IMMUTABLE',
            'metadata' => [
                'data_type' => $context['data_type'],
                'records_attempted' => $context['records_attempted'],
                'destination_ip' => $context['destination_ip'],
                'blocked' => $context['blocked'],
                'method' => $context['method'],
            ],
            'payload' => [
                'data_type' => $context['data_type'],
                'records_attempted' => $context['records_attempted'],
                'blocked' => $context['blocked'],
                'method' => $context['method'],
            ],
        ]);
    }

    // ==================== PHASE 8: NOTIFICATION EVENTS ====================

    /**
     * NOTIFICATION_CREATED - Notification record created
     */
    public static function logNotificationCreated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_CREATED',
            'event_category' => 'notification',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'created',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification created: {$context['type']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'type' => $context['type'],
                'channel' => $context['channel'],
                'template_id' => $context['template_id'],
                'priority' => $context['priority'],
                'scheduled_for' => $context['scheduled_for'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'type' => $context['type'],
                'channel' => $context['channel'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_SENT - Notification dispatched to provider
     */
    public static function logNotificationSent($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_SENT',
            'event_category' => 'notification',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'sent',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification sent via {$context['channel']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'provider_message_id' => $context['provider_message_id'],
                'delivery_status' => $context['delivery_status'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'provider_message_id' => $context['provider_message_id'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_DELIVERED - Provider confirmed delivery
     */
    public static function logNotificationDelivered($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_DELIVERED',
            'event_category' => 'notification',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'delivered',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification delivered via {$context['channel']}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'delivered_at' => $context['delivered_at'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'delivered_at' => $context['delivered_at'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_OPENED - User viewed notification
     */
    public static function logNotificationOpened($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_OPENED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'opened',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification opened via {$context['channel']}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'opened_at' => $context['opened_at'],
                'ip_address' => $context['ip_address'] ?? null,
                'device_type' => $context['device_type'] ?? 'unknown',
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'device_type' => $context['device_type'] ?? 'unknown',
            ],
        ]);
    }

    /**
     * NOTIFICATION_CLICKED - User clicked notification link
     */
    public static function logNotificationClicked($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_CLICKED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'clicked',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification clicked: {$context['clicked_url']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'clicked_url' => $context['clicked_url'],
                'timestamp' => $context['timestamp'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'clicked_url' => $context['clicked_url'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_FAILED - Delivery failed
     */
    public static function logNotificationFailed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_FAILED',
            'event_category' => 'notification',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'failed',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification delivery failed: {$context['error_message']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'channel' => $context['channel'],
                'error_message' => $context['error_message'],
                'will_retry' => $context['will_retry'] ?? true,
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'error_message' => substr($context['error_message'], 0, 200),
                'will_retry' => $context['will_retry'] ?? true,
            ],
        ]);
    }

    /**
     * NOTIFICATION_DELETED - User deleted notification
     */
    public static function logNotificationDeleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_DELETED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'deleted',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification deleted by user",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
                'deletion_method' => $context['deletion_method'] ?? 'manual',
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
                'deletion_method' => $context['deletion_method'] ?? 'manual',
            ],
        ]);
    }

    /**
     * NOTIFICATION_BULK_DELETED - Multiple notifications deleted
     */
    public static function logNotificationBulkDeleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_BULK_DELETED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'bulk_deleted',
            'model_type' => 'Notification',
            'model_id' => null,
            'description' => "{$context['count']} notifications bulk deleted",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_ids' => $context['notification_ids'] ?? [],
                'count' => $context['count'],
                'filter_criteria' => $context['filter_criteria'] ?? [],
            ],
            'payload' => [
                'count' => $context['count'],
                'filter_criteria' => $context['filter_criteria'] ?? [],
            ],
        ]);
    }

    /**
     * NOTIFICATION_ARCHIVED - User archived notification
     */
    public static function logNotificationArchived($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_ARCHIVED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'archived',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification archived",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_UNARCHIVED - User restored notification
     */
    public static function logNotificationUnarchived($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_UNARCHIVED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'unarchived',
            'model_type' => 'Notification',
            'model_id' => $context['notification_id'],
            'description' => "Notification unarchived",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $context['notification_id'],
            ],
            'payload' => [
                'notification_id' => $context['notification_id'],
            ],
        ]);
    }

    /**
     * NOTIFICATION_SETTINGS_CHANGED - User changed notification setting
     */
    public static function logNotificationSettingsChanged($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'NOTIFICATION_SETTINGS_CHANGED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'setting_changed',
            'model_type' => 'UserPreference',
            'model_id' => $user->id,
            'description' => "Notification setting changed: {$context['setting_key']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'setting_key' => $context['setting_key'],
                'old_value' => $context['old_value'],
                'new_value' => $context['new_value'],
            ],
            'payload' => [
                'setting_key' => $context['setting_key'],
                'new_value' => $context['new_value'],
            ],
        ]);
    }

    /**
     * CHANNEL_PREFERENCES_UPDATED - User changed channel preferences
     */
    public static function logChannelPreferencesUpdated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'CHANNEL_PREFERENCES_UPDATED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'channels_updated',
            'model_type' => 'UserPreference',
            'model_id' => $user->id,
            'description' => "Notification channel preferences updated",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'channels' => $context['channels'],
                'enabled_status' => $context['enabled_status'],
                'source' => $context['source'] ?? 'user',
            ],
            'payload' => [
                'channels' => $context['channels'],
                'source' => $context['source'] ?? 'user',
            ],
        ]);
    }

    /**
     * QUIET_HOURS_TOGGLED - User changed quiet hours
     */
    public static function logQuietHoursToggled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'QUIET_HOURS_TOGGLED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'quiet_hours_changed',
            'model_type' => 'UserPreference',
            'model_id' => $user->id,
            'description' => "Quiet hours " . ($context['enabled'] ? 'enabled' : 'disabled'),
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'enabled' => $context['enabled'],
                'start_time' => $context['start_time'],
                'end_time' => $context['end_time'],
                'timezone' => $context['timezone'],
            ],
            'payload' => [
                'enabled' => $context['enabled'],
                'start_time' => $context['start_time'],
                'end_time' => $context['end_time'],
            ],
        ]);
    }

    /**
     * DESKTOP_NOTIFICATIONS_TOGGLED - Browser notification permission changed
     */
    public static function logDesktopNotificationsToggled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'DESKTOP_NOTIFICATIONS_TOGGLED',
            'event_category' => 'notification',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'desktop_notifications_changed',
            'model_type' => 'UserPreference',
            'model_id' => $user->id,
            'description' => "Desktop notifications " . ($context['enabled'] ? 'enabled' : 'disabled'),
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'enabled' => $context['enabled'],
                'permission_status' => $context['permission_status'],
                'browser' => substr($context['browser'] ?? 'unknown', 0, 100),
            ],
            'payload' => [
                'enabled' => $context['enabled'],
                'permission_status' => $context['permission_status'],
            ],
        ]);
    }

    // ==================== PHASE 9: MARKETING EVENTS ====================

    /**
     * MARKETING_EMAIL_SENT - Marketing email dispatched
     */
    public static function logMarketingEmailSent($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_SENT',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'sent',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email sent to {$user?->email}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'user_id' => $user?->id,
                'message_id' => $context['message_id'],
                'template_id' => $context['template_id'],
                'sent_at' => $context['sent_at'],
                'ip_warmup' => $context['ip_warmup'] ?? false,
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'ip_warmup' => $context['ip_warmup'] ?? false,
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_DELIVERED - Provider confirmed delivery
     */
    public static function logMarketingEmailDelivered($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_DELIVERED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'delivered',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email delivered",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'delivered_at' => $context['delivered_at'],
                'provider' => $context['provider'],
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'provider' => $context['provider'],
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_OPENED - Recipient opened email
     */
    public static function logMarketingEmailOpened($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_OPENED',
            'event_category' => 'marketing',
            'actor_type' => 'USER',
            'user_id' => $user?->id,
            'action' => 'opened',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email opened",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'opened_at' => $context['opened_at'],
                'ip_address' => $context['ip_address'] ?? null,
                'user_agent' => substr($context['user_agent'] ?? 'unknown', 0, 500),
                'open_count' => $context['open_count'],
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'open_count' => $context['open_count'],
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_CLICKED - Recipient clicked link
     */
    public static function logMarketingEmailClicked($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_CLICKED',
            'event_category' => 'marketing',
            'actor_type' => 'USER',
            'user_id' => $user?->id,
            'action' => 'clicked',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email link clicked: {$context['clicked_url']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'clicked_url' => $context['clicked_url'],
                'clicked_at' => $context['clicked_at'],
                'click_count' => $context['click_count'],
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'clicked_url' => $context['clicked_url'],
                'click_count' => $context['click_count'],
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_BOUNCED - Email bounced
     */
    public static function logMarketingEmailBounced($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_BOUNCED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'bounced',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email bounced: {$context['bounce_type']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'bounce_type' => $context['bounce_type'],
                'bounce_reason' => $context['bounce_reason'],
                'timestamp' => $context['timestamp'],
                'list_cleaned' => $context['list_cleaned'],
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'bounce_type' => $context['bounce_type'],
                'list_cleaned' => $context['list_cleaned'],
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_COMPLAINED - Spam complaint received
     */
    public static function logMarketingEmailComplained($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_COMPLAINED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'complained',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "Marketing email complained: {$context['complaint_type']}",
            'severity' => 'HIGH',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'message_id' => $context['message_id'],
                'complaint_type' => $context['complaint_type'],
                'timestamp' => $context['timestamp'],
                'user_unsubscribed' => $context['user_unsubscribed'],
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'complaint_type' => $context['complaint_type'],
                'user_unsubscribed' => $context['user_unsubscribed'],
            ],
        ]);
    }

    /**
     * MARKETING_EMAIL_UNSUBSCRIBED - User unsubscribed
     */
    public static function logMarketingEmailUnsubscribed($campaign, $user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'MARKETING_EMAIL_UNSUBSCRIBED',
            'event_category' => 'marketing',
            'actor_type' => 'USER',
            'user_id' => $user?->id,
            'action' => 'unsubscribed',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign?->campaign_id,
            'description' => "User unsubscribed from marketing emails",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $context['campaign_id'],
                'user_id' => $user?->id,
                'unsubscribe_method' => $context['unsubscribe_method'],
                'timestamp' => $context['timestamp'],
                'reason' => $context['reason'] ?? null,
            ],
            'payload' => [
                'campaign_id' => $context['campaign_id'],
                'unsubscribe_method' => $context['unsubscribe_method'],
                'reason' => $context['reason'] ?? null,
            ],
        ]);
    }

    /**
     * SMS_DELIVERED - SMS confirmed delivered
     */
    public static function logSmsDelivered($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SMS_DELIVERED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'delivered',
            'model_type' => 'SmsMessage',
            'model_id' => $context['message_id'],
            'description' => "SMS delivered to {$user?->phone}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'phone_hash' => $context['phone_hash'],
                'message_type' => $context['message_type'],
                'carrier' => $context['carrier'],
                'message_id' => $context['message_id'],
                'delivered_at' => $context['delivered_at'],
            ],
            'payload' => [
                'phone_hash' => $context['phone_hash'],
                'message_type' => $context['message_type'],
                'carrier' => $context['carrier'],
            ],
        ]);
    }

    /**
     * SMS_FAILED - SMS delivery failed
     */
    public static function logSmsFailed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SMS_FAILED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'failed',
            'model_type' => 'SmsMessage',
            'model_id' => $context['message_id'] ?? 'unknown',
            'description' => "SMS delivery failed: {$context['error_message']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'phone_hash' => $context['phone_hash'],
                'message_type' => $context['message_type'],
                'error_code' => $context['error_code'],
                'error_message' => $context['error_message'],
                'retry_eligible' => $context['retry_eligible'] ?? true,
            ],
            'payload' => [
                'phone_hash' => $context['phone_hash'],
                'error_code' => $context['error_code'],
                'retry_eligible' => $context['retry_eligible'] ?? true,
            ],
        ]);
    }

    /**
     * PUSH_NOTIFICATION_SENT - Push dispatched
     */
    public static function logPushNotificationSent($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PUSH_NOTIFICATION_SENT',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'sent',
            'model_type' => 'PushNotification',
            'model_id' => $context['device_token_hash'],
            'description' => "Push notification sent",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'device_token_hash' => $context['device_token_hash'],
                'payload_size' => $context['payload_size'],
                'timestamp' => now(),
            ],
            'payload' => [
                'device_token_hash' => $context['device_token_hash'],
                'payload_size' => $context['payload_size'],
            ],
        ]);
    }

    /**
     * PUSH_NOTIFICATION_DELIVERED - Push confirmed delivered
     */
    public static function logPushNotificationDelivered($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PUSH_NOTIFICATION_DELIVERED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'user_id' => $user?->id,
            'action' => 'delivered',
            'model_type' => 'PushNotification',
            'model_id' => $context['device_token_hash'],
            'description' => "Push notification delivered",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'device_token_hash' => $context['device_token_hash'],
                'delivered_at' => $context['delivered_at'],
            ],
            'payload' => [
                'device_token_hash' => $context['device_token_hash'],
                'delivered_at' => $context['delivered_at'],
            ],
        ]);
    }

    // ==================== PHASE 10: BUSINESS OPERATIONS EVENTS ====================

    /**
     * SERVICE_BOOKED - New service appointment
     */
    public static function logServiceBooked($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SERVICE_BOOKED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'booked',
            'model_type' => 'ServiceBooking',
            'model_id' => $context['booking_id'],
            'description' => "Service booked: {$context['service_type']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'booking_id' => $context['booking_id'],
                'service_type' => $context['service_type'],
                'mechanic_id' => $context['mechanic_id'],
                'scheduled_date' => $context['scheduled_date'],
                'location_id' => $context['location_id'],
            ],
            'payload' => [
                'booking_id' => $context['booking_id'],
                'service_type' => $context['service_type'],
            ],
        ]);
    }

    /**
     * SERVICE_RESCHEDULED - Booking moved
     */
    public static function logServiceRescheduled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SERVICE_RESCHEDULED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'rescheduled',
            'model_type' => 'ServiceBooking',
            'model_id' => $context['booking_id'],
            'description' => "Service rescheduled",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'booking_id' => $context['booking_id'],
                'original_booking_id' => $context['original_booking_id'],
                'old_date' => $context['old_date'],
                'new_date' => $context['new_date'],
                'reschedule_reason' => $context['reschedule_reason'],
            ],
            'payload' => [
                'booking_id' => $context['booking_id'],
                'new_date' => $context['new_date'],
            ],
        ]);
    }

    /**
     * SERVICE_COMPLETED - Service finished
     */
    public static function logServiceCompleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SERVICE_COMPLETED',
            'event_category' => 'business',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'completed',
            'model_type' => 'ServiceBooking',
            'model_id' => $context['booking_id'],
            'description' => "Service completed",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'booking_id' => $context['booking_id'],
                'completion_time' => $context['completion_time'],
                'duration_minutes' => $context['duration_minutes'],
                'final_price' => $context['final_price'],
                'rating_prompt_sent' => $context['rating_prompt_sent'],
            ],
            'payload' => [
                'booking_id' => $context['booking_id'],
                'duration_minutes' => $context['duration_minutes'],
            ],
        ]);
    }

    /**
     * SERVICE_CANCELLED - Booking cancelled
     */
    public static function logServiceCancelled($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SERVICE_CANCELLED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'cancelled',
            'model_type' => 'ServiceBooking',
            'model_id' => $context['booking_id'],
            'description' => "Service cancelled by {$context['cancelled_by']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'booking_id' => $context['booking_id'],
                'cancelled_by' => $context['cancelled_by'],
                'reason' => $context['reason'],
                'refund_issued' => $context['refund_issued'],
            ],
            'payload' => [
                'booking_id' => $context['booking_id'],
                'cancelled_by' => $context['cancelled_by'],
                'refund_issued' => $context['refund_issued'],
            ],
        ]);
    }

    /**
     * SERVICE_NO_SHOW - Missed appointment
     */
    public static function logServiceNoShow($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'SERVICE_NO_SHOW',
            'event_category' => 'business',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'no_show',
            'model_type' => 'ServiceBooking',
            'model_id' => $context['booking_id'],
            'description' => "Service no-show: {$context['no_show_party']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'booking_id' => $context['booking_id'],
                'no_show_party' => $context['no_show_party'],
                'reschedule_offered' => $context['reschedule_offered'],
            ],
            'payload' => [
                'booking_id' => $context['booking_id'],
                'no_show_party' => $context['no_show_party'],
            ],
        ]);
    }

    /**
     * REVIEW_SUBMITTED - New review posted
     */
    public static function logReviewSubmitted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REVIEW_SUBMITTED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'submitted',
            'model_type' => 'Review',
            'model_id' => $context['review_id'],
            'description' => "Review submitted for product {$context['product_id']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'review_id' => $context['review_id'],
                'product_id' => $context['product_id'],
                'booking_id' => $context['booking_id'],
                'rating' => $context['rating'],
                'review_text_hash' => $context['review_text_hash'],
                'media_count' => $context['media_count'],
                'verified_purchase' => $context['verified_purchase'],
            ],
            'payload' => [
                'review_id' => $context['review_id'],
                'rating' => $context['rating'],
                'verified_purchase' => $context['verified_purchase'],
            ],
        ]);
    }

    /**
     * REVIEW_MODERATED - Review approved/rejected/flagged
     */
    public static function logReviewModerated($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REVIEW_MODERATED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'moderated',
            'model_type' => 'Review',
            'model_id' => $context['review_id'],
            'description' => "Review {$context['moderation_action']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'review_id' => $context['review_id'],
                'moderation_action' => $context['moderation_action'],
                'moderation_reason' => $context['moderation_reason'],
                'automated' => $context['automated'] ?? false,
            ],
            'payload' => [
                'review_id' => $context['review_id'],
                'moderation_action' => $context['moderation_action'],
            ],
        ]);
    }

    /**
     * REVIEW_EDITED - Review modified
     */
    public static function logReviewEdited($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REVIEW_EDITED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'edited',
            'model_type' => 'Review',
            'model_id' => $context['review_id'],
            'description' => "Review edited (edit #{$context['edit_count']})",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'review_id' => $context['review_id'],
                'old_rating' => $context['old_rating'],
                'new_rating' => $context['new_rating'],
                'changes' => $context['changes'],
                'edit_count' => $context['edit_count'],
            ],
            'payload' => [
                'review_id' => $context['review_id'],
                'edit_count' => $context['edit_count'],
            ],
        ]);
    }

    /**
     * REVIEW_DELETED - Review removed
     */
    public static function logReviewDeleted($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REVIEW_DELETED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'deleted',
            'model_type' => 'Review',
            'model_id' => $context['review_id'],
            'description' => "Review deleted: {$context['reason']}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'review_id' => $context['review_id'],
                'product_id' => $context['product_id'],
                'deleted_by' => $context['deleted_by'],
                'reason' => $context['reason'],
                'content_archived' => $context['content_archived'],
            ],
            'payload' => [
                'review_id' => $context['review_id'],
                'reason' => $context['reason'],
            ],
        ]);
    }

    /**
     * REVIEW_HELPFUL_MARKED - Helpful vote
     */
    public static function logReviewHelpfulMarked($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'REVIEW_HELPFUL_MARKED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'voted_helpful',
            'model_type' => 'Review',
            'model_id' => $context['review_id'],
            'description' => $context['helpful'] ? "Marked as helpful" : "Removed helpful mark",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'review_id' => $context['review_id'],
                'helpful' => $context['helpful'],
            ],
            'payload' => [
                'review_id' => $context['review_id'],
                'helpful' => $context['helpful'],
            ],
        ]);
    }

    /**
     * LOYALTY_TIER_CHANGED - Tier upgrade/downgrade
     */
    public static function logLoyaltyTierChanged($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'LOYALTY_TIER_CHANGED',
            'event_category' => 'business',
            'actor_type' => 'SYSTEM',
            'user_id' => $user->id,
            'action' => 'tier_changed',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Loyalty tier: {$context['old_tier']} → {$context['new_tier']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'old_tier' => $context['old_tier'],
                'new_tier' => $context['new_tier'],
                'qualifying_points' => $context['qualifying_points'],
                'benefits_unlocked' => $context['benefits_unlocked'],
            ],
            'payload' => [
                'old_tier' => $context['old_tier'],
                'new_tier' => $context['new_tier'],
                'qualifying_points' => $context['qualifying_points'],
            ],
        ]);
    }



    /**
     * WISHLIST_ITEM_ADDED - Product saved
     */
    public static function logWishlistItemAdded($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WISHLIST_ITEM_ADDED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'added',
            'model_type' => 'WishlistItem',
            'model_id' => $context['product_id'],
            'description' => "Product added to wishlist",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'product_id' => $context['product_id'],
                'variant_id' => $context['variant_id'],
            ],
            'payload' => [
                'product_id' => $context['product_id'],
            ],
        ]);
    }

    /**
     * WISHLIST_ITEM_REMOVED - Product removed
     */
    public static function logWishlistItemRemoved($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'WISHLIST_ITEM_REMOVED',
            'event_category' => 'business',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'removed',
            'model_type' => 'WishlistItem',
            'model_id' => $context['product_id'],
            'description' => "Product removed from wishlist",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'product_id' => $context['product_id'],
                'variant_id' => $context['variant_id'],
            ],
            'payload' => [
                'product_id' => $context['product_id'],
            ],
        ]);
    }

    /**
     * PRODUCT_VIEWED - Analytics tracking (sampled 10%)
     */
    public static function logProductViewed($user, array $context = []): ?AuditLog
    {
        return self::log([
            'event_type' => 'PRODUCT_VIEWED',
            'event_category' => 'business',
            'actor_type' => $user ? 'USER' : 'ANONYMOUS',
            'user_id' => $user?->id,
            'action' => 'viewed',
            'model_type' => 'Product',
            'model_id' => $context['product_id'],
            'description' => "Product viewed via {$context['source']}",
            'severity' => 'LOW',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'product_id' => $context['product_id'],
                'source' => $context['source'],
                'session_id' => $context['session_id'],
            ],
            'payload' => [
                'product_id' => $context['product_id'],
                'source' => $context['source'],
            ],
        ]);
    }

    /**
     * Fallback logging when database fails
     */
    private static function fallbackLog(array $data): void
    {
        $logEntry = [
            'timestamp' => now()->toIso8601String(),
            'level' => 'AUDIT_FALLBACK',
            'data' => $data,
        ];
        
        // Write to file-based log
        Log::channel('daily')->error('AUDIT_FALLBACK', $logEntry);
        
        // Could also write to Redis, SQS, etc.
    }

        /**
     * Phase 8: Hook to create notifications for critical audit events
     * Call this at the end of the log() method
     */
    protected static function notifyIfCritical(array $auditData, ?AuditLog $auditLog): void
    {
        if (!$auditLog) {
            return;
        }

        // Only notify for critical events
        if (!AuditNotificationService::isCriticalEvent($auditData['event_type'] ?? '')) {
            return;
        }

        // Queue the notification creation to not block the audit log
        dispatch(function () use ($auditData, $auditLog) {
            AuditNotificationService::convertAuditToNotification(
                array_merge($auditData, ['id' => $auditLog->id])
            );
        })->afterResponse();
    }
}
