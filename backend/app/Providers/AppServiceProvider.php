<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use App\Models\User;  
use App\Observers\UserObserver;  
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
        // Register User Observer
        User::observe(UserObserver::class);
        
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
    }
}