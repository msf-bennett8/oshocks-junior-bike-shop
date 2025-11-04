<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\SellerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OwnerDashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard/owner/overview?period=today|week|month
     */
    public function overview(Request $request)
    {
        $period = $request->query('period', 'today');
        
        $dateRange = $this->getDateRange($period);
        
        // Total Revenue
        $totalRevenue = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        // Platform Commission Earned
        $platformCommission = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('platform_commission_amount');
        
        // Seller Payouts Pending
        $pendingPayouts = Payment::where('payout_status', 'pending')
            ->where('status', 'completed')
            ->sum('seller_payout_amount');
        
        $pendingSellerCount = Payment::where('payout_status', 'pending')
            ->where('status', 'completed')
            ->distinct('seller_id')
            ->count('seller_id');
        
        // Previous period comparison (for percentage change)
        $previousDateRange = $this->getPreviousDateRange($period);
        $previousRevenue = Payment::whereBetween('payment_collected_at', $previousDateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        $revenueChange = $previousRevenue > 0 
            ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'total_revenue' => [
                    'amount' => $totalRevenue,
                    'currency' => 'KES',
                    'change_percentage' => round($revenueChange, 2)
                ],
                'platform_commission' => [
                    'amount' => $platformCommission,
                    'currency' => 'KES',
                    'average_rate' => $totalRevenue > 0 ? round(($platformCommission / $totalRevenue) * 100, 2) : 0
                ],
                'pending_payouts' => [
                    'amount' => $pendingPayouts,
                    'currency' => 'KES',
                    'seller_count' => $pendingSellerCount
                ]
            ]
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/owner/payment-methods-breakdown?period=today|week|month
     */
    public function paymentMethodsBreakdown(Request $request)
    {
        $period = $request->query('period', 'today');
        $dateRange = $this->getDateRange($period);
        
        $breakdown = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->select('payment_method', 
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(amount) as total_amount'))
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => ucfirst(str_replace('_', ' ', $item->payment_method)),
                    'transaction_count' => $item->transaction_count,
                    'total_amount' => $item->total_amount,
                    'currency' => 'KES'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $breakdown
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/owner/sale-channels-breakdown?period=today|week|month
     */
    public function saleChannelsBreakdown(Request $request)
    {
        $period = $request->query('period', 'today');
        $dateRange = $this->getDateRange($period);
        
        $totalRevenue = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        $breakdown = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->select('sale_channel', 
                DB::raw('SUM(amount) as total_amount'))
            ->groupBy('sale_channel')
            ->get()
            ->map(function ($item) use ($totalRevenue) {
                $percentage = $totalRevenue > 0 ? ($item->total_amount / $totalRevenue) * 100 : 0;
                return [
                    'channel' => ucfirst(str_replace('_', ' ', $item->sale_channel)),
                    'total_amount' => $item->total_amount,
                    'percentage' => round($percentage, 2),
                    'currency' => 'KES'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $breakdown
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/owner/top-sellers?limit=10&period=month
     */
    public function topSellers(Request $request)
    {
        $limit = $request->query('limit', 10);
        $period = $request->query('period', 'month');
        $dateRange = $this->getDateRange($period);
        
        $topSellers = Payment::whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->select('seller_id', 
                DB::raw('SUM(amount) as total_sales'))
            ->groupBy('seller_id')
            ->orderByDesc('total_sales')
            ->limit($limit)
            ->with('seller.user:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'seller_id' => $item->seller_id,
                    'seller_name' => $item->seller->shop_name ?? $item->seller->user->name,
                    'total_sales' => $item->total_sales,
                    'currency' => 'KES'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $topSellers
        ]);
    }
    
    /**
     * Helper: Get date range based on period
     */
    private function getDateRange($period)
    {
        switch ($period) {
            case 'today':
                return [Carbon::today(), Carbon::now()];
            case 'week':
                return [Carbon::now()->startOfWeek(), Carbon::now()];
            case 'month':
                return [Carbon::now()->startOfMonth(), Carbon::now()];
            default:
                return [Carbon::today(), Carbon::now()];
        }
    }
    
    /**
     * Helper: Get previous period date range
     */
    private function getPreviousDateRange($period)
    {
        switch ($period) {
            case 'today':
                return [Carbon::yesterday(), Carbon::yesterday()->endOfDay()];
            case 'week':
                return [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()];
            case 'month':
                return [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()];
            default:
                return [Carbon::yesterday(), Carbon::yesterday()->endOfDay()];
        }
    }
}