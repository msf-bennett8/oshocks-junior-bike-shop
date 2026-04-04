<?php

namespace App\Services;

use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuditContextService
{
    private static array $context = [];

    /**
     * Initialize audit context from request
     */
    public static function initialize(): void
    {
        $request = Request::instance();
        
        self::$context = [
            'correlation_id' => $request->attributes->get('correlation_id') ?? (string) Str::uuid(),
            'request_id' => $request->attributes->get('request_id') ?? (string) Str::uuid(),
            'session_id' => self::getSessionId(),
            'ip_address' => self::hashIp($request->ip()),
            'user_agent' => self::truncateUserAgent($request->userAgent()),
            'geolocation' => self::getGeolocation($request->ip()),
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Get current context
     */
    public static function getContext(): array
    {
        if (empty(self::$context)) {
            self::initialize();
        }
        
        return self::$context;
    }

    /**
     * Get specific context value
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return self::getContext()[$key] ?? $default;
    }

    /**
     * Set context value
     */
    public static function set(string $key, mixed $value): void
    {
        self::$context[$key] = $value;
    }

    /**
     * Get session ID
     */
    private static function getSessionId(): ?string
    {
        $request = Request::instance();
        
        // Try to get from auth token
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            return hash('sha256', substr($token, 0, 20));
        }
        
        // Try Laravel session
        if ($request->hasSession()) {
            return $request->session()->getId();
        }
        
        return null;
    }

    /**
     * Hash IP address for privacy
     */
    private static function hashIp(?string $ip): ?string
    {
        if (!$ip) return null;
        
        if (!config('audit.pii.hash_ips')) {
            return $ip;
        }

        // Anonymize: keep first 2 octets only
        $parts = explode('.', $ip);
        if (count($parts) === 4) {
            return $parts[0] . '.' . $parts[1] . '.x.x';
        }

        return hash('sha256', $ip . config('app.key'));
    }

    /**
     * Truncate user agent
     */
    private static function truncateUserAgent(?string $userAgent): ?string
    {
        if (!$userAgent) return null;
        
        $limit = config('audit.pii.truncate_user_agent', 500);
        return substr($userAgent, 0, $limit);
    }

    /**
     * Get geolocation from IP
     */
    private static function getGeolocation(?string $ip): ?array
    {
        if (!$ip || !config('audit.geolocation.enabled')) {
            return null;
        }

        // Simple country detection (replace with actual service)
        $country = self::detectCountry($ip);
        
        return $country ? [
            'country' => $country,
            'region' => null,
            'city' => null,
        ] : null;
    }

    /**
     * Simple country detection (placeholder)
     */
    private static function detectCountry(string $ip): ?string
    {
        // This is a placeholder - implement with ipapi.co or similar
        // For now, return null to avoid external calls
        return null;
    }

    /**
     * Clear context
     */
    public static function clear(): void
    {
        self::$context = [];
    }
}
