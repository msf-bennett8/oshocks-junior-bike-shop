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
use App\Services\AuditService;

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
            $itemsData = [];
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

                // Track items for audit log
                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ];

                // Reduce product stock (handle both stock_quantity and quantity columns)
                if ($product->stock_quantity !== null) {
                    $product->decrement('stock_quantity', $item['quantity']);
                } elseif ($product->quantity !== null) {
                    $product->decrement('quantity', $item['quantity']);
                }
            }

            // Log order creation
            AuditService::log([
                'event_type' => 'order_created',
                'event_category' => 'order',
                'action' => 'created',
                'model_type' => 'Order',
                'model_id' => $order->id,
                'description' => "Order created: {$order->order_number} - KES {$order->total} by {$request->customer_name}",
                'new_values' => [
                    'order_number' => $order->order_number,
                    'total' => $order->total,
                    'payment_method' => $order->payment_method,
                    'customer_name' => $order->customer_name,
                    'customer_phone' => $order->customer_phone,
                ],
                'metadata' => [
                    'items_count' => count($itemsData),
                    'items' => $itemsData,
                    'county' => $request->county,
                    'zone' => $request->zone,
                    'payment_method' => $request->payment_method,
                ],
                'severity' => 'low',
            ]);

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
     * Update order status
     * PUT /api/v1/orders/{orderNumber}/status
     */
    public function updateStatus(Request $request, $orderNumber)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,confirmed,shipped,delivered,cancelled',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Capture old status
        $oldStatus = $order->status;

        // Update status
        $order->status = $request->status;
        
        // Set timestamps for specific statuses
        if ($request->status === 'shipped' && !$order->shipped_at) {
            $order->shipped_at = now();
        }
        if ($request->status === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }
        
        $order->save();

        // Log status change
        AuditService::log([
            'event_type' => 'order_status_changed',
            'event_category' => 'order',
            'action' => 'updated',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} status changed from {$oldStatus} to {$request->status} by " . auth()->user()->name,
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $request->status],
            'metadata' => [
                'order_number' => $order->order_number,
                'customer_phone' => $order->customer_phone,
                'total' => $order->total,
                'notes' => $request->notes,
            ],
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Cancel order
     * POST /api/v1/orders/{orderNumber}/cancel
     */
    public function cancelOrder(Request $request, $orderNumber)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if (in_array($order->status, ['shipped', 'delivered', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled in current status'
            ], 400);
        }

        $oldStatus = $order->status;
        $oldPaymentStatus = $order->payment_status;

        $order->status = 'cancelled';
        $order->save();

        // Log cancellation
        AuditService::log([
            'event_type' => 'order_cancelled',
            'event_category' => 'order',
            'action' => 'updated',
            'model_type' => 'Order',
            'model_id' => $order->id,
            'description' => "Order {$order->order_number} cancelled by " . auth()->user()->name . " - Reason: {$request->reason}",
            'old_values' => [
                'status' => $oldStatus,
                'payment_status' => $oldPaymentStatus,
            ],
            'new_values' => [
                'status' => 'cancelled',
                'cancellation_reason' => $request->reason,
            ],
            'metadata' => [
                'order_number' => $order->order_number,
                'total' => $order->total,
                'reason' => $request->reason,
            ],
            'severity' => 'high',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $order
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
    public function getPendingPayments()
    {
        \Log::info('🔍 getPendingPayments method called');
        \Log::info('🔍 Auth user ID: ' . (auth()->id() ?? 'guest'));
        
        try {
            $orders = Order::where('payment_method', 'cod')
                ->where('payment_status', 'pending')
                ->with(['user', 'orderItems.product'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            \Log::info('📦 Found ' . $orders->total() . ' pending orders');

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Error in getPendingPayments: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error fetching orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search order by order number
     */
    public function searchByOrderNumber(Request $request)
    {
        \Log::info('🔍 searchByOrderNumber called');
        \Log::info('🔍 Query params:', $request->all());
        
        $orderNumber = $request->query('order_number');
        
        if (!$orderNumber) {
            return response()->json([
                'success' => false,
                'message' => 'Order number is required'
            ], 400);
        }

        \Log::info('🔍 Searching for order:', ['order_number' => $orderNumber]);

        $order = Order::where('order_number', $orderNumber)
            ->with(['user', 'orderItems.product', 'address'])
            ->first();

        if (!$order) {
            \Log::info('❌ Order not found:', ['order_number' => $orderNumber]);
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        \Log::info('✅ Order found:', ['order_number' => $orderNumber]);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Record payment for COD order
     * POST /api/v1/orders/{orderNumber}/record-payment
     */
    public function recordPayment(Request $request, $orderNumber)
    {
        $validator = Validator::make($request->all(), [
            'amount_received' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,mpesa_manual,bank_transfer',
            'customer_phone' => 'nullable|string|max:20',
            'external_reference' => 'nullable|string|max:255',
            'external_transaction_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'county' => 'nullable|string|max:100',
            'zone' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        if ($order->payment_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Payment already recorded for this order'
            ], 400);
        }

        // Prepare payment notes with all context
        $paymentNotesData = [
            'recorded_by' => $request->user()->name ?? 'Unknown',
            'recorded_at' => now()->toDateTimeString(),
            'payment_method' => $request->payment_method,
            'county' => $request->county,
            'zone' => $request->zone,
        ];

        if ($request->customer_phone) {
            $paymentNotesData['customer_phone'] = $request->customer_phone;
        }

        if ($request->external_reference) {
            $paymentNotesData['customer_reference'] = $request->external_reference;
        }

        if ($request->external_transaction_id) {
            $paymentNotesData['transaction_id'] = $request->external_transaction_id;
        }

        if ($request->notes) {
            $paymentNotesData['notes'] = $request->notes;
        }

        // Update order with all payment details
        $order->update([
            'payment_status' => 'paid',
            'amount_received' => $request->amount_received,
            'payment_notes' => json_encode($paymentNotesData, JSON_PRETTY_PRINT),
            'customer_phone' => $request->customer_phone ?? $order->customer_phone,
            'external_reference' => $request->external_reference,
            'external_transaction_id' => $request->external_transaction_id,
            'paid_at' => now(),
            'recorded_by' => $request->user()->id,
        ]);

        // Reload to get fresh data
        $order->refresh();

        // Log payment recording in audit trail
        try {
            AuditService::log([
                'event_type' => 'payment_recorded',
                'event_category' => 'payment',
                'action' => 'created',
                'model_type' => 'Order',
                'model_id' => $order->id,
                'description' => "Payment recorded for order {$order->order_number} - KES {$request->amount_received} via {$request->payment_method}",
                'new_values' => [
                    'order_number' => $order->order_number,
                    'amount_received' => $request->amount_received,
                    'payment_method' => $request->payment_method,
                    'county' => $request->county,
                    'zone' => $request->zone,
                ],
                'metadata' => $paymentNotesData,
                'severity' => 'medium',
            ]);
            \Log::info('✅ Audit log created successfully');
        } catch (\Exception $e) {
            \Log::error('❌ Failed to create audit log: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => $order
        ]);
    }
}