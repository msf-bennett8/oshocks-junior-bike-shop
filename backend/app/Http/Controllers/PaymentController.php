<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordPaymentRequest;
use App\Models\Order;
use App\Models\Payment;
use App\Models\PaymentRecorder;
use App\Services\TransactionReferenceService;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Record a new payment
     * 
     * POST /api/payments/record
     */
    public function recordPayment(RecordPaymentRequest $request)
    {
        DB::beginTransaction();
        
        try {
            // 1. Get and validate order
            $order = Order::with('orderItems.seller')->findOrFail($request->order_id);
            
            // 2. Check if order is already paid
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'This order has already been paid'
                ], 400);
            }
            
            // 3. Get recorder details
            $recorder = PaymentRecorder::where('user_id', $request->user()->id)
                ->where('is_active', true)
                ->first();
            
            if (!$recorder) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment recorder profile not found. Please contact admin.'
                ], 400);
            }
            
            // 4. Determine seller (for single-seller orders, use first item's seller)
            // For multi-seller orders, you may need different logic
            $sellerId = $order->orderItems->first()->seller_id;
            
            // 5. Validate amount matches order total (with tolerance for rounding)
            $amountDifference = abs($request->amount - $order->total);
            if ($amountDifference > 0.01) {
                return response()->json([
                    'success' => false,
                    'message' => "Payment amount (KES {$request->amount}) does not match order total (KES {$order->total})",
                    'expected_amount' => $order->total,
                    'received_amount' => $request->amount,
                ], 400);
            }
            
            // 6. Calculate commission
            $commission = CommissionService::calculate($request->amount, $sellerId);
            
            // 7. Generate transaction reference
            $transactionReference = TransactionReferenceService::generate(
                $request->payment_method,
                $recorder->recorder_code,
                $request->county,
                $request->zone
            );
            
            // 8. Capture IP address and device info
            $ipAddress = $request->ip();
            $deviceInfo = $request->header('User-Agent');
            
            // 9. Determine sale channel based on recorder type
            $saleChannel = $this->determineSaleChannel($recorder->recorder_type);
            
            // 10. Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'seller_id' => $sellerId,
                'sale_channel' => $saleChannel,
                'payment_method' => $request->payment_method,
                'transaction_id' => uniqid('TXN_'), // Legacy field
                'transaction_reference' => $transactionReference,
                'external_reference' => $request->external_reference,
                'external_transaction_id' => $request->external_transaction_id,
                'amount' => $request->amount,
                'currency' => 'KES',
                'platform_commission_rate' => $commission['commission_rate'],
                'platform_commission_amount' => $commission['commission_amount'],
                'seller_payout_amount' => $commission['seller_payout'],
                'status' => 'completed',
                'payout_status' => 'pending',
                'recorded_by_user_id' => $request->user()->id,
                'recorder_type' => $recorder->recorder_type,
                'recorder_location' => $recorder->location,
                'phone_number' => $request->customer_phone,
                'payment_collected_at' => now(),
                'verified_at' => now(), // Auto-verify for now
                'recorded_from_ip' => $ipAddress,
                'recorded_device_info' => $deviceInfo,
                'notes' => $request->notes,
                'completed_at' => now(),
            ]);
            
            // 11. Update seller totals
            CommissionService::updateSellerTotals(
                $sellerId,
                $request->amount,
                $commission['commission_amount'],
                $commission['seller_payout']
            );
            
            // 12. Update order status
            $order->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
            
            // 13. Log activity
            $this->logPaymentActivity($payment, $request->user(), $recorder);
            
            DB::commit();
            
            // 14. Return success response
            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => [
                    'payment_id' => $payment->id,
                    'transaction_reference' => $transactionReference,
                    'order_number' => $order->order_number,
                    'amount' => $request->amount,
                    'payment_method' => $request->payment_method,
                    'recorded_at' => $payment->payment_collected_at->toISOString(),
                    'breakdown' => [
                        'total_amount' => number_format($request->amount, 2),
                        'commission_rate' => $commission['commission_rate'] . '%',
                        'platform_commission' => number_format($commission['commission_amount'], 2),
                        'seller_receives' => number_format($commission['seller_payout'], 2),
                    ],
                ],
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Payment recording failed', [
                'error' => $e->getMessage(),
                'order_id' => $request->order_id,
                'user_id' => $request->user()->id,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    
    /**
     * Determine sale channel based on recorder type
     */
    private function determineSaleChannel(string $recorderType): string
    {
        return match($recorderType) {
            'delivery_agent' => 'online_delivery',
            'shop_attendant' => 'physical_shop',
            'seller' => 'direct_seller',
            default => 'online_delivery',
        };
    }
    
    /**
     * Log payment activity for audit trail
     */
    private function logPaymentActivity(Payment $payment, $user, PaymentRecorder $recorder): void
    {
        // You can implement ActivityLog model logging here
        Log::info('Payment recorded', [
            'payment_id' => $payment->id,
            'transaction_reference' => $payment->transaction_reference,
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'recorded_by' => $user->name,
            'recorder_type' => $recorder->recorder_type,
            'ip_address' => $payment->recorded_from_ip,
        ]);
    }
    
    /**
     * Get payment details by ID
     * 
     * GET /api/payments/{id}
     */
    public function show($id)
    {
        try {
            $payment = Payment::with([
                'order',
                'seller',
                'recordedBy',
            ])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $payment,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found',
            ], 404);
        }
    }
    
    /**
     * Existing methods for M-Pesa/Card can be added here
     */
    public function initiateMpesa(Request $request)
    {
        // TODO: Implement M-Pesa STK Push integration
        return response()->json([
            'success' => false,
            'message' => 'M-Pesa STK Push not yet implemented'
        ], 501);
    }
    
    public function initiateCard(Request $request)
    {
        // TODO: Implement Flutterwave card payment
        return response()->json([
            'success' => false,
            'message' => 'Card payment not yet implemented'
        ], 501);
    }
    
    public function mpesaCallback(Request $request)
    {
        // TODO: Handle M-Pesa callback
        Log::info('M-Pesa callback received', $request->all());
        
        return response()->json([
            'ResultCode' => 0,
            'ResultDesc' => 'Accepted'
        ]);
    }
}