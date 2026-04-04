<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'user_id',
        'points_change', // positive for earn, negative for redeem
        'balance_after',
        'transaction_type', // earn, redeem, expire, adjust, bonus
        'source', // order, referral, promo, manual, system
        'source_id', // order_id, referral_id, etc.
        'description',
        'expiry_date', // for earned points
        'processed_by', // for manual adjustments
        'adjustment_reason', // for manual adjustments
    ];

    protected $casts = [
        'points_change' => 'integer',
        'balance_after' => 'integer',
        'expiry_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
