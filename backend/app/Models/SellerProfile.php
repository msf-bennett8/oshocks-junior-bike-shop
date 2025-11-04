<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'business_description',
        'business_address',
        'business_phone',
        'business_email',
        'business_logo',
        'business_banner',
        'status',
        'commission_rate',
        'payment_account',
        'payment_method',
        'total_commission_paid',
        'total_earnings',
        'is_verified',
        'rating',
        'total_sales',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'rating' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'total_commission_paid' => 'decimal:2',
        'total_earnings' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'seller_id');
    }

    public function payouts()
    {
        return $this->hasMany(SellerPayout::class, 'seller_id');
    }

    public function reviews()
    {
        return $this->hasMany(SellerReview::class, 'seller_id');
    }

    // Helper methods
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function isSuspended()
    {
        return $this->status === 'suspended';
    }
}