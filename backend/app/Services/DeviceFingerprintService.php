<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DeviceFingerprintService
{
    /**
     * Generate device fingerprint from request
     */
    public static function generate(Request $request): array
    {
        $components = [
            'user_agent' => $request->userAgent() ?? 'unknown',
            'accept_language' => $request->header('Accept-Language') ?? 'unknown',
            'accept_encoding' => $request->header('Accept-Encoding') ?? 'unknown',
            'dnt' => $request->header('DNT') ?? '0',
            'screen_info' => $request->header('X-Screen-Info') ?? 'unknown', // Would come from JS
            'timezone' => $request->header('X-Timezone') ?? 'unknown', // Would come from JS
            'canvas' => $request->header('X-Canvas-Fingerprint') ?? 'unknown', // Would come from JS
        ];

        $fingerprintString = implode('|', $components);
        $fingerprintHash = hash('sha256', $fingerprintString);

        return [
            'hash' => $fingerprintHash,
            'components' => $components,
            'confidence_score' => self::calculateConfidence($components),
        ];
    }

    /**
     * Calculate confidence score (0-100)
     */
    private static function calculateConfidence(array $components): int
    {
        $score = 50; // Base score

        // Higher confidence with more unique components
        if ($components['canvas'] !== 'unknown') $score += 20;
        if ($components['screen_info'] !== 'unknown') $score += 15;
        if ($components['timezone'] !== 'unknown') $score += 10;

        // Cap at 100
        return min($score, 100);
    }

    /**
     * Check for fingerprint mismatch (impossible travel/ device change)
     */
    public static function checkMismatch(string $userId, string $currentFingerprint): array
    {
        $storedFingerprint = Cache::get("device_fp:{$userId}");
        
        if (!$storedFingerprint) {
            return ['match' => true, 'is_new' => true]; // First login
        }

        if ($storedFingerprint === $currentFingerprint) {
            return ['match' => true, 'is_new' => false];
        }

        // Calculate similarity
        $similarity = self::calculateSimilarity($storedFingerprint, $currentFingerprint);

        return [
            'match' => false,
            'is_new' => false,
            'expected_fingerprint' => $storedFingerprint,
            'actual_fingerprint' => $currentFingerprint,
            'similarity_score' => $similarity,
            'confidence_score' => 70, // Lower confidence on mismatch
        ];
    }

    /**
     * Store fingerprint for user
     */
    public static function store(string $userId, string $fingerprint, int $ttlDays = 30): void
    {
        Cache::put("device_fp:{$userId}", $fingerprint, now()->addDays($ttlDays));
        
        // Also store in history
        $historyKey = "device_fp_history:{$userId}";
        $history = Cache::get($historyKey, []);
        $history[] = [
            'fingerprint' => $fingerprint,
            'timestamp' => now()->toIso8601String(),
        ];
        // Keep last 10 fingerprints
        $history = array_slice($history, -10);
        Cache::put($historyKey, $history, now()->addDays(90));
    }

    /**
     * Mark device as trusted
     */
    public static function trustDevice(string $userId, string $fingerprint, string $trustMethod, int $expiryDays = 90): void
    {
        Cache::put("device_trusted:{$userId}:{$fingerprint}", [
            'trusted_at' => now()->toIso8601String(),
            'trust_method' => $trustMethod,
            'expires_at' => now()->addDays($expiryDays)->toIso8601String(),
        ], now()->addDays($expiryDays));
    }

    /**
     * Check if device is trusted
     */
    public static function isTrusted(string $userId, string $fingerprint): bool
    {
        return Cache::has("device_trusted:{$userId}:{$fingerprint}");
    }

    /**
     * Calculate similarity between fingerprints (0-100)
     */
    private static function calculateSimilarity(string $fp1, string $fp2): int
    {
        similar_text($fp1, $fp2, $percent);
        return (int) $percent;
    }
}
