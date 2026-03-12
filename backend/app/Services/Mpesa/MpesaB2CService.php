<?php

namespace App\Services\Mpesa;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaB2CService
{
    protected MpesaAuthService $authService;
    protected string $baseUrl;
    protected string $shortcode;
    protected string $initiatorName;
    protected string $securityCredential;
    protected string $queueTimeoutUrl;
    protected string $resultUrl;
    protected bool $isProduction;

    public function __construct(MpesaAuthService $authService)
    {
        $this->authService = $authService;
        $this->isProduction = config('services.mpesa.env', 'sandbox') === 'production';
        $this->baseUrl = $this->isProduction 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
        $this->shortcode = config('services.mpesa.shortcode');
        $this->initiatorName = config('services.mpesa.initiator_name');
        $this->securityCredential = config('services.mpesa.security_credential');
        $this->queueTimeoutUrl = config('services.mpesa.b2c_timeout_url');
        $this->resultUrl = config('services.mpesa.b2c_result_url');
    }

    /**
     * Send money to customer (B2C) - Business Payment
     * Use this for paying sellers to their M-Pesa
     */
    public function sendPayment(
        string $phoneNumber,
        float $amount,
        string $remarks = 'Seller Payout',
        string $occasion = 'Payout'
    ): array {
        $formattedPhone = $this->formatPhoneNumber($phoneNumber);

        $payload = [
            'OriginatorConversationID' => uniqid('PO', true),
            'InitiatorName' => $this->initiatorName,
            'SecurityCredential' => $this->securityCredential,
            'CommandID' => 'BusinessPayment', // or 'SalaryPayment' or 'PromotionPayment'
            'Amount' => (int) $amount,
            'PartyA' => $this->shortcode,
            'PartyB' => $formattedPhone,
            'Remarks' => substr($remarks, 0, 140),
            'QueueTimeOutURL' => $this->queueTimeoutUrl,
            'ResultURL' => $this->resultUrl,
            'Occasion' => substr($occasion, 0, 20),
        ];

        Log::info('Initiating B2C payment', [
            'phone' => $formattedPhone,
            'amount' => $amount,
            'occasion' => $occasion
        ]);

        $response = Http::withToken($this->authService->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/b2c/v3/paymentrequest", $payload);

        if ($response->successful()) {
            Log::info('B2C payment initiated successfully', $response->json());
            return [
                'success' => true,
                'conversation_id' => $response->json('ConversationID'),
                'originator_conversation_id' => $response->json('OriginatorConversationID'),
                'response_code' => $response->json('ResponseCode'),
                'response_description' => $response->json('ResponseDescription'),
            ];
        }

        Log::error('B2C payment failed', [
            'status' => $response->status(),
            'response' => $response->json()
        ]);

        return [
            'success' => false,
            'error' => $response->json('errorMessage') ?? 'Failed to send payment',
            'response' => $response->json()
        ];
    }

    /**
     * Format phone number to 2547XXXXXXXX format
     */
    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        $phone = ltrim($phone, '+');
        if (substr($phone, 0, 2) === '00') {
            $phone = substr($phone, 2);
        }
        if (strlen($phone) === 10 && $phone[0] === '0') {
            $phone = '254' . substr($phone, 1);
        }
        if (strlen($phone) === 9 && $phone[0] === '7') {
            $phone = '254' . $phone;
        }
        return $phone;
    }
}
