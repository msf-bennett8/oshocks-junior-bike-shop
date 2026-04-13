<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * List notifications with filtering
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Notification::where('user_id', $user->id)
            ->notExpired()
            ->with(['user']);

        // Filter by archived status
        if ($request->has('archived')) {
            $isArchived = filter_var($request->archived, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_archived', $isArchived);
        } else {
            // Default: show unarchived
            $query->unarchived();
        }

        // Filter by read status
        if ($request->has('read')) {
            $isRead = filter_var($request->read, FILTER_VALIDATE_BOOLEAN);
            if ($isRead) {
                $query->read();
            } else {
                $query->unread();
            }
        }

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->byPriority($request->priority);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhereJsonContains('metadata->orderId', $search)
                  ->orWhereJsonContains('metadata->sku', $search);
            });
        }

        // Date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sorting: Pinned first, then priority, then created_at
        $sortBy = $request->get('sort_by', 'newest');
        $sortOrder = $request->get('sort_order', 'desc');

        $query->orderBy('is_pinned', 'desc')
              ->orderByRaw("FIELD(priority, 'urgent', 'high', 'normal', 'low')")
              ->orderBy('created_at', $sortOrder === 'oldest' ? 'asc' : 'desc');

        $perPage = $request->get('per_page', 15);
        $notifications = $query->paginate($perPage);

        return response()->json([
            'data' => $notifications->map(fn ($n) => $this->formatNotification($n)),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => NotificationService::getUnreadCount($user),
            ],
        ]);
    }

    /**
     * Get single notification
     */
    public function show($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Auto-mark as read when viewed
        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'data' => $this->formatNotification($notification, true),
        ]);
    }

    /**
     * Mark as read
     */
    public function markAsRead($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
            'unread_count' => NotificationService::getUnreadCount($user),
        ]);
    }

    /**
     * Mark all as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();

        $query = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->unarchived();

        // Optional: filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        $count = $query->count();
        $query->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
            'count' => $count,
            'unread_count' => NotificationService::getUnreadCount($user),
        ]);
    }

    /**
     * Soft delete notification
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        NotificationService::delete($user, $notification->id);

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Archive notification
     */
    public function archive($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Unpin if archiving
        if ($notification->is_pinned) {
            $notification->unpin();
        }

        $notification->archive();

        return response()->json([
            'success' => true,
            'message' => 'Notification archived',
        ]);
    }

    /**
     * Unarchive notification
     */
    public function unarchive($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->unarchive();

        return response()->json([
            'success' => true,
            'message' => 'Notification unarchived',
        ]);
    }

    /**
     * Pin notification
     */
    public function pin($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->firstOrFail();

        $notification->pin();

        return response()->json([
            'success' => true,
            'message' => 'Notification pinned',
        ]);
    }

    /**
     * Unpin notification
     */
    public function unpin($id)
    {
        $user = Auth::user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $notification->unpin();

        return response()->json([
            'success' => true,
            'message' => 'Notification unpinned',
        ]);
    }

    /**
     * Bulk delete
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:notifications,id',
        ]);

        $count = NotificationService::bulkDelete($user, $validated['ids'], [
            'source' => 'api_bulk_delete',
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications deleted",
            'count' => $count,
        ]);
    }

    /**
     * Bulk archive
     */
    public function bulkArchive(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:notifications,id',
        ]);

        $count = Notification::whereIn('id', $validated['ids'])
            ->where('user_id', $user->id)
            ->update([
                'is_archived' => true,
                'is_pinned' => false,
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications archived",
            'count' => $count,
        ]);
    }

    /**
     * Bulk mark as read
     */
    public function bulkMarkRead(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:notifications,id',
        ]);

        $count = Notification::whereIn('id', $validated['ids'])
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
            'count' => $count,
            'unread_count' => NotificationService::getUnreadCount($user),
        ]);
    }

    /**
     * Get unread count
     */
    public function getUnreadCount()
    {
        $user = Auth::user();
        $count = NotificationService::getUnreadCount($user);

        // Get counts by priority
        $urgentCount = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->unarchived()
            ->byPriority('urgent')
            ->count();

        return response()->json([
            'unread_count' => $count,
            'urgent_count' => $urgentCount,
        ]);
    }

    /**
     * Track click (public endpoint with signed URL)
     */
    public function trackClick(Request $request, $notificationId)
    {
        $notification = Notification::where('notification_id', $notificationId)->first();

        if (!$notification) {
            return redirect('/notifications');
        }

        $clickedUrl = $request->get('url', $notification->action_url ?? '/notifications');
        
        NotificationService::trackClick($notificationId, 'email', $clickedUrl, $request->ip());

        return redirect($clickedUrl);
    }

    /**
     * Tracking pixel (for email opens)
     */
    public function trackingPixel($notificationId)
    {
        $notification = Notification::where('notification_id', $notificationId)->first();

        if ($notification) {
            NotificationService::trackOpen($notificationId, 'email', request()->ip());
        }

        // Return 1x1 transparent GIF
        return response(base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'))
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    /**
     * Format notification for API response
     */
    private function formatNotification(Notification $n, bool $full = false): array
    {
        $data = [
            'id' => $n->id,
            'notification_id' => $n->notification_id,
            'type' => $n->type,
            'priority' => $n->priority,
            'title' => $n->title,
            'message' => $n->message,
            'is_read' => $n->isRead,
            'is_archived' => $n->is_archived,
            'is_pinned' => $n->is_pinned,
            'read_at' => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->toIso8601String(),
            'time_ago' => $n->timeAgo,
            'icon' => [
                'type' => $n->icon_type,
                'color' => $n->icon_color,
                'gradient' => $n->icon_gradient,
            ],
            'action' => [
                'url' => $n->action_url,
                'text' => $n->action_text,
            ],
        ];

        // Include metadata and actions if available
        if ($n->metadata) {
            $data['metadata'] = $n->metadata;
        }
        if ($n->actions) {
            $data['actions'] = $n->actions;
        }

        // Full details for single view
        if ($full) {
            $data['audit_log'] = $n->audit_log;
            $data['channel'] = $n->channel;
            $data['delivery_status'] = $n->delivery_status;
            $data['sent_at'] = $n->sent_at?->toIso8601String();
            $data['delivered_at'] = $n->delivered_at?->toIso8601String();
            $data['clicked_at'] = $n->clicked_at?->toIso8601String();
            $data['open_count'] = $n->open_count;
            $data['click_count'] = $n->click_count;
        }

        return $data;
    }

    /**
     * Track delivery (from service worker push)
     */
    public function trackDelivery(Request $request, $notificationId)
    {
        $notification = Notification::where('notification_id', $notificationId)->first();

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        NotificationService::trackDelivery($notificationId, $request->ip());

        return response()->json(['success' => true]);
    }
}
