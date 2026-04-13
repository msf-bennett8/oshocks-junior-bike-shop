<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Events\OrderStatusChanged;
use App\Events\OrderShipped;
use App\Events\DeliveryOutForDelivery;
use App\Events\PaymentSuccessful;
use App\Events\PaymentFailed;
use App\Events\PaymentRefunded;
use App\Events\LowStockAlert;
use App\Events\BackInStock;
use App\Events\PriceDrop;
use App\Events\NewProductArrival;
use App\Events\SecurityAlert;
use App\Events\LoginFailed;
use App\Events\AuditAlert;
use App\Events\MassPurchaseAlert;
use App\Events\BulkOperationAlert;
use App\Events\SystemMaintenanceNotice;
use App\Events\FlashSaleStarted;
use App\Events\LoyaltyTierChanged;
use App\Events\WishlistPriceDrop;
use App\Events\WishlistBackInStock;
use App\Events\SupportMessageReceived;
use App\Events\DeliveryIssueReported;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmation implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;
        $user = $event->user;

        // Determine if this is a mass purchase
        $itemCount = $order->items()->sum('quantity');
        $isMassPurchase = $itemCount >= 10 || $order->total >= 100000;

        // Notify customer
        NotificationService::sendFromTemplate($user, 'order_placed', [
            'order' => [
                'number' => $order->order_number,
                'amount' => 'KES ' . number_format($order->total),
            ],
            'item_count' => $itemCount,
        ], 'all');

        // If mass purchase, alert admins
        if ($isMassPurchase) {
            $customerType = $this->determineCustomerType($order);
            
            NotificationService::notifySuperAdmins('mass_purchase_alert', [
                'order' => [
                    'id' => $order->id,
                    'number' => $order->order_number,
                    'items' => $itemCount,
                    'amount' => 'KES ' . number_format($order->total),
                ],
                'customer' => [
                    'type' => $customerType,
                    'name' => $user->name,
                ],
                'priority' => 'urgent',
                'icon_gradient' => 'from-emerald-500 to-emerald-600',
                'actions' => [
                    ['label' => 'Process', 'url' => "/admin/orders/{$order->order_number}", 'primary' => true],
                    ['label' => 'Invoice', 'url' => "/admin/orders/{$order->order_number}/invoice", 'primary' => false],
                ],
            ]);
        }
    }

    private function determineCustomerType($order): string
    {
        $itemCount = $order->items()->sum('quantity');
        if ($itemCount >= 25) return 'corporate';
        if ($itemCount >= 10) return 'reseller';
        return 'individual';
    }
}

class SendStatusUpdate implements ShouldQueue
{
    public function handle(OrderStatusChanged $event): void
    {
        $order = $event->order;
        $user = $event->user;

        // Map status to appropriate template
        $template = match($event->newStatus) {
            'shipped' => 'order_shipped',
            'delivered' => 'order_delivered',
            'cancelled' => 'order_cancelled',
            default => 'order_status_changed',
        };

        $variables = [
            'order' => [
                'number' => $order->order_number,
                'amount' => 'KES ' . number_format($order->total),
            ],
            'old_status' => $event->oldStatus,
            'new_status' => $event->newStatus,
        ];

        // Add tracking info if shipped
        if ($event->newStatus === 'shipped' && $order->tracking_number) {
            $variables['carrier'] = $order->shipping_carrier ?? 'Our Courier';
            $variables['tracking_number'] = $order->tracking_number;
        }

        NotificationService::sendFromTemplate($user, $template, $variables, 'all');
    }
}

class SendDeliveryNotification implements ShouldQueue
{
    public function handle(DeliveryOutForDelivery $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'order_out_for_delivery', [
            'order' => ['number' => $event->order->order_number],
            'eta' => $event->eta,
            'driver' => ['name' => $event->driverName],
            'tracking_number' => $event->trackingNumber,
        ], 'all', [
            'priority' => 'urgent',
            'icon_gradient' => 'from-violet-500 to-violet-600',
        ]);
    }
}

class SendPaymentConfirmation implements ShouldQueue
{
    public function handle(PaymentSuccessful $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'payment_successful', [
            'order' => ['number' => $event->order->order_number],
            'payment' => [
                'amount' => 'KES ' . number_format($event->payment->amount),
                'method' => $event->payment->method,
            ],
        ], 'all');
    }
}

