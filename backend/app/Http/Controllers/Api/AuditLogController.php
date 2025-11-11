<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    /**
     * Get all audit logs with filtering
     * GET /api/v1/audit-logs
     */
    public function index(Request $request)
    {
        // Only admins and super admins can view audit logs
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $query = AuditLog::with('user:id,name,email,role');

        // Filter by event type
        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        // Filter by event category
        if ($request->has('event_category')) {
            $query->where('event_category', $request->event_category);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by user role
        if ($request->has('user_role')) {
            $query->where('user_role', $request->user_role);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Filter by suspicious activity
        if ($request->has('is_suspicious')) {
            $query->where('is_suspicious', $request->is_suspicious);
        }

        // Filter by model type
        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by model ID
        if ($request->has('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('occurred_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('occurred_at', '<=', $request->date_to);
        }

        // Search in description
        if ($request->has('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Sort by occurred_at (newest first by default)
        $sortBy = $request->get('sort_by', 'occurred_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Get a specific audit log by ID
     * GET /api/v1/audit-logs/{id}
     */
    public function show(Request $request, $id)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $log = AuditLog::with('user:id,name,email,role')->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Audit log not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $log
        ]);
    }

    /**
     * Get audit logs for a specific user
     * GET /api/v1/audit-logs/user/{userId}
     */
    public function userLogs(Request $request, $userId)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $logs = AuditLog::where('user_id', $userId)
            ->orderBy('occurred_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'data' => $logs
        ]);
    }

    /**
     * Get suspicious activity logs
     * GET /api/v1/audit-logs/suspicious
     */
    public function suspicious(Request $request)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $logs = AuditLog::with('user:id,name,email,role')
            ->where('is_suspicious', true)
            ->orderBy('occurred_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }

    /**
     * Get audit statistics
     * GET /api/v1/audit-logs/stats
     */
    public function stats(Request $request)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $stats = [
            'total_logs' => AuditLog::count(),
            'suspicious_count' => AuditLog::where('is_suspicious', true)->count(),
            'by_category' => AuditLog::selectRaw('event_category, COUNT(*) as count')
                ->groupBy('event_category')
                ->get(),
            'by_severity' => AuditLog::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->get(),
            'recent_high_severity' => AuditLog::where('severity', 'high')
                ->orderBy('occurred_at', 'desc')
                ->limit(5)
                ->get(),
            'failed_logins_today' => AuditLog::where('event_type', 'login_failed')
                ->whereDate('occurred_at', today())
                ->count(),
            'payments_today' => AuditLog::where('event_type', 'payment_recorded')
                ->whereDate('occurred_at', today())
                ->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get audit logs by event category
     * GET /api/v1/audit-logs/category/{category}
     */
    public function byCategory(Request $request, $category)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $validCategories = ['security', 'payment', 'order', 'product', 'user'];
        
        if (!in_array($category, $validCategories)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid category'
            ], 400);
        }

        $logs = AuditLog::with('user:id,name,email,role')
            ->where('event_category', $category)
            ->orderBy('occurred_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'category' => $category,
            'data' => $logs
        ]);
    }

    /**
     * Export audit logs (returns JSON for now, could be CSV)
     * GET /api/v1/audit-logs/export
     */
    public function export(Request $request)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $query = AuditLog::with('user:id,name,email,role');

        // Apply same filters as index
        if ($request->has('date_from')) {
            $query->whereDate('occurred_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('occurred_at', '<=', $request->date_to);
        }

        if ($request->has('event_category')) {
            $query->where('event_category', $request->event_category);
        }

        $logs = $query->orderBy('occurred_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $logs->count(),
            'data' => $logs
        ]);
    }

    /**
     * Get retention statistics
     * GET /api/v1/audit-logs/retention/stats
     */
    public function retentionStats()
    {
        $stats = \App\Services\AuditRetentionService::getStats();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Run cleanup manually
     * POST /api/v1/audit-logs/retention/cleanup
     */
    public function runCleanup(Request $request)
    {
        // Only super admins can run cleanup
        if (auth()->user()->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only super admins can run cleanup.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'dry_run' => 'nullable|boolean',
            'is_suspicious' => 'nullable|string',
            'severity' => 'nullable|in:low,medium,high',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'event_category' => 'nullable|string',
            'delete_all' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Build conditions from request
        $conditions = [];
        if ($request->has('is_suspicious')) {
            $conditions['is_suspicious'] = $request->is_suspicious;
        }
        if ($request->has('severity')) {
            $conditions['severity'] = $request->severity;
        }
        if ($request->has('date_from') && $request->has('date_to')) {
            $conditions['date_from'] = $request->date_from;
            $conditions['date_to'] = $request->date_to;
        }
        if ($request->has('event_category')) {
            $conditions['event_category'] = $request->event_category;
        }

        // Preview mode (dry run)
        if ($request->dry_run) {
            $query = AuditLog::query();

            // Apply same filters
            if (isset($conditions['is_suspicious'])) {
                $query->where('is_suspicious', $conditions['is_suspicious'] == '1');
            }
            if (isset($conditions['severity'])) {
                $query->where('severity', $conditions['severity']);
            }
            if (isset($conditions['date_from']) && isset($conditions['date_to'])) {
                $query->whereBetween('occurred_at', [
                    $conditions['date_from'],
                    $conditions['date_to']
                ]);
            }
            if (isset($conditions['event_category'])) {
                $query->where('event_category', $conditions['event_category']);
            }
            if ($request->delete_all) {
                // No additional filters, count all
            }

            $count = $query->count();

            return response()->json([
                'success' => true,
                'message' => 'Dry run completed',
                'data' => [
                    'would_archive' => $count,
                    'breakdown' => [
                        'standard' => $count,
                        'high_severity' => 0,
                        'suspicious' => 0,
                    ]
                ]
            ]);
        }

        // Actual deletion
        if ($request->delete_all) {
            // Delete all logs (dangerous!)
            $result = \App\Services\AuditRetentionService::cleanup();
        } else {
            // Delete with conditions
            $result = \App\Services\AuditRetentionService::deleteByConditions($conditions);
        }

        return response()->json($result);
    }

    /**
     * Get archived logs
     * GET /api/v1/audit-logs/archives
     */
    public function archives(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $query = \App\Models\AuditArchive::query();

        // Filters
        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('event_category')) {
            $query->where('event_category', $request->event_category);
        }

        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->has('archive_reason')) {
            $query->where('archive_reason', $request->archive_reason);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('occurred_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'archived_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $archives = $query->with('user')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $archives
        ]);
    }

    /**
     * Get single archived log
     * GET /api/v1/audit-logs/archives/{id}
     */
    public function showArchive($id)
    {
        $archive = \App\Models\AuditArchive::with('user')->find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archived log not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $archive
        ]);
    }

    /**
     * Get archive statistics
     * GET /api/v1/audit-logs/archives/stats
     */
    public function archiveStats(Request $request)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        $totalArchived = \App\Models\AuditArchive::count();
        
        // Archives older than 90 days (eligible for permanent deletion)
        $eligibleForDeletion = \App\Models\AuditArchive::where(
            'archived_at', 
            '<', 
            now()->subDays(90)
        )->count();

        // Calculate approximate storage size (rough estimate)
        $avgRowSize = 2; // KB per row (estimate)
        $storageSizeMB = round(($totalArchived * $avgRowSize) / 1024, 2);

        $stats = [
            'total_archived' => $totalArchived,
            'eligible_for_deletion' => $eligibleForDeletion,
            'storage_size' => $storageSizeMB . ' MB',
            'retention_days' => 90,
            'by_reason' => \App\Models\AuditArchive::selectRaw('archive_reason, COUNT(*) as count')
                ->groupBy('archive_reason')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Restore archived log to active logs
     * POST /api/v1/audit-logs/archives/{id}/restore
     */
    public function restoreArchive(Request $request, $id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only super admins can restore archives.'
            ], 403);
        }

        $archive = \App\Models\AuditArchive::find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archive not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Restore to audit_logs table
            AuditLog::create([
                'event_type' => $archive->event_type,
                'event_category' => $archive->event_category,
                'user_id' => $archive->user_id,
                'user_role' => $archive->user_role,
                'action' => $archive->action,
                'model_type' => $archive->model_type,
                'model_id' => $archive->model_id,
                'description' => $archive->description,
                'old_values' => $archive->old_values,
                'new_values' => $archive->new_values,
                'metadata' => $archive->metadata,
                'ip_address' => $archive->ip_address,
                'user_agent' => $archive->user_agent,
                'request_method' => $archive->request_method,
                'request_url' => $archive->request_url,
                'severity' => $archive->severity,
                'is_suspicious' => $archive->is_suspicious,
                'occurred_at' => $archive->occurred_at,
            ]);

            // Delete from archives
            $archive->delete();

            DB::commit();

            Log::info('✅ Archive restored', [
                'archive_id' => $id,
                'restored_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Archive restored successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Archive restoration failed', [
                'archive_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Restoration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk restore archived logs
     * POST /api/v1/audit-logs/archives/bulk-restore
     */
    public function bulkRestoreArchives(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only super admins can restore archives.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'archive_ids' => 'required|array',
            'archive_ids.*' => 'required|integer|exists:audit_archives,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $restoredCount = 0;
            $failedCount = 0;

            foreach ($request->archive_ids as $archiveId) {
                $archive = \App\Models\AuditArchive::find($archiveId);
                
                if ($archive) {
                    try {
                        AuditLog::create([
                            'event_type' => $archive->event_type,
                            'event_category' => $archive->event_category,
                            'user_id' => $archive->user_id,
                            'user_role' => $archive->user_role,
                            'action' => $archive->action,
                            'model_type' => $archive->model_type,
                            'model_id' => $archive->model_id,
                            'description' => $archive->description,
                            'old_values' => $archive->old_values,
                            'new_values' => $archive->new_values,
                            'metadata' => $archive->metadata,
                            'ip_address' => $archive->ip_address,
                            'user_agent' => $archive->user_agent,
                            'request_method' => $archive->request_method,
                            'request_url' => $archive->request_url,
                            'severity' => $archive->severity,
                            'is_suspicious' => $archive->is_suspicious,
                            'occurred_at' => $archive->occurred_at,
                        ]);

                        $archive->delete();
                        $restoredCount++;
                    } catch (\Exception $e) {
                        $failedCount++;
                        Log::error('Failed to restore archive', [
                            'archive_id' => $archiveId,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }

            DB::commit();

            Log::info('✅ Bulk restore completed', [
                'restored' => $restoredCount,
                'failed' => $failedCount,
                'restored_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Restored $restoredCount archives successfully",
                'restored_count' => $restoredCount,
                'failed_count' => $failedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Bulk restoration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete single archived log
     * DELETE /api/v1/audit-logs/archives/{id}
     */
    public function permanentlyDeleteArchive(Request $request, $id)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only super admins can permanently delete archives.'
            ], 403);
        }

        $archive = \App\Models\AuditArchive::find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archive not found'
            ], 404);
        }

        try {
            $archive->delete();

            Log::warning('⚠️ Archive permanently deleted', [
                'archive_id' => $id,
                'event_type' => $archive->event_type,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Archive permanently deleted'
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Failed to delete archive', [
                'archive_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Deletion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk permanently delete archived logs
     * POST /api/v1/audit-logs/archives/bulk-delete
     */
    public function bulkDeleteArchives(Request $request)
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only super admins can permanently delete archives.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'archive_ids' => 'required|array',
            'archive_ids.*' => 'required|integer|exists:audit_archives,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $deletedCount = \App\Models\AuditArchive::whereIn('id', $request->archive_ids)->delete();

            Log::warning('⚠️ Bulk archives permanently deleted', [
                'count' => $deletedCount,
                'deleted_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Permanently deleted $deletedCount archives",
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Bulk deletion failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Bulk deletion failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export archived logs
     * GET /api/v1/audit-logs/archives/export
     */
    public function exportArchives(Request $request)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $query = \App\Models\AuditArchive::query();

        // Apply filters
        if ($request->has('start_date')) {
            $query->whereDate('archived_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('archived_at', '<=', $request->end_date);
        }

        if ($request->has('archive_reason')) {
            $query->where('archive_reason', $request->archive_reason);
        }

        $archives = $query->orderBy('archived_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $archives->count(),
            'data' => $archives
        ]);
    }
}