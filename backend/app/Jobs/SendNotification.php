<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60]; // Exponential backoff in seconds
    public $timeout = 60;

    public function __construct(
        public User $user,
        public string $type,
        public array $data = [],
        public string $channel = 'in_app',
        public ?string $template = null
    ) {}

    public function handle(): void
    {
        try {
            // Check if user has notification settings and respects them
            $settings = $this->user->notificationSettings;
            
            if ($settings && !$settings->shouldSendToChannel($this->type, $this->channel)) {
                Log::info('Notification skipped due to user preferences', [
                    'user_id' => $this->user->id,
                    'type' => $this->type,
                    'channel' => $this->channel,
                ]);
                return;
            }

            // Check quiet hours for non-urgent notifications
            if ($settings && $settings->isQuietHours() && ($this->data['priority'] ?? 'normal') !== 'urgent') {
                // Schedule for later
                $delay = $settings->getQuietHoursEnd()->diffInMinutes(now());
                self::dispatch($this->user, $this->type, $this->data, $this->channel, $this->template)
                    ->delay(now()->addMinutes($delay));
                
                Log::info('Notification delayed due to quiet hours', [
                    'user_id' => $this->user->id,
                    'type' => $this->type,
                    'delay_minutes' => $delay,
                ]);
                return;
            }

            // Send via NotificationService
            $result = NotificationService::send(
                $this->user,
                $this->type,
                $this->data['title'] ?? 'Notification',
                $this->data['message'] ?? '',
                array_merge($this->data, ['channel' => $this->channel]),
                $this->channel
            );

            if (!$result['success']) {
                throw new \Exception($result['error'] ?? 'Unknown error');
            }

            Log::info('Notification sent successfully', [
                'user_id' => $this->user->id,
                'type' => $this->type,
                'channel' => $this->channel,
                'notification_id' => $result['notification_id'],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'user_id' => $this->user->id,
                'type' => $this->type,
                'channel' => $this->channel,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            // Re-throw to trigger retry
            if ($this->attempts() < $this->tries) {
                throw $e;
            }

            // Final failure - log to audit
            \App\Services\AuditService::logNotificationFailed($this->user, [
                'type' => $this->type,
                'channel' => $this->channel,
                'error' => $e->getMessage(),
                'data' => $this->data,
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Notification job failed permanently', [
            'user_id' => $this->user->id,
            'type' => $this->type,
            'channel' => $this->channel,
            'error' => $exception->getMessage(),
        ]);

        // Final audit log
        \App\Services\AuditService::logNotificationFailed($this->user, [
            'type' => $this->type,
            'channel' => $this->channel,
            'error' => $exception->getMessage(),
            'final_failure' => true,
        ]);
    }
}
