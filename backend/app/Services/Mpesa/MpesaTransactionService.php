<?php

namespace App\Services\Mpesa;

use Illuminate\Support\Facades\Http;

class MpesaTransactionService
{
    protected MpesaAuthService $authService;
    protected string $baseUrl;
    protected bool $isProduction;

    public function __construct(MpesaAuthService $authService)
    {
        $this->authService = $authService;
        $this->isProduction = config('services.mpesa.env', 'sandbox') === 'production';
        $this->baseUrl = $this->isProduction 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Query transaction status using M-Pesa transaction ID
     */
    public function queryTransaction(
        string $transactionId,
        string $shortcode,
        string $identifierType = '4' // 4 for Shortcode
    ): array {
        $payload = [
            'Initiator' => config('services.mpesa.initiator_name'),
            'SecurityCredential' => config('services.mpesa.security_credential'),
            'CommandID' => 'TransactionStatusQuery',
            'TransactionID' => $transactionId,
            'PartyA' => $shortcode,
            'IdentifierType' => $identifierType,
            'ResultURL' => config('services.mpesa.transaction_status_result_url'),
            'QueueTimeOutURL' => config('services.mpesa.transaction_status_timeout_url'),
            'Remarks' => 'Transaction status query',
            'Occasion' => 'Query',
        ];

        $response = Http::withToken($this->authService->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/transactionstatus/v1/query", $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()
        ];
    }

    /**
     * Get account balance
     */
    public function getAccountBalance(string $shortcode): array
    {
        $payload = [
            'Initiator' => config('services.mpesa.initiator_name'),
            'SecurityCredential' => config('services.mpesa.security_credential'),
            'CommandID' => 'AccountBalance',
            'PartyA' => $shortcode,
            'IdentifierType' => '4',
            'Remarks' => 'Balance query',
            'QueueTimeOutURL' => config('services.mpesa.balance_timeout_url'),
            'ResultURL' => config('services.mpesa.balance_result_url'),
        ];

        $response = Http::withToken($this->authService->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/accountbalance/v1/query", $payload);

        if ($response->successful()) {
            return [
                'success' => true,
                'data' => $response->json()
            ];
        }

        return [
            'success' => false,
            'error' => $response->json()
        ];
    }
}
