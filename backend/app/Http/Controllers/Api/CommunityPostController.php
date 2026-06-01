<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\CommunityPostImage;
use App\Services\CommunityPostCodeService;
use App\Services\CommunityPostCloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityPostController extends Controller
{
    private CommunityPostCodeService $postCodeService;
    private CommunityPostCloudinaryService $cloudinary;

    public function __construct(
        CommunityPostCodeService $postCodeService,
        CommunityPostCloudinaryService $cloudinary
    ) {
        $this->postCodeService = $postCodeService;
        $this->cloudinary = $cloudinary;
    }

    /**
     * List community posts (public)
     */
    public function index(Request $request)
    {
        $query = CommunityPost::query()
            ->where('status', 'active')
            ->where('visibility', 'public');

        // Filters
        if ($request->has('type')) {
            $query->where('ride_type', $request->type);
        }
        if ($request->has('mood')) {
            $query->where('mood', $request->mood);
        }
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }
        if ($request->has('featured')) {
            $query->where('is_featured', $request->boolean('featured'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'latest');
        match($sortBy) {
            'popular' => $query->orderBy('likes_count', 'desc'),
            'distance' => $query->orderBy('ride_distance_km', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $posts = $query->with(['user:id,name,avatar', 'event:event_code,title', 'postImages'])
            ->paginate($request->get('per_page', 12));

        // Transform items to include flattened frontend-compatible fields
        $items = $posts->items();
        $transformed = array_map(function ($post) {
            $postArray = $post->toArray();
            // Ensure frontend gets flat photos array (not just relationship objects)
            $postArray['photos'] = $post->photos;
            $postArray['images'] = $post->images;
            $postArray['user_initials'] = $post->user_initials;
            $postArray['mood_emoji'] = $post->mood_emoji;
            $postArray['formatted_duration'] = $post->formatted_duration;
            return $postArray;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $transformed,
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Show single post by code (public)
     */
    public function show(string $postCode)
    {
        // Try post_code or slug first, then fallback to numeric id
        $post = CommunityPost::where('post_code', $postCode)
            ->orWhere('slug', $postCode)
            ->when(is_numeric($postCode), function ($q) use ($postCode) {
                $q->orWhere('id', $postCode);
            })
            ->with(['user:id,name,avatar', 'event:event_code,title,start_datetime', 'postImages'])
            ->firstOrFail();

        $postArray = $post->toArray();
        $postArray['photos'] = $post->photos;
        $postArray['images'] = $post->images;
        $postArray['user_initials'] = $post->user_initials;
        $postArray['mood_emoji'] = $post->mood_emoji;
        $postArray['formatted_duration'] = $post->formatted_duration;

        return response()->json([
            'success' => true,
            'data' => $postArray,
        ]);
    }

    /**
     * Create new community post (auth required)
     * Accepts multipart/form-data with image files
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            // Step 1: Ride Info
            'title' => 'required|string|min:5|max:100',
            'event_id' => [
                'nullable',
                'integer',
                function ($attribute, $value, $fail) {
                    if ($value === null) return;
                    if (!\Schema::hasTable('cycling_events')) {
                        \Log::warning('cycling_events table missing during validation', ['event_id' => $value]);
                        return;
                    }
                    if (!\DB::table('cycling_events')->where('id', $value)->exists()) {
                        $fail('The selected event is invalid.');
                    }
                },
            ],
            'ride_date' => 'required|date|before_or_equal:today',
            'ride_type' => 'required|string|in:solo,group,race,training,leisure',

            // Step 2: Stats
            'ride_distance_km' => 'nullable|numeric|min:0.1|max:500',
            'ride_duration_minutes' => 'nullable|integer|min:1|max:1440',
            'elevation_gain_m' => 'nullable|integer|min:0',
            'avg_speed_kmh' => 'nullable|numeric|min:0|max:100',
            'max_speed_kmh' => 'nullable|numeric|min:0|max:150|gte:avg_speed_kmh',
            'calories_burned' => 'nullable|integer|min:0|max:50000',

            // Step 3: Story & Details
            'content' => 'required|string|min:20',
            'mood' => 'required|string|in:amazing,good,tired,challenging,epic',
            'bike_used' => 'nullable|string|max:100',
            'gear' => 'nullable|array',
            'gear.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:30',
            'visibility' => 'required|string|in:public,followers,private',
            'allow_comments' => 'boolean',

            // Photos: Accept file uploads OR base64 strings
            'images' => 'nullable|array',
            'images.*' => 'file|mimes:jpeg,png,webp,gif|max:10240', // 10MB max
            'photo_captions' => 'nullable|array',
            'photo_captions.*' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $user, $request) {
            // Generate post code via Bennett Fibonacci 36th
            $postCode = $this->postCodeService->generate();

            // Generate slug
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $counter = 1;
            while (CommunityPost::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Create post first (without photos)
            $post = CommunityPost::create([
                'post_code' => $postCode,
                'slug' => $slug,
                'title' => $validated['title'],
                'event_id' => $validated['event_id'] ?? null,
                'ride_date' => $validated['ride_date'],
                'ride_type' => $validated['ride_type'],
                'ride_distance_km' => $validated['ride_distance_km'] ?? null,
                'ride_duration_minutes' => $validated['ride_duration_minutes'] ?? null,
                'elevation_gain_m' => $validated['elevation_gain_m'] ?? null,
                'avg_speed_kmh' => $validated['avg_speed_kmh'] ?? null,
                'max_speed_kmh' => $validated['max_speed_kmh'] ?? null,
                'calories_burned' => $validated['calories_burned'] ?? null,
                'content' => $validated['content'],
                'mood' => $validated['mood'],
                'bike_used' => $validated['bike_used'] ?? null,
                'gear' => $validated['gear'] ?? [],
                'tags' => $validated['tags'] ?? [],
                'visibility' => $validated['visibility'],
                'allow_comments' => $validated['allow_comments'] ?? true,
                'photos' => [], // Legacy field - kept empty, images stored in separate table
                'photo_captions' => [],
                'user_id' => $user->id,
                'user_name' => $user->name ?? $user->username ?? 'Anonymous',
                'user_avatar' => $user->avatar ?? null,
                'likes_count' => 0,
                'comments_count' => 0,
                'is_featured' => false,
                'status' => 'active',
            ]);

            // Handle image uploads to Cloudinary
            $uploadedImages = [];
            $photoCaptions = $request->input('photo_captions', []);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $idx => $imageFile) {
                    $caption = $photoCaptions[$idx] ?? null;

                    $result = $this->cloudinary->uploadPostImage($imageFile, $postCode, $caption);

                    if ($result['success']) {
                        $imageRecord = CommunityPostImage::create([
                            'post_code' => $postCode,
                            'cloudinary_public_id' => $result['public_id'],
                            'cloudinary_secure_url' => $result['secure_url'],
                            'cloudinary_thumbnail_url' => $result['thumbnail_url'],
                            'cloudinary_medium_url' => $result['medium_url'],
                            'original_name' => $result['original_name'],
                            'folder_path' => $result['folder_path'],
                            'format' => $result['format'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'file_size' => $result['file_size'],
                            'caption' => $caption,
                            'display_order' => $idx,
                        ]);
                        $uploadedImages[] = $imageRecord;
                    } else {
                        \Log::warning('Community post image upload failed', [
                            'post_code' => $postCode,
                            'error' => $result['error'],
                            'index' => $idx,
                        ]);
                    }
                }
            }

            // Handle base64 fallback (from old clients)
            $base64Photos = $request->input('photos');
            if (is_array($base64Photos) && empty($uploadedImages)) {
                foreach ($base64Photos as $idx => $photo) {
                    if (is_string($photo) && str_starts_with($photo, 'data:image')) {
                        $caption = $photoCaptions[$idx] ?? null;
                        $result = $this->cloudinary->uploadBase64PostImage($photo, $postCode, $caption);

                        if ($result['success']) {
                            CommunityPostImage::create([
                                'post_code' => $postCode,
                                'cloudinary_public_id' => $result['public_id'],
                                'cloudinary_secure_url' => $result['secure_url'],
                                'cloudinary_thumbnail_url' => $result['thumbnail_url'],
                                'cloudinary_medium_url' => $result['medium_url'],
                                'folder_path' => $result['folder_path'],
                                'format' => $result['format'],
                                'width' => $result['width'],
                                'height' => $result['height'],
                                'file_size' => $result['file_size'],
                                'caption' => $caption,
                                'display_order' => $idx,
                            ]);
                        }
                    }
                }
            }

            // Refresh post with images
            $post->load('postImages');

            return response()->json([
                'success' => true,
                'data' => $post,
                'post_code' => $postCode,
                'images_uploaded' => count($uploadedImages),
                'message' => 'Ride story shared successfully!',
            ], 201);
        });
    }

    /**
     * Update post (author or admin only)
     */
    public function update(Request $request, string $postCode)
    {
        $post = CommunityPost::where('post_code', $postCode)->firstOrFail();
        $user = Auth::user();

        if ($post->user_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|min:5|max:100',
            'content' => 'sometimes|string|min:20',
            'visibility' => 'sometimes|string|in:public,followers,private',
            'allow_comments' => 'boolean',
            'images' => 'nullable|array',
            'images.*' => 'file|mimes:jpeg,png,webp,gif|max:10240',
            'photo_captions' => 'nullable|array',
            'photo_captions.*' => 'nullable|string|max:255',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'string', // public_ids to remove
        ]);

        // Handle new image uploads
        $newImages = [];
        if ($request->hasFile('images')) {
            $photoCaptions = $request->input('photo_captions', []);
            $currentCount = $post->images()->count();

            foreach ($request->file('images') as $idx => $imageFile) {
                $caption = $photoCaptions[$idx] ?? null;
                $result = $this->cloudinary->uploadPostImage($imageFile, $postCode, $caption);

                if ($result['success']) {
                    $imageRecord = CommunityPostImage::create([
                        'post_code' => $postCode,
                        'cloudinary_public_id' => $result['public_id'],
                        'cloudinary_secure_url' => $result['secure_url'],
                        'cloudinary_thumbnail_url' => $result['thumbnail_url'],
                        'cloudinary_medium_url' => $result['medium_url'],
                        'original_name' => $result['original_name'],
                        'folder_path' => $result['folder_path'],
                        'format' => $result['format'],
                        'width' => $result['width'],
                        'height' => $result['height'],
                        'file_size' => $result['file_size'],
                        'caption' => $caption,
                        'display_order' => $currentCount + $idx,
                    ]);
                    $newImages[] = $imageRecord;
                }
            }
        }

        // Handle image removals
        $removePublicIds = $request->input('remove_images', []);
        foreach ($removePublicIds as $publicId) {
            $this->cloudinary->deletePostImage($publicId);
            CommunityPostImage::where('cloudinary_public_id', $publicId)->delete();
        }

        // Update post fields
        $updateData = collect($validated)->only([
            'title', 'content', 'visibility', 'allow_comments'
        ])->toArray();

        $post->update($updateData);
        $post->load('postImages');

        return response()->json([
            'success' => true,
            'data' => $post,
            'images_added' => count($newImages),
            'images_removed' => count($removePublicIds),
            'message' => 'Post updated successfully',
        ]);
    }

    /**
     * Delete post (soft delete, author or admin only)
     */
    public function destroy(string $postCode)
    {
        $post = CommunityPost::where('post_code', $postCode)->firstOrFail();
        $user = Auth::user();

        if ($post->user_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete all Cloudinary images
        $this->cloudinary->deleteAllPostImages($postCode);

        // Soft delete the post
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post removed successfully',
        ]);
    }

    /**
     * Get my posts
     */
    public function myPosts(Request $request)
    {
        $user = Auth::user();
        $posts = CommunityPost::where('user_id', $user->id)
            ->with('postImages')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        $items = $posts->items();
        $transformed = array_map(function ($post) {
            $postArray = $post->toArray();
            $postArray['photos'] = $post->photos;
            $postArray['images'] = $post->images;
            $postArray['user_initials'] = $post->user_initials;
            return $postArray;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $transformed,
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Like/unlike post
     */
    public function toggleLike(string $postCode)
    {
        $post = CommunityPost::where('post_code', $postCode)->firstOrFail();
        $user = Auth::user();

        // TODO: implement proper like tracking with pivot table
        $post->increment('likes_count');

        return response()->json([
            'success' => true,
            'likes_count' => $post->likes_count,
            'message' => 'Post liked',
        ]);
    }
}
