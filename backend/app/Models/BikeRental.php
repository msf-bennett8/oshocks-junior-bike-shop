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
        'approved_by',
        'approved_at',
        'rejection_reason',
        'submitted_by',
        'is_archived',
        'archived_at',
        'archived_by',
        'scheduled_for_deletion_at',
        'deletion_scheduled_by',
        'deletion_approved_by',
        'deletion_reason',
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
        'approved_by' => 'integer',
        'approved_at' => 'datetime',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'archived_by' => 'integer',
        'scheduled_for_deletion_at' => 'datetime',
        'deletion_scheduled_by' => 'integer',
        'deletion_approved_by' => 'integer',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
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

    /**
     * Transform photos array to images array for frontend compatibility
     */
    public function getImagesAttribute(): array
    {
        if (empty($this->photos)) {
            return [];
        }

        return array_map(function ($photo) {
            if (is_string($photo)) {
                return $photo;
            }
            return $photo['url'] ?? $photo['secure_url'] ?? null;
        }, $this->photos);
    }

    /**
     * Alias bike_condition as condition for frontend compatibility
     */
    public function getConditionAttribute(): ?string
    {
        return $this->bike_condition;
    }

    /**
     * Alias bike_features as features for frontend compatibility
     */
    public function getFeaturesAttribute(): array
    {
        return $this->bike_features ?? [];
    }

    /**
     * Get owner name from relationship or fallback
     */
    public function getOwnerNameAttribute(): string
    {
        if ($this->owner_type === 'platform') {
            return 'Oshocks Platform';
        }
        return $this->owner?->name ?? 'Unknown Owner';
    }

    /**
     * Get owner avatar from relationship
     */
    public function getOwnerAvatarAttribute(): ?string
    {
        return $this->owner?->avatar ?? $this->owner?->profile_image ?? null;
    }

    /**
     * Get owner initials for avatar fallback
     */
    public function getOwnerInitialsAttribute(): string
    {
        $name = $this->owner_name;
        return collect(explode(' ', $name))
            ->map(fn($n) => $n[0] ?? '')
            ->join('');
    }

    protected $appends = [
        'images',
        'condition',
        'features',
        'owner_name',
        'owner_avatar',
        'owner_initials',
        'is_available',
        'formatted_daily_rate',
    ];
}
