<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'auth/*'],
    
    'allowed_methods' => ['*'],
    
    'allowed_origins' => [
        'https://oshocks-junior-bike-shop.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173',
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => ['Authorization'],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
