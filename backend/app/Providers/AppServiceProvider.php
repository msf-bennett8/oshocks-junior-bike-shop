<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
