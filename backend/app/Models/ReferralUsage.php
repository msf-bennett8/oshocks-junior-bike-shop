<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'referral_code_id',
        'referrer_user_id',
        'referee_user_id',
        'order_id',
        'status', // pending, completed, cancelled
        'reward_issued',
        'reward_amount',
        'completed_at',
    ];

    protected $casts = [
        'reward_issued' => 'boolean',
        'reward_amount' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function referralCode()
    {
        return $this->belongsTo(ReferralCode::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_user_id');
    }

    public function referee()
    {
        return $this->belongsTo(User::class, 'referee_user_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
