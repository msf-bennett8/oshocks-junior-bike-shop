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

// Phase 6: System Health Monitoring

// Database backup - daily at 3 AM (after cleanup)
Schedule::command('db:backup --type=full --storage=r2')
    ->daily()
    ->at('03:00')
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('✅ Scheduled database backup completed');
    })
    ->onFailure(function () {
        \Log::error('❌ Scheduled database backup failed');
    });

// Cache warmup - every 6 hours
Schedule::command('cache:warmup')
    ->everySixHours()
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('✅ Scheduled cache warmup completed');
    });

// API key cleanup - hourly to deactivate expired grace period keys
Schedule::call(function () {
    $controller = new \App\Http\Controllers\Api\ApiKeyController();
    $controller->cleanupExpiredKeys();
})->hourly();

// Search index update - every 30 minutes during business hours
Schedule::call(function () {
    // Log search index update
    $start = microtime(true);
    
    // Refresh product search index
    $products = \App\Models\Product::searchable()->count();
    
    \App\Services\AuditService::logSearchIndexUpdated(null, [
        'index_name' => 'products',
        'documents_updated' => $products,
        'duration_ms' => round((microtime(true) - $start) * 1000),
    ]);
})->everyThirtyMinutes()->between('06:00', '22:00');