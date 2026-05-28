<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Services\CommunityPostCodeService;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommunityPostController extends Controller
{
    private CommunityPostCodeService $postCodeService;
    private CloudinaryService $cloudinary;

    public function __construct(CommunityPostCodeService $postCodeService, CloudinaryService $cloudinary)
    {
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

        $posts = $query->with(['user:id,name,avatar', 'event:event_code,title'])
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $posts->items(),
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
        $post = CommunityPost::where('post_code', $postCode)
            ->orWhere('slug', $postCode)
            ->with(['user:id,name,avatar', 'event:event_code,title,start_datetime'])
            ->firstOrFail();

        return response()->json([
            'data' => $post,
            'mood_emoji' => $post->mood_emoji,
            'formatted_duration' => $post->formatted_duration,
        ]);
    }

    /**
     * Create new community post (auth required)
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

            // Step 3: Photos
            'photos' => 'required|array|min:1',
            'photos.*' => 'string', // base64 data URI or URL
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

            // Handle photo uploads to Cloudinary
            $photoUrls = [];
            $photoCaptions = $validated['photo_captions'] ?? [];
            if (!empty($validated['photos'])) {
                foreach ($validated['photos'] as $idx => $photo) {
                    if (str_starts_with($photo, 'data:image')) {
                        $uploadResult = $this->cloudinary->uploadBase64($photo, [
                            'folder' => 'community-posts/' . $postCode,
                            'resource_type' => 'image',
                        ]);
                        $url = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? null;
                        if ($url) {
                            $photoUrls[] = $url;
                        }
                    } elseif (str_starts_with($photo, 'http')) {
                        $photoUrls[] = $photo;
                    }
                }
            }

            // Create post
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
                'photos' => $photoUrls,
                'photo_captions' => array_slice($photoCaptions, 0, count($photoUrls)),
                'user_id' => $user->id,
                'user_name' => $user->name ?? $user->username ?? 'Anonymous',
                'user_avatar' => $user->avatar ?? null,
                'likes_count' => 0,
                'comments_count' => 0,
                'is_featured' => false,
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'data' => $post,
                'post_code' => $postCode,
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
            'photos' => 'nullable|array',
            'photos.*' => 'string',
        ]);

        // Handle new photos
        if (!empty($validated['photos'])) {
            $existingPhotos = $post->photos ?? [];
            foreach ($validated['photos'] as $photo) {
                if (str_starts_with($photo, 'data:image')) {
                    $uploadResult = $this->cloudinary->uploadBase64($photo, [
                        'folder' => 'community-posts/' . $postCode,
                    ]);
                    $existingPhotos[] = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? $photo;
                } elseif (str_starts_with($photo, 'http')) {
                    $existingPhotos[] = $photo;
                }
            }
            $validated['photos'] = $existingPhotos;
        }

        $post->update($validated);

        return response()->json([
            'success' => true,
            'data' => $post,
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
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $posts->items(),
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
        // For now, increment/decrement
        $post->increment('likes_count');

        return response()->json([
            'success' => true,
            'likes_count' => $post->likes_count,
            'message' => 'Post liked',
        ]);
    }
}
