<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * GET /api/v1/transactions?page=1&per_page=20&filters...
     */
    public function index(Request $request)
    {
        $query = Payment::with(['seller.user:id,name', 'order:id,order_number', 'recordedBy:id,name']);
        
        // Apply filters
        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }
        
        if ($request->has('sale_channel')) {
            $query->where('sale_channel', $request->sale_channel);
        }
        
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
        
        return response()->json([
            'success' => true,
            'data' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'total_pages' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ]);
    }
    
    /**
     * GET /api/v1/transactions/{id}
     */
    public function show($id)
    {
        $payment = Payment::with(['seller.user', 'order', 'recordedBy'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }
}