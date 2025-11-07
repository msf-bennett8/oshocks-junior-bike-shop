<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\SellerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SellerDashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard/seller/overview?period=month
     */
    public function overview(Request $request)
    {
        $user = $request->user();
        
        // Get or create seller profile
        $seller = $this->getOrCreateSellerProfile($user);
        
        $period = $request->query('period', 'month');
        $dateRange = $this->getDateRange($period);
        
        // Total Sales (this period)
        $totalSales = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        // Platform Commission (this period)
        $platformCommission = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('platform_commission_amount');
        
        // My Earnings (this period)
        $myEarnings = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('seller_payout_amount');
        
        // Pending Payout (all time - not yet paid)
        $pendingPayout = Payment::where('seller_id', $seller->id)
            ->where('payout_status', 'pending')
            ->where('status', 'completed')
            ->sum('seller_payout_amount');
        
        // Completed Payouts (all time)
        $completedPayouts = Payment::where('seller_id', $seller->id)
            ->where('payout_status', 'completed')
            ->where('status', 'completed')
            ->sum('seller_payout_amount');
        
        // Previous period comparison
        $previousDateRange = $this->getPreviousDateRange($period);
        $previousSales = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $previousDateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        $salesChange = $previousSales > 0 
            ? (($totalSales - $previousSales) / $previousSales) * 100 
            : 0;
        
        // Average commission rate for this seller
        $avgCommissionRate = $seller->commission_rate ?? 15.00;
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'seller' => [
                    'id' => $seller->id,
                    'business_name' => $seller->business_name,
                    'commission_rate' => $avgCommissionRate,
                    'status' => $seller->status
                ],
                'total_sales' => [
                    'amount' => $totalSales,
                    'currency' => 'KES',
                    'change_percentage' => round($salesChange, 2)
                ],
                'platform_commission' => [
                    'amount' => $platformCommission,
                    'currency' => 'KES',
                    'rate' => $avgCommissionRate
                ],
                'my_earnings' => [
                    'amount' => $myEarnings,
                    'currency' => 'KES'
                ],
                'pending_payout' => [
                    'amount' => $pendingPayout,
                    'currency' => 'KES',
                    'status' => 'awaiting_transfer'
                ],
                'completed_payouts' => [
                    'amount' => $completedPayouts,
                    'currency' => 'KES',
                    'status' => 'already_received'
                ]
            ]
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/seller/transactions?page=1&per_page=20
     */
    public function transactions(Request $request)
    {
        $user = $request->user();
        $seller = $this->getOrCreateSellerProfile($user);
        
        $query = Payment::where('seller_id', $seller->id)
            ->with(['order:id,order_number', 'recordedBy:id,name']);
        
        // Apply filters (optional)
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('payout_status')) {
            $query->where('payout_status', $request->payout_status);
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('payment_collected_at', [
                $request->start_date,
                $request->end_date
            ]);
        }
        
        // Pagination
        $perPage = $request->query('per_page', 20);
        $transactions = $query->orderByDesc('payment_collected_at')->paginate($perPage);
        
        // Transform data to show seller's perspective
        $data = $transactions->items();
        foreach ($data as $transaction) {
            $transaction->breakdown = [
                'sale_amount' => $transaction->amount,
                'commission' => $transaction->platform_commission_amount,
                'commission_rate' => $transaction->platform_commission_rate . '%',
                'i_receive' => $transaction->seller_payout_amount
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'total_pages' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/seller/commission-breakdown?period=month
     */
    public function commissionBreakdown(Request $request)
    {
        $user = $request->user();
        $seller = $this->getOrCreateSellerProfile($user);
        
        $period = $request->query('period', 'month');
        $dateRange = $this->getDateRange($period);
        
        $totalSales = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('amount');
        
        $totalCommission = Payment::where('seller_id', $seller->id)
            ->whereBetween('payment_collected_at', $dateRange)
            ->where('status', 'completed')
            ->sum('platform_commission_amount');
        
        $myEarnings = $totalSales - $totalCommission;
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'total_sales' => $totalSales,
                'platform_commission' => $totalCommission,
                'my_earnings' => $myEarnings,
                'commission_rate' => $seller->commission_rate ?? 15.00,
                'currency' => 'KES',
                'breakdown' => [
                    'sales_percentage' => $totalSales > 0 ? round(($myEarnings / $totalSales) * 100, 2) : 0,
                    'commission_percentage' => $totalSales > 0 ? round(($totalCommission / $totalSales) * 100, 2) : 0
                ]
            ]
        ]);
    }
    
    /**
     * GET /api/v1/dashboard/seller/payouts
     */
    public function payouts(Request $request)
    {
        $user = $request->user();
        $seller = $this->getOrCreateSellerProfile($user);
        
        // Get completed payouts (payments that have been paid out)
        $completedPayouts = Payment::where('seller_id', $seller->id)
            ->where('payout_status', 'completed')
            ->where('status', 'completed')
            ->select(
                DB::raw('DATE(payout_date) as payout_date'),
                DB::raw('SUM(amount) as total_sales'),
                DB::raw('SUM(platform_commission_amount) as commission'),
                DB::raw('SUM(seller_payout_amount) as amount_received'),
                DB::raw('COUNT(*) as transaction_count')
            )
            ->groupBy(DB::raw('DATE(payout_date)'))
            ->orderByDesc('payout_date')
            ->get()
            ->map(function ($item) {
                return [
                    'payout_date' => $item->payout_date,
                    'period' => Carbon::parse($item->payout_date)->format('M d, Y'),
                    'total_sales' => $item->total_sales,
                    'commission' => $item->commission,
                    'amount_received' => $item->amount_received,
                    'transaction_count' => $item->transaction_count,
                    'method' => 'Bank Transfer',
                    'status' => 'completed',
                    'currency' => 'KES'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $completedPayouts
        ]);
    }
    
    /**
     * Helper: Get or create seller profile for the user
     * This prevents the "No query results" error
     */
    private function getOrCreateSellerProfile($user)
    {
        $seller = SellerProfile::where('user_id', $user->id)->first();
        
        if (!$seller) {
            // Auto-create seller profile if it doesn't exist
            $seller = SellerProfile::create([
                'user_id' => $user->id,
                'business_name' => $user->name . "'s Shop",
                'business_description' => 'New seller account - please update your business details',
                'phone' => $user->phone ?? '',
                'county' => '',
                'sub_county' => '',
                'ward' => '',
                'street_address' => '',
                'commission_rate' => 10.00,
                'status' => 'pending', // Requires admin approval
            ]);
            
            \Log::info("✅ Auto-created SellerProfile in controller for user: {$user->id}");
        }
        
        return $seller;
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