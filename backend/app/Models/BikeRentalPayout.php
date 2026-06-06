<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BikeRentalPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'booking_id',
        'gross_amount',
        'platform_commission',
        'net_payout',
        'status',
        'requested_at',
        'paid_at',
        'paid_by',
        'payout_reference',
        'payout_method',
        'delayed_at',
        'delayed_by',
        'delay_notes',
        'delay_watermark',
        'payout_period',
        'period_start',
        'period_end',
    ];

    protected $casts = [
        'gross_amount' => 'decimal:2',
        'platform_commission' => 'decimal:2',
        'net_payout' => 'decimal:2',
        'requested_at' => 'datetime',
        'paid_at' => 'datetime',
        'delayed_at' => 'datetime',
        'period_start' => 'date',
        'period_end' => 'date',
        'delay_watermark' => 'boolean',
    ];

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function booking()
    {
        return $this->belongsTo(BikeRentalBooking::class, 'booking_id');
    }

    public function paidBy()
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function delayedBy()
    {
        return $this->belongsTo(User::class, 'delayed_by');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isRequested()
    {
        return $this->status === 'requested';
    }

    public function isPaid()
    {
        return $this->status === 'paid';
    }

    public function isDelayed()
    {
        return $this->status === 'delayed';
    }
}
