<?php

namespace App\Observers;

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

            // Check for low stock threshold
            if ($newQuantity <= $product->low_stock_threshold && $oldQuantity > $product->low_stock_threshold) {
                AuditService::logInventoryLowThresholdTriggered($product, [
                    'previous_quantity' => $oldQuantity,
                ]);
            }
        }

        // Log price changes if not already logged in controller
        $oldPrice = $product->getOriginal('price');
        $newPrice = $product->price;
        if ($oldPrice !== $newPrice && !request()->has('price_change_reason')) {
            AuditService::logProductPriceModified($product, $oldPrice, $newPrice, 'system_adjustment', [
                'currency' => 'KES',
            ]);
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
