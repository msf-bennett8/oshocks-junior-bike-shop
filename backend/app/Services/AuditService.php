<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    /**
     * Log an audit event
     */
    public static function log(array $data)
    {
        $request = request();
        
        return AuditLog::create([
            'event_type' => $data['event_type'],
            'event_category' => $data['event_category'] ?? 'general',
            'user_id' => $data['user_id'] ?? Auth::id(),
            'user_role' => $data['user_role'] ?? Auth::user()?->role,
            'action' => $data['action'],
            'model_type' => $data['model_type'] ?? null,
            'model_id' => $data['model_id'] ?? null,
            'description' => $data['description'],
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_method' => $request->method(),
            'request_url' => $request->fullUrl(),
            'severity' => $data['severity'] ?? 'low',
            'is_suspicious' => $data['is_suspicious'] ?? false,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Log payment event
     */
    public static function logPayment($payment, $action = 'created')
    {
        return self::log([
            'event_type' => 'payment_recorded',
            'event_category' => 'payment',
            'action' => $action,
            'model_type' => 'Payment',
            'model_id' => $payment->id,
            'description' => "Payment {$action}: {$payment->transaction_reference} - KES {$payment->amount}",
            'new_values' => [
                'amount' => $payment->amount,
                'seller_id' => $payment->seller_id,
                'commission' => $payment->platform_commission_amount,
            ],
            'severity' => 'medium',
        ]);
    }

    /**
     * Log payout event
     */
    public static function logPayout($payout, $action = 'created')
    {
        return self::log([
            'event_type' => 'payout_' . $action,
            'event_category' => 'payout',
            'action' => $action,
            'model_type' => 'SellerPayout',
            'model_id' => $payout->id,
            'description' => "Payout {$action} for seller #{$payout->seller_id} - KES {$payout->amount}",
            'new_values' => [
                'amount' => $payout->amount,
                'seller_id' => $payout->seller_id,
                'status' => $payout->status,
            ],
            'severity' => 'high',
        ]);
    }

    /**
     * Log suspicious activity
     */
    public static function logSuspicious(string $description, array $metadata = [])
    {
        return self::log([
            'event_type' => 'suspicious_activity',
            'event_category' => 'security',
            'action' => 'detected',
            'description' => $description,
            'metadata' => $metadata,
            'severity' => 'critical',
            'is_suspicious' => true,
        ]);
    }

    /**
     * Log login attempt
     */
    public static function logLogin($user, $success = true)
    {
        return self::log([
            'event_type' => $success ? 'login_success' : 'login_failed',
            'event_category' => 'security',
            'action' => $success ? 'accessed' : 'failed',
            'user_id' => $success ? $user->id : null,
            'user_role' => $success ? $user->role : null,
            'description' => $success 
                ? "User {$user->email} logged in successfully" 
                : "Failed login attempt for {$user}",
            'severity' => $success ? 'low' : 'medium',
            'is_suspicious' => !$success,
        ]);
    }
}