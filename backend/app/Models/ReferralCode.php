<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_code',
        'total_uses',
        'successful_referrals',
        'rewards_earned',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'total_uses' => 'integer',
        'successful_referrals' => 'integer',
        'rewards_earned' => 'decimal:2',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function usages()
    {
        return $this->hasMany(ReferralUsage::class);
    }
}
