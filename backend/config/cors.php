<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        // Production frontend (Vercel)
        'https://oshocks-junior-bike-shop.vercel.app',
        // Railway backend domain
        'https://oshocks-backend-production.up.railway.app',
        // Local development
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ],
    
    'allowed_origins_patterns' => [
        // Allow ALL Vercel preview deployments dynamically
        '#^https://oshocks-junior-bike-shop-.*\.vercel\.app$#',
        // Allow all Railway subdomains
        '#^https://.*\.up\.railway\.app$#',
    ],
    
    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-CSRF-TOKEN'],
    
    'exposed_headers' => ['Authorization'],
    
    'max_age' => 86400,
    
    'supports_credentials' => true,
];
