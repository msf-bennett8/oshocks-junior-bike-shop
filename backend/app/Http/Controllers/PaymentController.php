<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\SellerPayout;
use App\Services\CommissionService;
use App\Services\Mpesa\MpesaAuthService;
use App\Services\Mpesa\MpesaStkService;
use App\Services\Mpesa\MpesaB2CService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected MpesaStkService $stkService;
    protected MpesaB2CService $b2cService;
    protected CommissionService $commissionService;

    public function __construct(
        MpesaStkService $stkService,
        MpesaB2CService $b2cService,
        CommissionService $commissionService
    ) {
        $this->stkService = $stkService;
        $this->b2cService = $b2cService;
        $this->commissionService = $commissionService;
    }

    /**
     * Initiate M-Pesa STK Push payment
     */
    public function initiateMpesa(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'phone_number' => 'required|string|min:10|max:15',
        ]);

        try {
            $order = Order::with('orderItems.product.seller')->findOrFail($validated['order_id']);
            
            // Check if order is already paid
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid'
                ], 400);
            }

            // Generate unique transaction reference
            $transactionRef = 'OS' . strtoupper(Str::random(8)) . time();
            
            // Calculate amounts
            $amount = $order->total;
            $sellerId = $order->orderItems->first()->product->seller_id ?? null;
            $commissionData = $this->commissionService::calculate($amount, $sellerId);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'seller_id' => $order->orderItems->first()->product->seller_id ?? null,
                'sale_channel' => 'online_delivery',
                'payment_method' => 'mpesa_stk',
                'transaction_reference' => $transactionRef,
                'transaction_id' => $transactionRef,
                'amount' => $amount,
                'currency' => 'KES',
                'platform_commission_rate' => $commissionData['commission_rate'],
                'platform_commission_amount' => $commissionData['commission_amount'],
                'seller_payout_amount' => $commissionData['seller_payout'],
                'status' => 'pending',
                'payout_status' => 'pending',
                'phone_number' => $validated['phone_number'],
                'metadata' => [
                    'order_number' => $order->order_number,
                    'items_count' => $order->orderItems->count(),
                ],
            ]);

            // Initiate STK Push
            $stkResponse = $this->stkService->initiateStkPush(
                phoneNumber: $validated['phone_number'],
                amount: $amount,
                accountReference: $transactionRef,
                transactionDesc: "Order {$order->order_number}"
            );

            if ($stkResponse['success']) {
                // Update payment with M-Pesa request IDs
                $payment->update([
                    'external_reference' => $stkResponse['checkout_request_id'],
                    'payment_details' => json_encode([
                        'merchant_request_id' => $stkResponse['merchant_request_id'],
                        'checkout_request_id' => $stkResponse['checkout_request_id'],
                        'customer_message' => $stkResponse['customer_message'],
                    ]),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment initiated successfully',
                    'data' => [
                        'payment_id' => $payment->id,
                        'transaction_reference' => $transactionRef,
                        'transaction_id' => $transactionRef,
                        'checkout_request_id' => $stkResponse['checkout_request_id'],
                        'customer_message' => $stkResponse['customer_message'],
                    ]
                ]);
            }

            // STK Push failed
            $payment->update([
                'status' => 'failed',
                'error_message' => $stkResponse['error'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $stkResponse['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('M-Pesa payment initiation failed', [
                'error' => $e->getMessage(),
                'order_id' => $validated['order_id'] ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle M-Pesa callback from Safaricom
     */
    public function mpesaCallback(Request $request)
    {
        Log::info('M-Pesa callback received', ['payload' => $request->all()]);

        try {
            $callbackData = $request->all();
            
            // Check if it's STK callback or B2C callback
            if (isset($callbackData['Body']['stkCallback'])) {
                return $this->handleStkCallback($callbackData);
            }
            
            if (isset($callbackData['Result'])) {
                return $this->handleB2CCallback($callbackData);
            }

            Log::warning('Unknown callback type received', $callbackData);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);

        } catch (\Exception $e) {
            Log::error('M-Pesa callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Always return success to Safaricom to prevent retries
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);
        }
    }

    /**
     * Handle STK Push callback
     */
    protected function handleStkCallback(array $data): \Illuminate\Http\JsonResponse
    {
        $stkCallback = $data['Body']['stkCallback'];
        $checkoutRequestId = $stkCallback['CheckoutRequestID'];
        $resultCode = $stkCallback['ResultCode'];
        $resultDesc = $stkCallback['ResultDesc'];

        // Find payment by checkout request ID
        $payment = Payment::where('external_reference', $checkoutRequestId)->first();

        if (!$payment) {
            Log::error('Payment not found for callback', ['checkout_request_id' => $checkoutRequestId]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);
        }

        if ($resultCode == 0) {
            // Success
            $callbackMetadata = $stkCallback['CallbackMetadata']['Item'] ?? [];
            $metadata = [];
            
            foreach ($callbackMetadata as $item) {
                $metadata[$item['Name']] = $item['Value'] ?? null;
            }

            $payment->update([
                'status' => 'completed',
                'external_transaction_id' => $metadata['MpesaReceiptNumber'] ?? null,
                'payment_collected_at' => now(),
                'verified_at' => now(),
                'payment_details' => json_encode([
                    'mpesa_receipt_number' => $metadata['MpesaReceiptNumber'] ?? null,
                    'transaction_date' => $metadata['TransactionDate'] ?? null,
                    'phone_number' => $metadata['PhoneNumber'] ?? null,
                    'amount' => $metadata['Amount'] ?? null,
                    'result_desc' => $resultDesc,
                ]),
            ]);

            // Update order status
            $payment->order->update([
                'payment_status' => 'paid',
                'status' => 'processing'
            ]);

            Log::info('Payment completed successfully', [
                'payment_id' => $payment->id,
                'mpesa_receipt' => $metadata['MpesaReceiptNumber'] ?? null
            ]);
        } else {
            // Failed
            $payment->update([
                'status' => 'failed',
                'error_message' => $resultDesc,
            ]);

            Log::warning('Payment failed', [
                'payment_id' => $payment->id,
                'result_code' => $resultCode,
                'result_desc' => $resultDesc
            ]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);
    }

    /**
     * Handle B2C (payout) callback
     */
    protected function handleB2CCallback(array $data): \Illuminate\Http\JsonResponse
    {
        $result = $data['Result'];
        $conversationId = $result['ConversationID'];
        $resultCode = $result['ResultCode'];
        $resultDesc = $result['ResultDesc'];

        // Find payout by conversation ID
        $payout = SellerPayout::where('payout_reference', $conversationId)->first();

        if (!$payout) {
            Log::error('Payout not found for callback', ['conversation_id' => $conversationId]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);
        }

        if ($resultCode == 0) {
            // Success
            $payout->update([
                'payout_status' => 'completed',
                'processed_at' => now(),
            ]);

            // Update associated payments
            $payout->payments()->update([
                'payout_status' => 'completed',
                'payout_date' => now(),
            ]);

            Log::info('Payout completed successfully', [
                'payout_id' => $payout->id,
                'conversation_id' => $conversationId
            ]);
        } else {
            // Failed
            $payout->update([
                'payout_status' => 'failed',
                'notes' => ($payout->notes ?? '') . "\nFailed: {$resultDesc}",
            ]);

            Log::error('Payout failed', [
                'payout_id' => $payout->id,
                'result_code' => $resultCode,
                'result_desc' => $resultDesc
            ]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Received']);
    }

    /**
     * Check payment status
     */
    public function show($id)
    {
        $payment = Payment::with(['order', 'seller'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Initiate Card payment (placeholder for Flutterwave/Stripe)
     */
    public function initiateCard(Request $request)
    {
        // TODO: Implement card payment integration
        return response()->json([
            'success' => false,
            'message' => 'Card payment not yet implemented'
        ], 501);
    }

    /**
     * Manual payment recording (for cash/bank)
     */
    public function recordPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:cash,bank_transfer,mpesa_manual',
            'amount' => 'required|numeric|min:0',
            'transaction_reference' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        try {
            $order = Order::findOrFail($validated['order_id']);
            
            $payment = Payment::create([
                'order_id' => $order->id,
                'payment_method' => $validated['payment_method'],
                'amount' => $validated['amount'],
                'transaction_reference' => $validated['transaction_reference'] ?? 'MANUAL-' . time(),
                'status' => 'completed',
                'payment_collected_at' => now(),
                'verified_at' => now(),
                'recorded_by_user_id' => auth()->id(),
                'notes' => $validated['notes'],
            ]);

            $order->update(['payment_status' => 'paid']);

            return response()->json([
                'success' => true,
                'message' => 'Payment recorded successfully',
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            Log::error('Manual payment recording failed', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to record payment'
            ], 500);
        }
    }
}
