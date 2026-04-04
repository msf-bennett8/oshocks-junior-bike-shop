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
        'hash_ips' => true,
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

];
