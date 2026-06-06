<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BikeRentalBooking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_code',
        'bike_rental_id',
        'renter_id',
        'owner_id',
        'start_datetime',
        'end_datetime',
        'duration_days',
        'duration_hours',
        'daily_rate',
        'total_rental_fee',
        'security_deposit',
        'delivery_fee',
        'insurance_fee',
        'add_ons_fee',
        'platform_fee',
        'owner_payout',
        'grand_total',
        'add_ons',
        'status',
        'picked_up_at',
        'returned_at',
        'pickup_notes',
        'return_notes',
        'pre_rental_photos',
        'post_rental_photos',
        'damage_fee',
        'late_fee',
        'damage_description',
        'renter_rating',
        'renter_review',
        'owner_rating',
        'owner_review',
        'payment_reference',
        'payment_method',
        'cancelled_at',
        'cancellation_reason',
        'refund_amount',
        'duration_type',
        'deposit_refunded',
        'deposit_refunded_at',
        'deposit_refunded_by',
        'late_return_fine',
        'fine_applied_at',
        'renter_terms_accepted',
        'renter_terms_accepted_at',
        'lister_terms_accepted',
        'lister_terms_accepted_at',
        'recirculated',
        'recirculated_at',
        'recirculated_by',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'picked_up_at' => 'datetime',
        'returned_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'daily_rate' => 'decimal:2',
        'total_rental_fee' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'insurance_fee' => 'decimal:2',
        'add_ons_fee' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'owner_payout' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'damage_fee' => 'decimal:2',
        'late_fee' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'duration_type' => 'string',
        'deposit_refunded' => 'boolean',
        'deposit_refunded_at' => 'datetime',
        'late_return_fine' => 'decimal:2',
        'fine_applied_at' => 'datetime',
        'renter_terms_accepted' => 'boolean',
        'renter_terms_accepted_at' => 'datetime',
        'lister_terms_accepted' => 'boolean',
        'lister_terms_accepted_at' => 'datetime',
        'recirculated' => 'boolean',
        'recirculated_at' => 'datetime',
        'recirculated_by' => 'integer',
        'add_ons' => 'array',
        'pre_rental_photos' => 'array',
        'post_rental_photos' => 'array',
        'renter_rating' => 'decimal:1',
        'owner_rating' => 'decimal:1',
        'duration_days' => 'integer',
        'duration_hours' => 'integer',
    ];

    public function bike()
    {
        return $this->belongsTo(BikeRental::class, 'bike_rental_id');
    }

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
