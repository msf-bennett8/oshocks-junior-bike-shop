<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CyclingEventModerationController extends Controller
{
    /**
     * List all cycling events for moderation
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = CyclingEvent::withTrashed()
            ->with(['organizer:id,name,avatar,role']);

        $tab = $request->get('tab', 'all');
        match($tab) {
            'pending' => $query->where('status', 'pending')->whereNull('deleted_at'),
            'approved' => $query->where('status', 'open')->whereNull('deleted_at'),
            'archived' => $query->where('is_archived', true)->whereNull('deleted_at'),
            'scheduled' => $query->whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at'),
            'auto-scheduled' => $query->whereNotNull('scheduled_for_deletion_at')
                ->whereNull('deleted_at')
                ->where('deletion_reason', 'like', 'Auto-scheduled%'),
            'deleted' => $query->whereNotNull('deleted_at'),
            default => $query->whereNull('deleted_at'),
        };

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('event_code', 'like', "%{$search}%")
                  ->orWhere('meeting_point', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort', 'latest');
        match($sortBy) {
            'oldest' => $query->orderBy('created_at', 'asc'),
            'start_date' => $query->orderBy('start_datetime', 'asc'),
            'scheduled_date' => $query->orderBy('scheduled_for_deletion_at', 'asc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $events = $query->paginate($request->get('per_page', 20));

        $items = $events->items();
        $transformed = array_map(function ($event) {
            $eventArray = $event->toArray();
            $eventArray['organizer_name'] = $event->organizer?->name ?? 'Unknown';
            $eventArray['organizer_role'] = $event->organizer?->role ?? 'user';
            $eventArray['seats_remaining'] = $event->seats_remaining;
            $eventArray['is_full'] = $event->is_full;
            $eventArray['formatted_price'] = $event->formatted_price;
            $eventArray['days_until_deletion'] = $event->scheduled_for_deletion_at
                ? now()->diffInDays($event->scheduled_for_deletion_at, false)
                : null;
            return $eventArray;
        }, $items);

        return response()->json([
            'success' => true,
            'data' => $transformed,
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]
        ]);
    }

    /**
     * Approve event (admin/super_admin)
     */
    public function approve(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        if ($event->status !== 'pending') {
            return response()->json(['error' => 'Event is not pending approval'], 400);
        }

        $event->update([
            'status' => 'open',
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event approved and published',
            'data' => $event->fresh(),
        ]);
    }

    /**
     * Reject event (admin/super_admin)
     */
    public function reject(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        if ($event->status !== 'pending') {
            return response()->json(['error' => 'Event is not pending approval'], 400);
        }

        $event->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event rejected',
            'data' => $event->fresh(),
        ]);
    }

    /**
     * Update event details (admin edit)
     */
    public function updateEvent(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|min:5|max:100',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'start_datetime' => 'sometimes|date',
            'end_datetime' => 'sometimes|date|after:start_datetime',
            'registration_deadline' => 'nullable|date|before:start_datetime',
            'max_participants' => 'sometimes|integer|min:' . ($event->current_participants + 1),
            'min_participants' => 'nullable|integer|min:1|lte:max_participants',
            'price_per_person' => 'sometimes|numeric|min:0',
            'member_price' => 'nullable|numeric|min:0|lte:price_per_person',
            'meeting_point' => 'sometimes|string|max:255',
            'distance_km' => 'sometimes|numeric|min:0.1',
            'estimated_duration_hours' => 'sometimes|numeric|min:0.5',
            'difficulty' => 'sometimes|string|in:beginner,casual,intermediate,advanced,expert',
            'terrain' => 'sometimes|string|in:road,gravel,mtb_trail,mixed',
            'status' => 'sometimes|string|in:open,closed,cancelled',
        ]);

        $event->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => $event->fresh(),
        ]);
    }

    /**
     * Archive event
     */
    public function archive(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
        $event->update([
            'is_archived' => true,
            'archived_at' => now(),
            'archived_by' => $user->id,
            'status' => 'archived',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event archived successfully',
        ]);
    }

    /**
     * Restore archived event
     */
    public function restoreArchive(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
        $event->update([
            'is_archived' => false,
            'archived_at' => null,
            'archived_by' => null,
            'status' => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event restored from archive',
        ]);
    }

    /**
     * Schedule event for deletion
     */
    public function scheduleForDeletion(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
        $event->update([
            'scheduled_for_deletion_at' => now()->addDays(30),
            'deletion_scheduled_by' => $user->id,
            'deletion_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event scheduled for deletion in 30 days',
        ]);
    }

    /**
     * Approve scheduled deletion (super_admin only)
     */
    public function approveDeletion(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        if (!$event->scheduled_for_deletion_at) {
            return response()->json(['error' => 'Event is not scheduled for deletion'], 400);
        }

        $event->update([
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
    public function restore(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::withTrashed()->where('event_code', $eventCode)->firstOrFail();

        if ($event->deleted_at) {
            $event->restore();
        }

        $event->update([
            'scheduled_for_deletion_at' => null,
            'deletion_scheduled_by' => null,
            'deletion_approved_by' => null,
            'deletion_reason' => null,
            'is_archived' => false,
            'status' => $event->approved_at ? 'open' : 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event restored successfully',
        ]);
    }

    /**
     * Permanently delete (super_admin only)
     */
    public function permanentDelete(string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['error' => 'Super admin only'], 403);
        }

        $event = CyclingEvent::withTrashed()->where('event_code', $eventCode)->firstOrFail();
        $event->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Event permanently deleted',
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
                'total_events' => CyclingEvent::count(),
                'pending_approval' => CyclingEvent::where('status', 'pending')->whereNull('deleted_at')->count(),
                'approved_events' => CyclingEvent::where('status', 'open')->whereNull('deleted_at')->count(),
                'rejected_events' => CyclingEvent::where('status', 'rejected')->whereNull('deleted_at')->count(),
                'archived_events' => CyclingEvent::where('is_archived', true)->count(),
                'scheduled_for_deletion' => CyclingEvent::whereNotNull('scheduled_for_deletion_at')->whereNull('deleted_at')->count(),
                'auto_scheduled' => CyclingEvent::whereNotNull('scheduled_for_deletion_at')
                    ->whereNull('deleted_at')
                    ->where('deletion_reason', 'like', 'Auto-scheduled%')
                    ->count(),
                'soft_deleted' => CyclingEvent::onlyTrashed()->count(),
                'pending_deletion_approval' => CyclingEvent::whereNotNull('scheduled_for_deletion_at')
                    ->whereNull('deletion_approved_by')
                    ->whereNull('deleted_at')
                    ->count(),
                'custom_ride_events' => CyclingEvent::where('submitted_by', 'custom_ride')->count(),
                'pending_custom_rides' => \App\Models\CustomRideRequest::whereIn('status', ['accepted', 'quoted', 'reviewing'])
                    ->whereNull('converted_event_code')
                    ->count(),
            ]
        ]);
    }
}
