<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;
use App\Models\Payment;
use App\Services\CommissionService;
use App\Services\PaystackService;
use Illuminate\Support\Str;

echo "=== FULL PAYMENT FLOW SIMULATION ===\n\n";

try {
    // Step 1: Get Order
    echo "1. Fetching order...\n";
    $order = Order::with('items.product.seller', 'user')->findOrFail(1);
    echo "   ✅ Order found: #{$order->id}, Total: {$order->total}\n\n";

    // Step 2: Check payment status
    echo "2. Checking payment status...\n";
    if ($order->payment_status === 'paid') {
        echo "   ⚠️ Order already paid!\n";
        exit;
    }
    echo "   ✅ Order is pending\n\n";

    // Step 3: Generate reference
    $reference = 'OS_CARD_' . strtoupper(Str::random(10)) . '_' . time();
    echo "3. Generated reference: {$reference}\n\n";

    // Step 4: Calculate commission (THE BUG IS HERE)
    echo "4. Calculating commission...\n";
    $amount = $order->total;
    $sellerId = $order->items->first()->product->seller_id ?? null;
    echo "   Amount: {$amount}, Seller ID: {$sellerId}\n";
    
    // This is the line that fails in the controller
    $commissionService = app(CommissionService::class);
    $commissionData = $commissionService->calculate($amount, $sellerId); // BUG!
    
    echo "   ✅ Commission: " . json_encode($commissionData) . "\n\n";

    // Step 5: Create payment record
    echo "5. Creating payment record...\n";
    $payment = Payment::create([
        'order_id' => $order->id,
        'seller_id' => $sellerId,
        'sale_channel' => 'online_delivery',
        'payment_method' => 'card',
        'transaction_reference' => $reference,
        'amount' => $amount,
        'currency' => 'KES',
        'platform_commission_rate' => $commissionData['commission_rate'],
        'platform_commission_amount' => $commissionData['commission_amount'],
        'seller_payout_amount' => $commissionData['seller_payout'],
        'status' => 'pending',
        'payout_status' => 'pending',
        'metadata' => [
            'order_number' => $order->order_number,
            'customer_email' => 'test@example.com',
            'payment_type' => 'card',
        ],
    ]);
    echo "   ✅ Payment created: #{$payment->id}\n\n";

    // Step 6: Initialize Paystack
    echo "6. Initializing Paystack...\n";
    $paystackService = app(PaystackService::class);
    $callbackUrl = rtrim(config('app.url'), '/') . '/api/v1/payments/card/callback';
    
    $response = $paystackService->initializeTransaction(
        email: 'test@example.com',
        amount: $amount,
        reference: $reference,
        metadata: [
            'order_id' => $order->id,
            'payment_id' => $payment->id,
            'customer_id' => $order->user_id,
        ],
        callbackUrl: $callbackUrl
    );

    if ($response['success']) {
        echo "   ✅ Paystack initialized!\n";
        echo "   Authorization URL: {$response['authorization_url']}\n";
    } else {
        echo "   ❌ Paystack failed: {$response['error']}\n";
    }

} catch (\Error $e) {
    echo "\n❌❌❌ ERROR CAUGHT ❌❌❌\n";
    echo "Type: " . get_class($e) . "\n";
    echo "Message: {$e->getMessage()}\n";
    echo "File: {$e->getFile()}:{$e->getLine()}\n";
    echo "\nThis is the exact error causing 'Payment initialization failed'\n";
} catch (\Exception $e) {
    echo "\n❌❌❌ EXCEPTION CAUGHT ❌❌❌\n";
    echo "Type: " . get_class($e) . "\n";
    echo "Message: {$e->getMessage()}\n";
}

echo "\n=== TEST COMPLETE ===\n";
