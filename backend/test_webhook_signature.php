<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secret = config('services.paystack.secret_key');
$payload = json_encode([
    "event" => "charge.success",
    "data" => [
        "reference" => "OS_CARD_WQMQLCJETB_1773360433",
        "status" => "success",
        "amount" => 2035000,
        "currency" => "KES"
    ]
]);

$signature = hash_hmac('sha512', $payload, $secret);

echo "=== WEBHOOK SIGNATURE TEST ===\n\n";
echo "Secret Key (first 20 chars): " . substr($secret, 0, 20) . "...\n";
echo "Payload: " . $payload . "\n\n";
echo "Generated Signature: {$signature}\n\n";

echo "Test with this curl command:\n";
echo "curl -X POST https://oshocks-backend-production.up.railway.app/api/v1/payments/card/webhook \\\n";
echo "  -H 'Content-Type: application/json' \\\n";
echo "  -H 'x-paystack-signature: {$signature}' \\\n";
echo "  -d '{$payload}'\n";
