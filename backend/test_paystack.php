<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use App\Models\Order;

echo "=== PAYSTACK DIAGNOSTIC TEST ===\n\n";

// Test 1: Check Order
echo "1. CHECKING ORDER:\n";
$order = Order::find(1);
if ($order) {
    echo "   ✅ Order found\n";
    echo "   ID: {$order->id}\n";
    echo "   Total: {$order->total}\n";
    echo "   Status: {$order->status}\n";
    echo "   Payment Status: {$order->payment_status}\n";
} else {
    echo "   ❌ Order NOT found\n";
}
echo "\n";

// Test 2: Check Paystack Config
echo "2. CHECKING PAYSTACK CONFIG:\n";
$secret = config('services.paystack.secret_key');
$currency = config('services.paystack.currency');
echo "   Secret: " . substr($secret, 0, 15) . "...\n";
echo "   Currency: {$currency}\n";
echo "   Environment: " . config('services.paystack.environment') . "\n";
echo "\n";

// Test 3: Test Paystack API with NGN (known working)
echo "3. TESTING PAYSTACK API WITH NGN:\n";
try {
    $response = Http::withToken($secret)
        ->post('https://api.paystack.co/transaction/initialize', [
            'email' => 'test@example.com',
            'amount' => 10000,
            'currency' => 'NGN',
            'reference' => 'TEST_NGN_' . time(),
        ]);
    
    echo "   Status: " . $response->status() . "\n";
    $data = $response->json();
    echo "   Message: " . ($data['message'] ?? 'N/A') . "\n";
    
    if ($response->successful() && isset($data['data']['authorization_url'])) {
        echo "   ✅ NGN WORKS! URL: " . $data['data']['authorization_url'] . "\n";
    } else {
        echo "   ❌ NGN Failed: " . json_encode($data) . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 4: Test Paystack API with KES (your currency)
echo "4. TESTING PAYSTACK API WITH KES:\n";
try {
    $response = Http::withToken($secret)
        ->post('https://api.paystack.co/transaction/initialize', [
            'email' => 'test@example.com',
            'amount' => 10000,
            'currency' => 'KES',
            'reference' => 'TEST_KES_' . time(),
        ]);
    
    echo "   Status: " . $response->status() . "\n";
    $data = $response->json();
    echo "   Message: " . ($data['message'] ?? 'N/A') . "\n";
    
    if ($response->successful() && isset($data['data']['authorization_url'])) {
        echo "   ✅ KES WORKS! URL: " . $data['data']['authorization_url'] . "\n";
    } else {
        echo "   ❌ KES Failed: " . json_encode($data) . "\n";
    }
} catch (Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== TEST COMPLETE ===\n";
