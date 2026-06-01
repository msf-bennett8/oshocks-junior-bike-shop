<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommunityPostModerationController extends Controller
{
    /**
     * List all community posts for moderation (admin/super_admin only)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = CommunityPost::withTrashed()
            ->with(['user:id,name,avatar', 'postImages']);

        // Tab filters
        $tab = $request->get('tab', 'all');
        match($tab) {
            'scheduled' => $query->whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at'),
            'auto-scheduled' => $query->whereNotNull('scheduled_for_deletion_at')
                ->whereNull('deleted_at')
                ->where('deletion_reason', 'like', 'Auto-scheduled%'),
            'deleted' => $query->whereNotNull('deleted_at'),
            'featured' => $query->where('is_featured', true)->whereNull('deleted_at'),
            default => $query->whereNull('deleted_at'),
        };

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('post_code', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort', 'latest');
        match($sortBy) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'scheduled_date' => $query->orderBy('scheduled_for_deletion_at', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $posts = $query->paginate($request->get('per_page', 20));

        $items = $posts->items();
        $transformed = array_map(function ($post) {
            $postArray = $post->toArray();
            $postArray['photos'] = $post->photos;
            $postArray['images'] = $post->images;
            $postArray['user_initials'] = $post->user_initials;
            $postArray['mood_emoji'] = $post->mood_emoji;
            $postArray['formatted_duration'] = $post->formatted_duration;
            $postArray['days_until_deletion'] = $post->scheduled_for_deletion_at
                ? now()->diffInDays($post->scheduled_for_deletion_at, false)
                : null;
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
     * Toggle featured status
     */
    public function toggleFeatured(string $postCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $post = CommunityPost::withTrashed()->where('post_code', $postCode)->firstOrFail();
        $post->update(['is_featured' => !$post->is_featured]);

        return response()->json([
            'success' => true,
            'is_featured' => $post->is_featured,
            'message' => $post->is_featured ? 'Post featured' : 'Post unfeatured',
        ]);
    }

    /**
     * Schedule post for deletion (30-day grace period)
     */
    public function scheduleForDeletion(Request $request, string $postCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $post = CommunityPost::where('post_code', $postCode)->firstOrFail();
        $post->update([
            'scheduled_for_deletion_at' => now()->addDays(30),
            'deletion_scheduled_by' => $user->id,
            'deletion_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post scheduled for deletion in 30 days',
            'scheduled_for_deletion_at' => $post->scheduled_for_deletion_at,
        ]);
    }

    /**
     * Approve scheduled deletion (super_admin only)
     */
    public function approveDeletion(string $postCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $post = CommunityPost::where('post_code', $postCode)->firstOrFail();

        if (!$post->scheduled_for_deletion_at) {
            return response()->json(['error' => 'Post is not scheduled for deletion'], 400);
        }

        $post->update([
            'deletion_approved_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Deletion approved. Post will be permanently deleted on ' . $post->scheduled_for_deletion_at->format('Y-m-d'),
        ]);
    }

    /**
     * Restore post from scheduled deletion
     */
    public function restore(string $postCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $post = CommunityPost::withTrashed()->where('post_code', $postCode)->firstOrFail();

        // Restore from soft delete if applicable
        if ($post->deleted_at) {
            $post->restore();
        }

        // Clear scheduled deletion
        $post->update([
            'scheduled_for_deletion_at' => null,
            'deletion_scheduled_by' => null,
            'deletion_approved_by' => null,
            'deletion_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Post restored successfully',
        ]);
    }

    /**
     * Permanently delete post (super_admin only)
     */
    public function permanentDelete(string $postCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $post = CommunityPost::withTrashed()->where('post_code', $postCode)->firstOrFail();

        // Delete Cloudinary images
        $cloudinary = app(\App\Services\CommunityPostCloudinaryService::class);
        $cloudinary->deleteAllPostImages($postCode);

        // Delete related images
        $post->postImages()->forceDelete();

        // Force delete
        $post->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Post permanently deleted',
        ]);
    }

    /**
     * Get moderation stats
     */
    public function stats()
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_posts' => CommunityPost::count(),
                'featured_posts' => CommunityPost::where('is_featured', true)->count(),
                'scheduled_for_deletion' => CommunityPost::whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at')->count(),
                'auto_scheduled' => CommunityPost::whereNotNull('scheduled_for_deletion_at')
                    ->whereNull('deleted_at')
                    ->where('deletion_reason', 'like', 'Auto-scheduled%')
                    ->count(),
                'soft_deleted' => CommunityPost::onlyTrashed()->count(),
                'pending_approval' => CommunityPost::whereNotNull('scheduled_for_deletion_at')
                    ->whereNull('deletion_approved_by')
                    ->whereNull('deleted_at')
                    ->count(),
            ]
        ]);
    }
}
