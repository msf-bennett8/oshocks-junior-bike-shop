<?php

namespace App\Traits;

use App\Services\AuditService;
use Illuminate\Support\Facades\Request;

trait HasAuditLogging
{
    /**
     * Boot the audit logging trait for a model.
     */
    public static function bootHasAuditLogging(): void
    {
        static::created(function ($model) {
            $model->logModelEvent('created');
        });

        static::updated(function ($model) {
            $model->logModelEvent('updated');
        });

        static::deleted(function ($model) {
            $model->logModelEvent('deleted');
        });
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
