<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResourceBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_code',
        'resource_item_id',
        'user_id',
        'event_id',
        'bike_rental_booking_id',
        'start_datetime',
        'end_datetime',
        'quantity_booked',
        'duration_days',
        'unit_price',
        'surge_multiplier_applied',
        'total_price',
        'platform_fee',
        'grand_total',
        'status',
        'picked_up_at',
        'returned_at',
        'picked_up_by',
        'returned_to',
        'pickup_notes',
        'return_notes',
        'pre_rental_photos',
        'post_rental_photos',
        'damage_fee',
        'late_fee',
        'damage_description',
        'payment_reference',
        'payment_method',
        'payment_status',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount',
        'recirculated',
        'recirculated_at',
        'recirculated_by',
        'auto_returned',
        'auto_returned_at',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'picked_up_at' => 'datetime',
        'returned_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'recirculated_at' => 'datetime',
        'auto_returned_at' => 'datetime',
        'quantity_booked' => 'integer',
        'duration_days' => 'integer',
        'unit_price' => 'decimal:2',
        'surge_multiplier_applied' => 'decimal:2',
        'total_price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'damage_fee' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'recirculated' => 'boolean',
        'auto_returned' => 'boolean',
        'pre_rental_photos' => 'array',
        'post_rental_photos' => 'array',
    ];

    // Relationships
    public function resourceItem()
    {
        return $this->belongsTo(ResourceItem::class, 'resource_item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    public function bikeRentalBooking()
    {
        return $this->belongsTo(BikeRentalBooking::class, 'bike_rental_booking_id');
    }

    public function pickedUpBy()
    {
        return $this->belongsTo(User::class, 'picked_up_by');
    }

    public function returnedTo()
    {
        return $this->belongsTo(User::class, 'returned_to');
    }

    public function recirculatedBy()
    {
        return $this->belongsTo(User::class, 'recirculated_by');
    }

    public function availabilityBlocks()
    {
        return $this->hasMany(ResourceAvailabilityBlock::class, 'booking_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['confirmed', 'active', 'picked_up']);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending_payment');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'active')
                     ->where('end_datetime', '<', now());
    }

    public function scopeForEvent($query, int $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    public function scopeNotRecirculated($query)
    {
        return $query->where('recirculated', false)
                     ->whereIn('status', ['returned', 'active', 'picked_up']);
    }

    // Status helpers
    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'active' && $this->end_datetime < now();
    }

    public function getCanRecirculateAttribute(): bool
    {
        return in_array($this->status, ['returned', 'active', 'picked_up'])
            && !$this->recirculated;
    }

    public function getCanAutoReturnAttribute(): bool
    {
        return $this->status === 'active'
            && $this->end_datetime < now()
            && !$this->recirculated
            && !$this->auto_returned;
    }

    public function getDisplayStatusAttribute(): string
    {
        if ($this->auto_returned) return 'auto_returned';
        if ($this->recirculated) return 'recirculated';
        if ($this->is_overdue) return 'overdue';
        return $this->status;
    }

    public function getDaysRemainingAttribute(): ?int
    {
        if ($this->status !== 'active') return null;
        return max(0, now()->diffInDays($this->end_datetime, false));
    }

    public function getHoursRemainingAttribute(): ?int
    {
        if ($this->status !== 'active') return null;
        return max(0, now()->diffInHours($this->end_datetime, false));
    }

    protected $appends = [
        'is_overdue',
        'can_recirculate',
        'can_auto_return',
        'display_status',
        'days_remaining',
        'hours_remaining',
    ];
}
