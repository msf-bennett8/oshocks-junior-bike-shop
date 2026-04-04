<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Create and send notification with full audit trail
     */
    public static function send(User $user, string $type, string $title, string $message, array $data = [], string $channel = 'in-app'): array
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
            'priority' => $data['priority'] ?? 'normal',
            'template_id' => $data['template_id'] ?? null,
            'scheduled_for' => $data['scheduled_for'] ?? null,
            'is_read' => false,
            'is_archived' => false,
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
        ];
    }

    /**
     * Send email notification
     */
    private static function sendEmail(User $user, Notification $notification, array $data): array
    {
        try {
            // Check quiet hours
            if (self::isQuietHours($user)) {
                // Schedule for later
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
        // Would integrate with Africa's Talking or Twilio
        // For now, log and return simulated success
        
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
     * Send push notification (placeholder for Firebase/OneSignal)
     */
    private static function sendPush(User $user, Notification $notification, array $data): array
    {
        // Would integrate with Firebase Cloud Messaging or OneSignal
        
        Log::info('Push notification would be sent', [
            'user_id' => $user->id,
            'title' => $notification->title,
            'message' => $notification->message,
        ]);

        return [
            'success' => true,
            'provider_message_id' => 'push_' . Str::random(8),
        ];
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

        $notification->update([
            'delivered_at' => now(),
            'delivery_status' => 'delivered',
        ]);

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
            return; // Already tracked or not found
        }

        $notification->update([
            'opened_at' => now(),
            'open_count' => ($notification->open_count ?? 0) + 1,
        ]);

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

        $notification->update([
            'clicked_at' => now(),
            'click_count' => ($notification->click_count ?? 0) + 1,
            'clicked_url' => $clickedUrl,
        ]);

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
        $preferences = Cache::get("user:{$user->id}:notification_preferences");
        
        if (!$preferences || !($preferences['quiet_hours_enabled'] ?? false)) {
            return false;
        }

        $timezone = $preferences['timezone'] ?? 'UTC';
        $startTime = $preferences['quiet_hours_start'] ?? '22:00';
        $endTime = $preferences['quiet_hours_end'] ?? '08:00';
        
        $now = now()->timezone($timezone);
        $currentTime = $now->format('H:i');
        
        // Handle overnight quiet hours (e.g., 22:00 - 08:00)
        if ($startTime > $endTime) {
            return $currentTime >= $startTime || $currentTime < $endTime;
        }
        
        return $currentTime >= $startTime && $currentTime < $endTime;
    }

    /**
     * Get when quiet hours end
     */
    private static function getQuietHoursEnd(User $user): \Carbon\Carbon
    {
        $preferences = Cache::get("user:{$user->id}:notification_preferences", []);
        $timezone = $preferences['timezone'] ?? 'UTC';
        $endTime = $preferences['quiet_hours_end'] ?? '08:00';
        
        $now = now()->timezone($timezone);
        $end = $now->copy()->setTimeFromTimeString($endTime);
        
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

        $notification->update(['is_archived' => true]);

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

        $notification->update(['is_archived' => false]);

        AuditService::logNotificationUnarchived($user, [
            'notification_id' => $notification->notification_id,
        ]);

        return true;
    }
}
