<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Audit Queue Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the queue configuration specifically for audit logs.
    | It extends the main queue config with audit-specific settings.
    |
    */

    'audit' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'audit-logs',
        'retry_after' => 3600, // 1 hour
        'block_for' => null,
        'after_commit' => true, // Only dispatch after DB commit
    ],

    'audit-priority' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'audit-logs-priority',
        'retry_after' => 3600,
        'block_for' => null,
        'after_commit' => true,
    ],

    'audit-bulk' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'audit-logs-bulk',
        'retry_after' => 7200, // 2 hours for bulk operations
        'block_for' => null,
        'after_commit' => false,
    ],

];
