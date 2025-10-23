<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get user's cart with all items
     */
    public function index(Request $request)
    {
        $cart = $this->getOrCreateCart($request);

        $cartItems = CartItem::with([
            'product.images',
            'product.category',
            'variant'
        ])
        ->where('cart_id', $cart->id)
        ->get()
        ->map(function ($item) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product->name,
                'slug' => $item->product->slug,
                'category' => $item->product->category->name ?? 'Uncategorized',
                'price' => (float) $item->price,
                'originalPrice' => $item->product->compare_price ? (float) $item->product->compare_price : null,
                'quantity' => $item->quantity,
                'stock' => $item->product->quantity,
                'image' => $item->product->images->first()->image_url ?? null,
                'thumbnail' => $item->product->images->first()->thumbnail_url ?? null,
                'seller' => $item->product->seller->name ?? 'Oshocks Junior',
                'variant' => $item->variant ? [
                    'id' => $item->variant->id,
                    'name' => $item->variant->name,
                    'attributes' => $item->variant->attributes,
                ] : null,
            ];
        });

        return response()->json([
            'cart_id' => $cart->id,
            'items' => $cartItems,
            'count' => $cartItems->count(),
            'total_quantity' => $cartItems->sum('quantity'),
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $this->getOrCreateCart($request);
        $product = Product::findOrFail($request->product_id);

        // Check stock
        if ($product->quantity < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock available',
                'available_stock' => $product->quantity
            ], 400);
        }

        // Check if item already exists in cart
        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if ($existingItem) {
            // Update quantity
            $newQuantity = $existingItem->quantity + ($request->quantity ?? 1);
            
            if ($newQuantity > $product->quantity) {
                return response()->json([
                    'message' => 'Cannot add more items. Stock limit reached.',
                    'available_stock' => $product->quantity,
                    'current_in_cart' => $existingItem->quantity
                ], 400);
            }

            $existingItem->quantity = $newQuantity;
            $existingItem->save();

            return response()->json([
                'message' => 'Cart updated successfully',
                'item' => $existingItem
            ]);
        }

        // Create new cart item
        $cartItem = CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $request->product_id,
            'variant_id' => $request->variant_id,
            'quantity' => $request->quantity ?? 1,
            'price' => $product->price,
        ]);

        return response()->json([
            'message' => 'Item added to cart successfully',
            'item' => $cartItem
        ], 201);
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $itemId)
            ->firstOrFail();

        // Check stock
        $product = $cartItem->product;
        if ($request->quantity > $product->quantity) {
            return response()->json([
                'message' => 'Insufficient stock available',
                'available_stock' => $product->quantity
            ], 400);
        }

        $cartItem->quantity = $request->quantity;
        $cartItem->save();

        return response()->json([
            'message' => 'Cart item updated successfully',
            'item' => $cartItem
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request, $itemId)
    {
        $cart = $this->getOrCreateCart($request);
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $itemId)
            ->firstOrFail();

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart successfully'
        ]);
    }

    /**
     * Clear entire cart
     */
    public function clearCart(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        
        CartItem::where('cart_id', $cart->id)->delete();

        return response()->json([
            'message' => 'Cart cleared successfully'
        ]);
    }

   /**
     * Get or create cart for current user/session
     */
    private function getOrCreateCart(Request $request)
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
        
        // If we found a user via token, use their cart
        if ($user) {
            $cart = Cart::firstOrCreate([
                'user_id' => $user->id
            ]);
        } else {
            // For guest users - create a single guest cart
            // In production, you'd use session or token-based identification
            $cart = Cart::firstOrCreate([
                'user_id' => null
            ]);
        }
        
        return $cart;
    }
}