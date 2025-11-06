<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->isHidden();

// Schedule audit log cleanup daily at 2 AM
Schedule::command('audit:cleanup --force')
    ->daily()
    ->at('02:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('✅ Scheduled audit cleanup completed successfully');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduled audit cleanup failed');
    });