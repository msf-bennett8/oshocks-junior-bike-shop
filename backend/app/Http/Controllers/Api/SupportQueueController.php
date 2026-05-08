<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClaimSupportCaseRequest;
use App\Models\SupportCase;
use App\Models\SupportCaseNote;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SupportQueueController extends Controller
{
    /**
     * List unclaimed/queue cases (admin/agent view)
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $query = SupportCase::with(['user', 'order'])
                            ->whereIn('status', ['new', 'open', 'in_progress', 'pending_user', 'escalated']);

        // Filter by case type queue
        if ($request->queue) {
            $query->where('case_type', $request->queue);
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter unclaimed only
        if ($request->unclaimed) {
            $query->whereNull('assigned_to')->where('status', 'new');
        }

        // Filter my cases
        if ($request->mine) {
            $query->where('assigned_to', $user->id);
        }

        $cases = $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
                       ->orderBy('created_at', 'asc')
                       ->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Get cases assigned to current agent
     */
    public function myCases(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $cases = SupportCase::with(['user', 'order', 'conversation'])
                            ->where('assigned_to', $user->id)
                            ->whereNotIn('status', ['resolved', 'closed'])
                            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
                            ->orderBy('created_at', 'asc')
                            ->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Get queue statistics
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $stats = [
            'total_unclaimed' => SupportCase::unclaimed()->count(),
            'total_active' => SupportCase::active()->count(),
            'total_escalated' => SupportCase::where('status', 'escalated')->count(),
            'my_open' => SupportCase::where('assigned_to', $user->id)
                                    ->whereNotIn('status', ['resolved', 'closed'])
                                    ->count(),
            'by_type' => [
                'order_issue' => SupportCase::byType('order_issue')->active()->count(),
                'account_help' => SupportCase::byType('account_help')->active()->count(),
                'report_problem' => SupportCase::byType('report_problem')->active()->count(),
                'delivery_question' => SupportCase::byType('delivery_question')->active()->count(),
            ],
            'by_priority' => [
                'urgent' => SupportCase::where('priority', 'urgent')->active()->count(),
                'high' => SupportCase::where('priority', 'high')->active()->count(),
                'medium' => SupportCase::where('priority', 'medium')->active()->count(),
                'low' => SupportCase::where('priority', 'low')->active()->count(),
            ],
            'sla_breached' => SupportCase::overdue()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Claim a case from the queue
     */
    public function claim(string $caseId, ClaimSupportCaseRequest $request): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$case->canBeClaimedBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'This case cannot be claimed.',
            ], 422);
        }

        $case->update([
            'assigned_to' => $request->agent_id ?? $user->id,
            'status' => 'open',
        ]);

        // Broadcast claim event
        broadcast(new \App\Events\SupportCaseUpdated($case, 'claimed', $user->id));

        return response()->json([
            'success' => true,
            'message' => 'Case claimed successfully.',
            'data' => $case->fresh(['assignedAgent', 'user']),
        ]);
    }

    /**
     * Assign case to specific agent (admin only)
     */
    public function assign(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'exists:users,id'],
        ]);

        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $case = SupportCase::findOrFail($caseId);
        $agent = User::findOrFail($request->agent_id);

        if (!$agent->canHandleSupportCases()) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user cannot handle support cases.',
            ], 422);
        }

        $case->update([
            'assigned_to' => $agent->id,
            'status' => $case->status === 'new' ? 'open' : $case->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Case assigned to {$agent->name}.",
            'data' => $case->fresh(['assignedAgent']),
        ]);
    }

    /**
     * Transfer case to another agent
     */
    public function transfer(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'agent_id' => ['required', 'exists:users,id'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        // Role conflict resolution: escalated cases can only be resolved by super_admin or the escalated handler
        if ($case->status === 'escalated') {
            if (!$user->hasSuperAdminAccess() && !$case->isAssignedTo($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Escalated cases can only be resolved by super admin or the assigned escalated handler.',
                ], 403);
            }
        } elseif (!$user->hasAdminAccess() && !$case->isAssignedTo($user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $newAgent = User::findOrFail($request->agent_id);
        if (!$newAgent->canHandleSupportCases()) {
            return response()->json([
                'success' => false,
                'message' => 'Selected user cannot handle support cases.',
            ], 422);
        }

        $case->update([
            'assigned_to' => $newAgent->id,
        ]);

        // Add transfer note
        SupportCaseNote::create([
            'case_id' => $caseId,
            'agent_id' => $user->id,
            'content' => "Transferred to {$newAgent->name}. Reason: {$request->reason}",
            'is_private' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Case transferred to {$newAgent->name}.",
            'data' => $case->fresh(['assignedAgent']),
        ]);
    }

    /**
     * Mark case as resolved
     */
    public function resolve(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'resolution_notes' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$case->canBeResolved()) {
            return response()->json([
                'success' => false,
                'message' => 'This case cannot be resolved.',
            ], 422);
        }

        if (!$user->hasAdminAccess() && !$case->isAssignedTo($user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $case->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $user->id,
            'resolution_notes' => $request->resolution_notes,
        ]);

        // Broadcast resolve event
        broadcast(new \App\Events\SupportCaseUpdated($case, 'resolved', $user->id));

        return response()->json([
            'success' => true,
            'message' => 'Case marked as resolved.',
            'data' => $case->fresh(),
        ]);
    }

    /**
     * Close a resolved case
     */
    public function close(Request $request, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$case->canBeClosed()) {
            return response()->json([
                'success' => false,
                'message' => 'Only resolved or pending cases can be closed.',
            ], 422);
        }

        // User can close their own resolved case, admin can close any
        if ($case->user_id !== $user->id && !$user->hasAdminAccess() && !$case->isAssignedTo($user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $case->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closed_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Case closed.',
            'data' => $case->fresh(),
        ]);
    }

    /**
     * Reopen a closed/resolved case
     */
    public function reopen(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!in_array($case->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only resolved or closed cases can be reopened.',
            ], 422);
        }

        // Only user who created it or admin can reopen
        if ($case->user_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $case->update([
            'status' => 'open',
            'resolved_at' => null,
            'resolved_by' => null,
            'closed_at' => null,
            'closed_by' => null,
        ]);

        // Add reopen note
        SupportCaseNote::create([
            'case_id' => $caseId,
            'agent_id' => $user->canHandleSupportCases() ? $user->id : null,
            'content' => "Case reopened. Reason: {$request->reason}",
            'is_private' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Case reopened.',
            'data' => $case->fresh(),
        ]);
    }

    /**
     * Get escalated cases (super admin view)
     */
    public function escalatedCases(): JsonResponse
    {
        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $cases = SupportCase::with(['user', 'assignedAgent', 'escalatedBy'])
                            ->where('status', 'escalated')
                            ->orderBy('escalated_at', 'asc')
                            ->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Handle escalated case (super admin)
     */
    public function handleEscalation(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'action' => ['required', 'in:assign_self,assign_agent,resolve,close'],
            'agent_id' => ['required_if:action,assign_agent', 'exists:users,id'],
            'resolution_notes' => ['required_if:action,resolve', 'string'],
        ]);

        $user = Auth::user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $case = SupportCase::findOrFail($caseId);

        return DB::transaction(function () use ($request, $user, $case) {
            match ($request->action) {
                'assign_self' => $case->update([
                    'assigned_to' => $user->id,
                    'status' => 'in_progress',
                ]),
                'assign_agent' => $case->update([
                    'assigned_to' => $request->agent_id,
                    'status' => 'open',
                ]),
                'resolve' => $case->update([
                    'status' => 'resolved',
                    'resolved_at' => now(),
                    'resolved_by' => $user->id,
                    'resolution_notes' => $request->resolution_notes,
                ]),
                'close' => $case->update([
                    'status' => 'closed',
                    'closed_at' => now(),
                    'closed_by' => $user->id,
                ]),
            };

            return response()->json([
                'success' => true,
                'message' => 'Escalation handled successfully.',
                'data' => $case->fresh(),
            ]);
        });
    }

    /**
     * Get available agents who can claim cases
     */
    public function availableAgents(): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $agents = User::whereIn('role', ['admin', 'super_admin', 'support_agent'])
                      ->orWhereJsonContains('additional_roles', 'support_agent')
                      ->select(['id', 'name', 'email', 'role'])
                      ->get()
                      ->map(fn($agent) => [
                          'id' => $agent->id,
                          'name' => $agent->name,
                          'email' => $agent->email,
                          'role' => $agent->role,
                          'current_case_load' => SupportCase::where('assigned_to', $agent->id)
                                                            ->whereNotIn('status', ['resolved', 'closed'])
                                                            ->count(),
                      ]);

        return response()->json([
            'success' => true,
            'data' => $agents,
        ]);
    }

    /**
     * Get internal notes for a case
     */
    public function getNotes(string $caseId): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $notes = SupportCaseNote::with('agent')
                                  ->where('case_id', $caseId)
                                  ->where(function ($q) use ($user) {
                                      // Show private notes only to handlers, public to all
                                      if ($user->canHandleSupportCases()) {
                                          $q->where('is_private', true)
                                            ->orWhere('is_private', false);
                                      } else {
                                          $q->where('is_private', false);
                                      }
                                  })
                                  ->orderBy('created_at', 'desc')
                                  ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Soft delete a case (admin or case creator only)
     */
    public function destroy(string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if ($case->user_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if (!$case->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only unclaimed new cases can be deleted.',
            ], 422);
        }

        $case->delete();

        return response()->json([
            'success' => true,
            'message' => 'Case deleted.',
        ]);
    }

    /**
     * Restore a soft-deleted case (admin only)
     */
    public function restore(string $caseId): JsonResponse
    {
        $user = Auth::user();

        if (!$user->hasAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Admin access required.'], 403);
        }

        $case = SupportCase::withTrashed()->findOrFail($caseId);

        if (!$case->trashed()) {
            return response()->json(['success' => false, 'message' => 'Case is not deleted.'], 422);
        }

        $case->restore();

        return response()->json([
            'success' => true,
            'message' => 'Case restored.',
            'data' => $case->fresh(),
        ]);
    }

    /**
     * Get full history of all cases for current user
     */
    public function getMyFullHistory(Request $request): JsonResponse
    {
        $user = Auth::user();

        $cases = SupportCase::withTrashed()
            ->with(['resolvedBy', 'assignedAgent', 'escalatedBy', 'closedBy', 'history.changedBy', 'conversation'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('assigned_to', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Get resolved/closed case history (admin/agent view)
     */
    public function getHistory(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $query = SupportCase::with(['user', 'assignedAgent', 'resolvedBy', 'closedBy', 'order'])
            ->history();

        // Filter by case type (accepts 'queue' from frontend or 'case_type')
        $caseType = $request->queue ?? $request->case_type;
        if ($caseType) {
            $query->byType($caseType);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('case_id', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $cases = $query->orderBy('resolved_at', 'desc')
                       ->orderBy('closed_at', 'desc')
                       ->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }
}
