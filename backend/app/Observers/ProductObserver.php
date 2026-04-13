<?php

namespace App\Observers;

use App\Events\LowStockAlert;
use App\Events\BackInStock;
use App\Events\PriceDrop;
use App\Events\NewProductArrival;
use App\Events\BulkOperationAlert;
use App\Models\Product;
use App\Services\AuditService;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        // Product creation is logged in controller for full context
        
        // Fire new product arrival notification
        NewProductArrival::dispatch($product, [
            'added_by' => auth()->id(),
            'category' => $product->category?->name,
        ]);
    }

    /**
     * Handle the Product "updating" event - capture old values.
     */
    public function updating(Product $product): void
    {
        // Store old values for comparison in updated event
        $product->oldValues = $product->getOriginal();
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $oldQuantity = $product->getOriginal('quantity');
        $newQuantity = $product->quantity;

        // Log inventory changes
        if ($oldQuantity !== $newQuantity) {
            $adjustment = $newQuantity - $oldQuantity;
            
            // Determine if this is an automatic or manual adjustment
            $isAutomatic = request()->route() === null; // No HTTP request = system triggered
            
            if ($isAutomatic) {
                // Automatic adjustment (order, reservation, etc.)
                AuditService::logInventoryAutoAdjusted($product, $adjustment, [
                    'trigger' => 'system',
                    'old_quantity' => $oldQuantity,
                    'new_quantity' => $newQuantity,
                ]);
            } else {
                // Manual adjustment by admin/seller
                AuditService::logInventoryUpdated($product, $adjustment, [
                    'old_quantity' => $oldQuantity,
                    'new_quantity' => $newQuantity,
                    'reason' => request()->input('reason', 'manual_adjustment'),
                ]);
            }

            // Check for back in stock (0 -> >0)
            if ($oldQuantity <= 0 && $newQuantity > 0) {
                BackInStock::dispatch(
                    auth()->user(), // Current user who made the update
                    $product,
                    $newQuantity
                );
            }

            // Check for low stock threshold
            if ($newQuantity <= $product->low_stock_threshold && $oldQuantity > $product->low_stock_threshold) {
                AuditService::logInventoryLowThresholdTriggered($product, [
                    'previous_quantity' => $oldQuantity,
                ]);

                // Fire low stock alert notification
                LowStockAlert::dispatch(
                    $product,
                    $newQuantity,
                    $product->low_stock_threshold,
                    [
                        'previous_quantity' => $oldQuantity,
                        'supplier' => $product->supplier_name,
                    ]
                );
            }
        }

        // Log price changes if not already logged in controller
        $oldPrice = $product->getOriginal('price');
        $newPrice = $product->price;
        $oldComparePrice = $product->getOriginal('compare_price');
        
        if ($oldPrice !== $newPrice && !request()->has('price_change_reason')) {
            AuditService::logProductPriceModified($product, $oldPrice, $newPrice, 'system_adjustment', [
                'currency' => 'KES',
            ]);
        }

        // Check for price drop (compare_price decreased)
        if ($oldComparePrice !== $product->compare_price && $product->compare_price < $oldComparePrice) {
            PriceDrop::dispatch(
                auth()->user(),
                $product,
                $oldComparePrice,
                $product->compare_price,
                ['percent' => round((($oldComparePrice - $product->compare_price) / $oldComparePrice) * 100)]
            );
        }

        // Check for bulk price modification (if multiple products updated in same request)
        if (request()->has('bulk_price_update')) {
            BulkOperationAlert::dispatch(
                [], // Admin IDs filled by listener
                'price_change',
                request()->input('affected_count', 1),
                [
                    'user' => auth()->user()?->name ?? 'system',
                    'reason' => request()->input('price_change_reason', 'Supplier cost increase'),
                    'average_change' => request()->input('average_change', '0%'),
                ]
            );
        }
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        // Soft deletes are logged in controller
    }

    /**
     * Handle the Product "forceDeleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        // Force deletes are logged in controller
    }
}
