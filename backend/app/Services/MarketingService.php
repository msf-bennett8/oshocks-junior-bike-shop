<?php

namespace App\Services;

use App\Models\MarketingCampaign;
use App\Models\MarketingCampaignLog;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MarketingService
{
    /**
     * Create new marketing campaign
     */
    public static function createCampaign(array $data, User $creator): MarketingCampaign
    {
        $campaign = MarketingCampaign::create([
            'campaign_id' => 'cmp_' . Str::random(16),
            'name' => $data['name'],
            'type' => $data['type'] ?? 'email',
            'status' => 'draft',
            'template_id' => $data['template_id'] ?? null,
            'subject' => $data['subject'] ?? null,
            'content' => $data['content'] ?? null,
            'audience_segment' => $data['audience_segment'] ?? [],
            'audience_count' => $data['audience_count'] ?? 0,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'ip_warmup' => $data['ip_warmup'] ?? false,
            'created_by' => $creator->id,
        ]);

        // Log campaign creation
        AuditService::log([
            'event_type' => 'CAMPAIGN_CREATED',
            'event_category' => 'marketing',
            'actor_type' => 'USER',
            'user_id' => $creator->id,
            'action' => 'created',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign->campaign_id,
            'description' => "Marketing campaign created: {$campaign->name}",
            'severity' => 'low',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $campaign->campaign_id,
                'campaign_type' => $campaign->type,
                'audience_count' => $campaign->audience_count,
                'ip_warmup' => $campaign->ip_warmup,
            ],
        ]);

        return $campaign;
    }

    /**
     * Send marketing email with full tracking
     */
    public static function sendMarketingEmail(MarketingCampaign $campaign, User $recipient, array $content): array
    {
        $messageId = 'msg_' . Str::random(16);
        
        try {
            // Check if user has unsubscribed from marketing emails
            if (self::isUnsubscribed($recipient, 'marketing')) {
                return ['success' => false, 'error' => 'unsubscribed', 'skipped' => true];
            }

            // Build tracking URLs
            $openPixelUrl = url("/api/v1/marketing/pixel/{$campaign->campaign_id}/{$recipient->id}/{$messageId}");
            $clickBaseUrl = url("/api/v1/marketing/click/{$campaign->campaign_id}/{$recipient->id}/{$messageId}");

            // Replace links in content with tracking URLs
            $trackedContent = self::injectTrackingLinks($content['html'] ?? '', $clickBaseUrl, $campaign->campaign_id, $recipient->id);

            // Send via configured provider (Postmark/Resend/SES)
            $result = self::sendViaProvider($recipient->email, $content['subject'], $trackedContent, $openPixelUrl, $campaign->ip_warmup);

            if ($result['success']) {
                // Log email sent
                AuditService::logMarketingEmailSent($campaign, $recipient, [
                    'campaign_id' => $campaign->campaign_id,
                    'message_id' => $messageId,
                    'template_id' => $campaign->template_id,
                    'sent_at' => now(),
                    'ip_warmup' => $campaign->ip_warmup,
                ]);

                // Update campaign stats
                $campaign->increment('sent_count');

                // Create campaign log
                MarketingCampaignLog::create([
                    'campaign_id' => $campaign->id,
                    'user_id' => $recipient->id,
                    'event_type' => 'sent',
                    'channel' => 'email',
                    'message_id' => $messageId,
                    'occurred_at' => now(),
                ]);

                return [
                    'success' => true,
                    'message_id' => $messageId,
                    'provider_message_id' => $result['provider_message_id'],
                ];
            }

            throw new \Exception($result['error'] ?? 'Send failed');

        } catch (\Exception $e) {
            Log::error('Marketing email failed', [
                'campaign_id' => $campaign->campaign_id,
                'recipient_id' => $recipient->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message_id' => $messageId,
            ];
        }
    }

    /**
     * Track email delivery (webhook from provider)
     */
    public static function trackDelivery(string $campaignId, string $userId, string $messageId, array $providerData): void
    {
        $campaign = MarketingCampaign::where('campaign_id', $campaignId)->first();
        $user = User::find($userId);

        if (!$campaign || !$user) return;

        // Log delivery
        AuditService::logMarketingEmailDelivered($campaign, $user, [
            'campaign_id' => $campaignId,
            'message_id' => $messageId,
            'delivered_at' => now(),
            'provider' => $providerData['provider'] ?? 'unknown',
        ]);

        // Update stats
        $campaign->increment('delivered_count');

        // Create log
        MarketingCampaignLog::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'event_type' => 'delivered',
            'channel' => 'email',
            'message_id' => $messageId,
            'metadata' => $providerData,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Track email open (from pixel)
     */
    public static function trackOpen(string $campaignId, string $userId, string $messageId, string $ipAddress, string $userAgent): void
    {
        $campaign = MarketingCampaign::where('campaign_id', $campaignId)->first();
        $user = User::find($userId);

        if (!$campaign || !$user) return;

        // Prevent duplicate opens within 1 hour
        $cacheKey = "marketing_open:{$messageId}";
        if (\Cache::has($cacheKey)) return;
        \Cache::put($cacheKey, true, 3600);

        // Get open count for this user
        $openCount = MarketingCampaignLog::where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->where('event_type', 'opened')
            ->count() + 1;

        // Log open
        AuditService::logMarketingEmailOpened($campaign, $user, [
            'campaign_id' => $campaignId,
            'message_id' => $messageId,
            'opened_at' => now(),
            'ip_address' => $ipAddress,
            'user_agent' => substr($userAgent, 0, 500),
            'open_count' => $openCount,
        ]);

        // Update stats only for first open
        if ($openCount === 1) {
            $campaign->increment('opened_count');
        }

        // Create log
        MarketingCampaignLog::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'event_type' => 'opened',
            'channel' => 'email',
            'message_id' => $messageId,
            'ip_address' => $ipAddress,
            'user_agent' => substr($userAgent, 0, 500),
            'occurred_at' => now(),
        ]);
    }

    /**
     * Track email click
     */
    public static function trackClick(string $campaignId, string $userId, string $messageId, string $url, string $ipAddress): string
    {
        $campaign = MarketingCampaign::where('campaign_id', $campaignId)->first();
        $user = User::find($userId);

        if (!$campaign || !$user) {
            return $url; // Redirect to original URL even if tracking fails
        }

        // Get click count
        $clickCount = MarketingCampaignLog::where('campaign_id', $campaign->id)
            ->where('user_id', $user->id)
            ->where('event_type', 'clicked')
            ->count() + 1;

        // Log click
        AuditService::logMarketingEmailClicked($campaign, $user, [
            'campaign_id' => $campaignId,
            'message_id' => $messageId,
            'clicked_url' => $url,
            'clicked_at' => now(),
            'click_count' => $clickCount,
        ]);

        // Update stats only for first click
        if ($clickCount === 1) {
            $campaign->increment('clicked_count');
        }

        // Create log
        MarketingCampaignLog::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'event_type' => 'clicked',
            'channel' => 'email',
            'message_id' => $messageId,
            'link_url' => $url,
            'ip_address' => $ipAddress,
            'occurred_at' => now(),
        ]);

        return $url;
    }

    /**
     * Track bounce (webhook from provider)
     */
    public static function trackBounce(string $campaignId, string $userId, string $messageId, string $bounceType, string $reason): void
    {
        $campaign = MarketingCampaign::where('campaign_id', $campaignId)->first();
        $user = User::find($userId);

        if (!$campaign || !$user) return;

        // Log bounce
        AuditService::logMarketingEmailBounced($campaign, $user, [
            'campaign_id' => $campaignId,
            'message_id' => $messageId,
            'bounce_type' => $bounceType, // hard, soft
            'bounce_reason' => $reason,
            'timestamp' => now(),
            'list_cleaned' => $bounceType === 'hard', // Hard bounces auto-remove
        ]);

        // Update stats
        $campaign->increment('bounced_count');

        // Hard bounce: mark email as invalid
        if ($bounceType === 'hard') {
            $user->update(['email_valid' => false]);
        }

        // Create log
        MarketingCampaignLog::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'event_type' => 'bounced',
            'channel' => 'email',
            'message_id' => $messageId,
            'bounce_reason' => $reason,
            'metadata' => ['bounce_type' => $bounceType],
            'occurred_at' => now(),
        ]);
    }

    /**
     * Track complaint/spam report
     */
    public static function trackComplaint(string $campaignId, string $userId, string $messageId, string $complaintType): void
    {
        $campaign = MarketingCampaign::where('campaign_id', $campaignId)->first();
        $user = User::find($userId);

        if (!$campaign || !$user) return;

        // Log complaint
        AuditService::logMarketingEmailComplained($campaign, $user, [
            'campaign_id' => $campaignId,
            'message_id' => $messageId,
            'complaint_type' => $complaintType, // spam, abuse
            'timestamp' => now(),
            'user_unsubscribed' => true, // Auto-unsubscribe on complaint
        ]);

        // Update stats
        $campaign->increment('complained_count');

        // Auto-unsubscribe user
        self::unsubscribe($user, 'marketing', 'complaint');

        // Create log
        MarketingCampaignLog::create([
            'campaign_id' => $campaign->id,
            'user_id' => $user->id,
            'event_type' => 'complained',
            'channel' => 'email',
            'message_id' => $messageId,
            'complaint_type' => $complaintType,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Process unsubscribe request
     */
    public static function unsubscribe(User $user, string $type, string $method = 'link'): bool
    {
        // Store unsubscribe preference
        \Cache::put("user:{$user->id}:unsubscribed:{$type}", true, now()->addYears(10));

        // Find recent campaigns to attribute unsubscribe
        $recentCampaign = MarketingCampaign::where('status', 'completed')
            ->where('completed_at', '>=', now()->subDays(7))
            ->latest()
            ->first();

        // Log unsubscribe
        AuditService::logMarketingEmailUnsubscribed($recentCampaign, $user, [
            'campaign_id' => $recentCampaign?->campaign_id,
            'user_id' => $user->id,
            'unsubscribe_method' => $method, // link, preference_center
            'timestamp' => now(),
            'reason' => $method === 'complaint' ? 'spam_complaint' : null,
        ]);

        // Update campaign stats if attributed
        if ($recentCampaign) {
            $recentCampaign->increment('unsubscribed_count');
        }

        return true;
    }

    /**
     * Check if user is unsubscribed
     */
    public static function isUnsubscribed(User $user, string $type): bool
    {
        return \Cache::get("user:{$user->id}:unsubscribed:{$type}", false);
    }

    /**
     * Send SMS via Africa's Talking (placeholder)
     */
    public static function sendSms(User $recipient, string $message, string $senderId = 'OSHCKS'): array
    {
        try {
            // Would integrate with Africa's Talking
            // $at = new AfricasTalking(env('AT_USERNAME'), env('AT_API_KEY'));
            // $sms = $at->sms();
            // $result = $sms->send([
            //     'to' => $recipient->phone,
            //     'message' => $message,
            //     'from' => $senderId,
            // ]);

            Log::info('SMS would be sent', [
                'to' => $recipient->phone,
                'message' => $message,
            ]);

            // Log SMS delivered
            AuditService::logSmsDelivered($recipient, [
                'phone_hash' => hash('sha256', $recipient->phone),
                'message_type' => 'marketing',
                'carrier' => 'unknown', // Would get from provider
                'message_id' => 'sms_' . Str::random(8),
                'delivered_at' => now(),
            ]);

            return ['success' => true, 'message_id' => 'sms_' . Str::random(8)];

        } catch (\Exception $e) {
            // Log SMS failed
            AuditService::logSmsFailed($recipient, [
                'phone_hash' => hash('sha256', $recipient->phone),
                'message_type' => 'marketing',
                'error_code' => 'SMS_ERROR',
                'error_message' => $e->getMessage(),
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send push notification via Firebase (placeholder)
     */
    public static function sendPush(User $recipient, string $title, string $body, array $data = []): array
    {
        try {
            // Would integrate with Firebase Cloud Messaging
            // $fcm = new FCM();
            // $result = $fcm->send($recipient->fcm_token, $title, $body, $data);

            Log::info('Push notification would be sent', [
                'to' => $recipient->id,
                'title' => $title,
            ]);

            // Log push sent
            AuditService::logPushNotificationSent($recipient, [
                'device_token_hash' => hash('sha256', $recipient->fcm_token ?? 'unknown'),
                'payload_size' => strlen(json_encode($data)),
            ]);

            // Log push delivered (assumed immediate)
            AuditService::logPushNotificationDelivered($recipient, [
                'device_token_hash' => hash('sha256', $recipient->fcm_token ?? 'unknown'),
                'delivered_at' => now(),
            ]);

            return ['success' => true];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Complete campaign and log
     */
    public static function completeCampaign(MarketingCampaign $campaign): void
    {
        $campaign->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Log campaign completion
        AuditService::log([
            'event_type' => 'CAMPAIGN_COMPLETED',
            'event_category' => 'marketing',
            'actor_type' => 'SYSTEM',
            'action' => 'completed',
            'model_type' => 'MarketingCampaign',
            'model_id' => $campaign->campaign_id,
            'description' => "Campaign completed: {$campaign->name}",
            'severity' => 'low',
            'tier' => 'TIER_3_ANALYTICS',
            'metadata' => [
                'campaign_id' => $campaign->campaign_id,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'opened_count' => $campaign->opened_count,
                'clicked_count' => $campaign->clicked_count,
                'bounced_count' => $campaign->bounced_count,
                'complained_count' => $campaign->complained_count,
                'unsubscribed_count' => $campaign->unsubscribed_count,
            ],
        ]);
    }

    /**
     * Send via configured email provider
     */
    private static function sendViaProvider(string $to, string $subject, string $html, string $openPixelUrl, bool $ipWarmup): array
    {
        $provider = config('mail.default', 'log');

        // Inject open pixel
        $html .= '<img src="' . $openPixelUrl . '" width="1" height="1" alt="" />';

        try {
            switch ($provider) {
                case 'postmark':
                    return self::sendViaPostmark($to, $subject, $html);
                
                case 'resend':
                    return self::sendViaResend($to, $subject, $html);
                
                case 'ses':
                    return self::sendViaSes($to, $subject, $html);
                
                case 'log':
                default:
                    \Log::info('Marketing email logged', ['to' => $to, 'subject' => $subject]);
                    return ['success' => true, 'provider_message_id' => 'log_' . Str::random(8)];
            }
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send via Postmark
     */
    private static function sendViaPostmark(string $to, string $subject, string $html): array
    {
        $response = Http::withHeaders([
            'X-Postmark-Server-Token' => config('services.postmark.token'),
            'Accept' => 'application/json',
        ])->post('https://api.postmarkapp.com/email', [
            'From' => config('mail.from.address'),
            'To' => $to,
            'Subject' => $subject,
            'HtmlBody' => $html,
            'TrackOpens' => true,
            'TrackLinks' => 'HtmlAndText',
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'provider_message_id' => $response->json('MessageID'),
            ];
        }

        return ['success' => false, 'error' => $response->body()];
    }

    /**
     * Send via Resend
     */
    private static function sendViaResend(string $to, string $subject, string $html): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.resend.key'),
        ])->post('https://api.resend.com/emails', [
            'from' => config('mail.from.address'),
            'to' => $to,
            'subject' => $subject,
            'html' => $html,
        ]);

        if ($response->successful()) {
            return [
                'success' => true,
                'provider_message_id' => $response->json('id'),
            ];
        }

        return ['success' => false, 'error' => $response->body()];
    }

    /**
     * Send via AWS SES
     */
    private static function sendViaSes(string $to, string $subject, string $html): array
    {
        // Would use AWS SDK
        return ['success' => true, 'provider_message_id' => 'ses_' . Str::random(8)];
    }

    /**
     * Inject tracking links into HTML content
     */
    private static function injectTrackingLinks(string $html, string $baseUrl, string $campaignId, string $userId): string
    {
        // Replace all href links with tracking URLs
        $pattern = '/href=["\']([^"\']+)["\']/i';
        
        $html = preg_replace_callback($pattern, function($matches) use ($baseUrl, $campaignId, $userId) {
            $originalUrl = $matches[1];
            $encodedUrl = urlencode($originalUrl);
            $trackingUrl = $baseUrl . '?redirect=' . $encodedUrl;
            
            return 'href="' . $trackingUrl . '"';
        }, $html);

        return $html;
    }
}
