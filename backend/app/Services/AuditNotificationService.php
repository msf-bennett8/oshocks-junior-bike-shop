<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;

/**
 * Audit Notification Service - Phase 8
 * Converts critical audit events to SuperAdmin notifications
 */
class AuditNotificationService
{
    /**
     * Critical event types that trigger SuperAdmin notifications
     */
    protected const CRITICAL_EVENTS = [
        // Security Events
        'DATA_EXFILTRATION_ATTEMPT',
        'PRIVILEGED_QUERY_BLOCKED',
        'BRUTE_FORCE_ATTEMPT',
        'SUSPICIOUS_IP_DETECTED',
        'GEOLOCATION_ANOMALY',
        'VELOCITY_CHECK_TRIGGERED',
        'DEVICE_FINGERPRINT_MISMATCH',
        
        // Admin/Operational Events
        'MASS_PURCHASE',
        'BULK_PRODUCT_PRICE_UPDATED',
        'BULK_OPERATION_EXECUTED',
        'ORDER_DELETED',
        'ORDER_STATUS_MANUALLY_CHANGED',
        'PRODUCT_DELETED',
        'USER_ROLE_CHANGED',
        'ADMIN_IMPERSONATION_STARTED',
        
        // Financial Events
        'PAYMENT_DISPUTE_OPENED',
        'CHARGEBACK_RECEIVED',
        'REFUND_REJECTED',
        'PAYMENT_FAILED',
        
        // System Events
        'DATABASE_RESTORE_REQUESTED',
        'DATABASE_RESTORE_COMPLETED',
        'SCHEDULED_JOB_FAILED',
        'THIRD_PARTY_INTEGRATION_ERROR',
        'API_KEY_REVOKED',
    ];

    /**
     * High priority events (urgent badge, require interaction)
     */
    protected const URGENT_EVENTS = [
        'DATA_EXFILTRATION_ATTEMPT',
        'PRIVILEGED_QUERY_BLOCKED',
        'BRUTE_FORCE_ATTEMPT',
        'CHARGEBACK_RECEIVED',
    ];

    /**
     * Convert audit log to SuperAdmin notification
     */
    public static function convertAuditToNotification(array $auditData): ?Notification
    {
        $eventType = $auditData['event_type'] ?? '';
        
        // Only process critical events
        if (!in_array($eventType, self::CRITICAL_EVENTS)) {
            return null;
        }

        try {
            // Get all SuperAdmin users
            $superAdmins = User::where('role', 'super_admin')
                ->orWhere('role', 'owner')
                ->get();

            if ($superAdmins->isEmpty()) {
                Log::warning('No SuperAdmins found for audit notification', [
                    'event_type' => $eventType,
                ]);
                return null;
            }

            // Generate notification content
            $content = self::generateContent($auditData);
            
            // Determine priority
            $priority = in_array($eventType, self::URGENT_EVENTS) ? 'urgent' : 'high';
            
            // Create notification for each SuperAdmin
            $notification = null;
            
            foreach ($superAdmins as $superAdmin) {
                $notification = NotificationService::createNotification(
                    $superAdmin,
                    $content['type'],
                    $content['title'],
                    $content['message'],
                    [
                        'priority' => $priority,
                        'action_url' => $content['action_url'],
                        'action_text' => $content['action_text'],
                        'icon_type' => $content['icon_type'],
                        'icon_color' => $content['icon_color'],
                        'metadata' => array_merge($auditData, [
                            'audit_event_type' => $eventType,
                            'audit_log_id' => $auditData['id'] ?? null,
                            'is_audit_alert' => true,
                            'requires_acknowledgment' => true,
                        ]),
                        'expires_at' => now()->addDays(30), // Audit alerts expire in 30 days
                    ]
                );

                // Send immediate push for urgent events
                if ($priority === 'urgent') {
                    NotificationService::sendPush(
                        $superAdmin,
                        $content['title'],
                        $content['message'],
                        [
                            'url' => $content['action_url'],
                            'requireInteraction' => true,
                            'badge' => '/badge-urgent-72x72.png',
                        ]
                    );
                }
            }

            // Log the notification creation
            AuditService::log([
                'event_type' => 'AUDIT_NOTIFICATION_CREATED',
                'event_category' => 'notification',
                'actor_type' => 'SYSTEM',
                'action' => 'created',
                'model_type' => 'Notification',
                'model_id' => $notification?->id,
                'description' => "Audit notification created for {$eventType}",
                'severity' => 'MEDIUM',
                'tier' => 'TIER_2_OPERATIONAL',
                'metadata' => [
                    'event_type' => $eventType,
                    'priority' => $priority,
                    'superadmin_count' => $superAdmins->count(),
                ],
            ]);

            return $notification;

        } catch (\Exception $e) {
            Log::error('Failed to create audit notification', [
                'error' => $e->getMessage(),
                'audit_data' => $auditData,
            ]);
            return null;
        }
    }

