<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Audit Log Tier Classification
    |--------------------------------------------------------------------------
    |
    | TIER_1_IMMUTABLE: Auth, Financial, Privacy, Admin, Security
    |   - Retention: 7-10 years
    |   - Storage: WORM (Write Once Read Many)
    |   - Encryption: AES-256 + HSM
    |   - Append-only: YES (never delete/modify)
    |
    | TIER_2_OPERATIONAL: Orders, Inventory, API, System Health
    |   - Retention: 2-5 years
    |   - Storage: PostgreSQL/TimescaleDB
    |   - Versioned updates allowed
    |
    | TIER_3_ANALYTICS: Business logs, Marketing, Views
    |   - Retention: 90 days - 2 years
    |   - Storage: ClickHouse/BigQuery
    |   - No immutability requirements
    |
    */

    'tiers' => [
        'tier_1' => [
            'name' => 'TIER_1_IMMUTABLE',
            'categories' => ['auth', 'financial', 'privacy', 'admin', 'security'],
            'retention_days' => env('AUDIT_TIER1_RETENTION_DAYS', 3650), // 10 years
            'integrity_hash' => true,
            'append_only' => true,
        ],
        'tier_2' => [
            'name' => 'TIER_2_OPERATIONAL',
            'categories' => ['order', 'inventory', 'api', 'system', 'config'],
            'retention_days' => env('AUDIT_TIER2_RETENTION_DAYS', 1825), // 5 years
            'integrity_hash' => false,
            'append_only' => false,
        ],
        'tier_3' => [
            'name' => 'TIER_3_ANALYTICS',
            'categories' => ['business', 'marketing', 'analytics', 'view'],
            'retention_days' => env('AUDIT_TIER3_RETENTION_DAYS', 730), // 2 years
            'integrity_hash' => false,
            'append_only' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cryptographic Integrity
    |--------------------------------------------------------------------------
    */
    'integrity' => [
        'algorithm' => 'sha256',
        'chain_enabled' => true, // Blockchain-style previous_hash chaining
        'namespace' => env('AUDIT_UUID_NAMESPACE', 'a3f5c8d9-1e2b-4c7d-9f8e-6d5c4b3a2109'),
    ],

    /*
    |--------------------------------------------------------------------------
    | PII Handling
    |--------------------------------------------------------------------------
    */
    'pii' => [
        'hash_ips' => env('AUDIT_PII_HASH_IPS', false),
        'hash_emails' => true,
        'hash_phones' => true,
        'truncate_user_agent' => 500,
        'mask_ip_octets' => 2, // 192.168.x.x
    ],

    /*
    |--------------------------------------------------------------------------
    | Retention Settings
    |--------------------------------------------------------------------------
    */
    'retention' => [
        'cleanup_enabled' => env('AUDIT_CLEANUP_ENABLED', true),
        'archive_before_delete' => env('AUDIT_ARCHIVE_BEFORE_DELETE', true),
        'batch_size' => 1000,
    ],

     /*
    |--------------------------------------------------------------------------
    | Async Publishing
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'enabled' => env('AUDIT_QUEUE_ENABLED', false),
        'connection' => env('AUDIT_QUEUE_CONNECTION', 'redis'),
        'queue' => env('AUDIT_QUEUE_NAME', 'audit-logs'),
        'retry_after' => 3600, // 1 hour for audit jobs
        'tries' => 3,
        'backoff' => [10, 30, 60], // Exponential backoff
    ],

    /*
    |--------------------------------------------------------------------------
    | Cold Storage (WORM) Configuration
    |--------------------------------------------------------------------------
    |
    | TIER_1_IMMUTABLE events are automatically shipped to cold storage
    | for long-term retention. Supports AWS Glacier, Azure Archive, or
    | any S3-compatible storage with object lock enabled.
    |
    */
    'cold_storage' => [
        'enabled' => env('AUDIT_COLD_STORAGE_ENABLED', false),
        'disk' => env('AUDIT_COLD_STORAGE_DISK', 's3'),
        'path_prefix' => env('AUDIT_COLD_STORAGE_PATH_PREFIX', 'audit-logs/tier1'),
        'encryption' => [
            'enabled' => env('AUDIT_COLD_STORAGE_ENCRYPTION_ENABLED', true),
            'key' => env('AUDIT_COLD_STORAGE_ENCRYPTION_KEY', env('APP_KEY')),
        ],
        'retention_days' => 3650, // 10 years for compliance
    ],

    /*
    |--------------------------------------------------------------------------
    | Geolocation
    |--------------------------------------------------------------------------
    */
    'geolocation' => [
        'enabled' => env('AUDIT_GEOLOCATION_ENABLED', true),
        'service' => 'ipapi', // ipapi, ipinfo, maxmind
    ],

    /*
    |--------------------------------------------------------------------------
    | SIEM Integration
    |--------------------------------------------------------------------------
    */
    'siem' => [
        'enabled' => env('AUDIT_SIEM_ENABLED', false),
        'endpoint' => env('AUDIT_SIEM_ENDPOINT'),
        'api_key' => env('AUDIT_SIEM_API_KEY'),
        'forward_tiers' => ['TIER_1_IMMUTABLE', 'TIER_2_OPERATIONAL'],
        'forward_severities' => ['high', 'critical'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Alerting Configuration
    |--------------------------------------------------------------------------
    */
    'alerts' => [
        'enabled' => env('AUDIT_ALERTS_ENABLED', true),
        'email_recipients' => explode(',', env('AUDIT_ALERT_EMAILS', '')),
        'webhook_url' => env('AUDIT_ALERT_WEBHOOK'),
        'sms_numbers' => explode(',', env('AUDIT_ALERT_SMS', '')),
    ],

];
