<?php

use Illuminate\Support\Str;

return [

    'driver' => env('SESSION_DRIVER', 'database'), // database is best for Railway

    'lifetime' => (int) env('SESSION_LIFETIME', 120),

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    'encrypt' => env('SESSION_ENCRYPT', true), // Encrypt for security

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION'), // Uses default DB connection

    'table' => env('SESSION_TABLE', 'sessions'),

    'store' => env('SESSION_STORE'),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug((string) env('APP_NAME', 'laravel')).'-session'
    ),

    'path' => env('SESSION_PATH', '/'),

    'domain' => env('SESSION_DOMAIN', null), // null = current domain

    'secure' => env('SESSION_SECURE_COOKIE', true), // true for HTTPS on Railway

    'http_only' => env('SESSION_HTTP_ONLY', true),

    'same_site' => env('SESSION_SAME_SITE', 'lax'), // lax for cross-site auth

    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

];
