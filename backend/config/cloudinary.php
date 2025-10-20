<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
    'secure' => true,
    
    // Upload presets
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET', 'ml_default'),
    
    // Folder structure
    'folders' => [
        'products' => 'oshocks/products',
        'users' => 'oshocks/users',
        'categories' => 'oshocks/categories',
    ],
    
    // Image transformation defaults
    'transformations' => [
        'thumbnail' => [
            'width' => 150,
            'height' => 150,
            'crop' => 'fill',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ],
        'medium' => [
            'width' => 500,
            'height' => 500,
            'crop' => 'fill',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ],
        'large' => [
            'width' => 1200,
            'height' => 1200,
            'crop' => 'limit',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ]
    ]
];