class SendPaymentFailure implements ShouldQueue
{
    public function handle(PaymentFailed $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'payment_failed', [
            'order' => ['number' => $event->order->order_number],
            'reason' => $event->reason,
        ], 'all', ['priority' => 'urgent']);
    }
}

class SendRefundNotification implements ShouldQueue
{
    public function handle(PaymentRefunded $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'payment_refunded', [
            'order' => ['number' => $event->order->order_number],
            'amount' => 'KES ' . number_format($event->amount),
            'refund_id' => $event->refundId,
        ], 'all');
    }
}

class SendStockAlert implements ShouldQueue
{
    public function handle(LowStockAlert $event): void
    {
        $product = $event->product;
        
        // Alert all admins and inventory managers
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
        
        foreach ($admins as $admin) {
            NotificationService::send($admin, 'low_stock_alert', 
                '🚨 Critical Low Stock Alert',
                "{$product->name} (SKU: {$product->sku}) is down to {$event->currentStock} units (threshold: {$event->threshold})",
                [
                    'priority' => 'urgent',
                    'icon_type' => 'TrendingDown',
                    'icon_color' => 'text-red-600',
                    'icon_gradient' => 'from-red-400 to-red-600',
                    'action_url' => "/admin/inventory/reorder/{$product->sku}",
                    'action_text' => 'Reorder Now',
                    'metadata' => [
                        'sku' => $product->sku,
                        'product' => $product->name,
                        'currentStock' => $event->currentStock,
                        'threshold' => $event->threshold,
                        'supplier' => $product->supplier_name ?? 'Unknown',
                        'lastRestocked' => $product->last_restocked,
                        'avgDailySales' => $product->avg_daily_sales ?? 'N/A',
                        'estimatedStockout' => $event->currentStock / ($product->avg_daily_sales ?? 1) . ' days',
                    ],
                    'actions' => [
                        ['label' => 'Reorder', 'url' => "/admin/inventory/reorder/{$product->sku}", 'primary' => true],
                        ['label' => 'View Stock', 'url' => "/admin/inventory/{$product->sku}", 'primary' => false],
                        ['label' => 'Adjust Threshold', 'action' => 'adjust_threshold', 'primary' => false],
                    ],
                    'audit_log' => [
                        'event' => 'STOCK_THRESHOLD_BREACH',
                        'severity' => 'critical',
                        'triggeredBy' => 'system',
                        'automated' => true,
                        'previousStock' => $event->currentStock + 1,
                        'notificationsSent' => ['admin', 'inventory_manager'],
                    ],
                ],
                'in_app'
            );
        }
    }
}

class SendBackInStockNotification implements ShouldQueue
{
    public function handle(BackInStock $event): void
    {
        // Notify users who have this in wishlist or viewed recently
        $userIds = \DB::table('wishlists')
            ->where('product_id', $event->product->id)
            ->pluck('user_id');

        $users = User::whereIn('id', $userIds)->get();

        foreach ($users as $user) {
            NotificationService::sendFromTemplate($user, 'back_in_stock', [
                'product' => [
                    'name' => $event->product->name,
                    'sku' => $event->product->sku,
                ],
                'stock' => ['quantity' => $event->quantity],
            ], 'all');
        }
    }
}

class SendPriceAlert implements ShouldQueue
{
    public function handle(PriceDrop $event): void
    {
        // Notify users with wishlist items
        $wishlistUserIds = \DB::table('wishlists')
            ->where('product_id', $event->product->id)
            ->pluck('user_id');

        $users = User::whereIn('id', $wishlistUserIds)->get();

        $discountPercent = round((($event->oldPrice - $event->newPrice) / $event->oldPrice) * 100);

        foreach ($users as $user) {
            NotificationService::sendFromTemplate($user, 'price_drop', [
                'product' => [
                    'name' => $event->product->name,
                ],
                'price' => [
                    'old' => 'KES ' . number_format($event->oldPrice),
                    'new' => 'KES ' . number_format($event->newPrice),
                    'percent' => $discountPercent,
                ],
            ], 'all');
        }
    }
}

class SendNewProductNotification implements ShouldQueue
{
    public function handle(NewProductArrival $event): void
    {
        // Notify admins
        NotificationService::notifyAdmins('admin', 'new_product_arrival', [
            'product' => [
                'name' => $event->product->name,
                'price' => 'KES ' . number_format($event->product->price),
                'stock' => $event->product->quantity,
            ],
            'icon_gradient' => 'from-cyan-500 to-cyan-600',
        ], 'in_app');
    }
}

