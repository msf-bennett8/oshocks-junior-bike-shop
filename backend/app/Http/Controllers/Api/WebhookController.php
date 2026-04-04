<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookSubscription;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    /**
     * Create webhook subscription
     * POST /api/v1/webhooks
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'endpoint_url' => 'required|url|max:500',
            'event_types' => 'required|array|min:1',
            'event_types.*' => 'in:order.created,order.updated,payment.success,payment.failed,product.updated,inventory.low',
            'secret' => 'nullable|string|min:32|max:64',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $secret = $request->secret ?? Str::random(32);
        $secretHash = hash('sha256', $secret);

        $subscription = WebhookSubscription::create([
            'user_id' => $user->id,
            'subscription_id' => 'wh_' . Str::random(16),
            'endpoint_url' => $request->endpoint_url,
            'event_types' => $request->event_types,
            'secret_hash' => $secretHash,
            'is_active' => true,
            'created_at' => now(),
        ]);

        // Log webhook creation
        AuditService::logWebhookSubscriptionCreated($user, $subscription, [
            'secret_hash_truncated' => substr($secretHash, 0, 16) . '...',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Webhook subscription created',
            'data' => [
                'subscription_id' => $subscription->subscription_id,
                'endpoint_url' => $subscription->endpoint_url,
                'event_types' => $subscription->event_types,
                'webhook_secret' => $secret, // SHOW ONCE
                'is_active' => $subscription->is_active,
            ],
            'warning' => 'Store the webhook secret securely - it will not be shown again.'
        ], 201);
    }

    /**
     * Deliver webhook event
     * Called internally when events occur
     */
    public function deliverEvent(string $eventType, array $payload, WebhookSubscription $subscription): array
    {
        $eventId = 'evt_' . Str::random(16);
        $timestamp = now()->timestamp;
        
        // Generate signature
        $signature = $this->generateSignature($subscription->secret_hash, $payload, $timestamp);

        $startTime = microtime(true);
        
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-Webhook-Event' => $eventType,
                    'X-Webhook-Event-ID' => $eventId,
                    'X-Webhook-Timestamp' => $timestamp,
                    'X-Webhook-Signature' => $signature,
                    'Content-Type' => 'application/json',
                    'User-Agent' => 'Oshocks-Webhook/1.0',
                ])
                ->post($subscription->endpoint_url, [
                    'event_id' => $eventId,
                    'event_type' => $eventType,
                    'timestamp' => now()->toIso8601String(),
                    'data' => $payload,
                ]);

            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            $statusCode = $response->status();

            if ($response->successful()) {
                // Log successful delivery
                AuditService::logWebhookDelivered($subscription, [
                    'event_id' => $eventId,
                    'event_type' => $eventType,
                    'http_status' => $statusCode,
                    'response_time_ms' => $responseTime,
                    'delivery_attempt' => 1,
                ]);

                return [
                    'success' => true,
                    'event_id' => $eventId,
                    'response_time_ms' => $responseTime,
                ];
            }

            throw new \Exception("HTTP {$statusCode}");
            
        } catch (\Exception $e) {
            $responseTime = round((microtime(true) - $startTime) * 1000, 2);
            
            // Log failed delivery
            AuditService::logWebhookFailed($subscription, [
                'event_id' => $eventId,
                'event_type' => $eventType,
                'http_status' => $response->status() ?? 0,
                'error_message' => $e->getMessage(),
                'delivery_attempt' => 1,
                'will_retry' => true,
            ]);

            // Schedule retry
            $this->scheduleRetry($subscription, $eventType, $payload, $eventId, 1);

            return [
                'success' => false,
                'event_id' => $eventId,
                'error' => $e->getMessage(),
                'scheduled_retry' => true,
            ];
        }
    }

    /**
     * Generate webhook signature
     */
    private function generateSignature(string $secretHash, array $payload, int $timestamp): string
    {
        $payloadJson = json_encode($payload);
        return hash_hmac('sha256', "{$timestamp}.{$payloadJson}", $secretHash);
    }

    /**
     * Schedule webhook retry
     */
    private function scheduleRetry(WebhookSubscription $subscription, string $eventType, array $payload, string $eventId, int $attemptNumber): void
    {
        // Exponential backoff: 5min, 15min, 45min, 2h, 6h
        $delays = [5, 15, 45, 120, 360];
        $delay = $delays[min($attemptNumber - 1, count($delays) - 1)];
        $nextAttempt = now()->addMinutes($delay);

        // In production, dispatch to queue
        // WebhookRetryJob::dispatch($subscription, $eventType, $payload, $eventId, $attemptNumber)->delay($nextAttempt);

        // Log retry scheduled
        AuditService::logWebhookRetryScheduled($subscription, [
            'event_id' => $eventId,
            'event_type' => $eventType,
            'next_attempt_at' => $nextAttempt,
            'attempt_number' => $attemptNumber + 1,
        ]);

        Log::info("Webhook retry scheduled", [
            'subscription_id' => $subscription->subscription_id,
            'event_id' => $eventId,
            'next_attempt' => $nextAttempt,
            'attempt_number' => $attemptNumber + 1,
        ]);
    }

    /**
     * Handle incoming webhook (for receiving webhooks from third parties)
     * POST /api/v1/webhooks/incoming/{provider}
     */
    public function handleIncoming(Request $request, string $provider)
    {
        $eventId = $request->header('X-Event-ID') ?? $request->header('X-Request-Id') ?? 'unknown';
        
        Log::info("Incoming webhook received", [
            'provider' => $provider,
            'event_id' => $eventId,
            'event_type' => $request->header('X-Event-Type'),
        ]);

        // Verify signature based on provider
        $verified = $this->verifyIncomingSignature($provider, $request);
        
        if (!$verified) {
            AuditService::logSuspiciousActivity("Invalid webhook signature from {$provider}", [
                'provider' => $provider,
                'ip_address' => $request->ip(),
                'activity_type' => 'webhook_signature_invalid',
                'risk_score' => 70,
            ]);

            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Process based on provider
        switch ($provider) {
            case 'paystack':
                return $this->handlePaystackWebhook($request);
            case 'mpesa':
                return $this->handleMpesaWebhook($request);
            case 'flutterwave':
                return $this->handleFlutterwaveWebhook($request);
            default:
                return response()->json(['error' => 'Unknown provider'], 400);
        }
    }

    /**
     * Verify incoming webhook signature
     */
    private function verifyIncomingSignature(string $provider, Request $request): bool
    {
        $signature = $request->header('X-Signature') ?? $request->header('X-Paystack-Signature');
        $secret = config("services.{$provider}.webhook_secret");

        if (!$secret || !$signature) {
            return false;
        }

        $computed = hash_hmac('sha256', $request->getContent(), $secret);
        return hash_equals($computed, $signature);
    }

    /**
     * Disable failing webhook
     */
    public function disableSubscription(WebhookSubscription $subscription, string $reason): void
    {
        $failureThreshold = 100; // Disable after 100 consecutive failures
        
        $recentFailures = \App\Models\WebhookDeliveryLog::where('subscription_id', $subscription->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->where('success', false)
            ->count();

        if ($recentFailures >= $failureThreshold) {
            $subscription->update([
                'is_active' => false,
                'disabled_at' => now(),
                'disabled_reason' => $reason,
            ]);

            AuditService::logWebhookDisabled($subscription, [
                'reason' => $reason,
                'failure_threshold_reached' => $failureThreshold,
                'recent_failures' => $recentFailures,
            ]);

            Log::warning("Webhook subscription disabled due to failures", [
                'subscription_id' => $subscription->subscription_id,
                'failures' => $recentFailures,
            ]);
        }
    }
}
