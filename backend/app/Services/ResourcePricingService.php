<?php

namespace App\Services;

use App\Models\ResourceItem;
use App\Models\ResourcePricingRule;
use App\Models\ResourceBooking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ResourcePricingService
{
    /**
     * Calculate current price for a resource considering all active rules
     */
    public static function calculatePrice(int $resourceItemId, ?string $bookingStart = null, ?string $bookingEnd = null, int $quantity = 1): array
    {
        $resource = ResourceItem::with('pricingRules')->find($resourceItemId);
        if (!$resource) {
            return ['error' => 'Resource not found'];
        }

        if (!$resource->dynamic_pricing_enabled) {
            return [
                'base_price' => $resource->base_price,
                'current_price' => $resource->base_price,
                'surge_multiplier' => 1.00,
                'total' => $resource->base_price * $quantity,
                'rules_applied' => [],
            ];
        }

        $multiplier = 1.00;
        $rulesApplied = [];

        // Get all active pricing rules ordered by priority
        $rules = $resource->pricingRules()
            ->where('is_active', true)
            ->validNow()
            ->orderedByPriority()
            ->get();

        foreach ($rules as $rule) {
            $ruleMultiplier = self::evaluateRule($rule, $resource, $bookingStart, $bookingEnd);
            if ($ruleMultiplier > 1.00) {
                if ($ruleMultiplier > $multiplier) {
                    $multiplier = $ruleMultiplier;
                    $rulesApplied[] = [
                        'rule_type' => $rule->rule_type,
                        'multiplier' => $ruleMultiplier,
                        'priority' => $rule->priority,
                    ];
                }
            }
        }

        // Apply low stock surge if no rule covers it
        if ($resource->available_quantity <= $resource->low_stock_threshold && $resource->available_quantity > 0) {
            $lowStockMultiplier = 1.25; // Default 25% surge
            // Check if a low_stock_surge rule exists
            $hasLowStockRule = $rules->where('rule_type', 'low_stock_surge')->isNotEmpty();
            if (!$hasLowStockRule && $lowStockMultiplier > $multiplier) {
                $multiplier = $lowStockMultiplier;
                $rulesApplied[] = [
                    'rule_type' => 'low_stock_default',
                    'multiplier' => $lowStockMultiplier,
                    'priority' => 0,
                ];
            }
        }

        // Deadline proximity surge (if booking start is provided)
        if ($bookingStart) {
            $hoursUntilBooking = now()->diffInHours(Carbon::parse($bookingStart), false);
            if ($hoursUntilBooking >= 0 && $hoursUntilBooking <= 24) {
                $deadlineMultiplier = 1.30; // 30% surge within 24h
                $hasDeadlineRule = $rules->where('rule_type', 'deadline_proximity')->isNotEmpty();
                if (!$hasDeadlineRule && $deadlineMultiplier > $multiplier) {
                    $multiplier = $deadlineMultiplier;
                    $rulesApplied[] = [
                        'rule_type' => 'deadline_proximity_default',
                        'multiplier' => $deadlineMultiplier,
                        'priority' => 0,
                    ];
                }
            }
        }

        $currentPrice = round($resource->base_price * $multiplier, 2);
        $total = $currentPrice * $quantity;

        return [
            'base_price' => $resource->base_price,
            'current_price' => $currentPrice,
            'surge_multiplier' => $multiplier,
            'quantity' => $quantity,
            'total' => $total,
            'rules_applied' => $rulesApplied,
            'is_surge_pricing' => $multiplier > 1.00,
        ];
    }

    /**
     * Evaluate a single pricing rule
     */
    protected static function evaluateRule(ResourcePricingRule $rule, ResourceItem $resource, ?string $bookingStart, ?string $bookingEnd): float
    {
        $now = now();

        // Check validity period
        if ($rule->valid_from && $now->lt($rule->valid_from)) return 1.0;
        if ($rule->valid_until && $now->gt($rule->valid_until)) return 1.0;

        switch ($rule->rule_type) {
            case 'low_stock_surge':
                if ($resource->available_quantity <= ($rule->low_stock_threshold ?? $resource->low_stock_threshold)) {
                    return $rule->low_stock_multiplier ?? 1.5;
                }
                break;

            case 'deadline_proximity':
                if (!$bookingStart) return 1.0;
                $hoursUntil = $now->diffInHours(Carbon::parse($bookingStart), false);
                if ($hoursUntil >= 0 && $hoursUntil <= ($rule->deadline_hours ?? 24)) {
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
                if ($resource->event_id && $resource->event_id == $rule->event_id) {
                    return $rule->event_multiplier ?? 1.4;
                }
                break;

            case 'seasonal_adjustment':
                // Could check current month/season against rule settings
                return $rule->seasonal_multiplier ?? 1.0;

            case 'custom':
                return $rule->custom_multiplier ?? 1.0;
        }

        return 1.0;
    }

    /**
     * Update all resource prices (run via scheduled command)
     */
    public static function updateAllPrices(): array
    {
        $updated = 0;
        $resources = ResourceItem::where('dynamic_pricing_enabled', true)
            ->where('status', 'approved')
            ->get();

        foreach ($resources as $resource) {
            $resource->updateCurrentPrice();
            $updated++;
        }

        return [
            'updated_count' => $updated,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    /**
     * Create default pricing rules for a new resource
     */
    public static function createDefaultRules(int $resourceItemId): void
    {
        $defaults = [
            [
                'rule_type' => 'low_stock_surge',
                'low_stock_threshold' => 3,
                'low_stock_multiplier' => 1.50,
                'priority' => 10,
                'is_active' => true,
            ],
            [
                'rule_type' => 'deadline_proximity',
                'deadline_hours' => 24,
                'deadline_multiplier' => 1.30,
                'priority' => 8,
                'is_active' => true,
            ],
            [
                'rule_type' => 'rush_hour_surge',
                'rush_start_time' => '17:00:00',
                'rush_end_time' => '21:00:00',
                'rush_multiplier' => 1.20,
                'rush_days' => ['friday', 'saturday', 'sunday'],
                'priority' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($defaults as $rule) {
            ResourcePricingRule::create(array_merge($rule, [
                'resource_item_id' => $resourceItemId,
            ]));
        }
    }

    /**
     * Get price history / trends for analytics
     */
    public static function getPriceTrends(int $resourceItemId, int $days = 30): array
    {
        // This would ideally use a price_history table
        // For now, return current pricing info
        $resource = ResourceItem::find($resourceItemId);
        if (!$resource) return [];

        $bookings = ResourceBooking::where('resource_item_id', $resourceItemId)
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('DATE(created_at) as date, AVG(unit_price) as avg_price, COUNT(*) as booking_count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'resource_id' => $resourceItemId,
            'current_base_price' => $resource->base_price,
            'current_price' => $resource->current_price,
            'surge_multiplier' => $resource->surge_multiplier,
            'daily_trends' => $bookings,
        ];
    }
}
