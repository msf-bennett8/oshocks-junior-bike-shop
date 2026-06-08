<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourcePricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_item_id',
        'rule_type',
        'low_stock_threshold',
        'low_stock_multiplier',
        'deadline_hours',
        'deadline_multiplier',
        'demand_score_threshold',
        'demand_multiplier',
        'rush_start_time',
        'rush_end_time',
        'rush_multiplier',
        'rush_days',
        'event_id',
        'event_multiplier',
        'is_active',
        'priority',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'low_stock_threshold' => 'integer',
        'low_stock_multiplier' => 'decimal:2',
        'deadline_hours' => 'integer',
        'deadline_multiplier' => 'decimal:2',
        'demand_score_threshold' => 'decimal:2',
        'demand_multiplier' => 'decimal:2',
        'rush_multiplier' => 'decimal:2',
        'rush_days' => 'array',
        'event_multiplier' => 'decimal:2',
        'is_active' => 'boolean',
        'priority' => 'integer',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    // Relationships
    public function resourceItem()
    {
        return $this->belongsTo(ResourceItem::class, 'resource_item_id');
    }

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForResource($query, int $resourceItemId)
    {
        return $query->where('resource_item_id', $resourceItemId);
    }

    public function scopeByType($query, string $ruleType)
    {
        return $query->where('rule_type', $ruleType);
    }

    public function scopeValidNow($query)
    {
        $now = now();
        return $query->where(function ($q) use ($now) {
            $q->whereNull('valid_from')
              ->orWhere('valid_from', '<=', $now);
        })->where(function ($q) use ($now) {
            $q->whereNull('valid_until')
              ->orWhere('valid_until', '>=', $now);
        });
    }

    public function scopeOrderedByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }
}
