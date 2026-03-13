<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING PAYMENTS TABLE SCHEMA ===\n\n";

$columns = DB::select('SHOW COLUMNS FROM payments');

echo "Column Name | Type | Null | Default | Extra\n";
echo str_repeat('-', 60) . "\n";

foreach ($columns as $column) {
    $null = $column->Null === 'NO' ? 'NOT NULL' : 'NULL';
    $default = $column->Default ?? 'NULL';
    echo "{$column->Field} | {$column->Type} | {$null} | {$default} | {$column->Extra}\n";
    
    // Highlight the problematic field
    if ($column->Field === 'transaction_id' && $column->Null === 'NO' && is_null($column->Default)) {
        echo "   ^^^ THIS FIELD IS REQUIRED BUT HAS NO DEFAULT! ^^^\n";
    }
}

echo "\n=== CHECK COMPLETE ===\n";
