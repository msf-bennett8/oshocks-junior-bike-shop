<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\SellerProfile;
use App\Models\SellerPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayoutController extends Controller
{
    /**
     * GET /api/v1/payouts/pending
     * Get all sellers with pending payouts grouped by seller
     */
    public function pending(Request $request)
    {
        $pendingSellers = DB::table('payments')
            ->select(
                'seller_id',
                DB::raw('COUNT(*) as transaction_count'),
                DB::raw('SUM(amount) as total_sales'),
                DB::raw('SUM(platform_commission_amount) as total_commission'),
                DB::raw('SUM(seller_payout_amount) as payout_amount'),
                DB::raw('MIN(payment_collected_at) as earliest_payment'),
                DB::raw('MAX(payment_collected_at) as latest_payment')
            )
            ->where('status', 'completed')
            ->where('payout_status', 'pending')
            ->groupBy('seller_id')
            ->get();
        
        // Enrich with seller details
        $data = $pendingSellers->map(function ($item) {
            $seller = SellerProfile::with('user:id,name,email,phone')
                ->find($item->seller_id);
            
            return [
                'seller_id' => $item->seller_id,
                'seller_name' => $seller->business_name ?? $seller->user->name,
                'seller_email' => $seller->user->email,
                'seller_phone' => $seller->user->phone,
                'payment_account' => $seller->payment_account,
                'payment_method' => $seller->payment_method,
                'transaction_count' => $item->transaction_count,
                'total_sales' => $item->total_sales,
                'total_commission' => $item->total_commission,
                'payout_amount' => $item->payout_amount,
                'period' => [
                    'from' => $item->earliest_payment,
                    'to' => $item->latest_payment
                ],
                'currency' => 'KES'
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'summary' => [
                'total_sellers' => $data->count(),
                'total_payout_amount' => $data->sum('payout_amount'),
                'currency' => 'KES'
            ]
        ]);
    }
    
    /**
     * GET /api/v1/payouts/seller/{seller_id}/pending-payments
     * Get detailed list of pending payments for a specific seller
     */
    public function sellerPendingPayments($sellerId)
    {
        $payments = Payment::where('seller_id', $sellerId)
            ->where('status', 'completed')
            ->where('payout_status', 'pending')
            ->with(['order:id,order_number', 'recordedBy:id,name'])
            ->orderBy('payment_collected_at')
            ->get();
        
        $summary = [
            'transaction_count' => $payments->count(),
            'total_sales' => $payments->sum('amount'),
            'total_commission' => $payments->sum('platform_commission_amount'),
            'payout_amount' => $payments->sum('seller_payout_amount'),
            'currency' => 'KES'
        ];
        
        return response()->json([
            'success' => true,
            'data' => $payments,
            'summary' => $summary
        ]);
    }
    
    /**
     * POST /api/v1/payouts/process
     * Process payout for one or more sellers
     */
    public function process(Request $request)
    {
        $request->validate([
            'seller_ids' => 'required|array',
            'seller_ids.*' => 'exists:seller_profiles,id',
            'payout_method' => 'required|in:mpesa,bank_transfer',
            'payout_reference' => 'required|string|min:5',
            'notes' => 'nullable|string|max:500'
        ]);
        
        DB::beginTransaction();
        
        try {
            $processedPayouts = [];
            
            foreach ($request->seller_ids as $sellerId) {
                // Get all pending payments for this seller
                $pendingPayments = Payment::where('seller_id', $sellerId)
                    ->where('status', 'completed')
                    ->where('payout_status', 'pending')
                    ->lockForUpdate()
                    ->get();
                
                if ($pendingPayments->isEmpty()) {
                    continue;
                }
                
                // Calculate totals
                $totalSales = $pendingPayments->sum('amount');
                $totalCommission = $pendingPayments->sum('platform_commission_amount');
                $payoutAmount = $pendingPayments->sum('seller_payout_amount');
                
                // Create payout record
                $payout = SellerPayout::create([
                    'seller_id' => $sellerId,
                    'payout_period_start' => $pendingPayments->min('payment_collected_at'),
                    'payout_period_end' => $pendingPayments->max('payment_collected_at'),
                    'total_sales' => $totalSales,
                    'total_commission' => $totalCommission,
                    'payout_amount' => $payoutAmount,
                    'payout_method' => $request->payout_method,
                    'payout_reference' => $request->payout_reference . '-' . $sellerId,
                    'payout_status' => 'completed',
                    'processed_by' => $request->user()->id,
                    'processed_at' => now(),
                    'notes' => $request->notes
                ]);
                
                // Update all payments to completed payout status
                Payment::whereIn('id', $pendingPayments->pluck('id'))
                    ->update([
                        'payout_status' => 'completed',
                        'payout_date' => now()
                    ]);
                
                // Create payment-to-payout mappings
                foreach ($pendingPayments as $payment) {
                    DB::table('payment_payout_mappings')->insert([
                        'payment_id' => $payment->id,
                        'payout_id' => $payout->id,
                        'created_at' => now()
                    ]);
                }
                
                // Update seller totals
                $seller = SellerProfile::find($sellerId);
                $seller->update([
                    'total_commission_paid' => $seller->total_commission_paid + $totalCommission,
                    'total_earnings' => $seller->total_earnings + $payoutAmount
                ]);
                
                $processedPayouts[] = [
                    'seller_id' => $sellerId,
                    'payout_id' => $payout->id,
                    'payout_amount' => $payoutAmount,
                    'transaction_count' => $pendingPayments->count(),
                    'payout_reference' => $payout->payout_reference
                ];
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Payouts processed successfully',
                'data' => $processedPayouts
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Payout processing failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * GET /api/v1/payouts/history?page=1&per_page=20
     * Get payout history (completed payouts)
     */
    public function history(Request $request)
    {
        $query = SellerPayout::with(['seller.user:id,name', 'processedBy:id,name'])
            ->where('payout_status', 'completed');
        
        // Apply filters
        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('processed_at', [
                $request->start_date,
                $request->end_date
            ]);
        }
        
        // Pagination
        $perPage = $request->query('per_page', 20);
        $payouts = $query->orderByDesc('processed_at')->paginate($perPage);
        
        // Enrich data
        $data = $payouts->items();
        foreach ($data as $payout) {
            $payout->seller_name = $payout->seller->business_name ?? $payout->seller->user->name;
            $payout->processed_by_name = $payout->processedBy->name;
        }
        
        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $payouts->currentPage(),
                'total_pages' => $payouts->lastPage(),
                'per_page' => $payouts->perPage(),
                'total' => $payouts->total()
            ]
        ]);
    }
}