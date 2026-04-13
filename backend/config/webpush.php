<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID Keys
    |--------------------------------------------------------------------------
    */
    'vapid' => [
        'subject' => env('VAPID_SUBJECT', 'mailto:oshocksstores@gmail.com'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Notification Options
    |--------------------------------------------------------------------------
    */
    'options' => [
        'TTL' => 43200, // 12 hours
        'urgency' => 'normal', // normal, high, low
        'topic' => 'notifications',
    ],
];
