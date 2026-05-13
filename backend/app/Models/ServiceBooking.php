<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', // <-- ADD THIS (string booking ID, auto-generated)
        'case_id', // nullable — null for standalone bookings, set for case-linked bookings
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
        'cancellation_request_status',
        'cancellation_reason',
        'cancellation_denial_reason',
        'cancellation_requested_by',
        'cancellation_requested_at',
        'cancellation_reviewed_by',
        'cancellation_reviewed_at',
        'shop_location',
        'staff_notes',
        'customer_notes',
        'merged_to_user_id',
        'merged_at',
        'metadata',
    ];

    protected $casts = [
        'requested_date' => 'datetime',
        'confirmed_date' => 'datetime',
        'completed_date' => 'datetime',
        'cancelled_date' => 'datetime',
        'merged_at' => 'datetime',
        'estimated_price' => 'decimal:2',
        'final_price' => 'decimal:2',
        'cancellation_requested_at' => 'datetime',
        'cancellation_reviewed_at' => 'datetime',
        'metadata' => 'array',
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

    /**
     * User who requested cancellation
     */
    public function cancellationRequester()
    {
        return $this->belongsTo(User::class, 'cancellation_requested_by');
    }

    /**
     * Staff who reviewed cancellation
     */
    public function cancellationReviewer()
    {
        return $this->belongsTo(User::class, 'cancellation_reviewed_by');
    }

    /**
     * Appointment notes for this booking
     */
    public function appointmentNotes()
    {
        return $this->hasMany(AppointmentNote::class, 'case_id', 'case_id')->orderBy('created_at', 'desc');
    }

    /**
     * Auto-generate booking ID on creating
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->id)) {
                $booking->id = app(\App\Services\BookingIdService::class)->generate();
            }
        });
    }

    /**
     * Appointment history/audit trail
     */
    public function appointmentHistory()
    {
        return $this->hasMany(AppointmentHistory::class, 'case_id', 'case_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get the conversation through the support case (only for case-linked bookings)
     */
    public function conversation()
    {
        // For standalone bookings (no case_id), return empty relation
        if (!$this->case_id) {
            return $this->hasOne(Conversation::class, 'id')->whereRaw('1 = 0');
        }

        // For case-linked bookings, get conversation via support_case
        return $this->hasOneThrough(
            Conversation::class,
            SupportCase::class,
            'case_id',        // Foreign key on support_cases table
            'id',             // Foreign key on conversations table
            'case_id',        // Local key on service_bookings table
            'conversation_id' // Local key on support_cases table
        );
    }

}
