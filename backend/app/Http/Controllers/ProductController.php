<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of products (public)
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        // Filter by type (bike or accessory)
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by brand (string field)
        if ($request->has('brand')) {
            $query->where('brand', $request->brand);
        }

        // Search by name or description
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by condition
        if ($request->has('condition')) {
            $query->where('condition', $request->condition);
        }

        // Only active products
        $query->where('is_active', true);

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Search Funtionality
     */
        public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Search products by name, description, brand
        $products = Product::where('is_active', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('brand', 'like', "%{$query}%")
                ->orWhere('sku', 'like', "%{$query}%");
            })
            ->with(['category', 'images'])
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
            'count' => $products->count()
        ]);
    }

    /**
     * Display a single product by ID
     */
    public function show($id)
    {
        $product = Product::with([
            'category',
            'brand',
            'seller.profile',
            'images',
            'variants',
            'reviews.user'
        ])->findOrFail($id);

        return response()->json($product);
    }

    /**
     * Display a single product by slug
     */
    public function showBySlug($slug)
    {
        $product = Product::with([
            'category',
            'brand',
            'seller.profile',
            'images',
            'variants',
            'reviews.user'
        ])->where('slug', $slug)->firstOrFail();

        return response()->json($product);
    }

    /**
     * Get all products (admin only)
     */
    public function allProducts(Request $request)
    {
        $query = Product::with(['category', 'brand', 'seller.profile']);

        // Include inactive products for admin
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $perPage = $request->get('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get seller's own products
     */
    public function myProducts(Request $request)
    {
        $query = Product::where('seller_id', auth()->id())
            ->with(['category', 'brand', 'images']);

        $perPage = $request->get('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Store a new product (seller only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:bike,accessory',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'condition' => 'required|in:new,used,refurbished',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'specifications' => 'nullable|array',
        ]);

        $validated['seller_id'] = auth()->id();
        $validated['slug'] = \Str::slug($validated['name']) . '-' . time();
	$validated['sku'] = 'SKU-' . strtoupper(uniqid());

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    /**
     * Update a product (seller only - own products)
     */
    public function update(Request $request, $id)
    {
        $product = Product::where('id', $id)
            ->where('seller_id', auth()->id())
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'type' => 'sometimes|in:bike,accessory',
            'category_id' => 'sometimes|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'sometimes|numeric|min:0',
            'quantity' => 'sometimes|integer|min:0',
            'condition' => 'sometimes|in:new,used,refurbished',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'specifications' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Str::slug($validated['name']) . '-' . $product->id;
        }

        $product->update($validated);

        return response()->json($product);
    }

    /**
     * Delete a product (soft delete - seller only)
     */
    public function destroy($id)
    {
        $product = Product::where('id', $id)
            ->where('seller_id', auth()->id())
            ->firstOrFail();

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Feature/unfeature a product (admin only)
     */
    public function toggleFeature($id)
    {
        $product = Product::findOrFail($id);
        $product->is_featured = !$product->is_featured;
        $product->save();

        return response()->json([
            'message' => 'Product featured status updated',
            'is_featured' => $product->is_featured
        ]);
    }

    /**
     * Force delete a product (admin only)
     */
    public function forceDestroy($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        $product->forceDelete();

        return response()->json(['message' => 'Product permanently deleted']);
    }

    /**
     * Get seller's product analytics
     */
    public function productAnalytics(Request $request)
    {
        $sellerId = auth()->id();

        $analytics = [
            'total_products' => Product::where('seller_id', $sellerId)->count(),
            'active_products' => Product::where('seller_id', $sellerId)->where('is_active', true)->count(),
            'out_of_stock' => Product::where('seller_id', $sellerId)->where('quantity', 0)->count(),
            'total_value' => Product::where('seller_id', $sellerId)->sum(\DB::raw('price * quantity')),
            'products_by_type' => Product::where('seller_id', $sellerId)
                ->select('type', \DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get(),
        ];

        return response()->json($analytics);
    }
}
