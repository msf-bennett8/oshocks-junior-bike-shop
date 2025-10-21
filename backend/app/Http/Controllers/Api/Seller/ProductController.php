<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Get all products for authenticated seller
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            // Check if user is seller or super admin
            if (!in_array($user->role, ['seller', 'super_admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $query = Product::with(['category', 'images', 'variants']);

            // If seller, only show their products
            if ($user->role === 'seller') {
                $query->where('seller_id', $user->id);
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%")
                      ->orWhere('sku', 'LIKE', "%{$search}%");
                });
            }

            // Category filter
            if ($request->has('category') && $request->category) {
                $query->where('category_id', $request->category);
            }

            // Sort
            $sortField = $request->get('sort', 'created_at');
            $sortDirection = $request->get('direction', 'desc');
            
            if ($sortField === 'latest') {
                $query->orderBy('created_at', 'desc');
            } else {
                $query->orderBy($sortField, $sortDirection);
            }

            // Pagination
            $perPage = $request->get('per_page', 15);
            $products = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $products->items(),
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new product with Cloudinary images
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // DEBUG: Log incoming request
            Log::info('Product creation request received', [
                'user_id' => $user->id,
                'has_files' => $request->hasFile('colors'),
                'all_files' => $request->allFiles(),
                'colors_input' => $request->input('colors'),
            ]);

            // Validate user role
            if (!in_array($user->role, ['seller', 'super_admin'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Validation rules
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'type' => 'required|in:bike,accessory',
                'category_id' => 'required|exists:categories,id',
                'price' => 'required|numeric|min:0',
                'quantity' => 'required|integer|min:0',
                'condition' => 'required|in:new,used,refurbished',
                'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
                'specifications' => 'nullable|json',
                'keyFeatures' => 'nullable|json', 
                'sizes' => 'nullable|json', 
                'colors' => 'required|array|min:1',
                'colors.*.name' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Prepare specifications with keyFeatures and sizes
            $specifications = $request->specifications ? json_decode($request->specifications, true) : [];

            // Add keyFeatures if provided
            if ($request->has('keyFeatures')) {
                $keyFeatures = json_decode($request->keyFeatures, true);
                if (is_array($keyFeatures)) {
                    $specifications['key_features'] = array_filter($keyFeatures, function($feature) {
                        return isset($feature['text']) && !empty(trim($feature['text']));
                    });
                }
            }

            // Add sizes if provided
            if ($request->has('sizes')) {
                $sizes = json_decode($request->sizes, true);
                if (is_array($sizes)) {
                    $specifications['sizes'] = $sizes;
                }
            }

            // Create product
            $product = Product::create([
                'name' => $request->name,
                'slug' => Str::slug($request->name) . '-' . Str::random(6),
                'description' => $request->description,
                'type' => $request->type,
                'category_id' => $request->category_id,
                'brand_id' => $request->brand_id,
                'seller_id' => $user->role === 'seller' ? $user->id : null,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'condition' => $request->condition,
                'year' => $request->year,
                'specifications' => !empty($specifications) ? $specifications : null,
                'is_active' => true,
            ]);

            // Process color variants with images
            $colors = $request->input('colors', []);
            $allUploadedImages = [];

            foreach ($colors as $index => $colorData) {
                // Create product variant for this color
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $colorData['name'],  // ✅ CORRECT: Use 'name' not 'color'
                    'sku' => $product->slug . '-' . Str::slug($colorData['name']),
                    'price' => $request->price,
                    'quantity' => $request->quantity,
                    'attributes' => [
                        'color' => $colorData['name'],  // Store color in attributes JSON
                    ],
                ]);

                // Upload images for this color variant
                $imageKey = "colors.{$index}.images";
                
                if ($request->hasFile($imageKey)) {
                    $images = $request->file($imageKey);
                    
                    // Handle both array and single file
                    if (!is_array($images)) {
                        $images = [$images];
                    }
                    
                    foreach ($images as $imageIndex => $imageFile) {
                        // Upload to Cloudinary
                        $uploadResult = $this->cloudinary->uploadImage(
                            $imageFile,
                            'oshocks/products/' . $product->slug,
                            [
                                'public_id' => $product->slug . '-' . Str::slug($colorData['name']) . '-' . ($imageIndex + 1),
                            ]
                        );

                        if ($uploadResult['success']) {
                            // Save image record to database
                            ProductImage::create([
                                'product_id' => $product->id,
                                'variant_id' => $variant->id,
                                'image_url' => $uploadResult['url'],
                                'thumbnail_url' => $uploadResult['thumbnail_url'],
                                'public_id' => $uploadResult['public_id'],
                                'is_primary' => $imageIndex === 0, // First image is primary
                                'display_order' => $imageIndex,
                            ]);

                            $allUploadedImages[] = $uploadResult;
                        }
                    }
                }
            }

            DB::commit();

            // Load relationships for response
            $product->load(['category', 'images', 'variants']);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product,
                'uploaded_images_count' => count($allUploadedImages)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create product: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a specific product
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            
            $product = Product::with(['category', 'images', 'variants'])->findOrFail($id);

            // Check ownership for sellers
            if ($user->role === 'seller' && $product->seller_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $product
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
    }

    /**
     * Update product with new images
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $product = Product::findOrFail($id);

            // Check ownership
            if ($user->role === 'seller' && $product->seller_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'price' => 'sometimes|required|numeric|min:0',
                'quantity' => 'sometimes|required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Update product fields
            $product->update($request->only([
                'name', 'description', 'type', 'category_id', 'brand_id',
                'price', 'quantity', 'condition', 'year'
            ]));

            if ($request->has('specifications')) {
                $product->specifications = json_decode($request->specifications, true);
                $product->save();
            }

            // Handle new images if uploaded
            if ($request->has('colors')) {
                $colors = $request->input('colors', []);
                
                foreach ($colors as $index => $colorData) {
                    $imageKey = "colors.{$index}.images";
                    
                    if ($request->hasFile($imageKey)) {
                        $variant = $product->variants()->where('name', $colorData['name'])->first();
                        
                        if (!$variant) {
                            $variant = ProductVariant::create([
                                'product_id' => $product->id,
                                'name' => $colorData['name'], 
                                'sku' => $product->slug . '-' . Str::slug($colorData['name']),
                                'price' => $product->price,
                                'quantity' => $product->quantity,
                                'attributes' => [
                                    'color' => $colorData['name'],
                                ],
                            ]);
                        }

                        $images = $request->file($imageKey);
                        
                        foreach ($images as $imageIndex => $imageFile) {
                            $uploadResult = $this->cloudinary->uploadImage(
                                $imageFile,
                                'oshocks/products/' . $product->slug
                            );

                            if ($uploadResult['success']) {
                                ProductImage::create([
                                    'product_id' => $product->id,
                                    'variant_id' => $variant->id,
                                    'image_url' => $uploadResult['url'],
                                    'thumbnail_url' => $uploadResult['thumbnail_url'],
                                    'public_id' => $uploadResult['public_id'],
                                    'display_order' => $imageIndex,
                                ]);
                            }
                        }
                    }
                }
            }

            DB::commit();

            $product->load(['category', 'images', 'variants']);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to update product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete product and its Cloudinary images
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $product = Product::with('images')->findOrFail($id);

            // Check ownership
            if ($user->role === 'seller' && $product->seller_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            DB::beginTransaction();

            // Delete images from Cloudinary
            $publicIds = $product->images->pluck('public_id')->toArray();
            if (!empty($publicIds)) {
                $this->cloudinary->deleteMultipleImages($publicIds);
            }

            // Delete product (cascades to images and variants)
            $product->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to delete product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product'
            ], 500);
        }
    }
}