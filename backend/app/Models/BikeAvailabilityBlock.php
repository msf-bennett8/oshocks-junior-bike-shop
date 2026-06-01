<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BikeAvailabilityBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'bike_rental_id',
        'block_type',
        'start_datetime',
        'end_datetime',
        'booking_id',
        'reason',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function bike()
    {
        return $this->belongsTo(BikeRental::class, 'bike_rental_id');
    }

    public function booking()
    {
        return $this->belongsTo(BikeRentalBooking::class, 'booking_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
