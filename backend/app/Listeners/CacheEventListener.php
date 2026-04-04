<?php

namespace App\Listeners;

use Illuminate\Cache\Events\CacheMiss;
use Illuminate\Cache\Events\KeyForgotten;
use Illuminate\Cache\Events\KeyWritten;
use App\Services\AuditService;
use Illuminate\Support\Facades\Log;

class CacheEventListener
{
    /**
     * Handle cache invalidation events.
     */
    public function handleKeyForgotten(KeyForgotten $event): void
    {
        // Only log significant invalidations (not routine expirations)
        if ($this->isSignificantKey($event->key)) {
            AuditService::logCacheInvalidation(null, [
                'cache_key_pattern' => $event->key,
                'invalidated_by' => 'system', // Could be user ID if available
                'reason' => $this->determineReason($event->key),
                'affected_entries_count' => 1,
                'cache_tier' => $this->determineTier($event->key),
            ]);
        }
    }

    /**
     * Handle cache writes for audit trail.
     */
    public function handleKeyWritten(KeyWritten $event): void
    {
        // Log cache writes for critical data
        if ($this->isSignificantKey($event->key)) {
            Log::debug('Cache write', [
                'key' => $event->key,
                'ttl' => $event->seconds,
            ]);
        }
    }

    /**
     * Determine if key is significant enough to audit
     */
    private function isSignificantKey(string $key): bool
    {
        $significantPatterns = [
            'products:',
            'categories:',
            'orders:',
            'users:',
            'settings:',
            'search:',
        ];

        foreach ($significantPatterns as $pattern) {
            if (str_starts_with($key, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determine invalidation reason from key
     */
    private function determineReason(string $key): string
    {
        if (str_contains($key, 'products:')) {
            return 'product_data_changed';
        }
        if (str_contains($key, 'categories:')) {
            return 'category_structure_changed';
        }
        if (str_contains($key, 'orders:')) {
            return 'order_status_changed';
        }
        if (str_contains($key, 'settings:')) {
            return 'platform_settings_updated';
        }

        return 'routine_maintenance';
    }

    /**
     * Determine cache tier
     */
    private function determineTier(string $key): string
    {
        if (str_starts_with($key, 'cdn:')) {
            return 'CDN';
        }
        if (str_starts_with($key, 'search:')) {
            return 'search';
        }

        return 'application';
    }
}
