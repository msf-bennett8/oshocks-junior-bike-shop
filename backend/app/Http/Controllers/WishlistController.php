<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    /**
     * Get user's wishlist with all items
     */
    public function index(Request $request)
    {
        $wishlist = $this->getOrCreateWishlist($request);

        $wishlistItems = WishlistItem::with([
            'product.images',
            'product.category',
            'product.seller',
            'variant'
        ])
        ->where('wishlist_id', $wishlist->id)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'category' => $item->product->category->name ?? 'Uncategorized',
                'price' => (float) $item->product->price,
                'originalPrice' => $item->product->compare_price ? (float) $item->product->compare_price : null,
                'stock' => $item->product->quantity,
                'condition' => $item->product->condition,
                'image' => $item->product->images->first()->image_url ?? null,
                'thumbnail' => $item->product->images->first()->thumbnail_url ?? null,
                'seller' => $item->product->seller->name ?? 'Oshocks Junior',
                'rating' => (float) $item->product->rating,
                'reviews_count' => $item->product->reviews_count,
                'is_active' => $item->product->is_active,
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'name' => $item->variant->name,
                    'price' => (float) $item->variant->price,
                    'attributes' => $item->variant->attributes,
                ] : null,
                'added_at' => $item->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'wishlist_id' => $wishlist->id,
            'items' => $wishlistItems,
            'count' => $wishlistItems->count(),
        ]);
    }

    /**
     * Add item to wishlist
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $wishlist = $this->getOrCreateWishlist($request);
        $product = Product::findOrFail($request->product_id);

        // Check if product is active
        if (!$product->is_active) {
            return response()->json([
                'message' => 'This product is not available',
            ], 400);
        }

        // Check if item already exists in wishlist
        $existingItem = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->product_id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if ($existingItem) {
            return response()->json([
                'message' => 'Item already exists in wishlist',
                'item' => $existingItem
            ], 200);
        }

        // Create new wishlist item
        $wishlistItem = WishlistItem::create([
            'wishlist_id' => $wishlist->id,
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
        ]);

        // Load relationships for response
        $wishlistItem->load('product.images', 'variant');

        return response()->json([
            'message' => 'Item added to wishlist successfully',
            'item' => [
                'id' => $wishlistItem->id,
                'product_id' => $wishlistItem->product_id,
                'name' => $wishlistItem->product->name,
                'slug' => $wishlistItem->product->slug,
                'price' => (float) $wishlistItem->product->price,
                'image' => $wishlistItem->product->images->first()->image_url ?? null,
                'thumbnail' => $wishlistItem->product->images->first()->thumbnail_url ?? null,
                'variant' => $wishlistItem->variant ? [
                    'id' => $wishlistItem->variant->id,
                    'name' => $wishlistItem->variant->name,
                    'price' => (float) $wishlistItem->variant->price,
                ] : null,
            ]
        ], 201);
    }

    /**
     * Remove item from wishlist
     */
    public function removeItem(Request $request, $itemId)
    {
        $wishlist = $this->getOrCreateWishlist($request);
        
        $wishlistItem = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Item removed from wishlist successfully'
        ]);
    }

    /**
     * Remove item by product_id and variant_id
     */
    public function removeByProduct(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $wishlist = $this->getOrCreateWishlist($request);
        
        $wishlistItem = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->product_id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if (!$wishlistItem) {
            return response()->json([
                'message' => 'Item not found in wishlist'
            ], 404);
        }

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Item removed from wishlist successfully'
        ]);
    }

    /**
     * Check if item is in wishlist
     */
    public function checkItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $wishlist = $this->getOrCreateWishlist($request);
        
        $existingItem = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->product_id)
            ->where('variant_id', $request->variant_id)
            ->first();

        return response()->json([
            'in_wishlist' => $existingItem !== null,
            'item_id' => $existingItem ? $existingItem->id : null,
        ]);
    }

    /**
     * Clear entire wishlist
     */
    public function clearWishlist(Request $request)
    {
        $wishlist = $this->getOrCreateWishlist($request);
        
        WishlistItem::where('wishlist_id', $wishlist->id)->delete();

        return response()->json([
            'message' => 'Wishlist cleared successfully'
        ]);
    }

    /**
     * Move item from wishlist to cart
     */
    public function moveToCart(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'integer|min:1',
        ]);

        $wishlist = $this->getOrCreateWishlist($request);
        
        $wishlistItem = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('id', $itemId)
            ->with('product')
            ->firstOrFail();

        // Check stock
        $product = $wishlistItem->product;
        $quantity = $request->quantity ?? 1;

        if ($product->quantity < $quantity) {
            return response()->json([
                'message' => 'Insufficient stock available',
                'available_stock' => $product->quantity
            ], 400);
        }

        // Add to cart using CartController logic
        $cartController = new CartController();
        $cartRequest = new Request([
            'product_id' => $wishlistItem->product_id,
            'variant_id' => $wishlistItem->variant_id,
            'quantity' => $quantity,
        ]);
        
        // Manually set authorization
        $cartRequest->headers->set('Authorization', $request->header('Authorization'));
        
        $cartResponse = $cartController->addItem($cartRequest);

        // If successfully added to cart, remove from wishlist
        if ($cartResponse->getStatusCode() === 201 || $cartResponse->getStatusCode() === 200) {
            $wishlistItem->delete();
            
            return response()->json([
                'message' => 'Item moved to cart successfully',
                'cart_response' => json_decode($cartResponse->getContent())
            ]);
        }

        return $cartResponse;
    }

    /**
     * Move all wishlist items to cart
     */
    public function moveAllToCart(Request $request)
    {
        $wishlist = $this->getOrCreateWishlist($request);
        
        $wishlistItems = WishlistItem::where('wishlist_id', $wishlist->id)
            ->with('product')
            ->get();

        if ($wishlistItems->isEmpty()) {
            return response()->json([
                'message' => 'Wishlist is empty'
            ], 400);
        }

        $moved = [];
        $failed = [];

        foreach ($wishlistItems as $item) {
            // Check stock
            if ($item->product->quantity < 1) {
                $failed[] = [
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'reason' => 'Out of stock'
                ];
                continue;
            }

            try {
                // Add to cart
                $cartController = new CartController();
                $cartRequest = new Request([
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'quantity' => 1,
                ]);
                
                $cartRequest->headers->set('Authorization', $request->header('Authorization'));
                $cartResponse = $cartController->addItem($cartRequest);

                if ($cartResponse->getStatusCode() === 201 || $cartResponse->getStatusCode() === 200) {
                    $item->delete();
                    $moved[] = [
                        'product_id' => $item->product_id,
                        'name' => $item->product->name,
                    ];
                } else {
                    $failed[] = [
                        'product_id' => $item->product_id,
                        'name' => $item->product->name,
                        'reason' => 'Failed to add to cart'
                    ];
                }
            } catch (\Exception $e) {
                $failed[] = [
                    'product_id' => $item->product_id,
                    'name' => $item->product->name,
                    'reason' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => 'Wishlist processing completed',
            'moved_count' => count($moved),
            'failed_count' => count($failed),
            'moved' => $moved,
            'failed' => $failed,
        ]);
    }

    /**
     * Get or create wishlist for current user/session
     */
    private function getOrCreateWishlist(Request $request)
    {
        // Try to authenticate via Sanctum token manually
        $user = null;
        
        if ($request->bearerToken()) {
            try {
                // Manually authenticate using Sanctum
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                if ($token) {
                    $user = $token->tokenable;
                }
            } catch (\Exception $e) {
                // Token invalid, continue as guest
            }
        }
        
        // If we found a user via token, use their wishlist
        if ($user) {
            $wishlist = Wishlist::firstOrCreate([
                'user_id' => $user->id
            ]);
        } else {
            // For guest users - create a single guest wishlist
            // In production, you'd use session or token-based identification
            $wishlist = Wishlist::firstOrCreate([
                'user_id' => null
            ]);
        }
        
        return $wishlist;
    }
}