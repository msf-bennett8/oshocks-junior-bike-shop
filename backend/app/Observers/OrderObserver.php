<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\AuditService;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // ORDER_PLACED is logged in controller with full context
        // This observer handles automatic inventory audit
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        $oldStatus = $order->getOriginal('status');
        $newStatus = $order->status;

        // Only log if status actually changed
        if ($oldStatus !== $newStatus) {
            AuditService::logOrderStatusChanged($order, $oldStatus, $newStatus, [
                'automatic' => false,
                'changed_by' => auth()->id(),
            ]);
        }

        // Log payment status changes
        $oldPaymentStatus = $order->getOriginal('payment_status');
        $newPaymentStatus = $order->payment_status;

        if ($oldPaymentStatus !== $newPaymentStatus) {
            if ($newPaymentStatus === 'paid' && $oldPaymentStatus !== 'paid') {
                AuditService::logPaymentSuccessful($order->payment, [
                    'previous_status' => $oldPaymentStatus,
                ]);
            }
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        // Orders should not be deleted, only cancelled
        AuditService::logSuspiciousActivity("Order deleted: {$order->order_number}", [
            'activity_type' => 'order_deleted',
            'order_id' => $order->id,
        ]);
    }
}
