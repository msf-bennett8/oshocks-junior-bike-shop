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
use App\Services\OrderCodeService;
use App\Services\LocationCodeService;

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
            \Log::error('❌ Order validation failed', [
                'errors' => $validator->errors()->toArray(),
                'input' => $request->except(['payment_proof']),
                'items_received' => $request->items,
                'first_item_id' => $request->items[0]['id'] ?? 'none'
            ]);
            
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

            // Generate legacy order number
            $orderNumber = $this->generateOrderNumber();

            // Generate new secure order codes
            $orderCodeService = new OrderCodeService();
            $orderCode = $orderCodeService->generateOrderCode();
            $orderDisplay = $orderCodeService->encodeForDisplay($orderCode);
            
                        // Generate location code (extract area from zone)
            // Zone format: "Kasarani Area (0-5km) - Kahawa Wendani"
            $extractedZone = $request->zone;
            $zoneNameForLookup = $request->zone;
            
            if (strpos($request->zone, ' - ') !== false) {
                $parts = explode(' - ', $request->zone);
                $zoneNameForLookup = trim($parts[0]); // "Kasarani Area (0-5km)"
                $extractedZone = trim($parts[1]); // "Kahawa Wendani"
            }
            
            $locationCode = LocationCodeService::generateLocationCode(
                $request->county,
                $zoneNameForLookup,  // Pass zone name for lookup
                $extractedZone       // Pass area for lookup
            );
            
            // Generate routing ID (customer pay-in)
            $routingId = $orderCodeService->generateRoutingId('customer', 'pay_in', $request->payment_method);

            // Create or get address
            $address = $this->createOrGetAddress($request, $user);

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'order_code' => $orderCode,
                'order_display' => $orderDisplay,
                'routing_id' => $routingId,
                'location_code' => $locationCode,
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
                'transaction_reference' => $this->generateTransactionReference($request->payment_method, $orderNumber, $request->county, $request->zone),
                'estimated_delivery_date' => now()->addDays(3)->toDateString(),
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

            // Generate purchase_id after order is created
            $transactionCode = $orderCodeService->generateTransactionCode();
            $purchaseId = $orderCodeService->generatePurchaseId(
                $orderDisplay,
                $transactionCode,
                $routingId,
                $locationCode
            );
            
            // Update order with purchase_id
            $order->update(['purchase_id' => $purchaseId]);

            // Load relationships
            $order->load(['orderItems.product', 'address']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'items' => $order->orderItems,
                    'order_display' => $orderDisplay,
                    'purchase_id' => $purchaseId,
                ],
                'debug' => [
                    'transaction_reference' => $order->transaction_reference,
                    'payment_method' => $request->payment_method,
                    'order_number' => $orderNumber,
                    'order_code' => $orderCode,
                    'order_display' => $orderDisplay,
                    'county' => $request->county,
                    'zone' => $request->zone,
                    'user_id' => auth('sanctum')->user()?->id ?? 'guest',
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
     * Get user's orders with product images for list view
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        $orders = Order::with([
            'orderItems' => function($query) {
                // Load ALL order items with product images
                $query->with(['product.images' => function($q) {
                    $q->ordered()->limit(1);
                }, 'product:id,name,slug', 'seller:id,business_name']);
            },
            'orderItems.product.images' => function($query) {
                $query->ordered()->limit(1);
            },
            'orderItems.product:id,name,slug',
            'orderItems.seller:id,business_name'
        ])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'order_display' => $order->order_display,
                    'purchase_id' => $order->purchase_id,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    'total' => $order->total,
                    'subtotal' => $order->subtotal,
                    'shipping_fee' => $order->shipping_fee,
                    'discount' => $order->discount,
                    'created_at' => $order->created_at,
                    'estimated_delivery_date' => $order->estimated_delivery_date,
                    'shipped_at' => $order->shipped_at,
                    'delivered_at' => $order->delivered_at,
                    'tracking_number' => $order->order_display,
                    'carrier' => $order->carrier,
                    'item_count' => $order->orderItems->sum('quantity'),
                    'product_count' => $order->orderItems->count(),
                    'first_product' => $order->orderItems->first() ? [
                        'id' => $order->orderItems->first()->product_id,
                        'name' => $order->orderItems->first()->product_name,
                        'image' => $order->orderItems->first()->product?->images?->first()?->image_url ?? null,
                        'thumbnail' => $order->orderItems->first()->product?->images?->first()?->thumbnail_url ?? null,
                    ] : null,
                    'items' => $order->orderItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'variant_name' => $item->variant_name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'total' => $item->total,
                            'image' => $item->product?->images?->first()?->image_url ?? null,
                            'thumbnail' => $item->product?->images?->first()?->thumbnail_url ?? null,
                            'seller_shop_name' => $item->seller?->business_name ?? 'Oshocks Junior',
                        ];
                    }),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get seller's orders - orders containing seller's products
     * GET /api/v1/seller/orders
     */
    public function sellerOrders(Request $request)
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required'
            ], 401);
        }

        // Get seller profile
        $seller = \App\Models\SellerProfile::where('user_id', $user->id)->first();
        
        if (!$seller) {
            return response()->json([
                'success' => false,
                'message' => 'Seller profile not found'
            ], 404);
        }

        // Get orders that contain this seller's items
        $orders = Order::whereHas('orderItems', function($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })
            ->with([
                'orderItems' => function($query) use ($seller) {
                    $query->where('seller_id', $seller->id)
                        ->with(['product.images' => function($q) {
                            $q->ordered()->limit(1);
                        }]);
                },
                'orderItems.product:id,name,slug',
                'user:id,name,email,phone'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) use ($seller) {
                // Filter only this seller's items - ALL items, not just first
                $sellerItems = $order->orderItems->filter(function($item) use ($seller) {
                    return $item->seller_id == $seller->id;
                })->values();
                
                $firstItem = $sellerItems->first();
                
                // Parse delivery zone: "Parklands Area (10-15km) - Eastleigh" -> "Parklands Area, Eastleigh"
                $deliveryAddress = $this->parseDeliveryZone($order->delivery_zone);
                
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'order_display' => $order->order_display,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'payment_method' => $order->payment_method,
                    // Use actual database values for totals
                    'subtotal' => (float) $order->subtotal,
                    'shipping_fee' => (float) $order->shipping_fee,
                    'tax' => (float) $order->tax,
                    'discount' => (float) $order->discount,
                    'total' => (float) $order->total, // Full order total from DB
                    'seller_total' => $sellerItems->sum('total'), // Seller's portion only
                    'created_at' => $order->created_at,
                    'estimated_delivery_date' => $order->estimated_delivery_date,
                    'customer_name' => $order->customer_name ?? $order->user?->name ?? 'Guest',
                    'customer_email' => $order->customer_email ?? $order->user?->email ?? null,
                    'customer_phone' => $order->customer_phone ?? $order->user?->phone ?? null,
                    'delivery_address' => $deliveryAddress,
                    'delivery_zone' => $order->delivery_zone,
                    'county' => $order->county,
                    'postal_code' => $order->postal_code,
                    'item_count' => $sellerItems->sum('quantity'),
                    'product_count' => $sellerItems->count(),
                    'first_product' => $firstItem ? [
                        'id' => $firstItem->product_id,
                        'name' => $firstItem->product_name,
                        'image' => $firstItem->product?->images?->first()?->image_url ?? null,
                        'thumbnail' => $firstItem->product?->images?->first()?->thumbnail_url ?? null,
                    ] : null,
                    // ALL items, properly mapped
                    'items' => $sellerItems->map(function($item) {
                        return [
                            'id' => $item->id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product_name,
                            'variant_name' => $item->variant_name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                            'total' => (float) $item->total,
                            'image' => $item->product?->images?->first()?->image_url ?? null,
                            'thumbnail' => $item->product?->images?->first()?->thumbnail_url ?? null,
                        ];
                    })->values(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Parse delivery zone to readable address
     * "Parklands Area (10-15km) - Eastleigh" -> "Parklands Area, Eastleigh"
     */
    private function parseDeliveryZone($deliveryZone)
    {
        if (!$deliveryZone) return 'N/A';
        
        // Remove distance info in parentheses: "(10-15km)"
        $zone = preg_replace('/\s*\([^)]*\)/', '', $deliveryZone);
        
        // Split by " - " and trim
        $parts = array_map('trim', explode(' - ', $zone));
        
        // Remove empty parts and join with comma
        $parts = array_filter($parts);
        
        return implode(', ', $parts);
    }

    /**
     * Get order by order number or order display
     */
    public function show($orderNumber)
    {
        // Try to find by order_display first (new format), then order_number (legacy)
        $order = Order::where('order_display', $orderNumber)
            ->orWhere('order_number', $orderNumber)
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
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'order_display' => $order->order_display,
                    'purchase_id' => $order->purchase_id,
                    'orderDate' => $order->created_at,
                    'status' => $order->status,
                    'customer_name' => $order->customer_name,
                    'customer_email' => $order->customer_email,
                    'customer_phone' => $order->customer_phone,
                    'delivery_address' => $order->address?->address_line1,
                    'county' => $order->county,
                    'delivery_zone' => $order->delivery_zone,
                    'postal_code' => $order->postal_code,
                    'subtotal' => $order->subtotal,
                    'shipping_fee' => $order->shipping_fee,
                    'tax' => $order->tax,
                    'discount' => $order->discount,
                    'total' => $order->total,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'transaction_reference' => $order->transaction_reference,
                    'estimated_delivery_date' => $order->estimated_delivery_date,
                ],
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
     * Format: OS-YYYYMMDD-SEQ
     * Example: OS-20231104-001
     */
    private function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        
        // Get today's order count to generate sequence
        $todayOrderCount = Order::whereDate('created_at', now()->toDateString())->count();
        $sequence = str_pad($todayOrderCount + 1, 3, '0', STR_PAD_LEFT);
        
        $orderNumber = "OS-{$date}-{$sequence}";
        
        // Ensure uniqueness (in case of race conditions)
        $counter = 1;
        while (Order::where('order_number', $orderNumber)->exists()) {
            $sequence = str_pad($todayOrderCount + $counter + 1, 3, '0', STR_PAD_LEFT);
            $orderNumber = "OS-{$date}-{$sequence}";
            $counter++;
        }

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
     * Generate transaction reference for online orders
     * Format: {METHOD}-UID{USER_ID}-{COUNTY}-{ZONE}-{ORDER_SEQ}-{YYYYMMDD}-{HHMMSS}-{PAYMENT_SEQ}
     * Example: COD-UID28-NAIROBI-LORESHO-002-20251107-084348-012
     */
    private function generateTransactionReference($paymentMethod, $orderNumber, $county = null, $zone = null)
    {
        \Log::info('========== TRANSACTION REFERENCE GENERATION START ==========');
        \Log::info('INPUT - paymentMethod: ' . $paymentMethod);
        \Log::info('INPUT - orderNumber: ' . $orderNumber);
        \Log::info('INPUT - county: ' . ($county ?? 'NULL'));
        \Log::info('INPUT - zone: ' . ($zone ?? 'NULL'));
        
        $method = strtoupper(explode('_', $paymentMethod)[0]);
        \Log::info('STEP 1 - Method extracted: ' . $method);
        
        $user = auth('sanctum')->user();
        $userCode = $user ? "UID{$user->id}" : 'GUEST';
        \Log::info('STEP 2 - User code: ' . $userCode);
        
        $countyCode = $county ? strtoupper(str_replace(' County', '', $county)) : 'UNKNOWN';
        $zoneCode = $zone ? strtoupper($zone) : 'UNKNOWN';
        \Log::info('STEP 3 - County code: ' . $countyCode);
        \Log::info('STEP 3 - Zone code: ' . $zoneCode);
        
        $orderParts = explode('-', $orderNumber);
        $orderSeq = end($orderParts);
        \Log::info('STEP 4 - Order parts: ' . json_encode($orderParts));
        \Log::info('STEP 4 - Order sequence: ' . $orderSeq);
        
        $date = now()->format('Ymd');
        $time = now()->format('His');
        \Log::info('STEP 5 - Date: ' . $date);
        \Log::info('STEP 5 - Time: ' . $time);
        
        $todayCount = Order::whereDate('created_at', now()->toDateString())
            ->where('payment_method', $paymentMethod)
            ->count();
        $sequence = str_pad($todayCount + 1, 3, '0', STR_PAD_LEFT);
        \Log::info('STEP 6 - Today count: ' . $todayCount);
        \Log::info('STEP 6 - Payment sequence: ' . $sequence);
        
        // Build transaction reference step by step
        $parts = [
            'method' => $method,
            'userCode' => $userCode,
            'countyCode' => $countyCode,
            'zoneCode' => $zoneCode,
            'orderSeq' => $orderSeq,
            'date' => $date,
            'time' => $time,
            'sequence' => $sequence,
        ];
        
        $transactionRef = "{$method}-{$userCode}-{$countyCode}-{$zoneCode}-{$orderSeq}-{$date}-{$time}-{$sequence}";
        
        // Store debug info in session for inspection
        session(['last_transaction_debug' => $parts]);
        
        return $transactionRef;
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
     * Search order by order number or order display
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

        // Search by order_display first (new format), then order_number (legacy)
        $order = Order::where('order_display', $orderNumber)
            ->orWhere('order_number', $orderNumber)
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
            'message' => 'Order cancelled successfully',
            'data' => $order
        ]);
    }

    /**
     * Get user's last delivery location for auto-fill
     * GET /api/v1/user/last-delivery-location
     */
    public function getLastDeliveryLocation(Request $request)
    {
        try {
            \Log::info('🔍 getLastDeliveryLocation called');
            
            $user = auth('sanctum')->user();
            
            if (!$user) {
                \Log::warning('❌ No authenticated user found');
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            \Log::info('👤 User found', ['user_id' => $user->id]);

            // Get user's most recent order with delivery info
            $lastOrder = Order::where('user_id', $user->id)
                ->whereNotNull('county')
                ->whereNotNull('delivery_zone')
                ->orderBy('created_at', 'desc')
                ->first();

            \Log::info('📦 Last order query result', [
                'found' => $lastOrder ? 'yes' : 'no',
                'order_id' => $lastOrder?->id
            ]);

            // If no order, check for default address
            if (!$lastOrder) {
                \Log::info('🔍 No order found, checking for default address');
                
                $defaultAddress = Address::where('user_id', $user->id)
                    ->where('is_default', true)
                    ->first();
                    
                if ($defaultAddress) {
                    \Log::info('✅ Default address found');
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'county' => $defaultAddress->county,
                            'zone' => $defaultAddress->city,
                            'address' => $defaultAddress->address_line1,
                            'postal_code' => $defaultAddress->postal_code,
                            'phone' => $defaultAddress->phone,
                            'source' => 'default_address'
                        ]
                    ]);
                }
                
                \Log::warning('❌ No previous delivery location found');
                return response()->json([
                    'success' => false,
                    'message' => 'No previous delivery location found'
                ], 404);
            }

            \Log::info('✅ Returning last order location');

            return response()->json([
                'success' => true,
                'data' => [
                    'county' => $lastOrder->county,
                    'zone' => $lastOrder->delivery_zone,
                    'address' => $lastOrder->address?->address_line1,
                    'postal_code' => $lastOrder->postal_code,
                    'phone' => $lastOrder->customer_phone,
                    'delivery_instructions' => $lastOrder->delivery_instructions,
                    'source' => 'last_order',
                    'order_number' => $lastOrder->order_number,
                    'order_date' => $lastOrder->created_at
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('❌ Error in getLastDeliveryLocation: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}