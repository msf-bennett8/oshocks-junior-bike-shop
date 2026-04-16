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
            ], [
                'session_id' => null
            ]);
            
            // If this cart had a session_id (was a guest cart), clear it
            if ($cart->session_id) {
                $cart->update(['session_id' => null]);
            }
        } else {
            // For guest users - use session-based cart
            $sessionId = $request->session()->getId() ?? $request->header('X-Session-ID') ?? uniqid('guest_', true);
            
            // Store session ID in session if not exists
            if (!$request->session()->has('cart_session_id')) {
                $request->session()->put('cart_session_id', $sessionId);
            } else {
                $sessionId = $request->session()->get('cart_session_id');
            }
            
            $cart = Cart::firstOrCreate([
                'session_id' => $sessionId,
                'user_id' => null
            ]);
        }
        
        return $cart;
    }

    /**
     * Merge guest cart items into user cart after login
     */
    public function mergeGuestCart(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $user = null;
        if ($request->bearerToken()) {
            try {
                $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
                if ($token) {
                    $user = $token->tokenable;
                }
            } catch (\Exception $e) {
                return response()->json(['message' => 'Invalid authentication'], 401);
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Authentication required'], 401);
        }

        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);
        
        $merged = 0;
        $failed = 0;
        $results = [];

        foreach ($request->items as $item) {
            try {
                $product = Product::findOrFail($item['product_id']);
                
                // Check if item already exists in user's cart
                $existingItem = CartItem::where('cart_id', $userCart->id)
                    ->where('product_id', $item['product_id'])
                    ->where('variant_id', $item['variant_id'] ?? null)
                    ->first();

                if ($existingItem) {
                    // Update quantity
                    $newQuantity = $existingItem->quantity + $item['quantity'];
                    
                    if ($newQuantity > $product->quantity) {
                        $newQuantity = $product->quantity;
                    }
                    
                    $existingItem->quantity = $newQuantity;
                    $existingItem->save();
                    $results[] = ['product_id' => $item['product_id'], 'action' => 'updated'];
                } else {
                    // Create new item
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'product_id' => $item['product_id'],
                        'variant_id' => $item['variant_id'] ?? null,
                        'quantity' => $item['quantity'],
                        'price' => $product->price,
                    ]);
                    $results[] = ['product_id' => $item['product_id'], 'action' => 'added'];
                }
                $merged++;
            } catch (\Exception $e) {
                $failed++;
                $results[] = ['product_id' => $item['product_id'], 'action' => 'failed', 'error' => $e->getMessage()];
            }
        }

        return response()->json([
            'message' => 'Cart merge completed',
            'merged' => $merged,
            'failed' => $failed,
            'results' => $results
        ]);
    }
}