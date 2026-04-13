<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationSetting;
use App\Models\PushSubscription;
use App\Models\User;
use App\Jobs\SendNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Create and send notification with full audit trail
     */
    public static function send(User $user, string $type, string $title, string $message, array $data = [], string $channel = 'in_app'): array
    {
        $notificationId = 'ntf_' . Str::random(16);
        
        // 1. Create notification record
        $notification = Notification::create([
            'notification_id' => $notificationId,
            'user_id' => $user->id,
            'type' => $type,
            'channel' => $channel,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'metadata' => $data['metadata'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'action_url' => $data['action_url'] ?? null,
            'action_text' => $data['action_text'] ?? null,
            'icon_type' => $data['icon_type'] ?? null,
            'icon_color' => $data['icon_color'] ?? null,
            'icon_gradient' => $data['icon_gradient'] ?? null,
            'is_pinned' => $data['is_pinned'] ?? false,
            'actions' => $data['actions'] ?? null,
            'audit_log' => $data['audit_log'] ?? null,
            'template_id' => $data['template_id'] ?? null,
            'scheduled_for' => $data['scheduled_for'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'delivery_status' => 'pending',
        ]);

        // 2. Log notification creation
        AuditService::logNotificationCreated($user, [
            'notification_id' => $notificationId,
            'type' => $type,
            'channel' => $channel,
            'template_id' => $data['template_id'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'scheduled_for' => $data['scheduled_for'] ?? null,
        ]);

        // 3. Send based on channel
        $result = match($channel) {
            'email' => self::sendEmail($user, $notification, $data),
            'sms' => self::sendSms($user, $notification, $data),
            'push' => self::sendPush($user, $notification, $data),
            'in-app' => ['success' => true, 'provider_message_id' => 'in-app'],
            default => ['success' => false, 'error' => 'Unknown channel'],
        };

        // 4. Log delivery attempt
        if ($result['success']) {
            AuditService::logNotificationSent($user, [
                'notification_id' => $notificationId,
                'channel' => $channel,
                'provider_message_id' => $result['provider_message_id'] ?? null,
                'delivery_status' => 'sent',
            ]);

            // Update notification with sent status
            $notification->update([
                'sent_at' => now(),
                'provider_message_id' => $result['provider_message_id'] ?? null,
                'delivery_status' => 'sent',
            ]);
        } else {
            AuditService::logNotificationFailed($user, [
                'notification_id' => $notificationId,
                'channel' => $channel,
                'error_message' => $result['error'] ?? 'Unknown error',
                'will_retry' => $result['retryable'] ?? true,
            ]);
        }

        return [
            'success' => $result['success'],
            'notification_id' => $notificationId,
            'channel' => $channel,
            'notification' => $notification,
        ];
    }

    /**
     * Create a notification record (used by AuditNotificationService)
     */
    public static function createNotification(
        User $user, 
        string $type, 
        string $title, 
        string $message, 
        array $data = []
    ): Notification
    {
        $notificationId = 'ntf_' . Str::random(16);
        
        return Notification::create([
            'notification_id' => $notificationId,
            'user_id' => $user->id,
            'type' => $type,
            'channel' => $data['channel'] ?? 'in_app',
            'title' => $title,
            'message' => $message,
            'data' => $data['data'] ?? [],
            'metadata' => $data['metadata'] ?? null,
            'priority' => $data['priority'] ?? 'normal',
            'action_url' => $data['action_url'] ?? null,
            'action_text' => $data['action_text'] ?? null,
            'icon_type' => $data['icon_type'] ?? null,
            'icon_color' => $data['icon_color'] ?? null,
            'icon_gradient' => $data['icon_gradient'] ?? null,
            'is_pinned' => $data['is_pinned'] ?? false,
            'actions' => $data['actions'] ?? null,
            'audit_log' => $data['audit_log'] ?? null,
            'template_id' => $data['template_id'] ?? null,
            'scheduled_for' => $data['scheduled_for'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'delivery_status' => $data['delivery_status'] ?? 'pending',
        ]);
    }

    /**
     * Send notification using template
     */
    public static function sendFromTemplate(User $user, string $templateKey, array $variables = [], string $channel = 'in_app', array $overrides = []): array
    {
        $template = config("notifications.templates.{$templateKey}");
        
        if (!$template) {
            Log::error("Notification template not found: {$templateKey}");
            return ['success' => false, 'error' => 'Template not found'];
        }

        // Apply variable substitution
        $title = self::parseTemplate($template['title'], $variables);
        $message = self::parseTemplate($template['message'], $variables);
        
        // Build data array from template
        $data = [
            'priority' => $overrides['priority'] ?? $template['priority'] ?? 'normal',
            'icon_type' => $overrides['icon_type'] ?? $template['icon_type'] ?? null,
            'icon_color' => $overrides['icon_color'] ?? $template['icon_color'] ?? null,
            'action_url' => $overrides['action_url'] ?? self::parseTemplate($template['action_url'] ?? '', $variables),
            'action_text' => $overrides['action_text'] ?? $template['action_text'] ?? null,
            'template_id' => $templateKey,
            'metadata' => $variables,
        ];

        // Send to all configured channels or specified channel
        $channels = $channel === 'all' ? ($template['channels'] ?? ['in_app']) : [$channel];
        $results = [];

        foreach ($channels as $ch) {
            // Check user preferences
            $settings = $user->notificationSettings;
            if ($settings && !$settings->shouldSendToTemplate($templateKey, $ch)) {
                continue;
            }

            $results[] = self::send($user, $templateKey, $title, $message, $data, $ch);
        }

        return [
            'success' => collect($results)->contains('success', true),
            'results' => $results,
        ];
    }

    /**
     * Queue notification for async sending
     */
    public static function queueNotification(User $user, string $type, array $data = [], string $channel = 'in_app', ?string $template = null, ?int $delayMinutes = null): void
    {
        $job = new SendNotification($user, $type, $data, $channel, $template);
        
        if ($delayMinutes) {
            $job->delay(now()->addMinutes($delayMinutes));
        }
        
        dispatch($job);
    }

    /**
     * Send to multiple users (bulk)
     */
    public static function sendBulk(array $userIds, string $type, array $data = [], string $channel = 'in_app', ?string $template = null): array
    {
        $results = ['sent' => 0, 'failed' => 0, 'skipped' => 0];
        
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            
            if (!$user) {
                $results['failed']++;
                continue;
            }

            // Check if should send
            if (!self::shouldSend($user, $type, $channel)) {
                $results['skipped']++;
                continue;
            }

            try {
                if ($template) {
                    self::queueNotification($user, $type, $data, $channel, $template);
                } else {
                    self::queueNotification($user, $type, $data, $channel);
                }
                $results['sent']++;
            } catch (\Exception $e) {
                $results['failed']++;
                Log::error("Bulk notification failed for user {$userId}", ['error' => $e->getMessage()]);
            }
        }

        return $results;
    }

    /**
     * Notify admins by role
     */
    public static function notifyAdmins(string $role, string $type, array $data = [], string $channel = 'in_app'): array
    {
        $admins = User::where('role', $role)
            ->orWhereJsonContains('additional_roles', $role)
            ->get();

        $results = [];
        foreach ($admins as $admin) {
            $results[] = self::queueNotification($admin, $type, $data, $channel);
        }

        return ['notified' => count($results)];
    }

    /**
     * Notify super admins (for audit/security alerts)
     */
    public static function notifySuperAdmins(string $type, array $data = [], string $channel = 'in_app'): array
    {
        return self::notifyAdmins('super_admin', $type, $data, $channel);
    }

        /**
     * Check if notification should be sent based on rate limits and preferences
     * Phase 9: Enhanced rate limiting with tiered limits
     */
    public static function shouldSend(User $user, string $type, string $channel): bool
    {
        // Skip rate limiting for critical/urgent notifications
        if (in_array($type, ['security_alert', 'audit_alert', 'urgent_system_alert'])) {
            return self::checkUserPreferences($user, $type, $channel);
        }

        $limits = config('notifications.rate_limits', [
            'max_per_day' => 100,
            'max_push_per_hour' => 10,
            'max_sms_per_day' => 5,
            'max_email_per_hour' => 20,
            'burst_limit' => 5, // Max in 1 minute
        ]);

        // Daily limit check
        $dailyKey = "notification_daily:{$user->id}:{$channel}";
        $dailyCount = Cache::get($dailyKey, 0);
        
        $dailyMax = match($channel) {
            'push' => min($limits['max_push_per_hour'] * 24, $limits['max_per_day']),
            'sms' => $limits['max_sms_per_day'],
            'email' => $limits['max_email_per_hour'] * 24,
            default => $limits['max_per_day'],
        };

        if ($dailyCount >= $dailyMax) {
            Log::warning("Daily rate limit exceeded", [
                'user_id' => $user->id,
                'channel' => $channel,
                'limit' => $dailyMax,
            ]);
            return false;
        }

        // Hourly limit for push/email
        if (in_array($channel, ['push', 'email'])) {
            $hourlyKey = "notification_hourly:{$user->id}:{$channel}";
            $hourlyCount = Cache::get($hourlyKey, 0);
            $hourlyMax = $channel === 'push' ? $limits['max_push_per_hour'] : $limits['max_email_per_hour'];

            if ($hourlyCount >= $hourlyMax) {
                Log::warning("Hourly rate limit exceeded", [
                    'user_id' => $user->id,
                    'channel' => $channel,
                    'limit' => $hourlyMax,
                ]);
                return false;
            }
            
            Cache::put($hourlyKey, $hourlyCount + 1, 3600); // 1 hour
        }

        // Burst limit (per minute)
        $burstKey = "notification_burst:{$user->id}";
        $burstCount = Cache::get($burstKey, 0);
        if ($burstCount >= $limits['burst_limit']) {
            Log::warning("Burst rate limit exceeded", ['user_id' => $user->id]);
            return false;
        }
        Cache::put($burstKey, $burstCount + 1, 60); // 1 minute

        // Increment daily counter
        Cache::put($dailyKey, $dailyCount + 1, 86400); // 24 hours

        return self::checkUserPreferences($user, $type, $channel);
    }

    /**
     * Check user preferences (extracted from shouldSend)
     */
    private static function checkUserPreferences(User $user, string $type, string $channel): bool
    {
        $settings = $user->notificationSettings;
        if ($settings) {
            return $settings->shouldSendToChannel($type, $channel);
        }
        return true;
    }

    /**
     * Parse template with variable substitution
     */
    private static function parseTemplate(string $template, array $variables): string
    {
        return preg_replace_callback('/\{\{([^}]+)\}\}/', function($matches) use ($variables) {
            $key = trim($matches[1]);
            $parts = explode('.', $key);
            
            $value = $variables;
            foreach ($parts as $part) {
                if (is_array($value) && isset($value[$part])) {
                    $value = $value[$part];
                } elseif (is_object($value) && isset($value->{$part})) {
                    $value = $value->{$part};
                } else {
                    return $matches[0]; // Return original if not found
                }
            }
            
            return is_string($value) || is_numeric($value) ? $value : $matches[0];
        }, $template);
    }

    /**
     * Send email notification
     */
    private static function sendEmail(User $user, Notification $notification, array $data): array
    {
        try {
            // Check quiet hours
            if (self::isQuietHours($user)) {
                $notification->update(['scheduled_for' => self::getQuietHoursEnd($user)]);
                
                return [
                    'success' => true,
                    'provider_message_id' => 'scheduled_quiet_hours',
                    'delayed' => true,
                ];
            }

            $mailData = [
                'title' => $notification->title,
                'message' => $notification->message,
                'action_url' => $data['action_url'] ?? null,
                'action_text' => $data['action_text'] ?? null,
                'notification' => $notification,
            ];

            Mail::to($user->email)->send(new \App\Mail\NotificationMail($mailData));

            return [
                'success' => true,
                'provider_message_id' => 'mail_' . Str::random(8),
            ];

        } catch (\Exception $e) {
            Log::error('Email notification failed', [
                'user_id' => $user->id,
                'notification_id' => $notification->notification_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'retryable' => true,
            ];
        }
    }

    /**
     * Send SMS notification (placeholder for Africa's Talking/Twilio)
     */
    private static function sendSms(User $user, Notification $notification, array $data): array
    {
        Log::info('SMS notification would be sent', [
            'user_id' => $user->id,
            'phone' => $user->phone,
            'message' => $notification->message,
        ]);

        return [
            'success' => true,
            'provider_message_id' => 'sms_' . Str::random(8),
        ];
    }

    /**
     * Send push notification via WebPush
     */
    private static function sendPush(User $user, Notification $notification, array $data): array
    {
        try {
            $subscriptions = PushSubscription::where('user_id', $user->id)->get();
            
            if ($subscriptions->isEmpty()) {
                return [
                    'success' => false,
                    'error' => 'No push subscriptions found',
                    'retryable' => false,
                ];
            }

            $payload = json_encode([
                'title' => $notification->title,
                'body' => $notification->message,
                'icon' => '/icon-192x192.png',
                'badge' => '/badge-72x72.png',
                'tag' => $notification->notification_id,
                'requireInteraction' => ($data['priority'] ?? 'normal') === 'urgent',
                'actions' => [
                    ['action' => 'view', 'title' => $data['action_text'] ?? 'View'],
                    ['action' => 'dismiss', 'title' => 'Dismiss'],
                ],
                'data' => [
                    'url' => $data['action_url'] ?? '/notifications',
                    'notification_id' => $notification->notification_id,
                ],
            ]);

            $auth = [
                'VAPID' => [
                    'subject' => config('webpush.vapid.subject', 'mailto:admin@oshocks.com'),
                    'publicKey' => config('webpush.vapid.public_key'),
                    'privateKey' => config('webpush.vapid.private_key'),
                ],
            ];

            $webPush = new \Minishlink\WebPush\WebPush($auth);
            
            foreach ($subscriptions as $subscription) {
                $webPush->queueNotification(
                    new \Minishlink\WebPush\Subscription(
                        $subscription->endpoint,
                        $subscription->p256dh,
                        $subscription->auth
                    ),
                    $payload
                );
            }

            // Flush and check results
            $results = $webPush->flush();
            $success = false;
            
            foreach ($results as $report) {
                if ($report->isSuccess()) {
                    $success = true;
                } else {
                    // Remove expired subscriptions
                    if ($report->isSubscriptionExpired()) {
                        PushSubscription::where('endpoint', $report->getEndpoint())->delete();
                    }
                }
            }

            return [
                'success' => $success,
                'provider_message_id' => 'push_' . Str::random(8),
            ];

        } catch (\Exception $e) {
            Log::error('Push notification failed', [
                'user_id' => $user->id,
                'notification_id' => $notification->notification_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'retryable' => true,
            ];
        }
    }

    /**
     * Mark notification as delivered (webhook callback from provider)
     */
    public static function markDelivered(string $notificationId, string $channel, string $providerMessageId): void
    {
        $notification = Notification::where('notification_id', $notificationId)->first();
        
        if (!$notification) {
            return;
        }

        $notification->markAsDelivered();

        AuditService::logNotificationDelivered($notification->user, [
            'notification_id' => $notificationId,
            'channel' => $channel,
            'delivered_at' => now(),
        ]);
    }

    /**
     * Track notification open (from email pixel or app event)
     */
    public static function trackOpen(string $notificationId, string $channel, ?string $ipAddress = null, ?string $deviceType = null): void
    {
        $notification = Notification::where('notification_id', $notificationId)->first();
        
        if (!$notification || $notification->opened_at) {
            return;
        }

        $notification->markAsOpened();

        AuditService::logNotificationOpened($notification->user, [
            'notification_id' => $notificationId,
            'channel' => $channel,
            'opened_at' => now(),
            'ip_address' => $ipAddress,
            'device_type' => $deviceType ?? 'unknown',
        ]);
    }

    /**
     * Track notification click
     */
    public static function trackClick(string $notificationId, string $channel, string $clickedUrl, ?string $ipAddress = null): void
    {
        $notification = Notification::where('notification_id', $notificationId)->first();
        
        if (!$notification) {
            return;
        }

        $notification->markAsClicked($clickedUrl);

        AuditService::logNotificationClicked($notification->user, [
            'notification_id' => $notificationId,
            'channel' => $channel,
            'clicked_url' => $clickedUrl,
            'timestamp' => now(),
        ]);
    }

    /**
     * Check if user is in quiet hours
     */
    private static function isQuietHours(User $user): bool
    {
        $settings = $user->notificationSettings;
        
        if (!$settings || !$settings->quiet_hours_enabled) {
            return false;
        }

        return $settings->isQuietHours();
    }

    /**
     * Get when quiet hours end
     */
    private static function getQuietHoursEnd(User $user): \Carbon\Carbon
    {
        $settings = $user->notificationSettings;
        
        if (!$settings) {
            return now()->addHour();
        }

        $now = now()->timezone($settings->timezone);
        $end = $now->copy()->setTimeFromTimeString($settings->quiet_hours_end);
        
        if ($end->isPast()) {
            $end->addDay();
        }
        
        return $end->utc();
    }

    /**
     * Delete notification with audit
     */
    public static function delete(User $user, int $notificationId, string $deletionMethod = 'manual'): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->delete();

        AuditService::logNotificationDeleted($user, [
            'notification_id' => $notification->notification_id,
            'deletion_method' => $deletionMethod,
        ]);

        return true;
    }

    /**
     * Bulk delete notifications with audit
     */
    public static function bulkDelete(User $user, array $notificationIds, array $filterCriteria = []): int
    {
        $count = Notification::whereIn('id', $notificationIds)
            ->where('user_id', $user->id)
            ->delete();

        AuditService::logNotificationBulkDeleted($user, [
            'notification_ids' => $notificationIds,
            'count' => $count,
            'filter_criteria' => $filterCriteria,
        ]);

        return $count;
    }

    /**
     * Archive notification with audit
     */
    public static function archive(User $user, int $notificationId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->archive();

        AuditService::logNotificationArchived($user, [
            'notification_id' => $notification->notification_id,
        ]);

        return true;
    }

    /**
     * Unarchive notification with audit
     */
    public static function unarchive(User $user, int $notificationId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->unarchive();

        AuditService::logNotificationUnarchived($user, [
            'notification_id' => $notification->notification_id,
        ]);

        return true;
    }

    /**
     * Get unread count for user
     */
    public static function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->where('is_archived', false)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            })
            ->count();
    }

    /**
     * Create default notification settings for user
     */
    public static function createDefaultSettings(User $user): NotificationSetting
    {
        return NotificationSetting::create([
            'user_id' => $user->id,
            'channel_preferences' => config('notifications.default_preferences.channels'),
            'quiet_hours_enabled' => config('notifications.default_preferences.quiet_hours.enabled'),
            'quiet_hours_start' => config('notifications.default_preferences.quiet_hours.start'),
            'quiet_hours_end' => config('notifications.default_preferences.quiet_hours.end'),
        ]);
    }

    /**
     * Track notification delivery (from service worker)
     */
    public static function trackDelivery(string $notificationId, ?string $ipAddress = null): void
    {
        $notification = \App\Models\Notification::where('notification_id', $notificationId)->first();
        
        if (!$notification) {
            return;
        }

        $notification->markAsDelivered();

        // Use your AuditService pattern
        \App\Services\AuditService::log([
            'event_type' => 'NOTIFICATION_DELIVERED',
            'event_category' => 'notification',
            'actor_type' => 'SYSTEM',
            'user_id' => $notification->user_id,
            'action' => 'delivered',
            'model_type' => 'Notification',
            'model_id' => $notificationId,
            'description' => "Notification delivered via push",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'notification_id' => $notificationId,
                'channel' => 'push',
                'delivered_at' => now()->toIso8601String(),
                'ip_address' => $ipAddress,
            ],
        ]);
    }

        /**
     * Get template from database or config (fallback)
     * Phase 9: Database templates with config fallback
     */
    public static function getTemplate(string $templateKey): ?array
    {
        // 1. Try database first (active templates only)
        $dbTemplate = \App\Models\NotificationTemplate::active()
            ->byKey($templateKey)
            ->first();

        if ($dbTemplate) {
            return [
                'source' => 'database',
                'title' => $dbTemplate->title,
                'message' => $dbTemplate->message,
                'channels' => $dbTemplate->channels,
                'priority' => $dbTemplate->priority,
                'icon_type' => $dbTemplate->icon_type,
                'icon_color' => $dbTemplate->icon_color,
                'icon_bg' => $dbTemplate->icon_bg,
                'action_text' => $dbTemplate->action_text,
                'variables' => $dbTemplate->variables,
            ];
        }

        // 2. Fallback to config
        $configTemplates = config('notifications.templates', []);
        
        if (isset($configTemplates[$templateKey])) {
            $template = $configTemplates[$templateKey];
            return [
                'source' => 'config',
                'title' => $template['title'] ?? '',
                'message' => $template['message'] ?? '',
                'channels' => $template['channels'] ?? ['in_app'],
                'priority' => $template['priority'] ?? 'normal',
                'icon_type' => $template['icon_type'] ?? null,
                'icon_color' => $template['icon_color'] ?? null,
                'icon_bg' => $template['icon_bg'] ?? null,
                'action_text' => $template['action_text'] ?? null,
                'variables' => [],
            ];
        }

        // 3. No template found
        return null;
    }

    /**
     * Send notification using template
     * Phase 9: Template-based notifications
     */
    public static function sendTemplated(User $user, string $templateKey, array $variables = [], array $overrides = []): array
    {
        $template = self::getTemplate($templateKey);

        if (!$template) {
            Log::error("Notification template not found: {$templateKey}");
            return [
                'success' => false,
                'error' => "Template '{$templateKey}' not found",
            ];
        }

        // Parse variables
        $title = $template['title'];
        $message = $template['message'];

        foreach ($variables as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $title = str_replace($placeholder, $value, $title);
            $message = str_replace($placeholder, $value, $message);
        }

        // Prepare data
        $data = [
            'priority' => $overrides['priority'] ?? $template['priority'],
            'icon_type' => $overrides['icon_type'] ?? $template['icon_type'],
            'icon_color' => $overrides['icon_color'] ?? $template['icon_color'],
            'icon_gradient' => $template['icon_bg'] ?? null,
            'action_text' => $overrides['action_text'] ?? $template['action_text'],
            'template_id' => $templateKey,
            'template_source' => $template['source'],
        ];

        // Send to all configured channels
        $results = [];
        $channels = $overrides['channels'] ?? $template['channels'];

        foreach ($channels as $channel) {
            $results[$channel] = self::send(
                $user,
                $templateKey,
                $title,
                $message,
                $data,
                $channel
            );
        }

        return [
            'success' => true,
            'template_key' => $templateKey,
            'template_source' => $template['source'],
            'channels' => $results,
        ];
    }
}