class SendSecurityNotification implements ShouldQueue
{
    public function handle(SecurityAlert $event): void
    {
        $priority = match($event->severity) {
            'critical' => 'urgent',
            'high' => 'high',
            default => 'medium',
        };

        NotificationService::sendFromTemplate($event->user, 'security_alert', [
            'alert' => [
                'description' => $event->details['description'] ?? 'Security event detected',
            ],
        ], 'all', [
            'priority' => $priority,
            'metadata' => $event->details,
        ]);
    }
}

class SendFailedLoginAlert implements ShouldQueue
{
    public function handle(LoginFailed $event): void
    {
        // After 3 failed attempts, notify user
        if ($event->attemptCount >= 3 && $event->user) {
            NotificationService::sendFromTemplate($event->user, 'login_failed', [
                'count' => $event->attemptCount,
                'ip' => $event->ipAddress,
            ], 'all', ['priority' => 'urgent']);

            // Also notify super admins if many attempts
            if ($event->attemptCount >= 5) {
                NotificationService::notifySuperAdmins('security_alert', [
                    'alert' => [
                        'type' => 'brute_force_attempt',
                        'description' => "{$event->attemptCount} failed login attempts for {$event->user->email} from IP {$event->ipAddress}",
                    ],
                    'severity' => 'high',
                ], 'in_app');
            }
        }
    }
}

class SendAuditNotification implements ShouldQueue
{
    public function handle(AuditAlert $event): void
    {
        foreach ($event->adminUserIds as $adminId) {
            $admin = User::find($adminId);
            if (!$admin) continue;

            NotificationService::send($admin, 'audit_alert',
                "📋 {$event->eventType} Detected",
                $event->auditData['description'] ?? 'Review audit log for details.',
                [
                    'priority' => $event->severity === 'high' ? 'high' : 'medium',
                    'icon_type' => 'FileText',
                    'icon_color' => 'text-slate-600',
                    'icon_gradient' => 'from-slate-500 to-slate-600',
                    'action_url' => $event->auditData['audit_url'] ?? '/admin/audit-logs',
                    'action_text' => 'View Audit',
                    'audit_log' => [
                        'event' => $event->eventType,
                        'severity' => $event->severity,
                        ...$event->auditData,
                    ],
                ],
                'in_app'
            );
        }
    }
}

class SendMassPurchaseNotification implements ShouldQueue
{
    public function handle(MassPurchaseAlert $event): void
    {
        foreach ($event->adminUserIds as $adminId) {
            $admin = User::find($adminId);
            if (!$admin) continue;

            NotificationService::send($admin, 'mass_purchase_alert',
                '🎉 Mass Purchase Confirmed!',
                "Corporate order {$event->order->order_number}: {$event->itemCount} items, KES " . number_format($event->totalValue) . ". {$event->customerType}",
                [
                    'priority' => 'urgent',
                    'icon_type' => 'Users',
                    'icon_color' => 'text-emerald-600',
                    'icon_gradient' => 'from-emerald-500 to-emerald-600',
                    'action_url' => "/admin/orders/{$event->order->order_number}",
                    'action_text' => 'Manage Order',
                    'metadata' => [
                        'orderId' => $event->order->order_number,
                        'customer' => $event->order->user->name,
                        'type' => $event->customerType,
                        'items' => $event->itemCount,
                        'amount' => 'KES ' . number_format($event->totalValue),
                    ],
                    'actions' => [
                        ['label' => 'Process', 'url' => "/admin/orders/{$event->order->order_number}", 'primary' => true],
                        ['label' => 'Invoice', 'url' => "/admin/orders/{$event->order->order_number}/invoice", 'primary' => false],
                    ],
                    'audit_log' => [
                        'event' => 'MASS_PURCHASE_CONFIRMED',
                        'value' => $event->totalValue,
                        'items' => $event->itemCount,
                        'verifiedBy' => 'payment_gateway',
                        'riskScore' => 'low',
                    ],
                ],
                'in_app'
            );
        }
    }
}

