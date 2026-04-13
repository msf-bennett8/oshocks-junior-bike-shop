<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://oshocks-junior-bike-shop.vercel.app',
        'https://oshocks-backend-production.up.railway.app',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ],
    
    'allowed_origins_patterns' => [
        '#^https://oshocks-junior-bike-shop-.*\.vercel\.app$#',
        '#^https://.*\.up\.railway\.app$#',
    ],
    
    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-TOKEN',
        'X-Effective-Role',
        'X-Request-Id',
        'X-Correlation-Id',
        'X-Screen-Info',
        'X-Client-Version',
        'X-Device-Type',
        'X-App-Name',
        'X-User-Agent',
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Timezone',
        'X-Session-Id',
        'X-Canvas-Fingerprint',
        'x-device-fingerprint',
        'Access-Control-Allow-Origin',
    ],
    
    'exposed_headers' => ['Authorization'],
    
    'max_age' => 86400,
    
    'supports_credentials' => true,
];