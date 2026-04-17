<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentHistoryController extends Controller
{
    /**
     * GET /api/v1/payments/history?page=1&per_page=20
     * Get all payment history (completed payments)
     */
    public function index(Request $request)
    {
        $query = Payment::with(['seller.user:id,name', 'order:id,order_number,order_display,purchase_id'])
            ->where('status', 'completed');
        
        // Apply filters
        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        
        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('payment_collected_at', [
                $request->start_date,
                $request->end_date
            ]);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('transaction_reference', 'like', "%{$search}%")
                  ->orWhere('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%")
                         ->orWhere('order_display', 'like', "%{$search}%")
                         ->orWhere('purchase_id', 'like', "%{$search}%");
                  })
                  ->orWhereHas('seller.user', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%")
                         ->orWhere('business_name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Get summary before pagination
        $summaryQuery = clone $query;
        $summary = [
            'total_payments' => $summaryQuery->count(),
            'total_amount' => $summaryQuery->sum('amount'),
            'total_commission' => $summaryQuery->sum('platform_commission_amount'),
            'total_net' => $summaryQuery->sum('seller_payout_amount'),
            'currency' => 'KES'
        ];
        
        // Pagination
        $perPage = $request->query('per_page', 20);
        $payments = $query->orderByDesc('payment_collected_at')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'summary' => $summary,
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'total_pages' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total()
            ]
        ]);
    }
}