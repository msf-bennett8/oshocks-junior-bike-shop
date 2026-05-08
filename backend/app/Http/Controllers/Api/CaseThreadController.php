<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\SupportCase;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CaseThreadController extends Controller
{
    /**
     * Create a new case within an existing conversation (threaded ticketing)
     */
    public function createCaseInConversation(Request $request, Conversation $conversation): JsonResponse
    {
        try {
            $user = Auth::user();
            $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

            \Log::info('Creating case in conversation', [
                'conversation_id' => $conversation->id,
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'request_data' => $request->all(),
            ]);

            $validated = $request->validate([
                'case_type' => ['required', 'in:order_issue,account_help,report_problem,delivery_question'],
                'subject' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:5000'],
                'priority' => ['nullable', 'in:low,medium,high,urgent'],
                'order_number' => ['nullable', 'string', 'max:50'],
            ]);

            // Authorization
            if (!$this->canAccessConversation($user, $guestSessionId, $conversation)) {
                \Log::warning('Unauthorized case creation attempt', [
                    'conversation_id' => $conversation->id,
                    'user_id' => $user?->id,
                    'guest_session_id' => $guestSessionId,
                ]);
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }

            // Only support conversations can have threaded cases
            if (!$conversation->isSupportCase()) {
                \Log::warning('Non-support conversation case creation rejected', [
                    'conversation_id' => $conversation->id,
                    'conversation_type' => $conversation->type,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Only support conversations can have cases.',
                ], 422);
            }

            return DB::transaction(function () use ($request, $user, $guestSessionId, $conversation, $validated) {
            // Resolve order if order_number provided
            $orderId = null;
            if (!empty($validated['order_number'])) {
                $order = \App\Models\Order::where('order_number', $validated['order_number'])
                    ->orWhere('order_code', $validated['order_number'])
                    ->first();
                if ($order) {
                    $orderId = $order->id;
                }
            }

            // Create the case
            $supportCase = SupportCase::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'case_type' => $validated['case_type'],
                'status' => 'new',
                'priority' => $validated['priority'] ?? 'medium',
                'order_id' => $orderId,
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'source' => $user ? 'web' : 'chat',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'created_in_thread' => true,
                ],
            ]);

            // Create a system message announcing the new case
            $systemMessage = Message::create([
                'conversation_id' => $conversation->id,
                'case_id' => $supportCase->case_id,
                'sender_id' => null,
                'body' => "📋 New Case Created: {$validated['subject']} ({$supportCase->case_id})",
                'type' => 'system',
            ]);

            // Create the user's actual message with subject and description
            $userMessageBody = !empty($validated['description'])
                ? "**Subject:** {$validated['subject']}\n\n**Description:**\n{$validated['description']}"
                : "**Subject:** {$validated['subject']}";

            $userMessage = Message::create([
                'conversation_id' => $conversation->id,
                'case_id' => $supportCase->case_id,
                'sender_id' => $user?->id,
                'body' => $userMessageBody,
                'type' => 'text',
                'guest_session_id' => $guestSessionId,
                'sender_name' => $user?->name ?? 'Guest',
            ]);

            \Log::info('Case created successfully in thread', [
                'case_id' => $supportCase->case_id,
                'conversation_id' => $conversation->id,
            ]);

            // Broadcast
            broadcast(new \App\Events\SupportCaseUpdated($supportCase, 'created_in_thread', $user?->id));

            return response()->json([
                'success' => true,
                'message' => 'Case created in conversation.',
                'data' => [
                    'support_case' => $supportCase->fresh(['user', 'order']),
                    'system_message' => $systemMessage,
                    'user_message' => $userMessage,
                ],
                'case_id' => $supportCase->case_id,
            ], 201);
        });
        } catch (\Exception $e) {
            \Log::error('Failed to create case in conversation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'conversation_id' => $conversation->id,
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create case: ' . $e->getMessage(),
                'debug' => [
                    'error_class' => get_class($e),
                    'error_message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ],
            ], 500);
        }
    }

    /**
     * Get all cases in a conversation with their messages
     */
    public function getConversationCases(Request $request, Conversation $conversation): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

        if (!$this->canAccessConversation($user, $guestSessionId, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $cases = $conversation->supportCases()
            ->with(['assignedAgent', 'resolvedBy', 'escalatedBy', 'history.changedBy'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Get messages for a specific case within a conversation
     */
    public function getCaseMessages(Request $request, Conversation $conversation, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;
        $case = SupportCase::findOrFail($caseId);

        if (!$this->canAccessConversation($user, $guestSessionId, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        // Verify case belongs to conversation
        if ($case->conversation_id !== $conversation->id) {
            return response()->json(['success' => false, 'message' => 'Case does not belong to this conversation.'], 403);
        }

        $messages = $conversation->messages()
            ->where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhereNull('case_id'); // Include general messages too
            })
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->cursorPaginate(50);

        return response()->json([
            'success' => true,
            'data' => $messages->items(),
            'next_cursor' => $messages->nextCursor()?->encode(),
            'case' => $case,
        ]);
    }

    /**
     * Send a message associated with a specific case
     */
    public function sendCaseMessage(Request $request, Conversation $conversation, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'type' => ['in:text,image,file,system'],
        ]);
        $case = SupportCase::findOrFail($caseId);

        if (!$this->canAccessConversation($user, $guestSessionId, $conversation)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if ($case->conversation_id !== $conversation->id) {
            return response()->json(['success' => false, 'message' => 'Case mismatch.'], 403);
        }

        // Don't allow messages on closed/resolved cases unless reopening
        if (in_array($case->status, ['resolved', 'closed']) && !$user?->canHandleSupportCases()) {
            return response()->json([
                'success' => false,
                'message' => 'This case is closed. Create a new case or ask an agent to reopen.',
            ], 422);
        }

        // Resolve guest name for display from request headers (sent by frontend)
        $guestName = null;
        if (!$user && $guestSessionId) {
            $guestName = $request->header('X-Guest-Name')
                ?? $request->input('sender_name')
                ?? 'Guest';
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'case_id' => $caseId,
            'sender_id' => $user?->id,
            'guest_session_id' => $guestSessionId,
            'sender_name' => $user ? null : $guestName,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Auto-track first response
        if (!$case->first_response_at && $user?->canHandleSupportCases() && $case->user_id !== $user->id) {
            $case->update(['first_response_at' => now()]);
        }

        // Broadcast
        try {
            broadcast(new \App\Events\MessageSent($message))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'data' => $message->load('sender'),
        ], 201);
    }

    /**
     * Get full case history for a user (all cases ever created)
     */
    public function getUserCaseHistory(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Authentication required.'], 401);
        }

        $cases = SupportCase::withTrashed()
            ->with(['resolvedBy', 'assignedAgent', 'escalatedBy', 'closedBy', 'history.changedBy', 'conversation'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Soft delete a case (only if new and unclaimed)
     */
    public function destroy(Request $request, string $caseId): JsonResponse
    {
        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        // Authorization: user who created it, or admin
        if ($case->user_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        if (!$case->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only unclaimed new cases can be deleted. Resolved/assigned cases cannot be deleted.',
            ], 422);
        }

        $case->delete(); // Soft delete

        return response()->json([
            'success' => true,
            'message' => 'Case deleted.',
        ]);
    }

    /**
     * Restore a soft-deleted case
     */
    public function restore(Request $request, string $caseId): JsonResponse
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

    private function canAccessConversation(?User $user, ?string $guestSessionId, Conversation $conversation): bool
    {
        // Admin/superadmin can access ALL conversations
        if ($user && in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return true;
        }

        // Authenticated user access
        if ($user) {
            $isParticipant = $conversation->participants()->where('user_id', $user->id)->exists();
            $isCreator = $conversation->created_by === $user->id;
            return $isParticipant || $isCreator;
        }

        // Guest access via session ID
        if ($guestSessionId) {
            return $conversation->guest_session_id === $guestSessionId;
        }

        return false;
    }
}
