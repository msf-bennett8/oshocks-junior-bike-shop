<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRental;
use App\Models\Product;
use App\Services\BikeListingCodeService;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BikeRentalController extends Controller
{
    private BikeListingCodeService $listingCodeService;
    private CloudinaryService $cloudinary;

    public function __construct(BikeListingCodeService $listingCodeService, CloudinaryService $cloudinary)
    {
        $this->listingCodeService = $listingCodeService;
        $this->cloudinary = $cloudinary;
    }

    /**
     * List all bike rentals (public)
     */
    public function index(Request $request)
    {
        $query = BikeRental::query()
            ->where('listing_status', 'approved')
            ->where('is_active', true);

        // Filters
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->has('condition')) {
            $query->where('bike_condition', $request->condition);
        }
        if ($request->has('owner_type')) {
            $query->where('owner_type', $request->owner_type);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('location_address', 'like', "%{$search}%");
            });
        }
        if ($request->has('min_price')) {
            $query->where('daily_rate', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('daily_rate', '<=', $request->max_price);
        }
        if ($request->has('instant_book')) {
            $query->where('instant_book', $request->boolean('instant_book'));
        }
        if ($request->has('frame_size')) {
            $query->where('frame_size', $request->frame_size);
        }
        if ($request->has('wheel_size')) {
            $query->where('wheel_size', $request->wheel_size);
        }

        // Sorting
        $sortBy = $request->get('sort', 'latest');
        $allowedSorts = ['latest', 'price_low', 'price_high', 'rating', 'popular'];
        if (in_array($sortBy, $allowedSorts)) {
            match($sortBy) {
                'price_low' => $query->orderBy('daily_rate', 'asc'),
                'price_high' => $query->orderBy('daily_rate', 'desc'),
                'rating' => $query->orderBy('rating', 'desc'),
                'popular' => $query->orderBy('total_rentals', 'desc'),
                default => $query->orderBy('created_at', 'desc'),
            };
        }

        $bikes = $query->with(['images', 'category', 'owner'])->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $bikes->items(),
            'meta' => [
                'current_page' => $bikes->currentPage(),
                'last_page' => $bikes->lastPage(),
                'per_page' => $bikes->perPage(),
                'total' => $bikes->total(),
            ]
        ]);
    }

    /**
     * Show single bike by listing code (public)
     */
    public function show(string $listingCode)
    {
        $bike = BikeRental::where('listing_code', $listingCode)
            ->orWhere('slug', $listingCode)
            ->with(['owner'])
            ->firstOrFail();

        return response()->json([
            'data' => $bike,
            'is_available' => $bike->listing_status === 'approved' && $bike->is_active,
        ]);
    }

    /**
     * Create new bike listing (auth required)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validate
        $validated = $request->validate([
            // Step 1: Basic Info
            'name' => 'required|string|min:3|max:100',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1990|max:' . (now()->year + 1),
            'category' => 'required|string|max:50',
            'frame_size' => 'required|string|max:10',
            'wheel_size' => 'required|string|max:10',
            'bike_condition' => 'required|string|in:new,excellent,good,fair',
            'description' => 'required|string|min:20',

            // Step 2: Pricing
            'hourly_rate' => 'nullable|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'weekly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'security_deposit' => 'required|numeric|min:0',
            'min_rental_hours' => 'required|integer|min:1',
            'max_rental_days' => 'required|integer|min:1',

            // Step 3: Location & Rules
            'location_address' => 'required|string|max:255',
            'location_lat' => 'nullable|numeric|between:-90,90',
            'location_lng' => 'nullable|numeric|between:-180,180',
            'pickup_type' => 'required|string|in:shop,owner_location,delivery',
            'delivery_fee' => 'nullable|numeric|min:0',
            'instant_book' => 'boolean',
            'response_time_hours' => 'nullable|integer|min:1|max:72',
            'rental_rules' => 'nullable|string',
            'cancellation_policy' => 'nullable|string',
            'insurance_included' => 'boolean',

            // Step 4: Photos & Features
            'photos' => 'required|array|min:1',
            'photos.*' => 'string', // base64 data URI or URL
            'bike_features' => 'nullable|array',
            'bike_features.*' => 'string|max:50',

            // System
            'owner_type' => 'nullable|string|in:user,platform',
        ]);

        return DB::transaction(function () use ($validated, $user, $request) {
            // Generate listing code via Bennett Fibonacci 36th
            $listingCode = $this->listingCodeService->generate();

            // Generate slug
            $slug = Str::slug("{$validated['brand']}-{$validated['model']}-{$validated['year']}");
            $originalSlug = $slug;
            $counter = 1;
            while (BikeRental::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Handle photo uploads to Cloudinary
            $photoUrls = [];
            $imageRecords = [];
            if (!empty($validated['photos'])) {
                foreach ($validated['photos'] as $idx => $photo) {
                    if (str_starts_with($photo, 'data:image')) {
                        $uploadResult = $this->cloudinary->uploadBase64($photo, [
                            'folder' => 'bike-listings/' . $listingCode,
                            'resource_type' => 'image',
                        ]);
                        $url = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? null;
                        if ($url) {
                            $photoUrls[] = $url;
                            $imageRecords[] = [
                                'url' => $url,
                                'public_id' => $uploadResult['public_id'] ?? null,
                                'is_primary' => $idx === 0,
                                'sort_order' => $idx,
                            ];
                        }
                    } elseif (str_starts_with($photo, 'http')) {
                        $photoUrls[] = $photo;
                        $imageRecords[] = [
                            'url' => $photo,
                            'is_primary' => $idx === 0,
                            'sort_order' => $idx,
                        ];
                    }
                }
            }

            // Get or create category for rentals
            $category = \App\Models\Category::firstOrCreate(
                ['name' => $validated['category']],
                ['slug' => Str::slug($validated['category']), 'is_active' => true]
            );

            // Create bike rental listing
            $bikeRental = BikeRental::create([
                'listing_code' => $listingCode,
                'seller_id' => $user->sellerProfile?->id, // Link to seller profile if exists
                'owner_id' => $user->id,
                'owner_type' => $validated['owner_type'] ?? 'user',
                'category_id' => $category->id,
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'],
                'brand' => $validated['brand'],
                'model' => $validated['model'],
                'year' => $validated['year'],
                'frame_size' => $validated['frame_size'],
                'wheel_size' => $validated['wheel_size'],
                'bike_condition' => $validated['bike_condition'],
                'type' => 'rental',
                'price' => $validated['daily_rate'], // Base price = daily rate
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'daily_rate' => $validated['daily_rate'],
                'weekly_rate' => $validated['weekly_rate'] ?? null,
                'monthly_rate' => $validated['monthly_rate'] ?? null,
                'security_deposit' => $validated['security_deposit'],
                'min_rental_hours' => $validated['min_rental_hours'],
                'max_rental_days' => $validated['max_rental_days'],
                'location_address' => $validated['location_address'],
                'location_lat' => $validated['location_lat'] ?? null,
                'location_lng' => $validated['location_lng'] ?? null,
                'pickup_type' => $validated['pickup_type'],
                'delivery_fee' => $validated['delivery_fee'] ?? null,
                'instant_book' => $validated['instant_book'] ?? false,
                'response_time_hours' => $validated['response_time_hours'] ?? 2,
                'rental_rules' => $validated['rental_rules'] ?? null,
                'cancellation_policy' => $validated['cancellation_policy'] ?? null,
                'insurance_included' => $validated['insurance_included'] ?? false,
                'bike_features' => $validated['bike_features'] ?? [],
                'listing_status' => 'pending_review',
                'total_rentals' => 0,
                'rating' => 0,
                'review_count' => 0,
                'is_verified' => false,
                'is_active' => false,
            ]);

            // Images are stored in JSON photos array, no separate images table needed
            // Cloudinary URLs already in $bikeRental->photos

            return response()->json([
                'success' => true,
                'data' => $bikeRental,
                'listing_code' => $listingCode,
                'message' => 'Bike listed successfully. Pending review.',
            ], 201);
        });
    }

    /**
     * Update my listing (owner only)
     */
    public function update(Request $request, string $listingCode)
    {
        $product = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($product->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|min:3|max:100',
            'description' => 'sometimes|string',
            'daily_rate' => 'sometimes|numeric|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'weekly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'security_deposit' => 'sometimes|numeric|min:0',
            'location_address' => 'sometimes|string|max:255',
            'pickup_type' => 'sometimes|string|in:shop,owner_location,delivery',
            'instant_book' => 'boolean',
            'is_active' => 'boolean',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
        ]);

        // Handle new photos
        if (!empty($validated['photos'])) {
            $existingPhotos = $product->photos ?? [];
            foreach ($validated['photos'] as $photo) {
                if (str_starts_with($photo, 'data:image')) {
                    $uploadResult = $this->cloudinary->uploadBase64($photo, [
                        'folder' => 'bike-listings/' . $listingCode,
                    ]);
                    $existingPhotos[] = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? $photo;
                } elseif (str_starts_with($photo, 'http')) {
                    $existingPhotos[] = $photo;
                }
            }
            $validated['photos'] = $existingPhotos;
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'data' => $product->fresh(),
            'message' => 'Listing updated successfully',
        ]);
    }

    /**
     * Delete listing (soft delete, owner or admin)
     */
    public function destroy(string $listingCode)
    {
        $product = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($product->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Listing removed successfully',
        ]);
    }

    /**
     * Get my listings
     */
    public function myListings(Request $request)
    {
        $user = Auth::user();
        $listings = BikeRental::where('owner_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $listings->items(),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ]
        ]);
    }

    /**
     * Get listing stats (for owner dashboard)
     */
    public function stats(string $listingCode)
    {
        $product = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($product->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'listing_code' => $product->listing_code,
                'name' => $product->name,
                'total_rentals' => $product->total_rentals,
                'rating' => $product->rating,
                'reviews_count' => $product->reviews_count,
                'listing_status' => $product->listing_status,
                'is_active' => $product->is_active,
                'earnings_estimate' => $product->daily_rate * $product->total_rentals * 0.85,
            ]
        ]);
    }
}
