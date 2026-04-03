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