    /**
     * Generate notification content based on audit event type
     */
    protected static function generateContent(array $auditData): array
    {
        $eventType = $auditData['event_type'];
        $metadata = $auditData['metadata'] ?? [];
        $payload = $auditData['payload'] ?? [];

        $templates = [
            'DATA_EXFILTRATION_ATTEMPT' => [
                'type' => 'security_alert',
                'title' => '🚨 Data Exfiltration Attempt Detected',
                'message' => sprintf(
                    'User ID %s attempted to access %d records of type "%s". Method: %s. %s',
                    $auditData['user_id'] ?? 'Unknown',
                    $metadata['records_attempted'] ?? 'unknown',
                    $metadata['data_type'] ?? 'unknown',
                    $metadata['method'] ?? 'unknown',
                    ($metadata['blocked'] ?? false) ? 'Blocked by system.' : 'Action required.'
                ),
                'action_url' => '/super-admin/audit-logs?filter=security_alert',
                'action_text' => 'Review Security Logs',
                'icon_type' => 'shield',
                'icon_color' => 'red',
            ],
            
            'PRIVILEGED_QUERY_BLOCKED' => [
                'type' => 'security_alert',
                'title' => '⛔ Dangerous SQL Query Blocked',
                'message' => sprintf(
                    'A privileged query was blocked. Reason: %s. Query type: %s.',
                    $metadata['block_reason'] ?? 'Unknown',
                    $metadata['query_type'] ?? 'Unknown'
                ),
                'action_url' => '/super-admin/audit-logs?filter=blocked_queries',
                'action_text' => 'View Blocked Query',
                'icon_type' => 'shield',
                'icon_color' => 'red',
            ],
            
            'BRUTE_FORCE_ATTEMPT' => [
                'type' => 'security_alert',
                'title' => '🔒 Brute Force Attack Detected',
                'message' => sprintf(
                    'Multiple failed login attempts detected for user %s from IP %s. Account %s.',
                    $metadata['identifier_attempted'] ?? 'Unknown',
                    $auditData['ip_address'] ?? 'Unknown',
                    ($metadata['account_locked'] ?? false) ? 'has been locked' : 'may need protection'
                ),
                'action_url' => '/super-admin/users?filter=locked',
                'action_text' => 'Review User Account',
                'icon_type' => 'lock',
                'icon_color' => 'red',
            ],
            
            'MASS_PURCHASE' => [
                'type' => 'mass_purchase',
                'title' => '🛒 Unusual Purchase Pattern Detected',
                'message' => sprintf(
                    'Order %s: %s items purchased for KES %s by %s. Review for fraud.',
                    $metadata['order_number'] ?? 'Unknown',
                    $metadata['item_count'] ?? 'multiple',
                    number_format($metadata['total_amount'] ?? 0),
                    $auditData['user_id'] ?? 'Unknown'
                ),
                'action_url' => sprintf('/super-admin/orders/%s', $metadata['order_id'] ?? ''),
                'action_text' => 'Review Order',
                'icon_type' => 'shopping-bag',
                'icon_color' => 'orange',
            ],
            
            'BULK_PRODUCT_PRICE_UPDATED' => [
                'type' => 'bulk_operation',
                'title' => '💰 Bulk Price Update Executed',
                'message' => sprintf(
                    '%d products affected by bulk price update. Rule: %s. Changed by: %s.',
                    $metadata['affected_count'] ?? 'Multiple',
                    $metadata['new_formula'] ?? 'Unknown',
                    $auditData['user_id'] ?? 'System'
                ),
                'action_url' => '/super-admin/products?filter=recently_updated',
                'action_text' => 'Review Changes',
                'icon_type' => 'tag',
                'icon_color' => 'amber',
            ],
            
            'ORDER_DELETED' => [
                'type' => 'admin_action',
                'title' => '🗑️ Order Deleted',
                'message' => sprintf(
                    'Order %s was deleted by %s. Reason: %s.',
                    $metadata['order_number'] ?? 'Unknown',
                    $auditData['user_id'] ?? 'Unknown',
                    $metadata['deletion_reason'] ?? 'No reason provided'
                ),
                'action_url' => '/super-admin/audit-logs?filter=order_deletions',
                'action_text' => 'View Deletion Log',
                'icon_type' => 'trash',
                'icon_color' => 'red',
            ],
            
            'PAYMENT_DISPUTE_OPENED' => [
                'type' => 'payment_alert',
                'title' => '⚠️ Payment Dispute Opened',
                'message' => sprintf(
                    'Dispute opened for order %s. Amount: KES %s. Reason: %s. Evidence due: %s.',
                    $metadata['order_number'] ?? 'Unknown',
                    number_format($metadata['amount_disputed'] ?? 0),
                    $metadata['dispute_reason'] ?? 'Unknown',
                    $metadata['evidence_due_date'] ?? 'Soon'
                ),
                'action_url' => sprintf('/super-admin/orders/%s/dispute', $metadata['order_id'] ?? ''),
                'action_text' => 'Manage Dispute',
                'icon_type' => 'credit-card',
                'icon_color' => 'red',
            ],
            
            'CHARGEBACK_RECEIVED' => [
                'type' => 'payment_alert',
                'title' => '💳 Chargeback Received',
                'message' => sprintf(
                    'Chargeback for KES %s on order %s. Bank reason: %s. Representment eligible: %s.',
                    number_format($metadata['amount'] ?? 0),
                    $metadata['order_number'] ?? 'Unknown',
                    $metadata['bank_reason_code'] ?? 'Unknown',
                    ($metadata['representment_eligible'] ?? false) ? 'Yes' : 'No'
                ),
                'action_url' => sprintf('/super-admin/payments/chargebacks/%s', $metadata['chargeback_id'] ?? ''),
                'action_text' => 'Respond to Chargeback',
                'icon_type' => 'alert-circle',
                'icon_color' => 'red',
            ],
            
            'ADMIN_IMPERSONATION_STARTED' => [
                'type' => 'admin_action',
                'title' => '👤 Admin Impersonation Started',
                'message' => sprintf(
                    'Admin %s started impersonating user %s. Reason: %s.',
                    $auditData['user_id'] ?? 'Unknown',
                    $metadata['target_user_id'] ?? 'Unknown',
                    $metadata['reason'] ?? 'Support'
                ),
                'action_url' => '/super-admin/audit-logs?filter=impersonation',
                'action_text' => 'Monitor Session',
                'icon_type' => 'user',
                'icon_color' => 'purple',
            ],
            
            'USER_ROLE_CHANGED' => [
                'type' => 'admin_action',
                'title' => '🔑 User Role Changed',
                'message' => sprintf(
                    'User %s role changed from %s to %s by %s.',
                    $metadata['target_user_id'] ?? 'Unknown',
                    $metadata['old_role'] ?? 'Unknown',
                    $metadata['new_role'] ?? 'Unknown',
                    $auditData['user_id'] ?? 'Unknown'
                ),
                'action_url' => sprintf('/super-admin/users/%s', $metadata['target_user_id'] ?? ''),
                'action_text' => 'Review User',
                'icon_type' => 'users',
                'icon_color' => 'blue',
            ],
            
            'SCHEDULED_JOB_FAILED' => [
                'type' => 'system_alert',
                'title' => '⚙️ Scheduled Job Failed',
                'message' => sprintf(
                    'Job "%s" failed after %d retries. Error: %s.',
                    $metadata['job_name'] ?? 'Unknown',
                    $metadata['retry_count'] ?? 0,
                    substr($metadata['error_message'] ?? 'Unknown error', 0, 100)
                ),
                'action_url' => '/super-admin/system/jobs',
                'action_text' => 'View Job Status',
                'icon_type' => 'settings',
                'icon_color' => 'orange',
            ],
            
            'THIRD_PARTY_INTEGRATION_ERROR' => [
                'type' => 'system_alert',
                'title' => '🔌 Integration Error',
                'message' => sprintf(
                    '%s integration error: %s. Impact: %s.',
                    $metadata['service_name'] ?? 'Unknown',
                    $metadata['error_code'] ?? 'Unknown',
                    $metadata['impact_level'] ?? 'Unknown'
                ),
                'action_url' => '/super-admin/integrations',
                'action_text' => 'Check Integration',
                'icon_type' => 'zap',
                'icon_color' => 'yellow',
            ],
        ];

        // Return template or default
        return $templates[$eventType] ?? [
            'type' => 'audit_alert',
            'title' => "🔔 Audit Alert: {$eventType}",
            'message' => $auditData['description'] ?? 'A critical system event has occurred.',
            'action_url' => '/super-admin/audit-logs',
            'action_text' => 'View Audit Log',
            'icon_type' => 'file-text',
            'icon_color' => 'slate',
        ];
    }

