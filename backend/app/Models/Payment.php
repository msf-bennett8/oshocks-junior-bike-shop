<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'seller_id',
        'sale_channel',
        'payment_method',
        'transaction_id',
        'transaction_reference',
        'external_reference',
        'external_transaction_id',
        'amount',
        'currency',
        'platform_commission_rate',
        'platform_commission_amount',
        'seller_payout_amount',
        'status',
        'payout_status',
        'payout_date',
        'recorded_by_user_id',
        'recorder_type',
        'recorder_location',
        'phone_number',
        'payment_details',
        'payment_collected_at',
        'verified_at',
        'recorded_from_ip',
        'recorded_device_info',
        'metadata',
        'notes',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'platform_commission_rate' => 'decimal:2',
        'platform_commission_amount' => 'decimal:2',
        'seller_payout_amount' => 'decimal:2',
        'payment_collected_at' => 'datetime',
        'verified_at' => 'datetime',
        'completed_at' => 'datetime',
        'payout_date' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    public function payouts()
    {
        return $this->belongsToMany(SellerPayout::class, 'payment_payout_mappings', 'payment_id', 'payout_id')
                    ->withTimestamps();
    }

    // Helper methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isFailed()
    {
        return $this->status === 'failed';
    }

    public function isRefunded()
    {
        return $this->status === 'refunded';
    }

    public function payoutIsPending()
    {
        return $this->payout_status === 'pending';
    }

    public function payoutIsCompleted()
    {
        return $this->payout_status === 'completed';
    }
}