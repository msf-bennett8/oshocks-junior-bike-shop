<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get user dashboard stats
     * GET /api/v1/user/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        // Total orders count
        $totalOrders = Order::where('user_id', $user->id)->count();
        
        // Total amount spent from completed/paid orders
        $totalSpent = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        // Wishlist count (from wishlist_items via wishlist)
        $wishlistCount = \App\Models\WishlistItem::whereHas('wishlist', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();
        
        // Loyalty points: KES 1000 = 1 point (calculated from total spent)
        $loyaltyPoints = floor($totalSpent / 1000);
        
        // Reviews written
        $reviewsCount = \App\Models\Review::where('user_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'total_spent' => (float) $totalSpent,
                'wishlist_count' => $wishlistCount,
                'loyalty_points' => $loyaltyPoints,
                'reviews_count' => $reviewsCount,
            ]
        ]);
    }

    /**
     * Get user's saved payment methods (M-Pesa + Cards)
     * GET /api/v1/user/payment-methods
     */
    public function paymentMethods(Request $request)
    {
        $user = $request->user();
        
        // Get unique M-Pesa numbers from successful payments
        $mpesaNumbers = Payment::whereHas('order', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('payment_method', 'mpesa_stk')
            ->where('status', 'completed')
            ->whereNotNull('phone_number')
            ->select('phone_number', DB::raw('MAX(created_at) as last_used'))
            ->groupBy('phone_number')
            ->get()
            ->map(function($item) {
                return [
                    'id' => 'mpesa_' . md5($item->phone_number),
                    'type' => 'mpesa',
                    'phone_number' => $item->phone_number,
                    'name' => 'M-Pesa (' . substr($item->phone_number, -4) . ')',
                    'is_default' => false,
                    'last_used' => $item->last_used,
                ];
            });

        // Get saved cards from payments
        $savedCards = Payment::whereHas('order', function($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('payment_method', 'card')
            ->where('status', 'completed')
            ->where('is_reusable', true)
            ->whereNotNull('authorization_code')
            ->select(
                'authorization_code',
                'card_last4',
                'card_brand',
                'card_expiry_month',
                'card_expiry_year',
                DB::raw('MAX(created_at) as last_used')
            )
            ->groupBy('authorization_code', 'card_last4', 'card_brand', 'card_expiry_month', 'card_expiry_year')
            ->get()
            ->map(function($item) {
                return [
                    'id' => 'card_' . md5($item->authorization_code),
                    'type' => 'card',
                    'last4' => $item->card_last4,
                    'brand' => $item->card_brand,
                    'expiry_month' => $item->card_expiry_month,
                    'expiry_year' => $item->card_expiry_year,
                    'name' => $item->card_brand . ' •••• ' . $item->card_last4,
                    'is_default' => false,
                    'last_used' => $item->last_used,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'mpesa' => $mpesaNumbers,
                'cards' => $savedCards,
            ]
        ]);
    }

    /**
     * Get user's recent login activity from audit logs
     * GET /api/v1/user/login-activity
     */
    public function loginActivity(Request $request)
    {
        $user = $request->user();
        
        $activity = \App\Models\AuditLog::where('user_id', $user->id)
            ->whereIn('event_type', ['login_success', 'logout', 'password_changed'])
            ->orderBy('occurred_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'type' => $log->event_type,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $this->parseUserAgent($log->user_agent),
                    'occurred_at' => $log->occurred_at,
                    'is_current_session' => false,
                ];
            });

        // Mark the most recent login as current session
        if ($activity->isNotEmpty()) {
            $firstLogin = $activity->firstWhere('type', 'login_success');
            if ($firstLogin) {
                $firstLogin['is_current_session'] = true;
            }
        }

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Get user dashboard stats with time filtering
     * GET /api/v1/user/dashboard-stats
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();
        $period = $request->get('period', 'all'); // today, 7days, 30days, thisyear, all

        // Calculate date range based on period
        $startDate = match($period) {
            'today' => now()->startOfDay(),
            '7days' => now()->subDays(7)->startOfDay(),
            '30days' => now()->subDays(30)->startOfDay(),
            'thisyear' => now()->startOfYear(),
            default => null,
        };

        // Base query for orders
        $ordersQuery = Order::where('user_id', $user->id);
        if ($startDate) {
            $ordersQuery->where('created_at', '>=', $startDate);
        }

        // Total orders count
        $totalOrders = (clone $ordersQuery)->count();

        // Active orders (pending, processing, shipped)
        $activeOrders = (clone $ordersQuery)->whereIn('status', ['pending', 'processing', 'shipped'])->count();

        // Total amount spent from paid orders
        $totalSpent = (clone $ordersQuery)->where('payment_status', 'paid')->sum('total');

        // Wishlist count
        $wishlistCount = \App\Models\WishlistItem::whereHas('wishlist', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();

        // Loyalty points (KES 1000 = 1 point)
        $totalSpentAllTime = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->sum('total');
        $loyaltyPoints = floor($totalSpentAllTime / 1000);

        // Reviews written
        $reviewsCount = \App\Models\Review::where('user_id', $user->id)->count();

        // Average rating given
        $avgRating = \App\Models\Review::where('user_id', $user->id)->avg('rating') ?? 0;

        // Saved addresses count
        $savedAddresses = \App\Models\Address::where('user_id', $user->id)->count();

        // Calculate trends (compare with previous period)
        $trends = $this->calculateTrends($user, $period);

        return response()->json([
            'success' => true,
            'data' => [
                'total_spent' => (float) $totalSpent,
                'total_orders' => $totalOrders,
                'active_orders' => $activeOrders,
                'wishlist_items' => $wishlistCount,
                'loyalty_points' => $loyaltyPoints,
                'saved_addresses' => $savedAddresses,
                'reviews_written' => $reviewsCount,
                'avg_rating' => round($avgRating, 1),
                'trends' => $trends,
                'period' => $period,
            ]
        ]);
    }

    /**
     * Calculate trends compared to previous period
     */
    private function calculateTrends($user, $period)
    {
        $now = now();
        
        // Current period
        $currentStart = match($period) {
            'today' => $now->copy()->startOfDay(),
            '7days' => $now->copy()->subDays(7)->startOfDay(),
            '30days' => $now->copy()->subDays(30)->startOfDay(),
            'thisyear' => $now->copy()->startOfYear(),
            default => null,
        };

        // Previous period
        $previousStart = match($period) {
            'today' => $now->copy()->subDay()->startOfDay(),
            '7days' => $now->copy()->subDays(14)->startOfDay(),
            '30days' => $now->copy()->subDays(60)->startOfDay(),
            'thisyear' => $now->copy()->subYear()->startOfYear(),
            default => null,
        };

        $previousEnd = $currentStart?->copy()->subSecond();

        if (!$currentStart || !$previousStart) {
            return [
                'total_spent' => null,
                'total_orders' => null,
                'active_orders' => null,
            ];
        }

        // Current period stats
        $currentSpent = Order::where('user_id', $user->id)
            ->where('created_at', '>=', $currentStart)
            ->where('payment_status', 'paid')
            ->sum('total');

        $currentOrders = Order::where('user_id', $user->id)
            ->where('created_at', '>=', $currentStart)
            ->count();

        // Previous period stats
        $previousSpent = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->where('payment_status', 'paid')
            ->sum('total');

        $previousOrders = Order::where('user_id', $user->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        // Calculate percentage change
        $calcTrend = function($current, $previous) {
            if ($previous == 0) return $current > 0 ? '+100%' : null;
            $change = (($current - $previous) / $previous) * 100;
            return ($change >= 0 ? '+' : '') . round($change) . '%';
        };

        return [
            'total_spent' => $calcTrend($currentSpent, $previousSpent),
            'total_orders' => $calcTrend($currentOrders, $previousOrders),
        ];
    }

    /**
     * Get spending analytics by month
     * GET /api/v1/user/spending-analytics
     */
    public function spendingAnalytics(Request $request)
    {
        $user = $request->user();
        $months = (int) $request->get('months', 7);

        // Get monthly spending for last N months
        $spendingData = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths($months)->startOfMonth())
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month_key'),
                DB::raw('DATE_FORMAT(created_at, "%b") as month'),
                DB::raw('SUM(total) as amount')
            )
            ->groupBy('month_key', 'month')
            ->orderBy('month_key')
            ->get();

        // Fill in missing months with zero
        $filledData = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthName = $date->format('M');
            
            $existing = $spendingData->firstWhere('month_key', $monthKey);
            $filledData[] = [
                'month' => $monthName,
                'amount' => $existing ? (float) $existing->amount : 0,
            ];
        }

        // Calculate summary stats
        $totalSpent = array_sum(array_column($filledData, 'amount'));
        $nonZeroMonths = count(array_filter($filledData, fn($d) => $d['amount'] > 0));
        $avgOrder = $nonZeroMonths > 0 ? $totalSpent / $nonZeroMonths : 0;

        // Calculate savings (discounts)
        $totalSavings = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths($months)->startOfMonth())
            ->sum('discount');

        return response()->json([
            'success' => true,
            'data' => [
                'monthly_data' => $filledData,
                'summary' => [
                    'total_spent' => $totalSpent,
                    'avg_order' => round($avgOrder, 2),
                    'saved' => (float) $totalSavings,
                ],
            ]
        ]);
    }

    /**
     * Generate or get referral code
     * GET /api/v1/user/referral-code
     */
    public function getReferralCode(Request $request)
    {
        $user = $request->user();

        // Generate new code if doesn't exist
        if (!$user->referral_code) {
            $code = $this->generateReferralCode($user);
            $user->referral_code = $code;
            $user->referral_code_generated_at = now();
            $user->save();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'referral_code' => $user->referral_code,
                'generated_at' => $user->referral_code_generated_at,
            ]
        ]);
    }

    /**
     * Regenerate referral code
     * POST /api/v1/user/referral-code/regenerate
     */
    public function regenerateReferralCode(Request $request)
    {
        $user = $request->user();
        
        $code = $this->generateReferralCode($user);
        $user->referral_code = $code;
        $user->referral_code_generated_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Referral code regenerated',
            'data' => [
                'referral_code' => $code,
                'generated_at' => now(),
            ]
        ]);
    }

    /**
     * Generate unique referral code
     * Format: FIRSTNAME + 3 random letters + 1 number + YEAR
     * Example: BENNETTCA7V2026
     */
    private function generateReferralCode($user)
    {
        $firstName = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $user->name), 0, 8));
        $year = now()->format('Y');
        
        do {
            $letters = substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 3);
            $number = rand(0, 9);
            $code = $firstName . $letters . $number . $year;
        } while (\App\Models\User::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Get rewards program data
     * GET /api/v1/user/rewards
     */
    public function rewards(Request $request)
    {
        $user = $request->user();

        // Calculate points (KES 1000 = 1 point)
        $totalSpent = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->sum('total');
        
        $points = floor($totalSpent / 1000);
        
        // Gold tier threshold
        $goldThreshold = 1000;
        $progressPercent = min(($points / $goldThreshold) * 100, 100);
        $pointsToGold = max($goldThreshold - $points, 0);

        // Points earned this month
        $pointsThisMonth = Order::where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total') / 1000;

        // Orders this month
        $ordersThisMonth = Order::where('user_id', $user->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'points_balance' => $points,
                'points_worth' => $points, // 1 point = KES 1
                'gold_threshold' => $goldThreshold,
                'progress_percent' => round($progressPercent),
                'points_to_gold' => $pointsToGold,
                'points_earned_this_month' => floor($pointsThisMonth),
                'orders_this_month' => $ordersThisMonth,
            ]
        ]);
    }

    /**
     * Parse user agent to get browser/OS info
     */
    private function parseUserAgent($userAgent)
    {
        if (!$userAgent) return 'Unknown';
        
        $browser = 'Unknown';
        $os = 'Unknown';
        
        if (strpos($userAgent, 'Chrome') !== false) $browser = 'Chrome';
        elseif (strpos($userAgent, 'Firefox') !== false) $browser = 'Firefox';
        elseif (strpos($userAgent, 'Safari') !== false) $browser = 'Safari';
        elseif (strpos($userAgent, 'Edge') !== false) $browser = 'Edge';
        
        if (strpos($userAgent, 'Windows') !== false) $os = 'Windows';
        elseif (strpos($userAgent, 'Mac') !== false) $os = 'Mac';
        elseif (strpos($userAgent, 'Linux') !== false) $os = 'Linux';
        elseif (strpos($userAgent, 'Android') !== false) $os = 'Android';
        elseif (strpos($userAgent, 'iPhone') !== false || strpos($userAgent, 'iPad') !== false) $os = 'iOS';
        
        return "$browser on $os";
    }
}
