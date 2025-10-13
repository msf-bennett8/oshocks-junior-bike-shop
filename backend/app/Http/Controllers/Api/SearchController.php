<?php
// backend/app/Http/Controllers/Api/SearchController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Blog;
use App\Models\Service;
use App\Models\User;
use App\Models\Category;

class SearchController extends Controller
{
    /**
     * Universal search across all content types
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type', 'all');
        $limit = $request->input('limit', 10);

        // Validate inputs
        if (strlen($query) < 1) {
            return response()->json([
                'products' => [],
                'blogs' => [],
                'services' => [],
                'sellers' => [],
                'categories' => []
            ]);
        }

        $results = [];

        // Search based on type filter
        if ($type === 'all' || $type === 'products') {
            $results['products'] = $this->searchProducts($query, $limit);
        }

        if ($type === 'all' || $type === 'blogs') {
            $results['blogs'] = $this->searchBlogs($query, $limit);
        }

        if ($type === 'all' || $type === 'services') {
            $results['services'] = $this->searchServices($query, $limit);
        }

        if ($type === 'all' || $type === 'sellers') {
            $results['sellers'] = $this->searchSellers($query, $limit);
        }

        if ($type === 'all' || $type === 'categories') {
            $results['categories'] = $this->searchCategories($query, $limit);
        }

        return response()->json($results);
    }

    /**
     * Search products
     */
    private function searchProducts($query, $limit)
    {
        return Product::where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('sku', 'LIKE', "%{$query}%")
                  ->orWhere('tags', 'LIKE', "%{$query}%");
            })
            ->with(['category:id,name', 'images' => function($q) {
                $q->where('is_primary', true)->limit(1);
            }])
            ->limit($limit)
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'type' => 'product',
                    'title' => $product->name,
                    'description' => substr($product->description, 0, 100),
                    'price' => $product->price,
                    'image' => $product->images->first()->url ?? null,
                    'category' => $product->category->name ?? null,
                    'badge' => $this->getProductBadge($product),
                    'rating' => $product->average_rating,
                    'reviews_count' => $product->reviews_count
                ];
            });
    }

    /**
     * Search blog posts
     */
    private function searchBlogs($query, $limit)
    {
        return Blog::where('status', 'published')
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('content', 'LIKE', "%{$query}%")
                  ->orWhere('excerpt', 'LIKE', "%{$query}%")
                  ->orWhere('tags', 'LIKE', "%{$query}%");
            })
            ->with('author:id,name')
            ->limit($limit)
            ->get()
            ->map(function($blog) {
                return [
                    'id' => $blog->id,
                    'type' => 'blog',
                    'title' => $blog->title,
                    'description' => $blog->excerpt ?? substr(strip_tags($blog->content), 0, 100),
                    'slug' => $blog->slug,
                    'author' => $blog->author->name ?? 'Oshocks',
                    'published_at' => $blog->published_at->format('M d, Y'),
                    'image' => $blog->featured_image
                ];
            });
    }

    /**
     * Search services
     */
    private function searchServices($query, $limit)
    {
        return Service::where('is_active', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%");
            })
            ->limit($limit)
            ->get()
            ->map(function($service) {
                return [
                    'id' => $service->id,
                    'type' => 'service',
                    'title' => $service->name,
                    'description' => substr($service->description, 0, 100),
                    'price' => $service->price,
                    'duration' => $service->duration,
                    'slug' => $service->slug
                ];
            });
    }

    /**
     * Search sellers/users
     */
    private function searchSellers($query, $limit)
    {
        return User::where('role', 'seller')
            ->where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('shop_name', 'LIKE', "%{$query}%")
                  ->orWhere('bio', 'LIKE', "%{$query}%");
            })
            ->withCount(['products', 'sales'])
            ->limit($limit)
            ->get()
            ->map(function($seller) {
                return [
                    'id' => $seller->id,
                    'type' => 'seller',
                    'name' => $seller->shop_name ?? $seller->name,
                    'title' => $seller->shop_name ?? $seller->name,
                    'description' => ($seller->is_verified ? 'Verified Seller • ' : '') . 
                                   $seller->products_count . '+ Products • ' . 
                                   $seller->sales_count . ' Sales',
                    'avatar' => $seller->avatar,
                    'is_verified' => $seller->is_verified,
                    'rating' => $seller->average_rating
                ];
            });
    }

    /**
     * Search categories
     */
    private function searchCategories($query, $limit)
    {
        return Category::where('is_active', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%");
            })
            ->withCount('products')
            ->limit($limit)
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'type' => 'category',
                    'name' => $category->name,
                    'title' => $category->name,
                    'description' => $category->products_count . ' products',
                    'slug' => $category->slug,
                    'image' => $category->image
                ];
            });
    }

    /**
     * Get product badge (New, Hot, Sale, etc.)
     */
    private function getProductBadge($product)
    {
        // Check if product is new (created within last 30 days)
        if ($product->created_at->diffInDays(now()) <= 30) {
            return 'New';
        }

        // Check if product is on sale
        if ($product->sale_price && $product->sale_price < $product->price) {
            $discount = round((($product->price - $product->sale_price) / $product->price) * 100);
            return "-{$discount}%";
        }

        // Check if product is trending (high sales)
        if ($product->sales_count > 50) {
            return 'Hot';
        }

        return null;
    }

    /**
     * Get search suggestions/autocomplete
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 5);

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        // Get product name suggestions
        $productSuggestions = Product::where('status', 'active')
            ->where('name', 'LIKE', "{$query}%")
            ->limit($limit)
            ->pluck('name');

        // Get category suggestions
        $categorySuggestions = Category::where('is_active', true)
            ->where('name', 'LIKE', "{$query}%")
            ->limit($limit)
            ->pluck('name');

        // Combine and return unique suggestions
        $suggestions = $productSuggestions
            ->merge($categorySuggestions)
            ->unique()
            ->values()
            ->take($limit);

        return response()->json($suggestions);
    }

    /**
     * Get popular/trending searches
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function trending()
    {
        // You can track this in a separate table or use product views
        $trending = [
            ['text' => 'Mountain Bikes', 'icon' => '🏔️', 'category' => 'bikes'],
            ['text' => 'Road Bikes', 'icon' => '🛣️', 'category' => 'bikes'],
            ['text' => 'Bike Helmets', 'icon' => '🪖', 'category' => 'accessories'],
            ['text' => 'Cycling Shoes', 'icon' => '👟', 'category' => 'accessories'],
            ['text' => 'Bike Lights', 'icon' => '💡', 'category' => 'accessories'],
            ['text' => 'Water Bottles', 'icon' => '🚰', 'category' => 'accessories']
        ];

        return response()->json($trending);
    }
}