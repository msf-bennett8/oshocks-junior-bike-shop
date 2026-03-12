<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackService
{
    protected string $secretKey;
    protected string $publicKey;
    protected string $baseUrl;
    protected string $currency;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
        $this->currency = config('services.paystack.currency', 'KES');
        $this->baseUrl = 'https://api.paystack.co';
    }

    /**
     * Initialize transaction (create payment request)
     */
    public function initializeTransaction(
        string $email,
        float $amount,
        string $reference,
        array $metadata = [],
        ?string $callbackUrl = null
    ): array {
        $payload = [
            'email' => $email,
            'amount' => (int) ($amount * 100), // Paystack uses kobo/cents
            'currency' => $this->currency,
            'reference' => $reference,
            'metadata' => $metadata,
            'callback_url' => $callbackUrl,
        ];

        Log::info('Initializing Paystack transaction', [
            'reference' => $reference,
            'amount' => $amount,
            'email' => $email
        ]);

        $response = Http::withToken($this->secretKey)
            ->post("{$this->baseUrl}/transaction/initialize", $payload);

        if ($response->successful()) {
            $data = $response->json('data');
            Log::info('Paystack transaction initialized', [
                'reference' => $reference,
                'access_code' => $data['access_code'] ?? null
            ]);
            
            return [
                'success' => true,
                'authorization_url' => $data['authorization_url'],
                'access_code' => $data['access_code'],
                'reference' => $data['reference'],
            ];
        }

        Log::error('Paystack initialization failed', [
            'reference' => $reference,
            'response' => $response->json()
        ]);

        return [
            'success' => false,
            'error' => $response->json('message') ?? 'Failed to initialize payment',
        ];
    }

    /**
     * Verify transaction
     */
    public function verifyTransaction(string $reference): array
    {
        Log::info('Verifying Paystack transaction', ['reference' => $reference]);

        $response = Http::withToken($this->secretKey)
            ->get("{$this->baseUrl}/transaction/verify/{$reference}");

        if ($response->successful()) {
            $data = $response->json('data');
            
            return [
                'success' => true,
                'status' => $data['status'], // success, failed, pending
                'amount' => $data['amount'] / 100,
                'currency' => $data['currency'],
                'reference' => $data['reference'],
                'transaction_id' => $data['id'],
                'paid_at' => $data['paid_at'],
                'channel' => $data['channel'], // card, bank, ussd, etc.
                'card_details' => $data['authorization'] ?? null,
                'customer' => $data['customer'],
            ];
        }

        Log::error('Paystack verification failed', [
            'reference' => $reference,
            'response' => $response->json()
        ]);

        return [
            'success' => false,
            'error' => $response->json('message') ?? 'Verification failed',
        ];
    }

    /**
     * Create subaccount (for sellers)
     */
    public function createSubaccount(
        string $businessName,
        string $settlementBank,
        string $accountNumber,
        float $percentageCharge = 90 // Seller gets 90%, platform 10%
    ): array {
        $payload = [
            'business_name' => $businessName,
            'settlement_bank' => $settlementBank,
            'account_number' => $accountNumber,
            'percentage_charge' => $percentageCharge,
        ];

        $response = Http::withToken($this->secretKey)
            ->post("{$this->baseUrl}/subaccount", $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'subaccount_code' => $response->json('data.subaccount_code'),
                'data' => $response->json('data'),
            ];
        }

        return [
            'success' => false,
            'error' => $response->json('message'),
        ];
    }

    /**
     * Initialize split payment (platform + seller)
     */
    public function initializeSplitPayment(
        string $email,
        float $amount,
        string $reference,
        string $subaccountCode,
        float $platformPercentage = 10,
        array $metadata = []
    ): array {
        $payload = [
            'email' => $email,
            'amount' => (int) ($amount * 100),
            'currency' => $this->currency,
            'reference' => $reference,
            'metadata' => $metadata,
            'subaccount' => $subaccountCode,
            'transaction_charge' => (int) (($amount * $platformPercentage / 100) * 100),
            'bearer' => 'subaccount', // Seller bears the transaction fee
        ];

        $response = Http::withToken($this->secretKey)
            ->post("{$this->baseUrl}/transaction/initialize", $payload);

        if ($response->successful()) {
            $data = $response->json('data');
            return [
                'success' => true,
                'authorization_url' => $data['authorization_url'],
                'access_code' => $data['access_code'],
                'reference' => $data['reference'],
            ];
        }

        return [
            'success' => false,
            'error' => $response->json('message'),
        ];
    }

    /**
     * Process refund
     */
    public function refundTransaction(string $transactionId, ?float $amount = null): array
    {
        $payload = ['transaction' => $transactionId];
        
        if ($amount) {
            $payload['amount'] = (int) ($amount * 100);
        }

        $response = Http::withToken($this->secretKey)
            ->post("{$this->baseUrl}/refund", $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json('data'),
            ];
        }

        return [
            'success' => false,
            'error' => $response->json('message'),
        ];
    }

    public function getPublicKey(): string
    {
        return $this->publicKey;
    }
}
