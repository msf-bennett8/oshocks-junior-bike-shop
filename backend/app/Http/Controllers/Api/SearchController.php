<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Models\SellerProfile;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Universal search across all entities
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all');
        
        if (empty($query)) {
            return response()->json([
                'success' => true,
                'data' => [
                    'products' => [],
                    'users' => [],
                    'sellers' => [],
                    'categories' => []
                ]
            ]);
        }

        $results = [];

        // Search Products
        if ($type === 'all' || $type === 'products') {
            $results['products'] = Product::where('is_active', true)
                ->where(function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%")
                      ->orWhere('brand', 'like', "%{$query}%")
                      ->orWhere('sku', 'like', "%{$query}%");
                })
                ->with(['category'])
                ->limit(10)
                ->get()
                ->map(function($product) {
                    return [
                        'id' => $product->id,
                        'type' => 'product',
                        'name' => $product->name,
                        'description' => $product->description,
                        'price' => $product->price,
                        'stock_quantity' => $product->stock_quantity,
                        'category' => $product->category->name ?? null,
                    ];
                });
        }

        // Search Categories
        if ($type === 'all' || $type === 'categories') {
            $results['categories'] = Category::where('name', 'like', "%{$query}%")
                ->limit(5)
                ->get()
                ->map(function($category) {
                    return [
                        'id' => $category->id,
                        'type' => 'category',
                        'name' => $category->name,
                        'description' => $category->description ?? '',
                        'slug' => $category->slug ?? null,
                        'product_count' => Product::where('category_id', $category->id)->count(),
                    ];
                });
        }

        // Search Sellers
        if ($type === 'all' || $type === 'sellers') {
            $results['sellers'] = SellerProfile::where(function($q) use ($query) {
                    $q->where('business_name', 'like', "%{$query}%")
                      ->orWhere('business_description', 'like', "%{$query}%");
                })
                ->where('status', 'approved')
                ->with('user')
                ->limit(5)
                ->get()
                ->map(function($seller) {
                    return [
                        'id' => $seller->user_id,
                        'type' => 'seller',
                        'name' => $seller->business_name,
                        'description' => $seller->business_description ?? '',
                        'business_name' => $seller->business_name,
                        'rating' => $seller->rating ?? 0,
                        'total_sales' => $seller->total_sales ?? 0,
                    ];
                });
        }

        // Search Users
        if ($type === 'all' || $type === 'users') {
            $results['users'] = User::where('role', 'user')
                ->where(function($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%");
                    if (strpos($query, '@') !== false) {
                        $q->orWhere('email', 'like', "%{$query}%");
                    }
                })
                ->limit(5)
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'type' => 'user',
                        'name' => $user->name,
                        'username' => $user->username ?? '',
                        'email' => $user->email,
                        'role' => $user->role,
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $query
        ]);
    }

    /**
     * Get search suggestions (autocomplete)
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'suggestions' => []
            ]);
        }

        $suggestions = [];

        // Get top product names
        $productSuggestions = Product::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->limit(5)
            ->pluck('name');

        // Get category names
        $categorySuggestions = Category::where('name', 'like', "%{$query}%")
            ->limit(3)
            ->pluck('name');

        $suggestions = array_merge(
            $productSuggestions->toArray(),
            $categorySuggestions->toArray()
        );

        return response()->json([
            'success' => true,
            'suggestions' => array_unique($suggestions)
        ]);
    }

    /**
     * Get trending searches
     */
    public function trending()
    {
        $trending = [
            'Mountain Bikes',
            'Road Bikes',
            'Bike Helmets',
            'Cycling Shoes',
            'Bike Lights',
            'Water Bottles',
            'Bike Locks',
            'Bike Pumps'
        ];

        return response()->json([
            'success' => true,
            'trending' => $trending
        ]);
    }
}