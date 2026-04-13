<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Models\WishlistItem;
use App\Observers\WishlistObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Cache\Events\KeyForgotten;
use Illuminate\Cache\Events\KeyWritten;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Queue\Events\JobFailed;
use App\Listeners\CacheEventListener;
use App\Listeners\QueueJobListener;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        
        // CRITICAL: Strava OAuth Configuration
        \SocialiteProviders\Manager\SocialiteWasCalled::class => [
            'SocialiteProviders\\Strava\\StravaExtendSocialite@handle',
        ],

        // Phase 6: Cache events for audit logging
        KeyForgotten::class => [
            [CacheEventListener::class, 'handleKeyForgotten'],
        ],
        KeyWritten::class => [
            [CacheEventListener::class, 'handleKeyWritten'],
        ],

        // Phase 6: Queue events for job monitoring
        JobProcessing::class => [
            QueueJobListener::class,
        ],
        JobProcessed::class => [
            [QueueJobListener::class, 'handleJobProcessed'],
        ],
        JobFailed::class => [
            [QueueJobListener::class, 'handleJobFailed'],
        ],

        // ============================================================================
        // NOTIFICATION EVENTS - PHASE 3
        // ============================================================================
        
        // Order Events
        \App\Events\OrderPlaced::class => [
            \App\Listeners\SendOrderConfirmation::class,
        ],
        \App\Events\OrderStatusChanged::class => [
            \App\Listeners\SendStatusUpdate::class,
        ],
        \App\Events\OrderShipped::class => [
            \App\Listeners\SendStatusUpdate::class,
        ],
        \App\Events\DeliveryOutForDelivery::class => [
            \App\Listeners\SendDeliveryNotification::class,
        ],
        \App\Events\DeliveryCompleted::class => [
            \App\Listeners\SendStatusUpdate::class,
        ],

        // Payment Events
        \App\Events\PaymentSuccessful::class => [
            \App\Listeners\SendPaymentConfirmation::class,
        ],
        \App\Events\PaymentFailed::class => [
            \App\Listeners\SendPaymentFailure::class,
        ],
        \App\Events\PaymentRefunded::class => [
            \App\Listeners\SendRefundNotification::class,
        ],

        // Product/Inventory Events
        \App\Events\LowStockAlert::class => [
            \App\Listeners\SendStockAlert::class,
        ],
        \App\Events\BackInStock::class => [
            \App\Listeners\SendBackInStockNotification::class,
        ],
        \App\Events\PriceDrop::class => [
            \App\Listeners\SendPriceAlert::class,
        ],
        \App\Events\NewProductArrival::class => [
            \App\Listeners\SendNewProductNotification::class,
        ],

        // Wishlist Events
        \App\Events\WishlistPriceDrop::class => [
            \App\Listeners\SendWishlistPriceNotification::class,
        ],
        \App\Events\WishlistBackInStock::class => [
            \App\Listeners\SendWishlistStockNotification::class,
        ],

        // Security Events
        \App\Events\SecurityAlert::class => [
            \App\Listeners\SendSecurityNotification::class,
        ],
        \App\Events\LoginFailed::class => [
            \App\Listeners\SendFailedLoginAlert::class,
        ],

        // Audit/Admin Events
        \App\Events\AuditAlert::class => [
            \App\Listeners\SendAuditNotification::class,
        ],
        \App\Events\MassPurchaseAlert::class => [
            \App\Listeners\SendMassPurchaseNotification::class,
        ],
        \App\Events\BulkOperationAlert::class => [
            \App\Listeners\SendBulkOperationNotification::class,
        ],
        \App\Events\SystemMaintenanceNotice::class => [
            \App\Listeners\SendMaintenanceNotification::class,
        ],

        // Marketing Events
        \App\Events\FlashSaleStarted::class => [
            \App\Listeners\SendFlashSaleNotification::class,
        ],
        \App\Events\LoyaltyTierChanged::class => [
            \App\Listeners\SendLoyaltyNotification::class,
        ],

        // Support Events
        \App\Events\SupportMessageReceived::class => [
            \App\Listeners\SendSupportNotification::class,
        ],
        \App\Events\DeliveryIssueReported::class => [
            \App\Listeners\SendDeliveryIssueNotification::class,
        ],
    ];

    /**
     * The subscriber classes to register.
     *
     * @var array
     */
    protected $subscribe = [
        \App\Listeners\SecurityEventSubscriber::class,
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        WishlistItem::observe(WishlistObserver::class);
        \App\Models\Order::observe(\App\Observers\OrderObserver::class);
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
