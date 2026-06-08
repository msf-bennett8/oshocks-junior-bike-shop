<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResourceBooking;
use App\Services\MpesaStkService;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResourcePaymentController extends Controller
{
    protected MpesaStkService $mpesa;
    protected PaystackService $paystack;

    public function __construct(MpesaStkService $mpesa, PaystackService $paystack)
    {
        $this->mpesa = $mpesa;
        $this->paystack = $paystack;
    }

    public function initiateMpesa(Request $request)
    {
        $validated = $request->validate([
            'booking_code' => 'required|string|exists:resource_bookings,booking_code',
            'phone' => 'required|string',
        ]);

        $booking = ResourceBooking::where('booking_code', $validated['booking_code'])->firstOrFail();

        if ($booking->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Already paid'], 422);
        }

        $result = $this->mpesa->stkPush(
            $validated['phone'],
            $booking->grand_total,
            $booking->booking_code,
            'Resource Booking Payment'
        );

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function initiateCard(Request $request)
    {
        $validated = $request->validate([
            'booking_code' => 'required|string|exists:resource_bookings,booking_code',
            'email' => 'required|email',
        ]);

        $booking = ResourceBooking::where('booking_code', $validated['booking_code'])->firstOrFail();

        $result = $this->paystack->initializeTransaction(
            $validated['email'],
            $booking->grand_total * 100, // kobo
            $booking->booking_code,
            route('resource.payments.callback')
        );

        return response()->json(['success' => true, 'data' => $result]);
    }

    public function cardCallback(Request $request)
    {
        $reference = $request->get('reference');
        if (!$reference) {
            return response()->json(['success' => false, 'message' => 'No reference'], 400);
        }

        $verification = $this->paystack->verifyTransaction($reference);
        if (!$verification['success']) {
            return response()->json(['success' => false, 'message' => 'Verification failed'], 400);
        }

        $booking = ResourceBooking::where('payment_reference', $reference)->first();
        if ($booking) {
            $booking->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
            ]);
        }

        return redirect('/resource-booking/success?reference=' . $reference);
    }

    public function cod(Request $request)
    {
        $validated = $request->validate([
            'booking_code' => 'required|string|exists:resource_bookings,booking_code',
        ]);

        $booking = ResourceBooking::where('booking_code', $validated['booking_code'])->firstOrFail();

        $booking->update([
            'payment_method' => 'cod',
            'payment_status' => 'pending',
            'status' => 'confirmed',
        ]);

        return response()->json(['success' => true, 'message' => 'COD confirmed']);
    }

    public function checkStatus($paymentId)
    {
        $booking = ResourceBooking::where('booking_code', $paymentId)
            ->orWhere('payment_reference', $paymentId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $booking->payment_status,
                'booking_status' => $booking->status,
            ]
        ]);
    }

    public function verifyCard($reference)
    {
        $result = $this->paystack->verifyTransaction($reference);
        return response()->json($result);
    }
}
