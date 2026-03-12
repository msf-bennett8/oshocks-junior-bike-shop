<?php

namespace App\Services\Mpesa;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaStkService
{
    protected MpesaAuthService $authService;
    protected string $baseUrl;
    protected string $shortcode;
    protected string $passkey;
    protected string $callbackUrl;
    protected bool $isProduction;

    public function __construct(MpesaAuthService $authService)
    {
        $this->authService = $authService;
        $this->isProduction = config('services.mpesa.env', 'sandbox') === 'production';
        $this->baseUrl = $this->isProduction 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        $this->shortcode = config('services.mpesa.shortcode');
        $this->passkey = config('services.mpesa.passkey');
        $this->callbackUrl = config('services.mpesa.callback_url');
    }

    /**
     * Initiate STK Push (Lipa na M-Pesa Online)
     */
    public function initiateStkPush(
        string $phoneNumber,
        float $amount,
        string $accountReference,
        string $transactionDesc = 'Payment'
    ): array {
        $timestamp = now()->format('YmdHis');
        $password = base64_encode("{$this->shortcode}{$this->passkey}{$timestamp}");
        
        // Format phone number (remove + and ensure 254 prefix)
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int) $amount,
            'PartyA' => $formattedPhone,
            'PartyB' => $this->shortcode,
            'PhoneNumber' => $formattedPhone,
            'CallBackURL' => $this->callbackUrl,
            'AccountReference' => substr($accountReference, 0, 12), // Max 12 chars
            'TransactionDesc' => substr($transactionDesc, 0, 13), // Max 13 chars
        ];

        Log::info('Initiating M-Pesa STK Push', [
            'phone' => $formattedPhone,
            'amount' => $amount,
            'reference' => $accountReference
        ]);

        $response = Http::withToken($this->authService->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        if ($response->successful()) {
            Log::info('STK Push initiated successfully', $response->json());
            return [
                'success' => true,
                'checkout_request_id' => $response->json('CheckoutRequestID'),
                'merchant_request_id' => $response->json('MerchantRequestID'),
                'response_code' => $response->json('ResponseCode'),
                'response_description' => $response->json('ResponseDescription'),
                'customer_message' => $response->json('CustomerMessage'),
            ];
        }

        Log::error('STK Push failed', [
            'status' => $response->status(),
            'response' => $response->json()
        ]);

        return [
            'success' => false,
            'error' => $response->json('errorMessage') ?? 'Failed to initiate payment',
            'response' => $response->json()
        ];
    }

    /**
     * Query STK Push transaction status
     */
    public function queryTransactionStatus(string $checkoutRequestId): array
    {
        $timestamp = now()->format('YmdHis');
        $password = base64_encode("{$this->shortcode}{$this->passkey}{$timestamp}");

        $payload = [
            'BusinessShortCode' => $this->shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'CheckoutRequestID' => $checkoutRequestId,
        ];

        $response = Http::withToken($this->authService->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'result_code' => $response->json('ResultCode'),
                'result_desc' => $response->json('ResultDesc'),
                'mpesa_receipt_number' => $response->json('MpesaReceiptNumber'),
                'transaction_date' => $response->json('TransactionDate'),
                'amount' => $response->json('Amount'),
            ];
        }

        return [
            'success' => false,
            'error' => $response->json('errorMessage') ?? 'Query failed',
            'response' => $response->json()
        ];
    }

    /**
     * Format phone number to 2547XXXXXXXX format
     */
    protected function formatPhoneNumber(string $phone): string
    {
        // Remove any non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Remove leading + or 00
        $phone = ltrim($phone, '+');
        if (substr($phone, 0, 2) === '00') {
            $phone = substr($phone, 2);
        }
        
        // If starts with 0, replace with 254
        if (strlen($phone) === 10 && $phone[0] === '0') {
            $phone = '254' . substr($phone, 1);
        }
        
        // If starts with 7, add 254
        if (strlen($phone) === 9 && $phone[0] === '7') {
            $phone = '254' . $phone;
        }
        
        return $phone;
    }
}
