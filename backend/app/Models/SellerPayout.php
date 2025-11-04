<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerPayout extends Model
{
    protected $fillable = [
        'seller_id',
        'payout_period_start',
        'payout_period_end',
        'total_sales',
        'total_commission',
        'payout_amount',
        'payout_method',
        'payout_reference',
        'payout_status',
        'processed_by',
        'processed_at',
        'notes',
    ];

    protected $casts = [
        'payout_period_start' => 'date',
        'payout_period_end' => 'date',
        'total_sales' => 'decimal:2',
        'total_commission' => 'decimal:2',
        'payout_amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    // Relationships
    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function payments()
    {
        return $this->belongsToMany(Payment::class, 'payment_payout_mappings', 'payout_id', 'payment_id')
                    ->withTimestamps();
    }

    // Helper methods
    public function isPending()
    {
        return $this->payout_status === 'pending';
    }

    public function isProcessing()
    {
        return $this->payout_status === 'processing';
    }

    public function isCompleted()
    {
        return $this->payout_status === 'completed';
    }

    public function isFailed()
    {
        return $this->payout_status === 'failed';
    }
}