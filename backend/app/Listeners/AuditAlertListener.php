<?php

namespace App\Listeners;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuditAlertListener
{
    /**
     * Handle audit log creation events.
     */
    public function handle(AuditLog $auditLog): void
    {
        // Only alert on suspicious or critical events
        if (!$this->shouldAlert($auditLog)) {
            return;
        }

        try {
            // Send email alert
            $this->sendEmailAlert($auditLog);
            
            // Send Slack/Teams notification if configured
            $this->sendWebhookAlert($auditLog);
            
            // Send SMS for critical events
            if ($auditLog->severity === 'CRITICAL') {
                $this->sendSMSAlert($auditLog);
            }

        } catch (\Exception $e) {
            Log::error('Failed to send audit alert', [
                'error' => $e->getMessage(),
                'audit_log_id' => $auditLog->id,
            ]);
        }
    }

    protected function shouldAlert(AuditLog $auditLog): bool
    {
        // Alert on suspicious flag
        if ($auditLog->is_suspicious) {
            return true;
        }

        // Alert on critical/high severity security events
        if ($auditLog->event_category === 'security' && in_array($auditLog->severity, ['CRITICAL', 'HIGH'])) {
            return true;
        }

        // Alert on specific event types
        $alertEvents = [
            'DATA_EXFILTRATION_ATTEMPT',
            'PRIVILEGED_QUERY_BLOCKED',
            'ACCOUNT_LOCKED',
            'SUSPICIOUS_IP_DETECTED',
            'GEOLOCATION_ANOMALY',
            'VELOCITY_CHECK_TRIGGERED',
        ];

        return in_array($auditLog->event_type, $alertEvents);
    }

    protected function sendEmailAlert(AuditLog $auditLog): void
    {
        $recipients = config('audit.alerts.email_recipients', []);
        
        if (empty($recipients)) {
            return;
        }

        Mail::send('emails.audit-alert', [
            'auditLog' => $auditLog,
            'riskScore' => $this->calculateRiskScore($auditLog),
        ], function ($message) use ($recipients, $auditLog) {
            $message->to($recipients)
                ->subject("🚨 Security Alert: {$auditLog->event_type}");
        });
    }

    protected function sendWebhookAlert(AuditLog $auditLog): void
    {
        $webhookUrl = config('audit.alerts.webhook_url');
        
        if (!$webhookUrl) {
            return;
        }

        Http::post($webhookUrl, [
            'text' => "🚨 *Security Alert*",
            'attachments' => [[
                'color' => $auditLog->severity === 'CRITICAL' ? 'danger' : 'warning',
                'fields' => [
                    ['title' => 'Event', 'value' => $auditLog->event_type, 'short' => true],
                    ['title' => 'Severity', 'value' => $auditLog->severity, 'short' => true],
                    ['title' => 'User', 'value' => $auditLog->user_id ?? 'N/A', 'short' => true],
                    ['title' => 'IP', 'value' => $auditLog->ip_address ?? 'N/A', 'short' => true],
                    ['title' => 'Description', 'value' => $auditLog->description, 'short' => false],
                    ['title' => 'Time', 'value' => $auditLog->occurred_at, 'short' => false],
                ],
            ]],
        ]);
    }

    protected function sendSMSAlert(AuditLog $auditLog): void
    {
        // Implement with Twilio or similar
        // Only for CRITICAL events
    }

    protected function calculateRiskScore(AuditLog $auditLog): int
    {
        $score = 0;
        
        if ($auditLog->is_suspicious) $score += 30;
        if ($auditLog->severity === 'CRITICAL') $score += 40;
        if ($auditLog->severity === 'HIGH') $score += 25;
        if ($auditLog->event_category === 'security') $score += 15;
        
        return min($score, 100);
    }
}
