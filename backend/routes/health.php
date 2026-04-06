<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'oshocks-api'
    ]);
});

// Railway health check endpoint
Route::get('/api/health', function () {
    return response()->json(['status' => 'ok']);
});
