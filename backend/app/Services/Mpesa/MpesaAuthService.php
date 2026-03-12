<?php

namespace App\Services\Mpesa;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaAuthService
{
    protected string $consumerKey;
    protected string $consumerSecret;
    protected string $baseUrl;
    protected bool $isProduction;

    public function __construct()
    {
        $this->consumerKey = config('services.mpesa.consumer_key');
        $this->consumerSecret = config('services.mpesa.consumer_secret');
        $this->isProduction = config('services.mpesa.env', 'sandbox') === 'production';
        $this->baseUrl = $this->isProduction 
            ? 'https://api.safaricom.co.ke' 
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Get OAuth access token (cached for 50 minutes)
     */
    public function getAccessToken(): string
    {
        $cacheKey = 'mpesa_access_token_' . ($this->isProduction ? 'prod' : 'sandbox');

        return Cache::remember($cacheKey, 3000, function () {
            $credentials = base64_encode("{$this->consumerKey}:{$this->consumerSecret}");
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $credentials,
            ])->get("{$this->baseUrl}/oauth/v1/generate", [
                'grant_type' => 'client_credentials'
            ]);

            if ($response->successful()) {
                Log::info('M-Pesa access token generated successfully');
                return $response->json('access_token');
            }

            Log::error('M-Pesa auth failed', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);
            
            throw new \Exception('Failed to get M-Pesa access token: ' . $response->body());
        });
    }

    /**
     * Clear cached token (useful for testing)
     */
    public function clearToken(): void
    {
        $cacheKey = 'mpesa_access_token_' . ($this->isProduction ? 'prod' : 'sandbox');
        Cache::forget($cacheKey);
    }
}
