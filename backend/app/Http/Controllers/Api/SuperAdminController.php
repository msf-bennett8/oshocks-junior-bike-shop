<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SuperAdminController extends Controller
{
    /**
     * Change user role (Super Admin only)
     */
    public function changeUserRole(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:customer,seller,pending_seller,admin,super_admin,payment_recorder',
            'reason' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($userId);
        $oldRole = $user->role;
        $newRole = $request->role;

        // Prevent self-demotion
        if ($user->id === auth()->id() && $oldRole === 'super_admin' && $newRole !== 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot demote yourself from super admin'
            ], 403);
        }

        $user->update(['role' => $newRole]);

        // Log role change
        AuditService::logUserRoleChanged($user, $oldRole, $newRole, [
            'reason' => $request->reason,
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully',
            'data' => [
                'user_id' => $user->id,
                'old_role' => $oldRole,
                'new_role' => $newRole,
            ]
        ]);
    }

    /**
     * Update user permissions (Super Admin only)
     */
    public function updatePermissions(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'permissions_added' => 'nullable|array',
            'permissions_removed' => 'nullable|array',
            'reason' => 'required|string|min:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($userId);
        
        // Get current permissions (assuming stored as JSON or pivot table)
        $currentPermissions = $user->permissions ?? [];
        $permissionsAdded = $request->permissions_added ?? [];
        $permissionsRemoved = $request->permissions_removed ?? [];

        // Calculate new permissions
        $newPermissions = array_merge(
            array_diff($currentPermissions, $permissionsRemoved),
            $permissionsAdded
        );

        // Update user permissions
        $user->update(['permissions' => $newPermissions]);

        // Log permission update
        AuditService::logPermissionsUpdated($user, $permissionsAdded, $permissionsRemoved, [
            'reason' => $request->reason,
            'changed_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User permissions updated successfully',
            'data' => [
                'user_id' => $user->id,
                'permissions_added' => $permissionsAdded,
                'permissions_removed' => $permissionsRemoved,
                'current_permissions' => $newPermissions,
            ]
        ]);
    }

    /**
     * Start impersonating a user (Super Admin only)
     */
    public function startImpersonation(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        
        // Prevent impersonating self
        if ($targetUser->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot impersonate yourself'
            ], 400);
        }

        // Prevent impersonating super admins
        if ($targetUser->role === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot impersonate super admins'
            ], 403);
        }

        $impersonationToken = bin2hex(random_bytes(32));

        // Store impersonation session
        session()->put('impersonation', [
            'original_user_id' => auth()->id(),
            'target_user_id' => $targetUser->id,
            'token' => hash('sha256', $impersonationToken),
            'started_at' => now(),
        ]);

        // Log impersonation start
        AuditService::logAdminImpersonationStarted($targetUser, [
            'impersonation_token' => $impersonationToken,
            'reason' => $request->reason ?? 'support',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Impersonation started',
            'data' => [
                'impersonation_token' => $impersonationToken,
                'target_user' => $targetUser->only(['id', 'name', 'email', 'role']),
                'warning' => 'You are now acting on behalf of this user. All actions will be logged.',
            ]
        ]);
    }

    /**
     * Stop impersonation and return to original user
     */
    public function stopImpersonation(Request $request)
    {
        $impersonation = session()->get('impersonation');
        
        if (!$impersonation) {
            return response()->json([
                'success' => false,
                'message' => 'No active impersonation session'
            ], 400);
        }

        $targetUser = User::find($impersonation['target_user_id']);
        $originalUser = User::find($impersonation['original_user_id']);
        $startedAt = \Carbon\Carbon::parse($impersonation['started_at']);
        $durationSeconds = now()->diffInSeconds($startedAt);

        // Log impersonation end
        AuditService::logAdminImpersonationEnded($targetUser, $durationSeconds, [
            'actions_taken_summary' => session()->get('impersonation_actions', []),
        ]);

        // Clear impersonation session
        session()->forget('impersonation');
        session()->forget('impersonation_actions');

        return response()->json([
            'success' => true,
            'message' => 'Impersonation ended',
            'data' => [
                'original_user' => $originalUser?->only(['id', 'name', 'email', 'role']),
                'impersonated_user' => $targetUser?->only(['id', 'name', 'email', 'role']),
                'duration_seconds' => $durationSeconds,
            ]
        ]);
    }

    /**
     * Get all users with filtering (Super Admin only)
     */
    public function listUsers(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Activate/Deactivate user account (Super Admin only)
     */
    public function toggleUserStatus(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot deactivate your own account'
            ], 403);
        }

        $user->update(['is_active' => !$user->is_active]);

        $action = $user->is_active ? 'activated' : 'deactivated';
        $severity = $user->is_active ? 'medium' : 'high';

        // Log status change
        AuditService::log([
            'event_type' => 'user_' . $action,
            'event_category' => 'admin',
            'action' => $action,
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User {$action} by super admin: {$user->email}",
            'severity' => $severity,
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$action} successfully",
            'data' => [
                'user_id' => $user->id,
                'is_active' => $user->is_active,
            ]
        ]);
    }
}
