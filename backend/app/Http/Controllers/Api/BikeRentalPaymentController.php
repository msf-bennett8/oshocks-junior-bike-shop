<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRentalBooking;
use App\Models\Payment;
use App\Services\BookingIdService;
use App\Services\PaystackService;
use App\Services\Mpesa\MpesaStkService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BikeRentalPaymentController extends Controller
{
    protected $bookingIdService;
    protected $paystackService;
    protected $mpesaStkService;

    public function __construct(
        BookingIdService $bookingIdService,
        PaystackService $paystackService,
        MpesaStkService $mpesaStkService
    ) {
        $this->bookingIdService = $bookingIdService;
        $this->paystackService = $paystackService;
        $this->mpesaStkService = $mpesaStkService;
    }

    /**
     * Initiate M-Pesa STK Push for bike rental
     */
    public function initiateMpesa(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string',
            'phone_number' => 'required|string',
        ]);

        try {
            $booking = BikeRentalBooking::where('booking_code', $request->booking_code)->firstOrFail();

            if ($booking->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already paid for'
                ], 400);
            }

            $phone = $this->formatPhoneNumber($request->phone_number);
            $amount = $booking->grand_total;

            $stkResponse = $this->mpesaStkService->initiateStkPush([
                'phone' => $phone,
                'amount' => $amount,
                'account_reference' => $booking->booking_code,
                'transaction_desc' => 'Bike Rental Payment - ' . $booking->booking_code,
            ]);

            $payment = Payment::create([
                'booking_code' => $booking->booking_code,
                'payment_method' => 'mpesa',
                'amount' => $amount,
                'status' => 'pending',
                'transaction_id' => 'BIKE-MPESA-' . uniqid() . '-' . time(),
                'transaction_reference' => $stkResponse['CheckoutRequestID'] ?? null,
                'phone_number' => $phone,
                'payment_for' => 'bike_rental',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'M-Pesa STK push initiated',
                'data' => [
                    'payment_id' => $payment->id,
                    'checkout_request_id' => $stkResponse['CheckoutRequestID'] ?? null,
                    'mock' => $stkResponse['mock'] ?? false,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Bike rental M-Pesa initiation failed', [
                'booking_code' => $request->booking_code,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initiate Card Payment (Paystack) for bike rental
     */
    public function initiateCard(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            $booking = BikeRentalBooking::where('booking_code', $request->booking_code)->firstOrFail();

            if ($booking->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already paid for'
                ], 400);
            }

            $reference = 'BKB_' . uniqid() . '_' . time();

            $paystackData = [
                'email' => $request->email,
                'amount' => $booking->grand_total * 100,
                'reference' => $reference,
                'callback_url' => config('app.frontend_url') . '/bike-rental-success?reference=' . $reference,
                'metadata' => [
                    'booking_code' => $booking->booking_code,
                    'payment_for' => 'bike_rental',
                    'cancel_action' => config('app.frontend_url') . '/bikes',
                ]
            ];

            $response = $this->paystackService->initializeTransaction($paystackData);

            $payment = Payment::create([
                'booking_code' => $booking->booking_code,
                'payment_method' => 'card',
                'amount' => $booking->grand_total,
                'status' => 'pending',
                'transaction_id' => 'BIKE-CARD-' . uniqid() . '-' . time(),
                'transaction_reference' => $reference,
                'email' => $request->email,
                'payment_for' => 'bike_rental',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Card payment initialized',
                'data' => [
                    'authorization_url' => $response['data']['authorization_url'] ?? null,
                    'reference' => $reference,
                    'payment_id' => $payment->id,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Bike rental card initiation failed', [
                'booking_code' => $request->booking_code,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cash on Delivery / Pay at Pickup for bike rental
     */
    public function cod(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string',
        ]);

        try {
            $booking = BikeRentalBooking::where('booking_code', $request->booking_code)->firstOrFail();

            if ($booking->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already paid for'
                ], 400);
            }

            $payment = Payment::create([
                'booking_code' => $booking->booking_code,
                'payment_method' => 'cod',
                'amount' => $booking->grand_total,
                'status' => 'pending',
                'transaction_id' => 'BIKE-COD-' . uniqid() . '-' . time(),
                'payment_for' => 'bike_rental',
            ]);

            $booking->update([
                'payment_status' => 'pending',
                'status' => 'confirmed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking confirmed. Pay at pickup.',
                'data' => [
                    'booking_code' => $booking->booking_code,
                    'payment_id' => $payment->id,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Bike rental COD failed', [
                'booking_code' => $request->booking_code,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify card payment callback
     */
    public function verifyCard(Request $request, $reference)
    {
        try {
            $payment = Payment::where('transaction_reference', $reference)
                ->where('payment_for', 'bike_rental')
                ->firstOrFail();

            $verification = $this->paystackService->verifyTransaction($reference);

            if ($verification['data']['status'] === 'success') {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'transaction_details' => $verification['data'],
                ]);

                $booking = BikeRentalBooking::where('booking_code', $payment->booking_code)->first();
                if ($booking) {
                    $booking->update([
                        'payment_status' => 'paid',
                        'status' => 'confirmed',
                        'paid_at' => now(),
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully',
                    'data' => [
                        'booking_code' => $payment->booking_code,
                        'amount' => $payment->amount,
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed',
                'data' => $verification
            ], 400);

        } catch (\Exception $e) {
            Log::error('Bike rental card verification failed', [
                'reference' => $reference,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus($paymentId)
    {
        try {
            $payment = Payment::findOrFail($paymentId);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Public card callback
     */
    public function cardCallback(Request $request)
    {
        $reference = $request->get('reference');
        $trxref = $request->get('trxref');

        $ref = $reference ?? $trxref;

        if (!$ref) {
            return redirect(config('app.frontend_url') . '/bikes?payment=failed');
        }

        try {
            $result = $this->verifyCard($request, $ref);
            $data = $result->getData(true);

            if ($data['success']) {
                return redirect(config('app.frontend_url') . '/bike-rental-success?reference=' . $ref . '&booking=' . ($data['data']['booking_code'] ?? ''));
            }

            return redirect(config('app.frontend_url') . '/bikes?payment=failed');
        } catch (\Exception $e) {
            Log::error('Bike rental card callback failed', [
                'reference' => $ref,
                'error' => $e->getMessage()
            ]);
            return redirect(config('app.frontend_url') . '/bikes?payment=failed');
        }
    }

    /**
     * Format phone number for M-Pesa
     */
    private function formatPhoneNumber($phone)
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }

        if (!str_starts_with($phone, '254')) {
            $phone = '254' . $phone;
        }

        return $phone;
    }
}
