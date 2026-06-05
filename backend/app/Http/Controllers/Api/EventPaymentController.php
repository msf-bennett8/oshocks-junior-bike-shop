<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEventRegistration;
use App\Models\Payment;
use App\Services\Mpesa\MpesaStkService;
use App\Services\PaystackService;
use App\Services\CommissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventPaymentController extends Controller
{
    protected MpesaStkService $stkService;
    protected PaystackService $paystackService;

    public function __construct(
        MpesaStkService $stkService,
        PaystackService $paystackService
    ) {
        $this->stkService = $stkService;
        $this->paystackService = $paystackService;
    }

    /**
     * Initiate M-Pesa STK Push for event registration
     * POST /api/v1/event-payments/mpesa/initiate
     */
    public function initiateMpesa(Request $request)
    {
        $validated = $request->validate([
            'registration_code' => 'required|string|exists:cycling_event_registrations,registration_code',
            'phone_number' => 'required|string|min:10|max:15',
        ]);

        try {
            $registration = CyclingEventRegistration::where('registration_code', $validated['registration_code'])
                ->with('event')
                ->firstOrFail();

            // Check if already paid
            if ($registration->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration is already paid'
                ], 400);
            }

            $amount = $registration->final_amount;

            // Generate unique transaction reference
            $transactionRef = 'EVT_MP_' . strtoupper(Str::random(8)) . time();

            // Create payment record
            $payment = Payment::create([
                'event_registration_id' => $registration->id,
                'payment_for' => 'event_registration',
                'payment_method' => 'mpesa_stk',
                'transaction_reference' => $transactionRef,
                'transaction_id' => $transactionRef,
                'amount' => $amount,
                'currency' => 'KES',
                'status' => 'pending',
                'payout_status' => 'pending',
                'phone_number' => $validated['phone_number'],
                'metadata' => [
                    'registration_code' => $registration->registration_code,
                    'event_title' => $registration->event->title,
                    'event_code' => $registration->event->event_code,
                ],
            ]);

            // ─── Development Mock: Bypass real M-Pesa API in local dev ───
            if (app()->environment('local') && config('services.mpesa.mock_in_dev', false)) {
                $mockCheckoutId = 'ws_CO_' . strtoupper(Str::random(16));

                $payment->update([
                    'external_reference' => $mockCheckoutId,
                    'payment_details' => json_encode([
                        'merchant_request_id' => 'mock_' . Str::random(10),
                        'checkout_request_id' => $mockCheckoutId,
                        'customer_message' => 'Mock STK push sent successfully',
                        'mock' => true,
                    ]),
                ]);

                // Auto-complete payment after 5 seconds (simulate M-Pesa callback)
                \Illuminate\Support\Facades\Queue::later(
                    now()->addSeconds(5),
                    function () use ($payment, $registration) {
                        $payment->refresh();
                        if ($payment->status === 'pending') {
                            $payment->update([
                                'status' => 'completed',
                                'external_transaction_id' => 'MPESA' . Str::random(10),
                                'payment_collected_at' => now(),
                                'verified_at' => now(),
                                'payment_details' => json_encode([
                                    'mpesa_receipt_number' => 'MCK' . Str::random(8),
                                    'transaction_date' => now()->format('YmdHis'),
                                    'phone_number' => $payment->phone_number,
                                    'amount' => $payment->amount,
                                    'mock' => true,
                                ]),
                            ]);

                            $registration->update(['payment_status' => 'paid']);
                        }
                    }
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Mock payment initiated (dev mode)',
                    'data' => [
                        'payment_id' => $payment->id,
                        'transaction_reference' => $transactionRef,
                        'checkout_request_id' => $mockCheckoutId,
                        'customer_message' => 'Mock STK push — payment will auto-complete in 5 seconds',
                        'mock' => true,
                    ]
                ]);
            }

            // Initiate STK Push (real M-Pesa API)
            $stkResponse = $this->stkService->initiateStkPush(
                phoneNumber: $validated['phone_number'],
                amount: $amount,
                accountReference: $transactionRef,
                transactionDesc: "Event: {$registration->event->title}"
            );

            if ($stkResponse['success']) {
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
                        'checkout_request_id' => $stkResponse['checkout_request_id'],
                        'customer_message' => $stkResponse['customer_message'],
                    ]
                ]);
            }

            $payment->update([
                'status' => 'failed',
                'error_message' => $stkResponse['error'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $stkResponse['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Event M-Pesa payment initiation failed', [
                'error' => $e->getMessage(),
                'registration_code' => $validated['registration_code'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initialize Paystack card payment for event registration
     * POST /api/v1/event-payments/card/initialize
     */
    public function initializeCard(Request $request)
    {
        $validated = $request->validate([
            'registration_code' => 'required|string|exists:cycling_event_registrations,registration_code',
            'email' => 'required|email',
        ]);

        try {
            $registration = CyclingEventRegistration::where('registration_code', $validated['registration_code'])
                ->with('event')
                ->firstOrFail();

            if ($registration->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration is already paid'
                ], 400);
            }

            $amount = $registration->final_amount;
            $reference = 'EVT_CARD_' . strtoupper(Str::random(10)) . '_' . time();

            // Create payment record
            $payment = Payment::create([
                'event_registration_id' => $registration->id,
                'payment_for' => 'event_registration',
                'payment_method' => 'card',
                'transaction_id' => $reference,
                'transaction_reference' => $reference,
                'amount' => $amount,
                'currency' => 'KES',
                'status' => 'pending',
                'payout_status' => 'pending',
                'metadata' => [
                    'registration_code' => $registration->registration_code,
                    'event_title' => $registration->event->title,
                    'customer_email' => $validated['email'],
                ],
            ]);

            $callbackUrl = rtrim(config('app.url'), '/') . '/api/v1/event-payments/card/callback';

            $response = $this->paystackService->initializeTransaction(
                email: $validated['email'],
                amount: $amount,
                reference: $reference,
                metadata: [
                    'registration_id' => $registration->id,
                    'payment_id' => $payment->id,
                    'event_code' => $registration->event->event_code,
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

            $payment->update([
                'status' => 'failed',
                'error_message' => $response['error'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment: ' . $response['error']
            ], 400);

        } catch (\Exception $e) {
            Log::error('Event card payment initialization failed', [
                'error' => $e->getMessage(),
                'registration_code' => $validated['registration_code'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initialization failed'
            ], 500);
        }
    }

    /**
     * Handle Paystack callback for event payments
     */
    public function cardCallback(Request $request)
    {
        $reference = $request->query('reference') ?? $request->query('trxref');

        if (!$reference) {
            return response()->json(['success' => false, 'message' => 'No reference provided'], 400);
        }

        try {
            $verification = $this->paystackService->verifyTransaction($reference);

            if (!$verification['success']) {
                return response()->json(['success' => false, 'message' => 'Payment verification failed'], 400);
            }

            $payment = Payment::where('transaction_reference', $reference)
                ->where('payment_for', 'event_registration')
                ->first();

            if (!$payment) {
                Log::error('Event payment not found for callback', ['reference' => $reference]);
                return response()->json(['success' => false, 'message' => 'Payment record not found'], 404);
            }

            $frontendUrl = config('app.frontend_url', 'https://oshocks.com');

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
                    ]),
                ]);

                // Update registration payment status
                $registration = CyclingEventRegistration::find($payment->event_registration_id);
                if ($registration) {
                    $registration->update(['payment_status' => 'paid']);
                }

                return redirect("{$frontendUrl}/event-booking/success?registration={$registration->registration_code}&reference={$reference}");
            }

            $payment->update([
                'status' => 'failed',
                'error_message' => "Payment {$verification['status']}",
            ]);

            return redirect("{$frontendUrl}/event-booking/failed?reference={$reference}&status=failed");

        } catch (\Exception $e) {
            Log::error('Event card callback failed', ['error' => $e->getMessage(), 'reference' => $reference]);
            return response()->json(['success' => false, 'message' => 'Callback processing failed'], 500);
        }
    }

    /**
     * Cash on Delivery for event registration
     * POST /api/v1/event-payments/cod
     */
    public function cashOnDelivery(Request $request)
    {
        $validated = $request->validate([
            'registration_code' => 'required|string|exists:cycling_event_registrations,registration_code',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $registration = CyclingEventRegistration::where('registration_code', $validated['registration_code'])
                ->firstOrFail();

            if ($registration->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration is already paid'
                ], 400);
            }

            $transactionRef = 'EVT_COD_' . strtoupper(Str::random(8)) . time();

            $payment = Payment::create([
                'event_registration_id' => $registration->id,
                'payment_for' => 'event_registration',
                'payment_method' => 'cod',
                'transaction_reference' => $transactionRef,
                'transaction_id' => $transactionRef,
                'amount' => $registration->final_amount,
                'currency' => 'KES',
                'status' => 'pending', // COD stays pending until collected
                'payout_status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'metadata' => [
                    'registration_code' => $registration->registration_code,
                    'payment_type' => 'cash_on_delivery',
                ],
            ]);

            // Registration stays registered but payment pending
            // User pays at the event

            return response()->json([
                'success' => true,
                'message' => 'Cash on Delivery confirmed. Please pay at the event.',
                'data' => [
                    'payment_id' => $payment->id,
                    'transaction_reference' => $transactionRef,
                    'registration_code' => $registration->registration_code,
                    'amount_due' => $registration->final_amount,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Event COD failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process COD: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check event payment status
     * GET /api/v1/event-payments/{paymentId}/status
     */
    public function status($paymentId)
    {
        $payment = Payment::where('payment_for', 'event_registration')
            ->with('eventRegistration.event')
            ->findOrFail($paymentId);

        return response()->json([
            'success' => true,
            'data' => [
                'payment_id' => $payment->id,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'registration_code' => $payment->eventRegistration?->registration_code,
                'event_title' => $payment->eventRegistration?->event?->title,
                'paid_at' => $payment->payment_collected_at,
            ]
        ]);
    }

    /**
     * Verify card payment by reference (for polling)
     * GET /api/v1/event-payments/card/verify/{reference}
     */
    public function verifyCard($reference)
    {
        try {
            $verification = $this->paystackService->verifyTransaction($reference);

            $payment = Payment::where('transaction_reference', $reference)
                ->where('payment_for', 'event_registration')
                ->first();

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
}
