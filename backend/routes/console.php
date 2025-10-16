<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->isHidden();

// Auto-run migrations on startup in production
if (app()->environment('production')) {
    Artisan::call('migrate', ['--force' => true]);
}