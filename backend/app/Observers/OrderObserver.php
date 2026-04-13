<?php

namespace App\Observers;

use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Events\OrderShipped;
use App\Events\DeliveryOutForDelivery;
use App\Events\DeliveryCompleted;
use App\Events\DeliveryFailed;
use App\Events\PaymentSuccessful;
use App\Events\PaymentFailed;
use App\Events\MassPurchaseAlert;
use App\Models\Order;
use App\Services\AuditService;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // Fire OrderPlaced event
        OrderPlaced::dispatch($order->user, $order, [
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Check for mass purchase and alert admins
        $itemCount = $order->items()->sum('quantity');
        if ($itemCount >= 10 || $order->total >= 100000) {
            $customerType = $this->determineCustomerType($order, $itemCount);
            
            MassPurchaseAlert::dispatch(
                [], // Will be filled by listener to get all admin IDs
                $order,
                $itemCount,
                $order->total,
                $customerType
            );
        }
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

            // Fire status changed event
            OrderStatusChanged::dispatch($order->user, $order, $oldStatus, $newStatus);

            // Fire specific events based on new status
            match($newStatus) {
                'shipped' => $this->handleShipped($order),
                'out_for_delivery' => $this->handleOutForDelivery($order),
                'delivered' => DeliveryCompleted::dispatch($order->user, $order),
                'cancelled' => $this->handleCancelled($order),
                default => null,
            };
        }

        // Log payment status changes
        $oldPaymentStatus = $order->getOriginal('payment_status');
        $newPaymentStatus = $order->payment_status;

        if ($oldPaymentStatus !== $newPaymentStatus) {
            if ($newPaymentStatus === 'paid' && $oldPaymentStatus !== 'paid') {
                AuditService::logPaymentSuccessful($order->payment, [
                    'previous_status' => $oldPaymentStatus,
                ]);

                PaymentSuccessful::dispatch(
                    $order->user,
                    $order,
                    $order->payment,
                    ['previous_status' => $oldPaymentStatus]
                );
            } elseif ($newPaymentStatus === 'failed') {
                PaymentFailed::dispatch(
                    $order->user,
                    $order,
                    $order->payment_failure_reason ?? 'Payment processing failed'
                );
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

    private function handleShipped(Order $order): void
    {
        OrderShipped::dispatch(
            $order->user,
            $order,
            $order->tracking_number,
            $order->shipping_carrier ?? 'Our Courier'
        );
    }

    private function handleOutForDelivery(Order $order): void
    {
        // Get driver info from delivery assignment
        $driverName = $order->deliveryDriver?->name ?? 'Your Driver';
        $eta = $order->estimated_delivery_time?->diffForHumans() ?? 'soon';

        DeliveryOutForDelivery::dispatch(
            $order->user,
            $order,
            $order->tracking_number,
            $driverName,
            $eta
        );
    }

    private function handleCancelled(Order $order): void
    {
        // Could dispatch OrderCancelled event here
    }

    private function determineCustomerType(Order $order, int $itemCount): string
    {
        if ($itemCount >= 25) return 'corporate';
        if ($itemCount >= 10) return 'reseller';
        return 'individual';
    }
}
