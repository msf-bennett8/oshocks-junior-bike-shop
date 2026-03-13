<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Payment;
use App\Models\Order;

echo "=== VERIFYING WEBHOOK UPDATE ===\n\n";

$payment = Payment::where('transaction_reference', 'OS_CARD_WQMQLCJETB_1773360433')->first();

if ($payment) {
    echo "Payment Found:\n";
    echo "  ID: {$payment->id}\n";
    echo "  Reference: {$payment->transaction_reference}\n";
    echo "  Status: {$payment->status}\n";
    echo "  External Tx ID: {$payment->external_transaction_id}\n";
    echo "  Verified At: {$payment->verified_at}\n";
    echo "  Payment Collected At: {$payment->payment_collected_at}\n";
    echo "  Payment Details: " . ($payment->payment_details ?? 'NULL') . "\n\n";
    
    $order = Order::find($payment->order_id);
    echo "Related Order:\n";
    echo "  ID: {$order->id}\n";
    echo "  Order Number: {$order->order_number}\n";
    echo "  Payment Status: {$order->payment_status}\n";
    echo "  Order Status: {$order->status}\n\n";
    
    if ($payment->status === 'completed' && $order->payment_status === 'paid') {
        echo "✅✅✅ WEBHOOK FULLY WORKING! Payment and Order updated correctly! ✅✅✅\n";
    } else {
        echo "⚠️ Webhook processed but status not as expected\n";
    }
} else {
    echo "❌ Payment not found!\n";
}

echo "\n=== VERIFICATION COMPLETE ===\n";
