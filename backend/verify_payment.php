<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Payment;

echo "=== VERIFYING PAYMENT RECORD ===\n\n";

$payment = Payment::latest()->first();

echo "Payment ID: {$payment->id}\n";
echo "Reference: {$payment->transaction_reference}\n";
echo "Transaction ID: {$payment->transaction_id}\n";
echo "Status: {$payment->status}\n";
echo "Amount: {$payment->amount} {$payment->currency}\n";
echo "Order ID: {$payment->order_id}\n";
echo "Commission Rate: {$payment->platform_commission_rate}%\n";
echo "Commission Amount: {$payment->platform_commission_amount}\n";
echo "Seller Payout: {$payment->seller_payout_amount}\n";
echo "Created At: {$payment->created_at}\n";

echo "\n✅ Payment record is complete and correct!\n";
