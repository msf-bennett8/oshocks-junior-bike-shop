<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'case_id',
        'service_type',
        'service_description',
        'estimated_price',
        'final_price',
        'requested_date',
        'preferred_time',
        'confirmed_date',
        'confirmed_time',
        'completed_date',
        'cancelled_date',
        'seller_id',
        'assigned_mechanic_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'guest_session_id',
        'status',
        'shop_location',
        'staff_notes',
        'customer_notes',
        'merged_to_user_id',
        'merged_at',
    ];

    protected $casts = [
        'requested_date' => 'datetime',
        'confirmed_date' => 'datetime',
        'completed_date' => 'datetime',
        'cancelled_date' => 'datetime',
        'merged_at' => 'datetime',
        'estimated_price' => 'decimal:2',
        'final_price' => 'decimal:2',
    ];

    /**
     * The support case this booking belongs to
     */
    public function supportCase()
    {
        return $this->belongsTo(SupportCase::class, 'case_id', 'case_id');
    }

    /**
     * The seller/shop where service is performed
     */
    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    /**
     * The mechanic assigned to this booking
     */
    public function assignedMechanic()
    {
        return $this->belongsTo(User::class, 'assigned_mechanic_id');
    }

    /**
     * User this booking was merged to (guest → auth)
     */
    public function mergedToUser()
    {
        return $this->belongsTo(User::class, 'merged_to_user_id');
    }

    /**
     * Scope: Pending bookings
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Confirmed bookings
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope: Today's bookings
     */
    public function scopeToday($query)
    {
        return $query->whereDate('confirmed_date', today());
    }

    /**
     * Scope: Upcoming bookings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'confirmed')
                     ->where('confirmed_date', '>=', now());
    }

    /**
     * Check if booking can be confirmed
     */
    public function canBeConfirmed(): bool
    {
        return in_array($this->status, ['pending', 'rescheduled']);
    }

    /**
     * Check if booking can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed', 'rescheduled']);
    }

    /**
     * Check if booking can be marked complete
     */
    public function canBeCompleted(): bool
    {
        return in_array($this->status, ['in_progress', 'ready']);
    }
}