class SendBulkOperationNotification implements ShouldQueue
{
    public function handle(BulkOperationAlert $event): void
    {
        foreach ($event->adminUserIds as $adminId) {
            $admin = User::find($adminId);
            if (!$admin) continue;

            NotificationService::send($admin, 'bulk_operation_alert',
                '⚠️ Bulk ' . ucfirst($event->operationType) . ' Detected',
                "{$event->affectedCount} items affected. Review changes.",
                [
                    'priority' => 'high',
                    'icon_type' => 'BarChart3',
                    'icon_color' => 'text-orange-600',
                    'icon_gradient' => 'from-orange-500 to-orange-600',
                    'action_url' => '/admin/audit-logs',
                    'action_text' => 'Review Changes',
                    'metadata' => [
                        'operation' => $event->operationType,
                        'count' => $event->affectedCount,
                        'details' => $event->details,
                    ],
                    'audit_log' => [
                        'event' => 'BULK_' . strtoupper($event->operationType),
                        'affectedCount' => $event->affectedCount,
                        'modifiedBy' => $event->details['user'] ?? 'unknown',
                        'reason' => $event->details['reason'] ?? 'Not specified',
                    ],
                ],
                'in_app'
            );
        }
    }
}

class SendMaintenanceNotification implements ShouldQueue
{
    public function handle(SystemMaintenanceNotice $event): void
    {
        $userIds = $event->userIds;
        
        // If empty, notify all users
        if (empty($userIds)) {
            // Use chunking for large user bases
            User::chunk(1000, function ($users) use ($event) {
                foreach ($users as $user) {
                    NotificationService::sendFromTemplate($user, 'system_maintenance', [
                        'maintenance' => [
                            'start' => $event->startTime->format('M j, Y g:i A'),
                            'end' => $event->endTime->format('M j, Y g:i A'),
                            'services' => implode(', ', $event->affectedServices),
                        ],
                    ], 'all', ['priority' => 'urgent']);
                }
            });
        } else {
            foreach ($userIds as $userId) {
                $user = User::find($userId);
                if ($user) {
                    NotificationService::sendFromTemplate($user, 'system_maintenance', [
                        'maintenance' => [
                            'start' => $event->startTime->format('M j, Y g:i A'),
                            'end' => $event->endTime->format('M j, Y g:i A'),
                            'services' => implode(', ', $event->affectedServices),
                        ],
                    ], 'all', ['priority' => 'urgent']);
                }
            }
        }
    }
}

class SendFlashSaleNotification implements ShouldQueue
{
    public function handle(FlashSaleStarted $event): void
    {
        foreach ($event->userIds as $userId) {
            $user = User::find($userId);
            if (!$user) continue;

            NotificationService::sendFromTemplate($user, 'flash_sale', [
                'sale' => [
                    'percent' => $event->discountPercent,
                    'products' => count($event->products),
                    'ends' => $event->endsAt->diffForHumans(),
                ],
            ], 'all');
        }
    }
}

class SendLoyaltyNotification implements ShouldQueue
{
    public function handle(LoyaltyTierChanged $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'loyalty_tier_changed', [
            'tier' => [
                'new' => $event->newTier,
                'old' => $event->oldTier,
            ],
            'benefits' => implode(', ', $event->benefits),
            'duration' => '30 days',
        ], 'all');
    }
}

class SendWishlistPriceNotification implements ShouldQueue
{
    public function handle(WishlistPriceDrop $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'price_drop', [
            'product' => ['name' => $event->product->name],
            'price' => [
                'old' => 'KES ' . number_format($event->oldPrice),
                'new' => 'KES ' . number_format($event->newPrice),
                'percent' => round($event->discountPercent),
            ],
        ], 'all');
    }
}

class SendWishlistStockNotification implements ShouldQueue
{
    public function handle(WishlistBackInStock $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'back_in_stock', [
            'product' => ['name' => $event->product->name],
            'stock' => ['quantity' => $event->quantity],
        ], 'all');
    }
}

class SendSupportNotification implements ShouldQueue
{
    public function handle(SupportMessageReceived $event): void
    {
        $priority = $event->isUrgent ? 'high' : 'medium';
        
        NotificationService::sendFromTemplate($event->user, 'support_message', [
            'message' => [
                'subject' => $event->subject,
                'preview' => $event->preview,
            ],
        ], 'all', ['priority' => $priority]);
    }
}

class SendDeliveryIssueNotification implements ShouldQueue
{
    public function handle(DeliveryIssueReported $event): void
    {
        NotificationService::sendFromTemplate($event->user, 'delivery_issue', [
            'order' => ['number' => $event->order->order_number],
            'issue' => ['type' => $event->issueType],
            'driver' => ['name' => $event->driverName],
            'attempt' => [
                'current' => $event->attemptNumber,
                'max' => 3,
            ],
        ], 'all', ['priority' => 'urgent']);
    }
}