    /**
     * Send bulk admin notification for system-wide events
     */
    public static function sendBulkAdminNotification(string $type, string $title, string $message, array $metadata = []): void
    {
        $superAdmins = User::whereIn('role', ['super_admin', 'owner', 'admin'])->get();

        foreach ($superAdmins as $admin) {
            NotificationService::createNotification(
                $admin,
                $type,
                $title,
                $message,
                [
                    'priority' => 'high',
                    'icon_type' => 'info',
                    'icon_color' => 'blue',
                    'metadata' => array_merge($metadata, [
                        'is_bulk_notification' => true,
                        'is_audit_alert' => true,
                    ]),
                ]
            );
        }
    }

    /**
     * Acknowledge an audit notification (mark as handled)
     */
    public static function acknowledgeNotification(string $notificationId, int $userId): bool
    {
        try {
            $notification = Notification::where('notification_id', $notificationId)
                ->where('user_id', $userId)
                ->first();

            if (!$notification) {
                return false;
            }

            $notification->markAsRead();
            
            // Update metadata to show acknowledgment
            $metadata = $notification->metadata ?? [];
            $metadata['acknowledged_at'] = now()->toIso8601String();
            $metadata['acknowledged_by'] = $userId;
            $notification->metadata = $metadata;
            $notification->save();

            // Log acknowledgment
            AuditService::log([
                'event_type' => 'AUDIT_NOTIFICATION_ACKNOWLEDGED',
                'event_category' => 'notification',
                'actor_type' => 'USER',
                'user_id' => $userId,
                'action' => 'acknowledged',
                'model_type' => 'Notification',
                'model_id' => $notification->id,
                'description' => "Audit notification {$notificationId} acknowledged",
                'severity' => 'LOW',
                'tier' => 'TIER_2_OPERATIONAL',
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to acknowledge notification', [
                'error' => $e->getMessage(),
                'notification_id' => $notificationId,
            ]);
            return false;
        }
    }

    /**
     * Get critical events list for frontend filtering
     */
    public static function getCriticalEvents(): array
    {
        return self::CRITICAL_EVENTS;
    }

    /**
     * Check if event type is critical
     */
    public static function isCriticalEvent(string $eventType): bool
    {
        return in_array($eventType, self::CRITICAL_EVENTS);
    }
}
