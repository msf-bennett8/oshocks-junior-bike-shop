<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Create a new order from checkout
     */
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'delivery_address' => 'required|string',
            'county' => 'required|string',
            'zone' => 'required|string',
            'postal_code' => 'nullable|string|max:10',
            'delivery_instructions' => 'nullable|string|max:500',
            'payment_method' => 'required|in:mpesa,card,cod',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'shipping_cost' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get authenticated user (if logged in)
            $user = auth('sanctum')->user();

            // Generate unique order number
            $orderNumber = $this->generateOrderNumber();

            // Create or get address
            $address = $this->createOrGetAddress($request, $user);

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user?->id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'address_id' => $address->id,
                'delivery_zone' => $request->zone,
                'postal_code' => $request->postal_code,
                'delivery_instructions' => $request->delivery_instructions,
                'subtotal' => $request->subtotal,
                'shipping_fee' => $request->shipping_cost,
                'tax' => $request->tax ?? 0,
                'discount' => $request->discount ?? 0,
                'total' => $request->total,
                'status' => 'pending',
                'payment_status' => $request->payment_method === 'cod' ? 'pending' : 'pending',
                'payment_method' => $request->payment_method,
                'transaction_reference' => $this->generateTransactionReference($request->payment_method, $orderNumber),
            ]);

            // Create order items
            foreach ($request->items as $item) {
                $product = Product::find($item['id']);
                
                if (!$product) {
                    throw new \Exception("Product not found: {$item['id']}");
                }

                // Check stock availability (handle both stock_quantity and quantity fields)
                $availableStock = $product->stock_quantity ?? $product->quantity ?? 0;
                if ($availableStock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}. Available: {$availableStock}, Requested: {$item['quantity']}");
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'seller_id' => $product->seller_id,
                    'product_name' => $product->name,
                    'variant_name' => $item['variant_name'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                ]);

                // Reduce product stock (handle both stock_quantity and quantity columns)
                if ($product->stock_quantity !== null) {
                    $product->decrement('stock_quantity', $item['quantity']);
                } elseif ($product->quantity !== null) {
                    $product->decrement('quantity', $item['quantity']);
                }
            }

            DB::commit();

            // Load relationships
            $order->load(['orderItems.product', 'address']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'items' => $order->orderItems,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order by order number
     */
    public function show($orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with(['orderItems.product.images', 'address'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Check authorization (user can only see their own orders, unless admin)
        $user = auth('sanctum')->user();
        if ($user && $order->user_id !== $user->id && $user->role !== 'admin' && $user->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'items' => $order->orderItems,
                'discount' => $order->discount
            ]
        ]);
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber()
    {
        do {
            $orderNumber = 'OS' . str_pad(mt_rand(1, 99999999), 8, '0', STR_PAD_LEFT);
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Create or get existing address
     */
    private function createOrGetAddress(Request $request, $user = null)
    {
        // Extract full name from customer_name
        $fullName = $request->customer_name;

        $addressData = [
            'user_id' => $user?->id,
            'full_name' => $fullName,
            'phone' => $request->customer_phone,
            'address_line1' => $request->delivery_address,
            'address_line2' => null,
            'city' => $request->zone, // Zone is the specific area
            'county' => $request->county,
            'postal_code' => $request->postal_code,
            'country' => 'Kenya',
            'type' => 'home',
            'is_default' => false,
        ];

        return Address::create($addressData);
    }

    /**
     * Generate transaction reference
     */
    private function generateTransactionReference($paymentMethod, $orderNumber)
    {
        $method = strtoupper($paymentMethod);
        $timestamp = now()->format('YmdHis');
        
        return "{$method}-{$orderNumber}-{$timestamp}";
    }

    /**
     * Get pending payment orders (for payment recorders)
     * GET /api/v1/orders/pending-payments
     */
    public function pendingPayments(Request $request)
    {
        try {
            $user = $request->user();
            
            // Check permission
            if (!$user->canRecordPayments()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get orders with pending payment status and COD payment method
            $orders = Order::where('payment_status', 'pending')
                ->where('payment_method', 'cod')
                ->where('status', '!=', 'cancelled')
                ->with(['orderItems.product', 'address'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pending orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search order by order number (for payment recorders)
     * GET /api/v1/orders/search?order_number=OS12345678
     */
    public function searchByOrderNumber(Request $request)
    {
        try {
            $user = $request->user();
            
            // Check permission
            if (!$user->canRecordPayments()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'order_number' => 'required|string|min:10|max:15'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid order number format',
                    'errors' => $validator->errors()
                ], 422);
            }

            $order = Order::where('order_number', $request->order_number)
                ->with(['orderItems.product.images', 'address'])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $order,
                    'items' => $order->orderItems,
                    'can_record_payment' => $order->payment_status === 'pending'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
