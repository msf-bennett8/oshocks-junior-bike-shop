<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupportCaseRequest;
use App\Http\Requests\UpdateSupportCaseRequest;
use App\Http\Requests\EscalateSupportCaseRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Models\SupportCase;
use App\Models\SupportCaseNote;
use App\Models\User;
use App\Services\SupportCaseIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SupportCaseController extends Controller
{
    protected SupportCaseIdService $idService;

    public function __construct(SupportCaseIdService $idService)
    {
        $this->idService = $idService;
    }

    /**
     * List support cases for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = SupportCase::with(['assignedAgent', 'order', 'conversation']);

        // If user can handle support cases, show all active cases
        if ($user->canHandleSupportCases()) {
            $query->when($request->status, fn($q, $status) => $q->where('status', $status))
                  ->when($request->case_type, fn($q, $type) => $q->where('case_type', $type))
                  ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority));
        } else {
            // Regular users only see their own cases
            $query->where('user_id', $user->id);
        }

        $cases = $query->orderBy('created_at', 'desc')
                       ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Show a single support case
     */
    public function show(string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::with([
            'user', 'assignedAgent', 'order', 'conversation.messages',
            'notes.agent', 'history.changedBy', 'tags', 'escalatedBy', 'resolvedBy', 'closedBy'
        ])->findOrFail($caseId);

        // Authorization check
        if (!$this->canViewCase($user, $case)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this case.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $case,
        ]);
    }

    /**
     * Create a new support case (with conversation)
     */
    public function store(StoreSupportCaseRequest $request): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

        return DB::transaction(function () use ($request, $user, $guestSessionId) {
            // Validate order if provided
            $orderId = null;
            if ($request->order_number) {
                $order = Order::where('order_number', $request->order_number)
                              ->orWhere('order_code', $request->order_number)
                              ->first();
                if (!$order) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Order not found.',
                    ], 422);
                }
                $orderId = $order->id;
            }

            // Create conversation first
            $conversation = Conversation::create([
                'type' => $orderId ? 'order_support' : 'support',
                'title' => $request->subject,
                'created_by' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'guest_name' => $guestSessionId ? 'Guest User' : null,
                'order_id' => $orderId,
                'status' => 'active',
                'priority' => $request->priority ?? 'medium',
            ]);

            // Add user as participant if authenticated
            if ($user) {
                $conversation->participants()->attach($user->id, [
                    'joined_at' => now(),
                    'is_admin' => false,
                ]);
            }

            // Create initial message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user?->id,
                'body' => $request->description ?? 'Support case created: ' . $request->subject,
                'type' => 'text',
                'guest_session_id' => $guestSessionId,
                'sender_name' => $user?->name ?? 'Guest',
            ]);

            // Create support case (observer will generate case_id)
            $supportCase = SupportCase::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'case_type' => $request->case_type,
                'status' => 'new',
                'priority' => $request->priority ?? 'medium',
                'order_id' => $orderId,
                'subject' => $request->subject,
                'description' => $request->description,
                'source' => $user ? 'web' : 'chat',
                'metadata' => array_merge($request->metadata ?? [], [
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'initial_message_id' => $message->id,
                ]),
            ]);

            // Link conversation to case
            $conversation->update(['support_case_id' => $supportCase->case_id]);

            // Add system participant (admin bot) for routing
            $this->addSystemParticipant($conversation);

            return response()->json([
                'success' => true,
                'message' => 'Support case created successfully.',
                'data' => [
                    'conversation' => $conversation->fresh(['participants', 'messages']),
                    'support_case' => $supportCase->fresh(['tags']),
                ],
                'case_id' => $supportCase->case_id,
            ], 201);
        });
    }

    /**
     * Update support case
     */
    public function update(UpdateSupportCaseRequest $request, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$this->canManageCase($user, $case)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this case.',
            ], 403);
        }

        $case->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Case updated successfully.',
            'data' => $case->fresh(['assignedAgent', 'order']),
        ]);
    }

    /**
     * Escalate a support case
     */
    public function escalate(EscalateSupportCaseRequest $request, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$case->canBeEscalated()) {
            return response()->json([
                'success' => false,
                'message' => 'This case cannot be escalated.',
            ], 422);
        }

        $case->update([
            'status' => 'escalated',
            'escalated_at' => now(),
            'escalated_by' => $user->id,
            'escalation_reason' => $request->reason,
        ]);

        // Notify super admins
        $this->notifyEscalation($case);

        return response()->json([
            'success' => true,
            'message' => 'Case escalated to super admin review.',
            'data' => $case->fresh(['escalatedBy']),
        ]);
    }

    /**
     * Rate satisfaction after resolution
     */
    public function rateSatisfaction(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if ($case->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($case->status !== 'resolved') {
            return response()->json([
                'success' => false,
                'message' => 'Can only rate resolved cases.',
            ], 422);
        }

        $case->update([
            'satisfaction_rating' => $request->rating,
            'satisfaction_comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you for your feedback.',
        ]);
    }

    /**
     * Validate order number
     */
    public function validateOrder(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string', 'max:50'],
        ]);

        $order = Order::where('order_number', $request->order_number)
                      ->orWhere('order_code', $request->order_number)
                      ->orWhere('order_display', $request->order_number)
                      ->with(['user', 'orderItems.product'])
                      ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $user = Auth::user();
        // Check if user owns this order (unless admin)
        if ($user && !$user->hasAdminAccess() && $order->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'This order does not belong to you.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'order_display' => $order->order_display,
                'status' => $order->status,
                'total' => $order->total,
                'created_at' => $order->created_at,
                'items_count' => $order->orderItems->count(),
            ],
        ]);
    }

    /**
     * Add internal note to case
     */
    public function addNote(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'is_private' => ['boolean'],
            'message_id' => ['nullable', 'exists:messages,id'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$user->canHandleSupportCases()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $note = SupportCaseNote::create([
            'case_id' => $caseId,
            'agent_id' => $user->id,
            'content' => $request->content,
            'is_private' => $request->is_private ?? true,
            'message_id' => $request->message_id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $note->load('agent'),
        ], 201);
    }

    /**
     * Get case history/audit trail
     */
    public function getHistory(string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        if (!$this->canViewCase($user, $case)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $history = $case->history()
                        ->with(['changedBy', 'fromAssignedTo', 'toAssignedTo'])
                        ->orderBy('created_at', 'desc')
                        ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    // Helper methods
    protected function canViewCase(?User $user, SupportCase $case): bool
    {
        if (!$user) return false;
        if ($user->canHandleSupportCases()) return true;
        return $case->user_id === $user->id;
    }

    protected function canManageCase(User $user, SupportCase $case): bool
    {
        if ($user->hasSuperAdminAccess()) return true;
        if ($user->hasAdminAccess() && in_array($case->status, ['new', 'open', 'in_progress'])) return true;
        return $case->isAssignedTo($user);
    }

    protected function addSystemParticipant(Conversation $conversation): void
    {
        // Find any admin to add as system participant for routing
        $systemUser = User::whereIn('role', ['admin', 'super_admin'])->first();
        if ($systemUser) {
            $conversation->participants()->attach($systemUser->id, [
                'joined_at' => now(),
                'is_admin' => true,
            ]);
        }
    }

    protected function notifyEscalation(SupportCase $case): void
    {
        // Broadcast to super admin channel
        try {
            // This will be implemented in Phase 9 with WebSocket events
            Log::info('Case escalated', ['case_id' => $case->case_id, 'reason' => $case->escalation_reason]);
        } catch (\Exception $e) {
            Log::error('Failed to notify escalation', ['error' => $e->getMessage()]);
        }
    }
}
