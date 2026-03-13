<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\CommissionService;

echo "=== TESTING COMMISSION SERVICE ===\n\n";

// Test 1: Static call (correct way based on current definition)
echo "1. Testing STATIC call (CommissionService::calculate):\n";
try {
    $result = CommissionService::calculate(20350.00, 1);
    echo "   ✅ SUCCESS: " . json_encode($result) . "\n";
} catch (Exception $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
}

// Test 2: Instance call (what CardPaymentController is doing)
echo "\n2. Testing INSTANCE call (commissionService->calculate):\n";
try {
    $commissionService = app(CommissionService::class);
    $result = $commissionService->calculate(20350.00, 1);
    echo "   ✅ SUCCESS: " . json_encode($result) . "\n";
} catch (Error $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
    echo "   This confirms the bug!\n";
} catch (Exception $e) {
    echo "   ❌ FAILED: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
