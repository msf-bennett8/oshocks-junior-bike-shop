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
        return $this->belongsTo(Order::class, 'order_id');
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

    public function scopeHistory($query)
    {
        return $query->whereIn('status', ['resolved', 'closed']);
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

        /**
     * Service booking details (for case_type = 'service')
     */
    public function serviceBooking()
    {
        return $this->hasOne(ServiceBooking::class, 'case_id', 'case_id');
    }

    /**
     * Seller assigned to this case (for service bookings)
     */
    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    /**
     * Service agent/mechanic assigned
     */
    public function serviceAgent()
    {
        return $this->belongsTo(User::class, 'service_agent_id');
    }

    /**
     * Check if this is a service booking case
     */
    public function isServiceBooking(): bool
    {
        return $this->case_type === 'services_booking';
    }

    /**
     * Check if this is a contact inquiry
     */
    public function isInquiry(): bool
    {
        return $this->case_type === 'general_inquiry';
    }

    /**
     * Check if this case requires order validation
     */
    public function requiresOrder(): bool
    {
        return in_array($this->case_type, ['order_issue', 'returns_refund', 'payment_billing']);
    }

    /**
     * Get human-readable case type label
     */
    public function getCaseTypeLabelAttribute(): string
    {
        return [
            'order_issue'       => 'Order Issue',
            'account_login'     => 'Account & Login',
            'report_problem'    => 'Report a Problem',
            'shipment_delivery' => 'Shipment & Delivery',
            'services_booking'  => 'Services & Booking',
            'general_inquiry'   => 'General Inquiry',
            'payment_billing'   => 'Payment & Billing',
            'product_info'      => 'Product Information',
            'returns_refund'    => 'Returns & Refund',
            'technical_support' => 'Technical Support',
            'other'             => 'Other',
        ][$this->case_type] ?? 'Support';
    }

    /**
     * Get service details accessor
     */
    public function getServiceDetailsAttribute($value)
    {
        return $value ? json_decode($value, true) : null;
    }

    /**
     * Set service details mutator
     */
    public function setServiceDetailsAttribute($value)
    {
        $this->attributes['service_details'] = is_string($value) ? $value : json_encode($value);
    }

    /**
     * Appointment notes for this service booking case
     */
    public function appointmentNotes()
    {
        return $this->hasMany(AppointmentNote::class, 'case_id', 'case_id')->orderBy('created_at', 'desc');
    }

    /**
     * Appointment history/audit trail
     */
    public function appointmentHistory()
    {
        return $this->hasMany(AppointmentHistory::class, 'case_id', 'case_id')->orderBy('created_at', 'desc');
    }
}
