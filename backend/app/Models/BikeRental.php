<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BikeRental extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'listing_code',
        'seller_id',
        'name',
        'slug',
        'description',
        'brand',
        'model',
        'year',
        'category',
        'frame_size',
        'wheel_size',
        'bike_condition',
        'hourly_rate',
        'daily_rate',
        'weekly_rate',
        'monthly_rate',
        'security_deposit',
        'min_rental_hours',
        'max_rental_days',
        'location_address',
        'location_lat',
        'location_lng',
        'pickup_type',
        'delivery_fee',
        'instant_book',
        'response_time_hours',
        'rental_rules',
        'cancellation_policy',
        'insurance_included',
        'photos',
        'bike_features',
        'listing_status',
        'total_rentals',
        'rating',
        'review_count',
        'is_verified',
        'is_active',
        'owner_id',
        'owner_type',
        'owner_rating',
    ];

    protected $casts = [
        'year' => 'integer',
        'hourly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'weekly_rate' => 'decimal:2',
        'monthly_rate' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'min_rental_hours' => 'integer',
        'max_rental_days' => 'integer',
        'location_lat' => 'decimal:8',
        'location_lng' => 'decimal:8',
        'delivery_fee' => 'decimal:2',
        'instant_book' => 'boolean',
        'response_time_hours' => 'integer',
        'insurance_included' => 'boolean',
        'photos' => 'array',
        'bike_features' => 'array',
        'total_rentals' => 'integer',
        'rating' => 'decimal:1',
        'review_count' => 'integer',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'owner_rating' => 'decimal:1',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeApproved($query)
    {
        return $query->where('listing_status', 'approved')->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByOwner($query, $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    public function getFormattedDailyRateAttribute(): string
    {
        return 'KSh ' . number_format($this->daily_rate, 0);
    }

    public function getIsAvailableAttribute(): bool
    {
        return $this->listing_status === 'approved' && $this->is_active;
    }
}
