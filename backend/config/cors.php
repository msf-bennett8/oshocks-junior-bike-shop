<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        // Production frontend (Vercel)
        'https://oshocks-junior-bike-shop.vercel.app',
        // Railway backend domain (add your actual Railway domain after deployment)
        'https://*.up.railway.app',
        // Local development
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ],
    
    'allowed_origins_patterns' => [
        // Allow all Railway subdomains dynamically
        '#^https://.*\.up\.railway\.app$#',
    ],
    
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-TOKEN'],
    
    'exposed_headers' => ['Authorization'],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
