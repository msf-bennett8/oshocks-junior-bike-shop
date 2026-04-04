<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use App\Models\User;  
use App\Models\Order;  
use App\Models\Product;  
use App\Observers\UserObserver;  
use App\Observers\OrderObserver;  
use App\Observers\ProductObserver;  
use App\Services\CloudinaryService;  

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register CloudinaryService as singleton
        $this->app->singleton(CloudinaryService::class, function ($app) {
            return new CloudinaryService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Observers
        User::observe(UserObserver::class);
        Order::observe(OrderObserver::class);
        Product::observe(ProductObserver::class);
        
        // Register Strava Socialite Provider
        $this->app->make(SocialiteFactory::class)->extend('strava', function ($app) {
            $config = $app['config']['services.strava'];
            return new \SocialiteProviders\Strava\Provider(
                $app['request'],
                $config['client_id'],
                $config['client_secret'],
                $config['redirect']
            );
        });
        
        // Initialize audit context for console commands
        if ($this->app->runningInConsole()) {
            \App\Services\AuditContextService::set('correlation_id', 'console-' . uniqid());
            \App\Services\AuditContextService::set('actor_type', 'SYSTEM');
        }
        
        // Force HTTPS in production
        if (config('app.env') === 'production') {
            \URL::forceScheme('https');
        }
    }
}