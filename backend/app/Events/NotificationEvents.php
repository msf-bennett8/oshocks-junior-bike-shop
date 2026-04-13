<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Product;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// ============================================================================
// ORDER EVENTS
// ============================================================================

class OrderPlaced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public array $metadata = []
    ) {}
}

class OrderStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $oldStatus,
        public string $newStatus,
        public array $metadata = []
    ) {}
}

class OrderCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $reason,
        public array $metadata = []
    ) {}
}

// ============================================================================
// PAYMENT EVENTS
// ============================================================================

class PaymentSuccessful
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public Payment $payment,
        public array $metadata = []
    ) {}
}

class PaymentFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $reason,
        public array $metadata = []
    ) {}
}

class PaymentRefunded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public float $amount,
        public string $refundId,
        public array $metadata = []
    ) {}
}

// ============================================================================
// PRODUCT/INVENTORY EVENTS
// ============================================================================

class PriceDrop
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Product $product,
        public float $oldPrice,
        public float $newPrice,
        public array $metadata = []
    ) {}
}

class BackInStock
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Product $product,
        public int $quantity,
        public array $metadata = []
    ) {}
}

class LowStockAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Product $product,
        public int $currentStock,
        public int $threshold,
        public array $metadata = []
    ) {}
}

class NewProductArrival
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Product $product,
        public array $metadata = []
    ) {}
}

// ============================================================================
// SHIPPING EVENTS
// ============================================================================

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $trackingNumber,
        public string $carrier,
        public array $metadata = []
    ) {}
}

class DeliveryOutForDelivery
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $trackingNumber,
        public string $driverName,
        public string $eta,
        public array $metadata = []
    ) {}
}

class DeliveryCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public array $metadata = []
    ) {}
}

class DeliveryFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $reason,
        public int $attemptNumber,
        public array $metadata = []
    ) {}
}

// ============================================================================
// USER/WISHLIST EVENTS
// ============================================================================

class WishlistPriceDrop
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Product $product,
        public float $oldPrice,
        public float $newPrice,
        public float $discountPercent,
        public array $metadata = []
    ) {}
}

class WishlistBackInStock
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Product $product,
        public int $quantity,
        public array $metadata = []
    ) {}
}

// ============================================================================
// PROMOTION/MARKETING EVENTS
// ============================================================================

class FlashSaleStarted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $userIds, // Bulk notification
        public array $products,
        public float $discountPercent,
        public \DateTime $endsAt,
        public array $metadata = []
    ) {}
}

class LoyaltyTierChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public string $newTier,
        public string $oldTier,
        public array $benefits,
        public array $metadata = []
    ) {}
}

// ============================================================================
// SECURITY EVENTS
// ============================================================================

class SecurityAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public string $alertType, // login_failed, password_changed, new_device, etc.
        public array $details,
        public string $severity = 'medium', // low, medium, high, critical
        public array $metadata = []
    ) {}
}

class LoginFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ?User $user,
        public string $ipAddress,
        public int $attemptCount,
        public array $metadata = []
    ) {}
}

// ============================================================================
// AUDIT/ADMIN EVENTS
// ============================================================================

class AuditAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $adminUserIds, // Array of super_admin IDs
        public string $eventType, // MASS_PURCHASE, BULK_PRICE_MODIFICATION, etc.
        public array $auditData,
        public string $severity = 'medium',
        public array $metadata = []
    ) {}
}

class MassPurchaseAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $adminUserIds,
        public Order $order,
        public int $itemCount,
        public float $totalValue,
        public string $customerType, // corporate, individual, reseller
        public array $metadata = []
    ) {}
}

class BulkOperationAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $adminUserIds,
        public string $operationType, // price_change, stock_adjustment, order_cancel
        public int $affectedCount,
        public array $details,
        public array $metadata = []
    ) {}
}

class SystemMaintenanceNotice
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $userIds, // empty = all users
        public \DateTime $startTime,
        public \DateTime $endTime,
        public array $affectedServices,
        public string $impact, // low, medium, high
        public array $metadata = []
    ) {}
}

// ============================================================================
// MESSAGE/SUPPORT EVENTS
// ============================================================================

class SupportMessageReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public string $messageId,
        public string $subject,
        public string $preview,
        public bool $isUrgent,
        public array $metadata = []
    ) {}
}

class DeliveryIssueReported
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Order $order,
        public string $issueType,
        public string $driverName,
        public int $attemptNumber,
        public array $metadata = []
    ) {}
}
