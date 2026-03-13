<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Order;

echo "=== TESTING ORDER RELATIONSHIP CHAIN ===\n\n";

$order = Order::with('items.product.seller')->find(1);

echo "Order ID: {$order->id}\n";
echo "Order Total: {$order->total}\n";
echo "Items count: " . $order->items->count() . "\n\n";

if ($order->items->count() > 0) {
    $firstItem = $order->items->first();
    echo "First item ID: {$firstItem->id}\n";
    
    if ($firstItem->product) {
        echo "Product ID: {$firstItem->product->id}\n";
        echo "Product Name: {$firstItem->product->name}\n";
        echo "Seller ID: {$firstItem->product->seller_id}\n";
        
        if ($firstItem->product->seller) {
            echo "Seller exists: YES\n";
            echo "Seller Shop: {$firstItem->product->seller->shop_name}\n";
        } else {
            echo "Seller exists: NO (seller_id: {$firstItem->product->seller_id})\n";
        }
    } else {
        echo "❌ Product not found for this item!\n";
    }
} else {
    echo "❌ No items found for this order!\n";
}

echo "\n=== TEST COMPLETE ===\n";
