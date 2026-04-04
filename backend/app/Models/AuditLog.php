<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AuditLog extends Model
{
    protected $fillable = [
        // Core identification
        'event_uuid',
        'event_type',
        'event_category',
        
        // Actor information
        'actor_type',
        'user_id',
        'user_role',
        'on_behalf_of',
        
        // Action details
        'action',
        'model_type',
        'model_id',
        'description',
        
        // Data changes
        'old_values',
        'new_values',
        'metadata',
        'payload',
        
        // Request context
        'ip_address',
        'user_agent',
        'device_fingerprint',
        'geolocation',
        'request_method',
        'request_url',
        'session_id',
        'correlation_id',
        
        // Classification
        'severity',
        'tier',
        'is_suspicious',
        
        // Integrity
        'integrity_hash',
        'previous_hash',
        'schema_version',
        
        // Environment
        'environment',
        'service_version',
        
        // Timing
        'occurred_at',
        'processed_at',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'payload' => 'array',
        'geolocation' => 'array',
        'is_suspicious' => 'boolean',
        'occurred_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->event_uuid) {
                $model->event_uuid = (string) \Ramsey\Uuid\Uuid::uuid4();
            }
            if (!$model->schema_version) {
                $model->schema_version = '2024.04.04-v1';
            }
            if (!$model->environment) {
                $model->environment = config('app.env', 'production');
            }
            if (!$model->service_version) {
                $model->service_version = config('app.version', '1.0.0');
            }
            if (!$model->processed_at) {
                $model->processed_at = now();
            }
        });
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function onBehalfOf()
    {
        return $this->belongsTo(User::class, 'on_behalf_of');
    }

    // Scopes
    public function scopeSuspicious($query)
    {
        return $query->where('is_suspicious', true);
    }

    public function scopeCategory($query, $category)
    {
        return $query->where('event_category', $category);
    }

    public function scopeSeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('occurred_at', '>=', now()->subDays($days));
    }

    public function scopeTier1($query)
    {
        return $query->where('tier', 'TIER_1_IMMUTABLE');
    }

    public function scopeTier2($query)
    {
        return $query->where('tier', 'TIER_2_OPERATIONAL');
    }

    public function scopeTier3($query)
    {
        return $query->where('tier', 'TIER_3_ANALYTICS');
    }

    public function scopeByCorrelation($query, string $correlationId)
    {
        return $query->where('correlation_id', $correlationId);
    }

    public function scopeBySession($query, string $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeAuthEvents($query)
    {
        return $query->where('event_category', 'security')
                     ->whereIn('event_type', [
                         'LOGIN_SUCCESS',
                         'LOGIN_FAILED',
                         'LOGOUT',
                         'SESSION_REVOKED',
                         'PASSWORD_CHANGED',
                         'PASSWORD_RESET_REQUESTED',
                         'PASSWORD_RESET_COMPLETED',
                         'PASSWORD_RESET_FAILED',
                         'TWO_FACTOR_ENABLED',
                         'TWO_FACTOR_DISABLED',
                         'TWO_FACTOR_CHALLENGE',
                         'ACCOUNT_LOCKED',
                         'ACCOUNT_UNLOCKED',
                         'SUSPICIOUS_ACTIVITY_DETECTED',
                     ]);
    }

    /**
     * Verify integrity hash for TIER_1 events
     */
    public function verifyIntegrity(): bool
    {
        if ($this->tier !== 'TIER_1_IMMUTABLE' || !$this->integrity_hash) {
            return true;
        }

        $calculated = $this->calculateIntegrityHash();
        return hash_equals($calculated, $this->integrity_hash);
    }

    /**
     * Calculate integrity hash
     */
    public function calculateIntegrityHash(): string
    {
        $data = [
            'event_uuid' => $this->event_uuid,
            'event_type' => $this->event_type,
            'actor_type' => $this->actor_type,
            'user_id' => $this->user_id,
            'timestamp' => $this->occurred_at?->toIso8601String(),
            'payload' => $this->payload,
        ];

        return hash('sha256', json_encode($data) . config('app.key'));
    }

    /**
     * Get previous hash for chaining
     */
    public static function getPreviousHash(): ?string
    {
        return Cache::remember('audit:last_hash', 60, function () {
            return self::where('tier', 'TIER_1_IMMUTABLE')
                ->whereNotNull('integrity_hash')
                ->orderBy('occurred_at', 'desc')
                ->value('integrity_hash');
        });
    }

    /**
     * Check if this is an immutable record
     */
    public function isImmutable(): bool
    {
        return $this->tier === 'TIER_1_IMMUTABLE';
    }

    /**
     * Prevent deletion of immutable records
     */
    public function delete(): ?bool
    {
        if ($this->isImmutable()) {
            throw new \RuntimeException('Cannot delete TIER_1_IMMUTABLE audit records');
        }

        return parent::delete();
    }

    /**
     * Prevent updates to immutable records
     */
    public function update(array $attributes = [], array $options = []): bool
    {
        if ($this->isImmutable()) {
            throw new \RuntimeException('Cannot modify TIER_1_IMMUTABLE audit records');
        }

        return parent::update($attributes, $options);
    }
}