<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupportCase extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'case_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'case_id',
        'conversation_id',
        'user_id',
        'guest_session_id',
        'case_type',
        'status',
        'priority',
        'assigned_to',
        'order_id',
        'subject',
        'description',
        'escalated_at',
        'escalated_by',
        'escalation_reason',
        'resolved_at',
        'resolved_by',
        'resolution_notes',
        'closed_at',
        'closed_by',
        'claimed_at',
        'first_response_at',
        'sla_deadline',
        'first_response_deadline',
        'sla_breached',
        'breach_reason',
        'satisfaction_rating',
        'satisfaction_comment',
        'source',
        'metadata',
    ];

    protected $casts = [
        'escalated_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'claimed_at' => 'datetime',
        'first_response_at' => 'datetime',
        'sla_deadline' => 'datetime',
        'first_response_deadline' => 'datetime',
        'sla_breached' => 'boolean',
        'satisfaction_rating' => 'integer',
        'metadata' => 'array',
    ];

    // Relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withDefault([
            'name' => 'Guest',
            'email' => null,
        ]);
    }

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class)->withDefault();
    }

    public function notes(): HasMany
    {
        return $this->hasMany(SupportCaseNote::class, 'case_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(SupportCaseHistory::class, 'case_id');
    }

    public function tags(): HasMany
    {
        return $this->hasMany(SupportCaseTag::class, 'case_id');
    }

    public function escalatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'escalated_by');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * Messages belonging to this case
     */
    public function caseMessages(): HasMany
    {
        return $this->hasMany(\App\Models\Message::class, 'case_id');
    }

    // Scopes
    public function scopeUnclaimed($query)
    {
        return $query->whereNull('assigned_to')->where('status', 'new');
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotNull('sla_deadline')
                     ->where('sla_deadline', '<', now())
                     ->whereNotIn('status', ['resolved', 'closed']);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('case_type', $type);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['resolved', 'closed']);
    }

    // Accessors
    public function getIsEscalatedAttribute(): bool
    {
        return $this->status === 'escalated' || $this->escalated_at !== null;
    }

    public function getTimeToFirstResponseAttribute(): ?string
    {
        if (!$this->first_response_at || !$this->created_at) return null;
        return $this->created_at->diffForHumans($this->first_response_at, true);
    }

    public function getTimeToResolutionAttribute(): ?string
    {
        if (!$this->resolved_at || !$this->created_at) return null;
        return $this->created_at->diffForHumans($this->resolved_at, true);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'new' => 'gray',
            'open' => 'blue',
            'in_progress' => 'amber',
            'pending_user' => 'purple',
            'resolved' => 'green',
            'closed' => 'slate',
            'escalated' => 'red',
            default => 'gray',
        };
    }

    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'blue',
            'high' => 'orange',
            'urgent' => 'red',
            default => 'blue',
        };
    }

    // Helper methods
    public function canBeClaimedBy(User $user): bool
    {
        return $user->canHandleSupportCases()
            && $this->status === 'new'
            && is_null($this->assigned_to);
    }

    public function canBeEscalated(): bool
    {
        return !in_array($this->status, ['escalated', 'resolved', 'closed']);
    }

    public function canBeResolved(): bool
    {
        return in_array($this->status, ['open', 'in_progress', 'pending_user', 'escalated']);
    }

    public function canBeClosed(): bool
    {
        return in_array($this->status, ['resolved', 'pending_user']);
    }

    public function isAssignedTo(User $user): bool
    {
        return $this->assigned_to === $user->id;
    }

    /**
     * Check if case can be deleted (only new/unclaimed cases)
     */
    public function canBeDeleted(): bool
    {
        return $this->status === 'new' && is_null($this->assigned_to);
    }

    /**
     * Get all cases for a user with full audit trail
     */
    public static function getUserCaseHistory(int $userId)
    {
        return self::withTrashed()
            ->with(['resolvedBy', 'assignedAgent', 'escalatedBy', 'closedBy', 'history.changedBy'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
