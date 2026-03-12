<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // OAuth Services
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'strava' => [
        'client_id' => env('STRAVA_CLIENT_ID'),
        'client_secret' => env('STRAVA_CLIENT_SECRET'),
        'redirect' => env('STRAVA_REDIRECT_URI'),
    ],

    /*
    |--------------------------------------------------------------------------
    | M-Pesa Daraja API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Safaricom M-Pesa Daraja API integration.
    | Supports both Sandbox and Production environments.
    |
    */

    'mpesa' => [
        // Environment: 'sandbox' or 'production'
        'env' => env('MPESA_ENV', 'sandbox'),
        
        // OAuth Credentials
        'consumer_key' => env('MPESA_CONSUMER_KEY'),
        'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
        
        // Business Shortcode (Paybill or Till Number)
        'shortcode' => env('MPESA_SHORTCODE'),
        
        // Passkey (from Safaricom portal)
        'passkey' => env('MPESA_PASSKEY'),
        
        // Initiator credentials for B2C/B2B transactions
        'initiator_name' => env('MPESA_INITIATOR_NAME'),
        'security_credential' => env('MPESA_SECURITY_CREDENTIAL'),
        
        // Callback URLs - Must be HTTPS and publicly accessible
        'callback_url' => env('MPESA_CALLBACK_URL'),
        
        // B2C specific URLs
        'b2c_timeout_url' => env('MPESA_B2C_TIMEOUT_URL'),
        'b2c_result_url' => env('MPESA_B2C_RESULT_URL'),
        
        // Transaction status URLs
        'transaction_status_result_url' => env('MPESA_TRANSACTION_STATUS_RESULT_URL'),
        'transaction_status_timeout_url' => env('MPESA_TRANSACTION_STATUS_TIMEOUT_URL'),
        
        // Balance query URLs
        'balance_result_url' => env('MPESA_BALANCE_RESULT_URL'),
        'balance_timeout_url' => env('MPESA_BALANCE_TIMEOUT_URL'),
        
        // Platform settings
        'platform_name' => env('MPESA_PLATFORM_NAME', 'Oshocks Bike Shop'),
        'default_transaction_desc' => env('MPESA_DEFAULT_TRANSACTION_DESC', 'Payment for goods'),
    ],

];
