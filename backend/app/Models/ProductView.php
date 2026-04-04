<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductView extends Model
{
    use HasFactory;

    protected $fillable = [
        'view_id',
        'user_id', // null for guests
        'session_id', // for guest tracking
        'product_id',
        'source', // search, recommendation, direct, category, wishlist
        'search_query', // if from search
        'recommendation_type', // if from recommendations
        'device_type', // mobile, desktop, tablet
        'ip_address_hash', // hashed for privacy
        'user_agent_hash', // hashed
        'view_duration_seconds', // how long they stayed
        'added_to_cart', // did they add to cart after viewing?
        'purchased', // did they purchase?
        'viewed_at',
    ];

    protected $casts = [
        'view_duration_seconds' => 'integer',
        'added_to_cart' => 'boolean',
        'purchased' => 'boolean',
        'viewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
