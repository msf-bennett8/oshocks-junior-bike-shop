<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     * GET /api/v1/notifications
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notification::where('user_id', $user->id)
            ->where('is_archived', false);

        // Filter by read status
        if ($request->has('unread_only')) {
            $query->where('is_read', false);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->where('is_archived', false)
                ->count(),
        ]);
    }

    /**
     * Mark notification as read
     * PUT /api/v1/notifications/{id}/read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        // Track as opened if not already tracked
        if (!$notification->opened_at) {
            NotificationService::trackOpen(
                $notification->notification_id,
                $notification->channel,
                $request->ip(),
                $request->header('X-Device-Type') ?? 'web'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Mark all notifications as read
     * PUT /api/v1/notifications/read-all
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->where('is_archived', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read"
        ]);
    }

    /**
     * Delete notification
     * DELETE /api/v1/notifications/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $success = NotificationService::delete($user, $id, 'manual');

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted'
        ]);
    }

    /**
     * Archive notification
     * POST /api/v1/notifications/{id}/archive
     */
    public function archive(Request $request, $id)
    {
        $user = $request->user();

        $success = NotificationService::archive($user, $id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification archived'
        ]);
    }

    /**
     * Unarchive notification
     * POST /api/v1/notifications/{id}/unarchive
     */
    public function unarchive(Request $request, $id)
    {
        $user = $request->user();

        $success = NotificationService::unarchive($user, $id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification unarchived'
        ]);
    }

    /**
     * Bulk delete notifications
     * POST /api/v1/notifications/bulk-delete
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:notifications,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $count = NotificationService::bulkDelete($user, $request->ids, [
            'type' => $request->filter_type,
            'date_range' => $request->date_range,
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications deleted"
        ]);
    }

    /**
     * Track notification click (public endpoint for email links)
     * GET /api/v1/notifications/track-click/{notificationId}
     */
    public function trackClick(Request $request, $notificationId)
    {
        $redirectUrl = $request->get('redirect', '/');

        NotificationService::trackClick(
            $notificationId,
            $request->get('channel', 'email'),
            $redirectUrl,
            $request->ip()
        );

        return redirect($redirectUrl);
    }

    /**
     * Get notification tracking pixel (for email opens)
     * GET /api/v1/notifications/pixel/{notificationId}
     */
    public function trackingPixel(Request $request, $notificationId)
    {
        NotificationService::trackOpen(
            $notificationId,
            'email',
            $request->ip(),
            'email_client'
        );

        // Return 1x1 transparent GIF
        $pixel = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        
        return response($pixel, 200)
            ->header('Content-Type', 'image/gif')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}
