<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VelocityCheckService
{
    /**
     * Check velocity for various activities
     */
    public static function check(string $userId, string $checkType, array $context = []): array
    {
        $thresholds = [
            'login' => ['max' => 5, 'window' => 300], // 5 attempts per 5 minutes
            'payment' => ['max' => 3, 'window' => 60], // 3 attempts per minute
            'order' => ['max' => 10, 'window' => 3600], // 10 orders per hour
            'api_request' => ['max' => 1000, 'window' => 60], // 1000 per minute
        ];

        $threshold = $thresholds[$checkType] ?? $thresholds['api_request'];
        $key = "velocity:{$checkType}:{$userId}";
        
        // Get current window
        $windowStart = Cache::get("{$key}:window", now()->timestamp);
        $currentWindow = now()->timestamp - $windowStart;
        
        // Reset if window expired
        if ($currentWindow > $threshold['window']) {
            Cache::put("{$key}:window", now()->timestamp, $threshold['window']);
            Cache::put($key, 0, $threshold['window']);
            $count = 0;
        } else {
            $count = Cache::get($key, 0);
        }

        $count++;
        Cache::put($key, $count, $threshold['window']);

        $triggered = $count > $threshold['max'];
        $action = 'allow';
        
        if ($triggered) {
            $action = self::determineAction($checkType, $count, $threshold['max']);
        }

        return [
            'triggered' => $triggered,
            'threshold' => $threshold['max'],
            'actual_value' => $count,
            'time_window' => $threshold['window'],
            'action' => $action,
            'window_id' => $key,
        ];
    }

    /**
     * Check for impossible travel (geolocation anomaly)
     */
    public static function checkImpossibleTravel(string $userId, array $currentLocation): ?array
    {
        $lastLocation = Cache::get("location:last:{$userId}");
        
        if (!$lastLocation) {
            Cache::put("location:last:{$userId}", $currentLocation, now()->addHours(24));
            return null; // No previous location to compare
        }

        $distance = self::calculateDistance(
            $lastLocation['lat'] ?? 0,
            $lastLocation['lon'] ?? 0,
            $currentLocation['lat'] ?? 0,
            $currentLocation['lon'] ?? 0
        );

        $timeDiff = now()->diffInMinutes($lastLocation['timestamp'] ?? now());
        
        // Impossible travel: > 500km in < 1 hour
        $impossible = ($distance > 500 && $timeDiff < 60) || ($distance > 1000 && $timeDiff < 120);

        if ($impossible) {
            return [
                'impossible_travel' => true,
                'expected_location' => $lastLocation,
                'actual_location' => $currentLocation,
                'distance_km' => round($distance, 2),
                'time_diff_minutes' => $timeDiff,
            ];
        }

        // Update last location
        Cache::put("location:last:{$userId}", $currentLocation, now()->addHours(24));
        
        return null;
    }

    /**
     * Check for suspicious IP patterns
     */
    public static function checkSuspiciousIp(string $ip): array
    {
        $threatTypes = [];
        $riskScore = 0;

        // Check for Tor exit nodes (simplified - would use real list)
        if (self::isTorExitNode($ip)) {
            $threatTypes[] = 'tor';
            $riskScore += 50;
        }

        // Check for known VPN/proxy ranges (simplified)
        if (self::isVpnOrProxy($ip)) {
            $threatTypes[] = 'vpn';
            $riskScore += 30;
        }

        // Check for botnet patterns
        if (self::hasBotnetPatterns($ip)) {
            $threatTypes[] = 'botnet';
            $riskScore += 70;
        }

        return [
            'is_suspicious' => !empty($threatTypes),
            'threat_types' => $threatTypes,
            'risk_score' => min($riskScore, 100),
        ];
    }

    /**
     * Determine action based on velocity
     */
    private static function determineAction(string $checkType, int $count, int $threshold): string
    {
        $ratio = $count / $threshold;

        if ($ratio > 5) return 'block';
        if ($ratio > 3) return 'challenge';
        if ($ratio > 1.5) return 'alert';
        
        return 'throttle';
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private static function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // km

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Check if IP is Tor exit node (placeholder - use real list in production)
     */
    private static function isTorExitNode(string $ip): bool
    {
        // Would check against Tor exit node list
        return false;
    }

    /**
     * Check if IP is VPN/proxy (placeholder - use real service in production)
     */
    private static function isVpnOrProxy(string $ip): bool
    {
        // Would use IP intelligence service
        return false;
    }

    /**
     * Check for botnet patterns
     */
    private static function hasBotnetPatterns(string $ip): bool
    {
        // Check recent request patterns
        $key = "ip_requests:{$ip}";
        $requests = Cache::get($key, []);
        
        // If > 100 requests in 1 minute, likely bot
        $recent = collect($requests)->filter(fn($t) => $t > now()->subMinute()->timestamp);
        
        return $recent->count() > 100;
    }
}
