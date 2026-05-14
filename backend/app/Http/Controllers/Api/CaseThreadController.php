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
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

            \Log::info('Creating case in conversation', [
                'conversation_id' => $conversation->id,
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'request_data' => $request->all(),
            ]);

            $validated = $request->validate([
                'case_type' => ['required', 'in:order_issue,account_login,report_problem,shipment_delivery,services_booking,general_inquiry,payment_billing,product_info,returns_refund,technical_support,other'],
                'subject' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:5000'],
                'priority' => ['nullable', 'in:low,medium,high,urgent'],
                'order_number' => ['nullable', 'string', 'max:50'],
                'purchase_id' => ['nullable', 'string', 'max:50'],
                'guest_name' => ['nullable', 'string', 'max:255'],
                'guest_email' => ['nullable', 'email', 'max:255'],
                'guest_phone' => ['nullable', 'string', 'max:20'],
                'attachment' => ['nullable', 'array'],
                'attachment.name' => ['nullable', 'string', 'max:255'],
                'attachment.type' => ['nullable', 'string', 'max:100'],
                'attachment.size' => ['nullable', 'integer'],
                'attachment_file' => ['nullable', 'file', 'max:10240'], // Actual file upload
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
            // Resolve order if order_number provided (searches order_display, purchase_id, order_number, order_code)
            $orderId = null;
            $orderLookup = $validated['order_number'] ?? $validated['purchase_id'] ?? null;
            if (!empty($orderLookup)) {
                $order = \App\Models\Order::where('order_display', $orderLookup)
                    ->orWhere('purchase_id', $orderLookup)
                    ->orWhere('order_number', $orderLookup)
                    ->orWhere('order_code', $orderLookup)
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
                'guest_name' => !$user ? ($validated['guest_name'] ?? null) : null,
                'guest_email' => !$user ? ($validated['guest_email'] ?? null) : null,
                'guest_phone' => !$user ? ($validated['guest_phone'] ?? null) : null,
                'case_type' => $validated['case_type'],
                'status' => 'new',
                'priority' => $validated['priority'] ?? 'medium',
                'order_id' => $orderId,
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'source' => $user ? 'web' : 'chat',
                'metadata' => array_merge([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'created_in_thread' => true,
                ], !empty($validated['attachment']) ? ['attachment' => $validated['attachment']] : []),
            ]);

            // ─── DEFER ATTACHMENT UPLOAD ───
            // Upload to Cloudinary now, but create DB record AFTER message exists
            $attachmentUploadResult = null;
            if (!empty($validated['attachment'])) {
                try {
                    $uploadService = app(\App\Services\AttachmentUploadService::class);
                    $attachmentUploadResult = $uploadService->uploadCaseAttachment(
                        $request->file('attachment_file'),
                        $supportCase->case_id
                    );
                } catch (\Exception $e) {
                    \Log::warning('Attachment upload failed during case creation', [
                        'case_id' => $supportCase->case_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Build system message with order info if applicable
            $orderDisplay = $order?->order_display ?? $order?->order_number ?? null;
            $systemMessageBody = $orderDisplay
                ? "📋 New Case Created: {$validated['subject']} ({$supportCase->case_id}) for order {$orderDisplay}"
                : "📋 New Case Created: {$validated['subject']} ({$supportCase->case_id})";

            // Create a system message announcing the new case
            $systemMessage = Message::create([
                'conversation_id' => $conversation->id,
                'case_id' => $supportCase->case_id,
                'sender_id' => null,
                'body' => $systemMessageBody,
                'type' => 'system',
                'metadata' => $orderDisplay ? ['order_display' => $orderDisplay, 'event_type' => 'created'] : ['event_type' => 'created'],
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
                'guest_name' => $supportCase->guest_name,
                'guest_email' => $supportCase->guest_email,
                'guest_phone' => $supportCase->guest_phone,
            ]);

            // Broadcast
            broadcast(new \App\Events\SupportCaseUpdated($supportCase, 'created_in_thread', $user?->id));

            // Create attachment record NOW that we have a valid message_id
            if ($attachmentUploadResult && $attachmentUploadResult['success'] && $userMessage) {
                $attachmentRecord = \App\Models\MessageAttachment::create([
                    'message_id' => $userMessage->id,
                    'file_name' => $attachmentUploadResult['original_name'],
                    'file_path' => $attachmentUploadResult['secure_url'],
                    'file_type' => $attachmentUploadResult['resource_type'] === 'image' ? 'image' : 'document',
                    'mime_type' => $attachmentUploadResult['mime_type'],
                    'file_size' => $attachmentUploadResult['file_size'],
                    'cloudinary_public_id' => $attachmentUploadResult['public_id'],
                    'cloudinary_secure_url' => $attachmentUploadResult['secure_url'],
                    'cloudinary_resource_type' => $attachmentUploadResult['resource_type'],
                    'original_name' => $attachmentUploadResult['original_name'],
                    'width' => $attachmentUploadResult['width'],
                    'height' => $attachmentUploadResult['height'],
                    'folder_path' => $attachmentUploadResult['folder_path'],
                ]);
                $userMessage->load('attachments');
            }

            return response()->json([
                'success' => true,
                'message' => 'Case created in conversation.',
                'data' => [
                    'support_case' => $supportCase->fresh(['user', 'order']),
                    'system_message' => $systemMessage,
                    'user_message' => $userMessage,
                    'attachment' => $attachmentRecord ?? null,
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
            ->with(['assignedAgent', 'resolvedBy', 'escalatedBy', 'history.changedBy', 'order'])
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

        $includeFull = $request->boolean('include_full_conversation', false);

        $query = $conversation->messages()
            ->with(['sender', 'attachments'])
            ->orderBy('created_at', 'asc');

        if (!$includeFull) {
            // Default: only case messages + system messages
            $query->where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhereIn('type', ['system', 'case_created', 'case_resolved', 'case_closed', 'case_escalated']);
            });
        }

        $messages = $query->get()->map(function ($msg) use ($caseId) {
            $msg->is_case_message = $msg->case_id === $caseId;
            return $msg;
        });

        return response()->json([
            'success' => true,
            'data' => $messages,
            'meta' => [
                'case_id' => $caseId,
                'include_full_conversation' => $includeFull,
                'case_message_count' => $messages->where('is_case_message', true)->count(),
                'total_message_count' => $messages->count(),
            ],
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
