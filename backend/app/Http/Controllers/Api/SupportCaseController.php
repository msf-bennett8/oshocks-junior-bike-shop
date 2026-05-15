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
        $query = SupportCase::with(['user', 'assignedAgent', 'order', 'conversation']);

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

        // Normalize empty order stubs in paginated collection
        $cases->getCollection()->transform(function ($case) {
            $caseArray = $case->toArray();
            // Check for meaningful order data (id OR order_display OR order_number)
            $hasOrder = !empty($caseArray['order']['id'] ?? null)
                     || !empty($caseArray['order']['order_display'] ?? null)
                     || !empty($caseArray['order']['order_number'] ?? null);
            if (!$hasOrder) {
                $caseArray['order'] = null;
            }
            return $caseArray;
        });

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
            'user', 'assignedAgent', 'order',
            'conversation.messages' => function ($q) {
                $q->with(['sender', 'attachments'])->orderBy('created_at', 'desc')->limit(50);
            },
            'notes.agent', 'history.changedBy', 'tags', 'escalatedBy', 'resolvedBy', 'closedBy'
        ])->findOrFail($caseId);

        // Authorization check
        if (!$this->canViewCase($user, $case)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view this case.',
            ], 403);
        }

        $response = $case->toArray();

        // Filter notes based on visibility
        $isStaff = $user->canHandleSupportCases();
        $isOwner = $case->user_id === $user->id;
        if (isset($response['notes']) && is_array($response['notes'])) {
            $response['notes'] = array_values(array_filter($response['notes'], function ($note) use ($isStaff, $isOwner, $user) {
                $visibility = $note['visibility'] ?? ($note['is_private'] ? 'private' : 'public');

                // Public notes: everyone sees
                if ($visibility === 'public') return true;

                // Note creator always sees their own notes
                if ($note['agent_id'] === $user->id) return true;

                // Staff-public: only staff sees
                if ($visibility === 'staff_public') return $isStaff;

                // Private: only staff sees (staff private notes)
                if ($visibility === 'private') return $isStaff;

                return false;
            }));
        }

        // Normalize empty order stubs to null for clean frontend handling
        $hasOrder = !empty($response['order']['id'] ?? null)
                 || !empty($response['order']['order_display'] ?? null)
                 || !empty($response['order']['order_number'] ?? null);
        if (!$hasOrder) {
            $response['order'] = null;
        }

        return response()->json([
            'success' => true,
            'data' => $response,
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
            // Validate order if provided (order_display preferred, fallback to purchase_id/order_code/order_number)
            $orderId = null;
            $orderLookup = $request->purchase_id ?? $request->order_number ?? $request->order_display;
            if ($orderLookup) {
                $order = Order::where('order_display', $orderLookup)
                              ->orWhere('purchase_id', $orderLookup)
                              ->orWhere('order_number', $orderLookup)
                              ->orWhere('order_code', $orderLookup)
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
            // For guests, use a system support user as created_by to satisfy FK constraint
            $createdBy = $user?->id;
            if (!$createdBy && $guestSessionId) {
                // Find first admin/super_admin to act as conversation owner
                $systemUser = \App\Models\User::whereIn('role', ['admin', 'super_admin'])->first();
                $createdBy = $systemUser?->id;
            }

            // Determine conversation title based on case type
            $conversationTitle = match($request->case_type) {
                'services_booking' => "Service: {$request->subject}",
                'order_issue', 'returns_refund', 'shipment_delivery', 'payment_billing' => "Order: {$request->subject}",
                default => "Case: {$request->subject}",
            };

            $conversation = Conversation::create([
                'type' => $orderId ? 'order_support' : 'support',
                'title' => $conversationTitle,
                'created_by' => $createdBy,
                'guest_session_id' => $guestSessionId,
                'guest_name' => $request->guest_name ?? 'Guest User',
                'order_id' => $orderId,
                'status' => 'active',
                'priority' => $request->priority ?? 'medium',
                'last_message_at' => now(), // Ensure it appears in chat list immediately
            ]);

            // Add user as participant if authenticated
            if ($user) {
                $conversation->participants()->attach($user->id, [
                    'joined_at' => now(),
                    'is_admin' => false,
                ]);
            }

            // Create support case FIRST (observer will generate case_id)
            $supportCase = SupportCase::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'guest_name' => !$user ? $request->guest_name : null,
                'guest_email' => !$user ? $request->guest_email : null,
                'guest_phone' => !$user ? $request->guest_phone : null,
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
            ], $request->has('attachment') ? ['attachment' => $request->attachment] : []),
            ]);

            // ─── HANDLE ATTACHMENT UPLOAD (deferred — will create after message exists) ───
            $attachmentUploadResult = null;
            if ($request->hasFile('attachment_file')) {
                try {
                    $uploadService = app(\App\Services\AttachmentUploadService::class);
                    $attachmentUploadResult = $uploadService->uploadCaseAttachment(
                        $request->file('attachment_file'),
                        $supportCase->case_id
                    );
                } catch (\Exception $e) {
                    \Log::warning('Attachment upload failed during support case creation', [
                        'case_id' => $supportCase->case_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // ─── Create clean system message (single line, no description) ───
            $systemBody = "New Case Created " .
                "Type: " . str_replace('_', ' ', $supportCase->case_type) . " " .
                "Subject: {$supportCase->subject} " .
                "Priority: " . ucfirst($supportCase->priority) . " " .
                "Status: New " .
                "Our team will review and respond shortly.";

            $systemMsg = Message::create([
                'conversation_id' => $conversation->id,
                'case_id' => $supportCase->case_id,
                'sender_id' => null,
                'body' => $systemBody,
                'type' => 'system',
                'metadata' => [
                    'event_type' => 'case_created',
                    'case_id' => $supportCase->case_id,
                    'case_type' => $supportCase->case_type,
                ],
            ]);

            // ─── Create user message with description (if provided) ───
            $initialMessage = null;
            if ($request->description) {
                $messageBody = "Subject: {$request->subject}\n" .
                    "Date: " . now()->format('F j, Y') . "\n" .
                    "Description:\n{$request->description}";

                $initialMessage = Message::create([
                    'conversation_id' => $conversation->id,
                    'case_id' => $supportCase->case_id,
                    'sender_id' => $user?->id,
                    'body' => $messageBody,
                    'type' => 'text',
                    'guest_session_id' => $guestSessionId,
                    'sender_name' => $user?->name ?? 'Guest',
                ]);

                // Link initial message ID back to case metadata
                $supportCase->update([
                    'metadata' => array_merge($supportCase->metadata ?? [], [
                        'initial_message_id' => $initialMessage->id,
                    ]),
                ]);

                // Create attachment record NOW that we have a valid message_id
                if ($attachmentUploadResult && $attachmentUploadResult['success']) {
                    $attachmentRecord = \App\Models\MessageAttachment::create([
                        'message_id' => $initialMessage->id,
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
                    $initialMessage->load('attachments');
                }
            }

            // Update conversation last_message_at so it appears in chat list
            $conversation->update(['last_message_at' => ($initialMessage?->created_at ?? $systemMsg->created_at) ?? now()]);

            // Link conversation to case
            $conversation->update(['support_case_id' => $supportCase->case_id]);

            // Broadcast case creation event with order info
            $orderDisplay = $order?->order_display ?? $order?->order_number ?? null;
            broadcast(new \App\Events\SupportCaseUpdated($supportCase, 'created', $user?->id, [
                'order_display' => $orderDisplay,
            ]));

            // Add system participant (admin bot) for routing
            $this->addSystemParticipant($conversation);

            return response()->json([
                'success' => true,
                'message' => 'Support case created successfully.',
                'data' => [
                    'conversation' => $conversation->fresh(['participants', 'messages.sender', 'messages.attachments', 'messages.supportCase']),
                    'support_case' => $supportCase->fresh(['tags', 'caseMessages']),
                    'initial_message' => $initialMessage?->load('attachments'),
                    'attachment' => $attachmentRecord ?? null,
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

        // Broadcast escalation event
        broadcast(new \App\Events\SupportCaseUpdated($case, 'escalated', $user->id, ['reason' => $request->reason]));

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
            'purchase_id' => ['required', 'string', 'max:50'],
        ]);

        $order = Order::where('order_display', $request->purchase_id)
                      ->orWhere('purchase_id', $request->purchase_id)
                      ->orWhere('order_number', $request->purchase_id)
                      ->orWhere('order_code', $request->purchase_id)
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
                'purchase_id' => $order->purchase_id,
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
     * Add note to case — available to all authenticated users
     * Staff: public (user+staff), staff_public (staff only), private (only me)
     * Users: public (staff sees), private (only user)
     */
    public function addNote(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'visibility' => ['nullable', 'string', 'in:public,staff_public,private'],
            'is_private' => ['boolean'], // Legacy support
            'message_id' => ['nullable', 'exists:messages,id'],
        ]);

        $user = Auth::user();
        $case = SupportCase::findOrFail($caseId);

        // Authorization: case owner OR staff can add notes
        $isStaff = $user->canHandleSupportCases();
        $isOwner = $case->user_id === $user->id;

        if (!$isStaff && !$isOwner) {
            return response()->json(['success' => false, 'message' => 'Unauthorized to add notes to this case.'], 403);
        }

        // Determine visibility
        $visibility = $request->visibility;

        if (!$visibility) {
            // Legacy fallback: is_private boolean
            $isPrivate = $isStaff ? ($request->is_private ?? true) : false;
            $visibility = $isPrivate ? 'private' : 'public';
        }

        // Users cannot create staff_public notes
        if (!$isStaff && $visibility === 'staff_public') {
            $visibility = 'public';
        }

        // Users' private notes are truly private (only them)
        // Staff private notes are only them
        // Staff staff_public notes are visible to all staff
        // Public notes are visible to everyone

        $note = SupportCaseNote::create([
            'case_id' => $case->case_id,
            'agent_id' => $user->id,
            'content' => $request->content,
            'is_private' => in_array($visibility, ['private', 'staff_public']),
            'visibility' => $visibility,
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

    /**
     * Get current authenticated user's support cases
     */
    public function myCases(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = SupportCase::with(['user', 'assignedAgent', 'order', 'conversation'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('case_type')) {
            $query->where('case_type', $request->case_type);
        }

        $cases = $query->paginate($request->per_page ?? 20);

        // Normalize empty order stubs
        $cases->getCollection()->transform(function ($case) {
            $caseArray = $case->toArray();
            $hasOrder = !empty($caseArray['order']['id'] ?? null)
                     || !empty($caseArray['order']['order_display'] ?? null)
                     || !empty($caseArray['order']['order_number'] ?? null);
            if (!$hasOrder) {
                $caseArray['order'] = null;
            }
            return $caseArray;
        });

        return response()->json([
            'success' => true,
            'data' => $cases,
        ]);
    }

    /**
     * Get stats for current user's cases
     */
    public function myCaseStats(Request $request): JsonResponse
    {
        $user = Auth::user();

        $stats = [
            'total' => SupportCase::where('user_id', $user->id)->count(),
            'new' => SupportCase::where('user_id', $user->id)->where('status', 'new')->count(),
            'open' => SupportCase::where('user_id', $user->id)->where('status', 'open')->count(),
            'in_progress' => SupportCase::where('user_id', $user->id)->where('status', 'in_progress')->count(),
            'pending_user' => SupportCase::where('user_id', $user->id)->where('status', 'pending_user')->count(),
            'resolved' => SupportCase::where('user_id', $user->id)->where('status', 'resolved')->count(),
            'closed' => SupportCase::where('user_id', $user->id)->where('status', 'closed')->count(),
            'escalated' => SupportCase::where('user_id', $user->id)->where('status', 'escalated')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

        /**
     * Get messages for a case — case-only or full conversation context
     */
    public function getCaseMessages(Request $request, string $conversationId, ?string $caseId = null): JsonResponse
    {
        $user = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);

        // Authorization
        if (!$user->canHandleSupportCases()) {
            // Regular user can only access their own conversations
            $isParticipant = $conversation->participants()->where('user_id', $user->id)->exists()
                || $conversation->created_by === $user->id;
            if (!$isParticipant) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        }

        $includeFull = $request->boolean('include_full_conversation', false);

        $query = $conversation->messages()
            ->with(['sender', 'attachments', 'reactions', 'replyToMessage'])
            ->orderBy('created_at', 'asc');

        if (!$includeFull && $caseId) {
            // Default: only messages for this specific case + general system messages
            $query->where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere(function ($q2) {
                      $q2->whereNull('case_id')
                         ->whereIn('type', ['system', 'case_created', 'case_resolved', 'case_closed']);
                  });
            });
        }

        // If full conversation requested, we return ALL messages but mark which belong to the case
        $messages = $query->get();

        // Add metadata for frontend to distinguish case vs general messages
        $messages = $messages->map(function ($msg) use ($caseId) {
            $msg->is_case_message = $msg->case_id === $caseId;
            $msg->case_id_value = $msg->case_id;
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

}
