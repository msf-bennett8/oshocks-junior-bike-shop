<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BikeRental;
use App\Models\BikeRentalBooking;
use App\Models\BikeAvailabilityBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BikeListingModerationController extends Controller
{
    /**
     * List all bike listings for moderation
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = BikeRental::withTrashed()
            ->with(['owner:id,name,avatar,role', 'seller:id,business_name']);

        $tab = $request->get('tab', 'all');
        match($tab) {
            'pending' => $query->where('listing_status', 'pending_review')->whereNull('deleted_at'),
            'approved' => $query->where('listing_status', 'approved')->whereNull('deleted_at'),
            'rejected' => $query->where('listing_status', 'rejected')->whereNull('deleted_at'),
            'paused' => $query->where('listing_status', 'paused')->whereNull('deleted_at'),
            'archived' => $query->where('is_archived', true)->whereNull('deleted_at'),
            'scheduled' => $query->whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at'),
            'deleted' => $query->whereNotNull('deleted_at'),
            default => $query->whereNull('deleted_at'),
        };

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('listing_code', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('location_address', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort', 'latest');
        match($sortBy) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'price_low' => $query->orderBy('daily_rate', 'asc'),
            'price_high' => $query->orderBy('daily_rate', 'desc'),
            'scheduled_date' => $query->orderBy('scheduled_for_deletion_at', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $listings = $query->paginate($request->get('per_page', 20));

        $items = $listings->items();
        $transformed = array_map(function ($listing) {
            $listingArray = $listing->toArray();
            $listingArray['owner_name'] = $listing->owner?->name ?? 'Unknown';
            $listingArray['owner_role'] = $listing->owner?->role ?? 'user';
            $listingArray['seller_name'] = $listing->seller?->business_name ?? null;
            $listingArray['images'] = $listing->images;
            $listingArray['formatted_daily_rate'] = $listing->formatted_daily_rate;
            $listingArray['is_available'] = $listing->is_available;
            $listingArray['days_until_deletion'] = $listing->scheduled_for_deletion_at
                ? now()->diffInDays($listing->scheduled_for_deletion_at, false)
                : null;
            $listingArray['active_bookings_count'] = BikeRentalBooking::where('bike_rental_id', $listing->id)
                ->whereIn('status', ['confirmed', 'active'])
                ->count();
            return $listingArray;
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
     * Approve listing (admin/super_admin)
     */
    public function approve(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();

        if ($listing->listing_status !== 'pending_review') {
            return response()->json(['error' => 'Listing is not pending review'], 400);
        }

        $listing->update([
            'listing_status' => 'approved',
            'is_active' => true,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing approved and published',
            'data' => $listing->fresh(),
        ]);
    }

    /**
     * Reject listing (admin/super_admin)
     */
    public function reject(Request $request, string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();

        if ($listing->listing_status !== 'pending_review') {
            return response()->json(['error' => 'Listing is not pending review'], 400);
        }

        $listing->update([
            'listing_status' => 'rejected',
            'is_active' => false,
            'rejection_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing rejected',
            'data' => $listing->fresh(),
        ]);
    }

    /**
     * Update listing details (admin edit)
     */
    public function updateListing(Request $request, string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();

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
            'listing_status' => 'sometimes|string|in:pending_review,approved,rejected,paused,delisted',
            'is_active' => 'sometimes|boolean',
            'is_verified' => 'sometimes|boolean',
        ]);

        $listing->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Listing updated successfully',
            'data' => $listing->fresh(),
        ]);
    }

    /**
     * Pause listing (admin)
     */
    public function pause(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $listing->update([
            'listing_status' => 'paused',
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing paused',
        ]);
    }

    /**
     * Resume listing (admin)
     */
    public function resume(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $listing->update([
            'listing_status' => 'approved',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing resumed',
        ]);
    }

    /**
     * Archive listing
     */
    public function archive(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $listing->update([
            'is_archived' => true,
            'archived_at' => now(),
            'archived_by' => $user->id,
            'listing_status' => 'delisted',
            'is_active' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing archived successfully',
        ]);
    }

    /**
     * Restore archived listing
     */
    public function restoreArchive(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $listing->update([
            'is_archived' => false,
            'archived_at' => null,
            'archived_by' => null,
            'listing_status' => 'approved',
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing restored from archive',
        ]);
    }

    /**
     * Schedule listing for deletion
     */
    public function scheduleForDeletion(Request $request, string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();
        $listing->update([
            'scheduled_for_deletion_at' => now()->addDays(30),
            'deletion_scheduled_by' => $user->id,
            'deletion_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing scheduled for deletion in 30 days',
        ]);
    }

    /**
     * Approve scheduled deletion (super_admin only)
     */
    public function approveDeletion(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();

        if (!$listing->scheduled_for_deletion_at) {
            return response()->json(['error' => 'Listing is not scheduled for deletion'], 400);
        }

        $listing->update([
            'deletion_approved_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Deletion approved',
        ]);
    }

    /**
     * Restore from scheduled deletion
     */
    public function restore(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $listing = BikeRental::withTrashed()->where('listing_code', $listingCode)->firstOrFail();

        if ($listing->deleted_at) {
            $listing->restore();
        }

        $listing->update([
            'scheduled_for_deletion_at' => null,
            'deletion_scheduled_by' => null,
            'deletion_approved_by' => null,
            'deletion_reason' => null,
            'is_archived' => false,
            'listing_status' => $listing->approved_at ? 'approved' : 'pending_review',
            'is_active' => $listing->approved_at ? true : false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Listing restored successfully',
        ]);
    }

    /**
     * Permanently delete (super_admin only)
     */
    public function permanentDelete(string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $listing = BikeRental::withTrashed()->where('listing_code', $listingCode)->firstOrFail();

        // Delete photos from Cloudinary
        if (!empty($listing->photos)) {
            foreach ($listing->photos as $photo) {
                if (isset($photo['public_id'])) {
                    app(\App\Services\CloudinaryService::class)->deleteFile($photo['public_id'], 'image');
                }
            }
        }

        $listing->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Listing permanently deleted',
        ]);
    }

    /**
     * Mark as out of service / maintenance
     */
    public function markOutOfService(Request $request, string $listingCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        $listing = BikeRental::where('listing_code', $listingCode)->firstOrFail();

        DB::transaction(function () use ($listing, $validated, $user) {
            // Create availability block
            BikeAvailabilityBlock::create([
                'bike_rental_id' => $listing->id,
                'block_type' => 'out_of_service',
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'reason' => $validated['reason'],
                'created_by' => $user->id,
            ]);

            // Pause the listing if currently active
            if ($listing->listing_status === 'approved') {
                $listing->update(['listing_status' => 'paused', 'is_active' => false]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Listing marked as out of service',
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
                'total_listings' => BikeRental::count(),
                'pending_review' => BikeRental::where('listing_status', 'pending_review')->whereNull('deleted_at')->count(),
                'approved_listings' => BikeRental::where('listing_status', 'approved')->whereNull('deleted_at')->count(),
                'rejected_listings' => BikeRental::where('listing_status', 'rejected')->whereNull('deleted_at')->count(),
                'paused_listings' => BikeRental::where('listing_status', 'paused')->whereNull('deleted_at')->count(),
                'archived_listings' => BikeRental::where('is_archived', true)->count(),
                'scheduled_for_deletion' => BikeRental::whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at')->count(),
                'soft_deleted' => BikeRental::onlyTrashed()->count(),
                'pending_deletion_approval' => BikeRental::whereNotNull('scheduled_for_deletion_at')
                    ->whereNull('deletion_approved_by')
                    ->whereNull('deleted_at')
                    ->count(),
                'active_bookings' => BikeRentalBooking::whereIn('status', ['confirmed', 'active'])->count(),
                'out_of_service' => BikeAvailabilityBlock::where('block_type', 'out_of_service')
                    ->where('end_datetime', '>=', now())
                    ->count(),
            ]
        ]);
    }

    /**
     * Check bike availability for date range (public)
     * Returns true if available, false if booked/out-of-service
     */
    public function checkAvailability(Request $request, string $listingCode)
    {
        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        $listing = BikeRental::where('listing_code', $listingCode)
            ->where('listing_status', 'approved')
            ->where('is_active', true)
            ->firstOrFail();

        $isAvailable = $this->isBikeAvailable(
            $listing->id,
            $validated['start_datetime'],
            $validated['end_datetime']
        );

        // Get existing blocks for the period
        $blocks = BikeAvailabilityBlock::where('bike_rental_id', $listing->id)
            ->where(function ($q) use ($validated) {
                $q->whereBetween('start_datetime', [$validated['start_datetime'], $validated['end_datetime']])
                  ->orWhereBetween('end_datetime', [$validated['start_datetime'], $validated['end_datetime']])
                  ->orWhere(function ($sq) use ($validated) {
                      $sq->where('start_datetime', '<=', $validated['start_datetime'])
                         ->where('end_datetime', '>=', $validated['end_datetime']);
                  });
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'available' => $isAvailable,
                'listing_code' => $listingCode,
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'blocks' => $blocks,
                'next_available_from' => $isAvailable ? null : $this->getNextAvailableDate($listing->id, $validated['end_datetime']),
            ],
        ]);
    }

    /**
     * Core availability check — used by booking controller too
     */
    public static function isBikeAvailable(int $bikeRentalId, string $start, string $end): bool
    {
        $overlapExists = BikeAvailabilityBlock::where('bike_rental_id', $bikeRentalId)
            ->where(function ($q) use ($start, $end) {
                // Overlap condition: existing block overlaps with requested range
                $q->where(function ($sq) use ($start, $end) {
                    $sq->where('start_datetime', '<', $end)
                       ->where('end_datetime', '>', $start);
                });
            })
            ->exists();

        return !$overlapExists;
    }

    /**
     * Get next available date after a given date
     */
    private function getNextAvailableDate(int $bikeRentalId, string $afterDate): ?string
    {
        $nextBlock = BikeAvailabilityBlock::where('bike_rental_id', $bikeRentalId)
            ->where('end_datetime', '>', $afterDate)
            ->orderBy('end_datetime', 'asc')
            ->first();

        return $nextBlock?->end_datetime?->toDateTimeString();
    }
}
