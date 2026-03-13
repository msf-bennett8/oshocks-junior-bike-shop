<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\CommissionService;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CardPaymentController extends Controller
{
    protected PaystackService $paystackService;
    protected CommissionService $commissionService;

    public function __construct(
        PaystackService $paystackService,
        CommissionService $commissionService
    ) {
        $this->paystackService = $paystackService;
        $this->commissionService = $commissionService;
    }

    /**
     * Initialize card payment
     */
    public function initialize(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'email' => 'required|email',
        ]);

        try {
            $order = Order::with('items.product.seller', 'user')->findOrFail($validated['order_id']);

            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid'
                ], 400);
            }

            // Generate unique reference
            $reference = 'OS_CARD_' . strtoupper(Str::random(10)) . '_' . time();
            
            $amount = $order->total;
            $sellerId = $order->items->first()->product->seller_id ?? null;
            $commissionData = $this->commissionService->calculate($amount, $sellerId);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'seller_id' => $order->items->first()->product->seller_id ?? null,
                'sale_channel' => 'online_delivery',
                'payment_method' => 'card',
                'transaction_id' => $reference,
                'transaction_reference' => $reference,
                'amount' => $amount,
                'currency' => 'KES',
                'platform_commission_rate' => $commissionData['commission_rate'],
                'platform_commission_amount' => $commissionData['commission_amount'],
                'seller_payout_amount' => $commissionData['seller_payout'],
                'status' => 'pending',
                'payout_status' => 'pending',
                'metadata' => [
                    'order_number' => $order->order_number,
                    'customer_email' => $validated['email'],
                    'payment_type' => 'card',
                ],
            ]);

            // Initialize Paystack transaction
            $callbackUrl = rtrim(config('app.url'), '/') . '/api/v1/payments/card/callback';
            
            $response = $this->paystackService->initializeTransaction(
                email: $validated['email'],
                amount: $amount,
                reference: $reference,
                metadata: [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                    'customer_id' => $order->user_id,
                ],
                callbackUrl: $callbackUrl
            );

            if ($response['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment initialized',
                    'data' => [
                        'payment_id' => $payment->id,
                        'reference' => $reference,
                        'authorization_url' => $response['authorization_url'],
                        'access_code' => $response['access_code'],
                    ]
                ]);
            }

            // Failed
            $payment->update([
                'status' => 'failed',
                'error_message' => $response['error'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment: ' . $response['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Card payment initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initialization failed'
            ], 500);
        }
    }

    /**
     * Handle Paystack callback/redirect
     */
    public function callback(Request $request)
    {
        $reference = $request->query('reference');
        $trxref = $request->query('trxref');

        if (!$reference && !$trxref) {
            return response()->json([
                'success' => false,
                'message' => 'No reference provided'
            ], 400);
        }

        $reference = $reference ?? $trxref;

        try {
            $verification = $this->paystackService->verifyTransaction($reference);

            if (!$verification['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed'
                ], 400);
            }

            $payment = Payment::where('transaction_reference', $reference)->first();

            if (!$payment) {
                Log::error('Payment not found for callback', ['reference' => $reference]);
                return response()->json([
                    'success' => false,
                    'message' => 'Payment record not found'
                ], 404);
            }

            if ($verification['status'] === 'success') {
                $payment->update([
                    'status' => 'completed',
                    'external_transaction_id' => (string) $verification['transaction_id'],
                    'payment_collected_at' => $verification['paid_at'],
                    'verified_at' => now(),
                    'payment_details' => json_encode([
                        'channel' => $verification['channel'],
                        'card_last4' => $verification['card_details']['last4'] ?? null,
                        'card_brand' => $verification['card_details']['brand'] ?? null,
                        'paid_at' => $verification['paid_at'],
                    ]),
                ]);

                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing'
                ]);

                Log::info('Card payment completed', [
                    'payment_id' => $payment->id,
                    'reference' => $reference
                ]);

                // Redirect to frontend success page
                $frontendUrl = config('app.frontend_url', 'https://oshocks.com');
                return redirect("{$frontendUrl}/checkout/payment-callback?reference={$reference}");
            }

            // Failed or abandoned
            $payment->update([
                'status' => 'failed',
                'error_message' => "Payment {$verification['status']}",
            ]);

            $frontendUrl = config('app.frontend_url', 'https://oshocks.com');
            return redirect("{$frontendUrl}/checkout/payment-callback?reference={$reference}&status=failed");

        } catch (\Exception $e) {
            Log::error('Card callback processing failed', [
                'error' => $e->getMessage(),
                'reference' => $reference
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Callback processing failed'
            ], 500);
        }
    }

        /**
     * Handle Paystack webhook
     */
    public function webhook(Request $request)
    {
        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.secret_key');
        
        // Validate we have required values
        if (empty($signature)) {
            Log::warning('Paystack webhook: Missing signature header');
            return response()->json(['status' => 'missing signature'], 400);
        }
        
        if (empty($secret)) {
            Log::error('Paystack webhook: Secret key not configured');
            return response()->json(['status' => 'server config error'], 500);
        }
        
        $computed = hash_hmac('sha512', $request->getContent(), $secret);

        if (!hash_equals($computed, $signature)) {
            Log::warning('Invalid Paystack webhook signature', [
                'ip' => $request->ip(),
                'signature' => substr($signature, 0, 10) . '...',
            ]);
            return response()->json(['status' => 'invalid signature'], 400);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        Log::info('Paystack webhook received', ['event' => $event]);

        if ($event === 'charge.success') {
            $reference = $data['reference'] ?? null;
            
            if (!$reference) {
                Log::warning('Paystack webhook: charge.success missing reference');
                return response()->json(['status' => 'missing reference'], 400);
            }
            
            $payment = Payment::where('transaction_reference', $reference)->first();

            if ($payment && $payment->status === 'pending') {
                // Extract authorization data for saved cards
                $authorization = $data['authorization'] ?? [];
                $isReusable = $authorization['reusable'] ?? false;
                
                $payment->update([
                    'status' => 'completed',
                    'external_transaction_id' => (string) ($data['id'] ?? ''),
                    'authorization_code' => $authorization['authorization_code'] ?? null,
                    'card_last4' => $authorization['last4'] ?? null,
                    'card_brand' => $authorization['brand'] ?? null,
                    'card_expiry_month' => $authorization['exp_month'] ?? null,
                    'card_expiry_year' => $authorization['exp_year'] ?? null,
                    'is_reusable' => $isReusable,
                    'payment_collected_at' => $data['paid_at'] ?? now(),
                    'verified_at' => now(),
                    'payment_details' => json_encode([
                        'channel' => $data['channel'] ?? null,
                        'card_last4' => $authorization['last4'] ?? null,
                        'card_brand' => $authorization['brand'] ?? null,
                        'authorization_code' => $authorization['authorization_code'] ?? null,
                        'reusable' => $isReusable,
                    ]),
                ]);

                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing'
                ]);
                
                Log::info('Paystack webhook processed charge.success', [
                    'payment_id' => $payment->id,
                    'reference' => $reference
                ]);
            } else {
                Log::info('Paystack webhook: Payment not found or already processed', [
                    'reference' => $reference,
                    'payment_exists' => $payment ? 'yes' : 'no',
                    'status' => $payment?->status
                ]);
            }
        }

        // Acknowledge webhook
        return response()->json(['status' => 'success']);
    }

    /**
     * Verify payment status (for polling)
     */
    public function verify(string $reference)
    {
        try {
            $verification = $this->paystackService->verifyTransaction($reference);
            
            if (!$verification['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Verification failed'
                ], 400);
            }

            $payment = Payment::where('transaction_reference', $reference)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $verification['status'],
                    'amount' => $verification['amount'],
                    'paid_at' => $verification['paid_at'],
                    'payment_status' => $payment?->status,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification error'
            ], 500);
        }
    }

    /**
     * Get user's saved cards (reusable authorizations)
     */
    public function getSavedCards(Request $request)
    {
        try {
            $user = $request->user();
            
            // Get unique saved cards from successful payments
            $savedCards = Payment::whereHas('order', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->whereNotNull('authorization_code')
                ->where('is_reusable', true)
                ->where('status', 'completed')
                ->select('authorization_code', 'card_last4', 'card_brand', 'card_expiry_month', 'card_expiry_year')
                ->distinct('authorization_code')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $savedCards
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get saved cards', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve saved cards'
            ], 500);
        }
    }

    /**
     * Charge saved card directly (inline payment)
     */
    public function chargeSavedCard(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'authorization_code' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            $order = Order::with('items.product.seller', 'user')->findOrFail($validated['order_id']);

            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid'
                ], 400);
            }

            // Verify this authorization_code belongs to the user
            $existingPayment = Payment::where('authorization_code', $validated['authorization_code'])
                ->whereHas('order', function ($query) use ($order) {
                    $query->where('user_id', $order->user_id);
                })
                ->where('is_reusable', true)
                ->where('status', 'completed')
                ->first();

            if (!$existingPayment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired saved card'
                ], 400);
            }

            // Generate new reference
            $reference = 'OS_CARD_SAVED_' . strtoupper(Str::random(10)) . '_' . time();
            
            $amount = $order->total;
            $sellerId = $order->items->first()->product->seller_id ?? null;
            $commissionData = $this->commissionService->calculate($amount, $sellerId);

            // Create payment record
            $payment = Payment::create([
                'order_id' => $order->id,
                'seller_id' => $sellerId,
                'sale_channel' => 'online_delivery',
                'payment_method' => 'card',
                'transaction_id' => $reference,
                'transaction_reference' => $reference,
                'authorization_code' => $validated['authorization_code'],
                'card_last4' => $existingPayment->card_last4,
                'card_brand' => $existingPayment->card_brand,
                'card_expiry_month' => $existingPayment->card_expiry_month,
                'card_expiry_year' => $existingPayment->card_expiry_year,
                'is_reusable' => true,
                'amount' => $amount,
                'currency' => 'KES',
                'platform_commission_rate' => $commissionData['commission_rate'],
                'platform_commission_amount' => $commissionData['commission_amount'],
                'seller_payout_amount' => $commissionData['seller_payout'],
                'status' => 'pending',
                'payout_status' => 'pending',
                'metadata' => [
                    'order_number' => $order->order_number,
                    'customer_email' => $validated['email'],
                    'payment_type' => 'card_saved',
                    'previous_payment_id' => $existingPayment->id,
                ],
            ]);

            // Charge the saved card directly
            $response = $this->paystackService->chargeSavedCard(
                authorizationCode: $validated['authorization_code'],
                email: $validated['email'],
                amount: $amount,
                reference: $reference,
                metadata: [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                    'customer_id' => $order->user_id,
                ]
            );

            if ($response['success'] && $response['status'] === 'success') {
                // Payment successful immediately
                $payment->update([
                    'status' => 'completed',
                    'external_transaction_id' => (string) $response['transaction_id'],
                    'payment_collected_at' => $response['paid_at'],
                    'verified_at' => now(),
                ]);

                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing'
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment successful',
                    'data' => [
                        'payment_id' => $payment->id,
                        'reference' => $reference,
                        'status' => 'completed',
                        'amount' => $response['amount'],
                    ]
                ]);
            }

            // Failed
            $payment->update([
                'status' => 'failed',
                'error_message' => $response['error'],
            ]);

            return response()->json([
                'success' => false,
                'message' => $response['error'] ?? 'Failed to charge saved card'
            ], 400);

        } catch (\Exception $e) {
            Log::error('Saved card charge failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment processing failed'
            ], 500);
        }
    }
}
