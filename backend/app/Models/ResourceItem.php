<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResourceItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resource_code',
        'resource_type',
        'category',
        'name',
        'slug',
        'description',
        'brand',
        'model',
        'total_quantity',
        'available_quantity',
        'reserved_quantity',
        'low_stock_threshold',
        'allow_backorder',
        'base_price',
        'current_price',
        'surge_multiplier',
        'dynamic_pricing_enabled',
        'photos',
        'status',
        'is_active',
        'is_verified',
        'event_id',
        'uploaded_by',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'moderation_notes',
    ];

    protected $casts = [
        'total_quantity' => 'integer',
        'available_quantity' => 'integer',
        'reserved_quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'allow_backorder' => 'boolean',
        'base_price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'surge_multiplier' => 'decimal:2',
        'dynamic_pricing_enabled' => 'boolean',
        'photos' => 'array',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    public function bookings()
    {
        return $this->hasMany(ResourceBooking::class, 'resource_item_id');
    }

    public function activeBookings()
    {
        return $this->hasMany(ResourceBooking::class, 'resource_item_id')
            ->whereIn('status', ['confirmed', 'active', 'picked_up']);
    }

    public function availabilityBlocks()
    {
        return $this->hasMany(ResourceAvailabilityBlock::class, 'resource_item_id');
    }

    public function pricingRules()
    {
        return $this->hasMany(ResourcePricingRule::class, 'resource_item_id');
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved')->where('is_active', true);
    }

    public function scopeAssets($query)
    {
        return $query->where('resource_type', 'asset');
    }

    public function scopeAncillary($query)
    {
        return $query->where('resource_type', 'ancillary');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeAvailable($query)
    {
        return $query->where('available_quantity', '>', 0)
                     ->where('status', 'approved')
                     ->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('available_quantity <= low_stock_threshold')
                     ->where('available_quantity', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('available_quantity', '<=', 0);
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    // Computed attributes
    public function getIsAvailableAttribute(): bool
    {
        return $this->status === 'approved'
            && $this->is_active
            && $this->available_quantity > 0;
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->available_quantity > 0
            && $this->available_quantity <= $this->low_stock_threshold;
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->available_quantity <= 0) {
            return 'out_of_stock';
        }
        if ($this->available_quantity <= $this->low_stock_threshold) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    public function getRemainingAlertAttribute(): ?string
    {
        if ($this->available_quantity <= 0) {
            return 'Sold out';
        }
        if ($this->available_quantity <= $this->low_stock_threshold) {
            return "Only {$this->available_quantity} remaining";
        }
        if ($this->available_quantity <= 3) {
            return "Only {$this->available_quantity} left";
        }
        return null;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'KSh ' . number_format($this->current_price, 0);
    }

    public function getFormattedBasePriceAttribute(): string
    {
        return 'KSh ' . number_format($this->base_price, 0);
    }

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

    public function getUploaderNameAttribute(): string
    {
        return $this->uploadedBy?->name ?? 'Unknown';
    }

    public function getApproverNameAttribute(): ?string
    {
        return $this->approvedBy?->name;
    }

    // Inventory management methods
    public function decrementAvailability(int $quantity = 1): bool
    {
        if ($this->available_quantity < $quantity && !$this->allow_backorder) {
            return false;
        }

        $this->decrement('available_quantity', $quantity);
        $this->increment('reserved_quantity', $quantity);
        return true;
    }

    public function incrementAvailability(int $quantity = 1): void
    {
        $this->increment('available_quantity', $quantity);
        $this->decrement('reserved_quantity', $quantity);
    }

    public function restoreToInventory(int $quantity = 1): void
    {
        $this->increment('available_quantity', $quantity);
        $this->decrement('reserved_quantity', max(0, $this->reserved_quantity - $quantity));
    }

    public function updateCurrentPrice(): void
    {
        if (!$this->dynamic_pricing_enabled) {
            $this->current_price = $this->base_price;
            return;
        }

        $multiplier = 1.00;

        // Apply pricing rules
        foreach ($this->pricingRules()->where('is_active', true)->orderBy('priority', 'desc')->get() as $rule) {
            $ruleMultiplier = $this->calculateRuleMultiplier($rule);
            if ($ruleMultiplier > $multiplier) {
                $multiplier = $ruleMultiplier;
            }
        }

        // Low stock surge (if no rule covers it)
        if ($this->available_quantity <= $this->low_stock_threshold && $this->available_quantity > 0) {
            $multiplier = max($multiplier, 1.25); // Default 25% surge for low stock
        }

        $this->surge_multiplier = $multiplier;
        $this->current_price = round($this->base_price * $multiplier, 2);
        $this->save();
    }

    protected function calculateRuleMultiplier($rule): float
    {
        $now = now();

        // Check validity period
        if ($rule->valid_from && $now->lt($rule->valid_from)) return 1.0;
        if ($rule->valid_until && $now->gt($rule->valid_until)) return 1.0;

        switch ($rule->rule_type) {
            case 'low_stock_surge':
                if ($this->available_quantity <= ($rule->low_stock_threshold ?? $this->low_stock_threshold)) {
                    return $rule->low_stock_multiplier ?? 1.5;
                }
                break;

            case 'deadline_proximity':
                // Check if any active booking is within deadline hours
                $upcomingBooking = $this->activeBookings()
                    ->where('start_datetime', '<=', $now->copy()->addHours($rule->deadline_hours ?? 24))
                    ->where('start_datetime', '>=', $now)
                    ->first();
                if ($upcomingBooking) {
                    return $rule->deadline_multiplier ?? 1.3;
                }
                break;

            case 'rush_hour_surge':
                $currentTime = $now->format('H:i:s');
                $currentDay = strtolower($now->format('l'));
                $rushDays = $rule->rush_days ?? [];
                if (
                    in_array($currentDay, $rushDays) &&
                    $currentTime >= ($rule->rush_start_time ?? '00:00:00') &&
                    $currentTime <= ($rule->rush_end_time ?? '23:59:59')
                ) {
                    return $rule->rush_multiplier ?? 1.2;
                }
                break;

            case 'event_premium':
                if ($this->event_id && $this->event_id == $rule->event_id) {
                    return $rule->event_multiplier ?? 1.4;
                }
                break;

            case 'custom':
                return $rule->custom_multiplier ?? 1.0;
        }

        return 1.0;
    }

    protected $appends = [
        'is_available',
        'is_low_stock',
        'stock_status',
        'remaining_alert',
        'formatted_price',
        'formatted_base_price',
        'images',
        'uploader_name',
        'approver_name',
    ];
}
