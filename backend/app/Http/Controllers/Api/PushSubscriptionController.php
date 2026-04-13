<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushSubscriptionController extends Controller
{
    /**
     * Store a new push subscription
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'keys.p256dh' => 'required|string|max:255',
            'keys.auth' => 'required|string|max:255',
            'device_info' => 'nullable|array',
        ]);

        $user = $request->user();

        // Check if subscription already exists
        $existing = PushSubscription::where('endpoint', $validated['endpoint'])->first();

        if ($existing) {
            // Update existing
            $existing->update([
                'p256dh' => $validated['keys']['p256dh'],
                'auth' => $validated['keys']['auth'],
                'device_info' => $validated['device_info'] ?? null,
                'last_used_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription updated',
                'id' => $existing->id,
            ]);
        }

        // Create new subscription
        $subscription = PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $validated['endpoint'],
            'p256dh' => $validated['keys']['p256dh'],
            'auth' => $validated['keys']['auth'],
            'device_info' => array_merge(
                $validated['device_info'] ?? [],
                [
                    'user_agent' => $request->userAgent(),
                    'ip' => $request->ip(),
                ]
            ),
            'last_used_at' => now(),
        ]);

        // Log for audit
        \App\Services\AuditService::logUserAction($user, 'push_subscription_created', [
            'subscription_id' => $subscription->id,
            'endpoint_hash' => substr(md5($validated['endpoint']), 0, 8),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription created',
            'id' => $subscription->id,
        ], 201);
    }

    /**
     * Delete a push subscription
     */
    public function destroy($id)
    {
        $user = auth()->user();
        
        $subscription = PushSubscription::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription not found',
            ], 404);
        }

        $endpointHash = substr(md5($subscription->endpoint), 0, 8);
        $subscription->delete();

        \App\Services\AuditService::logUserAction($user, 'push_subscription_deleted', [
            'subscription_id' => $id,
            'endpoint_hash' => $endpointHash,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription deleted',
        ]);
    }

    /**
     * Send test push notification
     */
    public function test(Request $request)
    {
        $user = $request->user();
        
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();

        if ($subscriptions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No push subscriptions found',
            ], 404);
        }

        $payload = json_encode([
            'title' => '🔔 Test Notification',
            'body' => 'Push notifications are working! You\'ll receive updates here.',
            'icon' => '/icon-192x192.png',
            'badge' => '/badge-72x72.png',
            'tag' => 'test-' . time(),
            'requireInteraction' => false,
            'actions' => [
                ['action' => 'view', 'title' => 'Open App'],
                ['action' => 'dismiss', 'title' => 'Dismiss'],
            ],
            'data' => [
                'url' => '/notifications',
                'type' => 'test',
            ],
        ]);

        $auth = [
            'VAPID' => [
                'subject' => config('webpush.vapid.subject'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ];

        $webPush = new WebPush($auth);
        $sent = 0;
        $failed = 0;

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification(
                new Subscription(
                    $subscription->endpoint,
                    $subscription->p256dh,
                    $subscription->auth
                ),
                $payload
            );
        }

        $results = $webPush->flush();

        foreach ($results as $report) {
            if ($report->isSuccess()) {
                $sent++;
            } else {
                $failed++;
                // Remove expired subscriptions
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $report->getEndpoint())->delete();
                }
            }
        }

        return response()->json([
            'success' => $sent > 0,
            'message' => "Test notification sent: {$sent} succeeded, {$failed} failed",
            'sent' => $sent,
            'failed' => $failed,
        ]);
    }

    /**
     * Get user's subscriptions
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $subscriptions = PushSubscription::where('user_id', $user->id)
            ->select('id', 'device_info', 'last_used_at', 'created_at')
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'device' => $sub->device_info['platform'] ?? $sub->device_info['browser'] ?? 'Unknown',
                    'browser' => $sub->device_info['browser'] ?? null,
                    'platform' => $sub->device_info['platform'] ?? null,
                    'last_used' => $sub->last_used_at,
                    'created_at' => $sub->created_at,
                ];
            });

        return response()->json([
            'subscriptions' => $subscriptions,
        ]);
    }
}
