<?php

namespace App\Observers;

use App\Models\WishlistItem;
use App\Services\BusinessOperationsService;

class WishlistObserver
{
    /**
     * Handle the WishlistItem "created" event.
     */
    public function created(WishlistItem $wishlistItem): void
    {
        if ($wishlistItem->wishlist && $wishlistItem->wishlist->user) {
            BusinessOperationsService::trackWishlistAdd(
                $wishlistItem->wishlist->user,
                $wishlistItem
            );
        }
    }

    /**
     * Handle the WishlistItem "deleted" event.
     */
    public function deleted(WishlistItem $wishlistItem): void
    {
        if ($wishlistItem->wishlist && $wishlistItem->wishlist->user) {
            BusinessOperationsService::trackWishlistRemove(
                $wishlistItem->wishlist->user,
                $wishlistItem
            );
        }
    }
}
