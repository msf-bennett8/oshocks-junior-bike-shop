<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRental;
use App\Services\BikeImageUploadService;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class BikeRentalController extends Controller
{
    protected BikeImageUploadService $imageUploadService;
    protected CloudinaryService $cloudinary;

    public function __construct(
        BikeImageUploadService $imageUploadService,
        CloudinaryService $cloudinary
    ) {
        $this->imageUploadService = $imageUploadService;
        $this->cloudinary = $cloudinary;
    }

    /**
     * Generate unique listing code via Bennett Fibonacci 36th codec
     */
    protected function generateListingCode(): string
    {
        return app(\App\Services\BikeListingCodeService::class)->generate();
    }

    /**
     * List all bike rentals (public)
     */
    public function index(Request $request)
    {
        $query = BikeRental::with('owner')
            ->where('listing_status', 'approved')
            ->where('is_active', true);

        // Filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
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

        $perPage = $request->get('per_page', 12);
        $bikes = $query->paginate($perPage);

        // Transform items to include appended attributes
        $items = $bikes->items();
        $transformed = array_map(function ($bike) {
            $bikeArray = $bike->toArray();
            // Ensure images are flat URLs (not objects) for frontend
            $bikeArray['images'] = $bike->images;
            $bikeArray['condition'] = $bike->condition;
            $bikeArray['features'] = $bike->features;
            $bikeArray['owner_name'] = $bike->owner_name;
            $bikeArray['owner_avatar'] = $bike->owner_avatar;
            $bikeArray['owner_initials'] = $bike->owner_initials;
            return $bikeArray;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $transformed,
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

        $bikeArray = $bike->toArray();
        $bikeArray['images'] = $bike->images;
        $bikeArray['condition'] = $bike->condition;
        $bikeArray['features'] = $bike->features;
        $bikeArray['owner_name'] = $bike->owner_name;
        $bikeArray['owner_avatar'] = $bike->owner_avatar;
        $bikeArray['owner_initials'] = $bike->owner_initials;

        return response()->json([
            'success' => true,
            'data' => $bikeArray,
            'is_available' => $bike->is_available,
        ]);
    }

    /**
     * Create new bike listing (auth required)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|min:3|max:100',
            'brand' => 'required|string|max:100',
            'model' => 'required|string|max:100',
            'year' => 'required|integer|min:1990|max:' . (now()->year + 1),
            'category' => 'required|string|max:50',
            'frame_size' => 'required|string|max:10',
            'wheel_size' => 'required|string|max:10',
            'bike_condition' => 'required|string|in:new,excellent,good,fair',
            'description' => 'required|string|min:20',
            'hourly_rate' => 'nullable|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'weekly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'security_deposit' => 'required|numeric|min:0',
            'min_rental_hours' => 'required|integer|min:1',
            'max_rental_days' => 'required|integer|min:1',
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
            'photos' => 'required|array|min:1',
            'photos.*' => 'nullable',
            'bike_features' => 'nullable|array',
            'bike_features.*' => 'string|max:50',
            'owner_type' => 'nullable|string|in:user,platform',
        ]);

        DB::beginTransaction();

        try {
            $listingCode = $this->generateListingCode();

            // Generate slug
            $slug = Str::slug("{$validated['brand']}-{$validated['model']}-{$validated['year']}");
            $originalSlug = $slug;
            $counter = 1;
            while (BikeRental::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Handle photo uploads — supports BOTH file uploads (multipart) AND base64
            $photoData = [];
            $uploadedPublicIds = [];

            if ($request->hasFile('photos')) {
                // File uploads via multipart/form-data from listBikeService
                foreach ($request->file('photos') as $idx => $file) {
                    $result = $this->imageUploadService->uploadBikeImage($file, $listingCode);
                    if ($result['success']) {
                        $photoData[] = [
                            'public_id' => $result['public_id'],
                            'url' => $result['secure_url'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['medium_url'],
                            'width' => $result['width'] ?? null,
                            'height' => $result['height'] ?? null,
                            'format' => $result['format'] ?? null,
                            'file_size' => $result['file_size'] ?? null,
                            'original_name' => $result['original_name'],
                            'is_primary' => $idx === 0,
                            'sort_order' => $idx,
                        ];
                        $uploadedPublicIds[] = $result['public_id'];
                    }
                }
            } elseif ($request->has('photos') && is_array($request->photos)) {
                // Base64 strings or existing URLs
                foreach ($request->photos as $idx => $photo) {
                    if (is_string($photo) && str_starts_with($photo, 'data:image')) {
                        $result = $this->imageUploadService->uploadBase64BikeImage($photo, $listingCode);
                        if ($result['success']) {
                            $photoData[] = [
                                'public_id' => $result['public_id'],
                                'url' => $result['secure_url'],
                                'thumbnail_url' => $result['thumbnail_url'],
                                'medium_url' => $result['medium_url'],
                                'width' => $result['width'] ?? null,
                                'height' => $result['height'] ?? null,
                                'format' => $result['format'] ?? null,
                                'file_size' => $result['file_size'] ?? null,
                                'is_primary' => $idx === 0,
                                'sort_order' => $idx,
                            ];
                            $uploadedPublicIds[] = $result['public_id'];
                        }
                    } elseif (is_string($photo) && str_starts_with($photo, 'http')) {
                        $photoData[] = [
                            'url' => $photo,
                            'is_primary' => $idx === 0,
                            'sort_order' => $idx,
                        ];
                    }
                }
            }

            $bikeRental = BikeRental::create([
                'listing_code' => $listingCode,
                'seller_id' => $user->sellerProfile?->id ?? null,
                'owner_id' => $user->id,
                'owner_type' => $validated['owner_type'] ?? 'user',
                'category' => $validated['category'],
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'],
                'brand' => $validated['brand'],
                'model' => $validated['model'],
                'year' => $validated['year'],
                'frame_size' => $validated['frame_size'],
                'wheel_size' => $validated['wheel_size'],
                'bike_condition' => $validated['bike_condition'],
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
                'photos' => $photoData,
                'bike_features' => $validated['bike_features'] ?? [],
                'listing_status' => $user->hasAdminAccess() ? 'approved' : 'pending_review',
                'is_active' => $user->hasAdminAccess() ? true : false,
                'is_verified' => $user->hasAdminAccess() ? true : false,
                'approved_by' => $user->hasAdminAccess() ? $user->id : null,
                'approved_at' => $user->hasAdminAccess() ? now() : null,
                'submitted_by' => $user->hasAdminAccess() ? 'admin' : 'user',
                'total_rentals' => 0,
                'rating' => 0,
                'review_count' => 0,
                'owner_rating' => 0,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bikeRental,
                'listing_code' => $listingCode,
                'message' => 'Bike listed successfully. Pending review.',
            ], 201);

        } catch (Exception $e) {
            DB::rollBack();

            // Clean up any uploaded images on failure
            foreach ($uploadedPublicIds ?? [] as $publicId) {
                $this->cloudinary->deleteFile($publicId, 'image');
            }

            Log::error('Bike listing creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create listing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update my listing (owner or admin)
     */
    public function update(Request $request, string $listingCode)
    {
        $bike = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($bike->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|min:3|max:100',
            'brand' => 'sometimes|string|max:100',
            'model' => 'sometimes|string|max:100',
            'year' => 'sometimes|integer|min:1990|max:' . (now()->year + 1),
            'category' => 'sometimes|string|max:50',
            'frame_size' => 'sometimes|string|max:10',
            'wheel_size' => 'sometimes|string|max:10',
            'bike_condition' => 'sometimes|string|in:new,excellent,good,fair',
            'description' => 'sometimes|string',
            'hourly_rate' => 'nullable|numeric|min:0',
            'daily_rate' => 'sometimes|numeric|min:0',
            'weekly_rate' => 'nullable|numeric|min:0',
            'monthly_rate' => 'nullable|numeric|min:0',
            'security_deposit' => 'sometimes|numeric|min:0',
            'min_rental_hours' => 'sometimes|integer|min:1',
            'max_rental_days' => 'sometimes|integer|min:1',
            'location_address' => 'sometimes|string|max:255',
            'location_lat' => 'nullable|numeric|between:-90,90',
            'location_lng' => 'nullable|numeric|between:-180,180',
            'pickup_type' => 'sometimes|string|in:shop,owner_location,delivery',
            'delivery_fee' => 'nullable|numeric|min:0',
            'instant_book' => 'boolean',
            'response_time_hours' => 'nullable|integer|min:1|max:72',
            'rental_rules' => 'nullable|string',
            'cancellation_policy' => 'nullable|string',
            'insurance_included' => 'boolean',
            'bike_features' => 'nullable|array',
            'bike_features.*' => 'string|max:50',
            'photos' => 'nullable|array',
            'photos.*' => 'nullable',
            'is_active' => 'sometimes|boolean',
        ]);

        DB::beginTransaction();

        try {
            // Handle photo updates — supports BOTH file uploads AND base64
            if ($request->has('photos') || $request->hasFile('photos')) {
                $photoData = [];
                $newUploads = [];

                // Delete old photos from Cloudinary
                if (!empty($bike->photos)) {
                    foreach ($bike->photos as $oldPhoto) {
                        if (isset($oldPhoto['public_id'])) {
                            $this->cloudinary->deleteFile($oldPhoto['public_id'], 'image');
                        }
                    }
                }

                // Upload new photos
                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $idx => $file) {
                        $result = $this->imageUploadService->uploadBikeImage($file, $listingCode);
                        if ($result['success']) {
                            $photoData[] = [
                                'public_id' => $result['public_id'],
                                'url' => $result['secure_url'],
                                'thumbnail_url' => $result['thumbnail_url'],
                                'medium_url' => $result['medium_url'],
                                'width' => $result['width'] ?? null,
                                'height' => $result['height'] ?? null,
                                'format' => $result['format'] ?? null,
                                'file_size' => $result['file_size'] ?? null,
                                'original_name' => $result['original_name'],
                                'is_primary' => $idx === 0,
                                'sort_order' => $idx,
                            ];
                            $newUploads[] = $result['public_id'];
                        }
                    }
                } elseif ($request->has('photos') && is_array($request->photos)) {
                    foreach ($request->photos as $idx => $photo) {
                        if (is_string($photo) && str_starts_with($photo, 'data:image')) {
                            $result = $this->imageUploadService->uploadBase64BikeImage($photo, $listingCode);
                            if ($result['success']) {
                                $photoData[] = [
                                    'public_id' => $result['public_id'],
                                    'url' => $result['secure_url'],
                                    'thumbnail_url' => $result['thumbnail_url'],
                                    'medium_url' => $result['medium_url'],
                                    'width' => $result['width'] ?? null,
                                    'height' => $result['height'] ?? null,
                                    'format' => $result['format'] ?? null,
                                    'file_size' => $result['file_size'] ?? null,
                                    'is_primary' => $idx === 0,
                                    'sort_order' => $idx,
                                ];
                                $newUploads[] = $result['public_id'];
                            }
                        } elseif (is_string($photo) && str_starts_with($photo, 'http')) {
                            $photoData[] = [
                                'url' => $photo,
                                'is_primary' => $idx === 0,
                                'sort_order' => $idx,
                            ];
                        }
                    }
                }

                $validated['photos'] = $photoData;
            }

            // Regenerate slug if name changed
            if (isset($validated['name'])) {
                $slug = Str::slug("{$validated['brand']}-{$validated['model']}-{$validated['year']}");
                $originalSlug = $slug;
                $counter = 1;
                while (BikeRental::where('slug', $slug)->where('id', '!=', $bike->id)->exists()) {
                    $slug = "{$originalSlug}-" . $counter++;
                }
                $validated['slug'] = $slug;
            }

            $bike->update($validated);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $bike->fresh(),
                'message' => 'Listing updated successfully',
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            foreach ($newUploads ?? [] as $publicId) {
                $this->cloudinary->deleteFile($publicId, 'image');
            }

            Log::error('Bike listing update failed', [
                'listing_code' => $listingCode,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update listing: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete listing (soft delete, owner or admin)
     */
    public function destroy(string $listingCode)
    {
        $bike = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($bike->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete photos from Cloudinary
        if (!empty($bike->photos)) {
            foreach ($bike->photos as $photo) {
                if (isset($photo['public_id'])) {
                    $this->cloudinary->deleteFile($photo['public_id'], 'image');
                }
            }
        }

        $bike->delete();

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
            ->with('owner')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        $items = $listings->items();
        $transformed = array_map(function ($bike) {
            $bikeArray = $bike->toArray();
            $bikeArray['images'] = $bike->images;
            $bikeArray['condition'] = $bike->condition;
            $bikeArray['features'] = $bike->features;
            $bikeArray['owner_name'] = $bike->owner_name;
            $bikeArray['owner_avatar'] = $bike->owner_avatar;
            $bikeArray['owner_initials'] = $bike->owner_initials;
            return $bikeArray;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $transformed,
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
        $bike = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $user = Auth::user();

        if ($bike->owner_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'listing_code' => $bike->listing_code,
                'name' => $bike->name,
                'total_rentals' => $bike->total_rentals,
                'rating' => $bike->rating,
                'review_count' => $bike->review_count,
                'listing_status' => $bike->listing_status,
                'is_active' => $bike->is_active,
                'is_verified' => $bike->is_verified,
                'earnings_estimate' => $bike->daily_rate * $bike->total_rentals * 0.85,
            ]
        ]);
    }
}
