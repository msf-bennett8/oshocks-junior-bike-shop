<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CyclingEventRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_code',
        'event_id',
        'user_id',
        'participant_count',
        'price_per_person',
        'total_amount',
        'discount_amount',
        'final_amount',
        'add_ons',
        'bike_included',
        'bike_rental_id',
        'bike_add_ons',
        'emergency_contact_name',
        'emergency_contact_phone',
        'waiver_signed',
        'payment_status',
        'payment_reference',
        'payment_method',
        'status',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount',
        'checked_in_at',
        'rating',
        'review',
    ];

    protected $casts = [
        'participant_count' => 'integer',
        'price_per_person' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'bike_included' => 'boolean',
        'waiver_signed' => 'boolean',
        'add_ons' => 'array',
        'bike_add_ons' => 'array',
        'cancelled_at' => 'datetime',
        'checked_in_at' => 'datetime',
        'rating' => 'decimal:1',
    ];

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bike()
    {
        return $this->belongsTo(BikeRental::class, 'bike_rental_id');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereHas('event', function ($q) {
            $q->where('start_datetime', '>=', now());
        });
    }

    public function scopePast($query)
    {
        return $query->whereHas('event', function ($q) {
            $q->where('start_datetime', '<', now());
        });
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'registered');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}
