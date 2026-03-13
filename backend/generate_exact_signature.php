<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$secret = config('services.paystack.secret_key');

// The EXACT payload as it will be sent (no extra spaces)
$payload = '{"event":"charge.success","data":{"reference":"OS_CARD_WQMQLCJETB_1773360433","status":"success","amount":2035000,"currency":"KES","paid_at":"2026-03-13T00:15:00.000Z","authorization":{"last4":"4081","brand":"visa"}}}';

$signature = hash_hmac('sha512', $payload, $secret);

echo "=== EXACT SIGNATURE GENERATION ===\n\n";
echo "Payload (exact bytes):\n{$payload}\n\n";
echo "Signature:\n{$signature}\n\n";

// Save to file for easy copy-paste
file_put_contents('/tmp/webhook_test.txt', "curl -X POST \"https://oshocks-backend-production.up.railway.app/api/v1/payments/card/webhook\" \\\n  -H \"Content-Type: application/json\" \\\n  -H \"x-paystack-signature: {$signature}\" \\\n  -d '{$payload}'\n");
echo "Curl command saved to: /tmp/webhook_test.txt\n";
