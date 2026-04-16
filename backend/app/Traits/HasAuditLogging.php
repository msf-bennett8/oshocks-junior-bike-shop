<?php

namespace App\Traits;

use App\Services\AuditService;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Cache;

trait HasAuditLogging
{
    /**
     * Models to skip or sample (high-frequency models)
     */
    protected static array $samplingConfig = [
        'AuditLog' => ['skip' => true],
        'Notification' => ['skip' => true],
        'ActivityLog' => ['skip' => true],
        'Cart' => ['sample_rate' => 10],
        'CartItem' => ['sample_rate' => 10],
        'Wishlist' => ['sample_rate' => 10],
        'WishlistItem' => ['sample_rate' => 10],
        'ProductView' => ['sample_rate' => 20],
    ];

    /**
     * Boot the audit logging trait for a model.
     */
    public static function bootHasAuditLogging(): void
    {
        static::created(function ($model) {
            if ($model->shouldLogEvent('created')) {
                $model->logModelEvent('created');
            }
        });

        static::updated(function ($model) {
            if ($model->shouldLogEvent('updated')) {
                $model->logModelEvent('updated');
            }
        });

        static::deleted(function ($model) {
            if ($model->shouldLogEvent('deleted')) {
                $model->logModelEvent('deleted');
            }
        });
    }

    /**
     * Check if this event should be logged (sampling/deduplication)
     */
    protected function shouldLogEvent(string $action): bool
    {
        $modelClass = class_basename($this);
        
        if (isset(self::$samplingConfig[$modelClass]['skip']) && self::$samplingConfig[$modelClass]['skip']) {
            return false;
        }
        
        if (isset(self::$samplingConfig[$modelClass]['sample_rate'])) {
            $rate = self::$samplingConfig[$modelClass]['sample_rate'];
            return rand(1, $rate) === 1;
        }
        
        $cacheKey = "audit:model:{$modelClass}:{$this->getKey()}:{$action}";
        if (Cache::has($cacheKey)) {
            return false;
        }
        Cache::put($cacheKey, true, 5);
        
        return true;
    }

    /**
     * Log a model event
     */
    protected function logModelEvent(string $action): void
    {
        $changes = $this->getChangesForAudit($action);
        
        AuditService::log([
            'event_type' => strtolower(class_basename($this)) . '_' . $action,
            'event_category' => 'model',
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->getKey(),
            'description' => $this->getAuditDescription($action),
            'old_values' => $changes['old'] ?? null,
            'new_values' => $changes['new'] ?? null,
            'severity' => $this->getAuditSeverity($action),
        ]);
    }

    /**
     * Get changes for audit logging
     */
    protected function getChangesForAudit(string $action): array
    {
        if ($action === 'created') {
            return ['new' => $this->getAttributes()];
        }

        if ($action === 'updated') {
            return [
                'old' => $this->getOriginal(),
                'new' => $this->getChanges(),
            ];
        }

        if ($action === 'deleted') {
            return ['old' => $this->getAttributes()];
        }

        return [];
    }

    /**
     * Get audit description
     */
    protected function getAuditDescription(string $action): string
    {
        $modelName = class_basename($this);
        return "{$modelName} {$action}: {$this->getKey()}";
    }

    /**
     * Get audit severity
     */
    protected function getAuditSeverity(string $action): string
    {
        return match($action) {
            'deleted' => 'high',
            'created' => 'medium',
            'updated' => 'low',
            default => 'low',
        };
    }
}