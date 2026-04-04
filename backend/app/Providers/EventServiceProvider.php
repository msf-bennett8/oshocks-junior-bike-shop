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
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        WishlistItem::observe(WishlistObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
