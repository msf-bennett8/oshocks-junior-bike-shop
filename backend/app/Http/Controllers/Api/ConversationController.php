<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Order;
use App\Models\SupportCase;
use App\Services\MessageModerationService;
use App\Services\SupportCaseIdService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    protected MessageModerationService $moderationService;
    protected SupportCaseIdService $caseIdService;

    public function __construct(MessageModerationService $moderationService, SupportCaseIdService $caseIdService)
    {
        $this->moderationService = $moderationService;
        $this->caseIdService = $caseIdService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $userId = $user?->id ?? $guestSessionId;

        $query = Conversation::with([
            'participants',
            'lastMessage',
            'lastMessage.sender',
            'supportCase.order',
            'order',
        ])->withCount(['messages as unread_count' => function ($q) use ($userId) {
            $q->whereNull('read_at')->where('sender_id', '!=', $userId);
        }]);

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('participants', function ($pq) use ($user) {
                    $pq->where('user_id', $user->id);
                })->orWhere('created_by', $user->id);
            });
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        } else {
            return response()->json(['data' => []]);
        }

        $conversations = $query->orderBy('last_message_at', 'desc')->get();

        // Add computed fields
        $conversations->transform(function ($conv) use ($user) {
            // Include guest_name in response for guest conversations
            $conv->guest_name = $conv->guest_name ?? null;
            // unread_count now comes from withCount() eager load — no N+1 query
            $conv->unread_count = $conv->unread_count ?? 0;

            $conv->other_participant = $conv->participants
                ->where('id', '!=', $user?->id)
                ->first();

            // ─── LAST SENDER INFO (for support chat headers) ───
            $lastMsg = $conv->lastMessage;
            $conv->last_sender = null;
            if ($lastMsg && $lastMsg->sender_id) {
                $conv->last_sender = [
                    'id' => $lastMsg->sender_id,
                    'name' => $lastMsg->sender?->name ?? $lastMsg->sender_name ?? 'Guest',
                    'avatar' => $lastMsg->sender?->avatar ?? null,
                    'email' => $lastMsg->sender?->email ?? null,
                    'phone' => $lastMsg->sender?->phone ?? null,
                    'role' => $lastMsg->sender?->role ?? null,
                    'is_guest' => false,
                ];
            } elseif ($lastMsg && $lastMsg->guest_session_id) {
                $conv->last_sender = [
                    'id' => null,
                    'name' => $lastMsg->sender_name ?? 'Guest',
                    'avatar' => null,
                    'email' => null,
                    'phone' => null,
                    'role' => null,
                    'is_guest' => true,
                ];
            }

            // ─── ASSIGNED AGENT INFO (for user view of support chats) ───
            $conv->assigned_agent = null;
            if ($conv->support_case?->assigned_to) {
                $agent = $conv->support_case->assignedAgent;
                if ($agent) {
                    $conv->assigned_agent = [
                        'id' => $agent->id,
                        'name' => $agent->name,
                        'avatar' => $agent->avatar,
                        'email' => $agent->email,
                        'phone' => $agent->phone,
                        'role' => $agent->role,
                    ];
                }
            }

            $lastMessageBody = $conv->lastMessage?->body;
            $conv->last_message = is_string($lastMessageBody) ? $lastMessageBody : null;
            $conv->last_message_at = $conv->lastMessage?->created_at ?? $conv->last_message_at ?? $conv->updated_at;
            // Load support case with order relationship
            $supportCase = $conv->supportCase;
            if ($supportCase) {
                $supportCase->load('order');
                // Normalize empty order stubs
                if (empty($supportCase->order?->id) && empty($supportCase->order?->order_display) && empty($supportCase->order?->order_number)) {
                    $supportCase->setRelation('order', null);
                }
            }
            $conv->support_case = $supportCase;
            // Also include direct conversation order for order_support chats
            $conv->order = $conv->order;

            return $conv;
        });

        return response()->json([
            'data' => $conversations,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        $validated = $request->validate([
            'participant_id' => 'nullable|exists:users,id',
            'type' => 'in:direct,support,order_support,seller_inquiry',
            'title' => 'nullable|string|max:255',
            'order_id' => 'nullable|exists:orders,id',
            'guest_name' => 'nullable|string|max:100',
            'guest_email' => 'nullable|email|max:255',
        ]);

        // ─── DUPLICATE PREVENTION: Check for existing direct conversation ───
        if (($validated['type'] ?? 'direct') === 'direct' && !empty($validated['participant_id'])) {
            $existingQuery = Conversation::where('type', 'direct')
                ->whereHas('participants', function ($q) use ($user, $validated) {
                    $q->where('user_id', $user ? $user->id : $validated['participant_id']);
                })
                ->whereHas('participants', function ($q) use ($validated) {
                    $q->where('user_id', $validated['participant_id']);
                });

            // Only 2 participants = direct 1-on-1
            $existing = $existingQuery->get()->filter(function ($conv) {
                return $conv->participants()->count() === 2;
            })->first();

            if ($existing) {
                return response()->json([
                    'data' => $existing->load(['participants', 'messages' => function ($q) {
                        $q->latest()->limit(1);
                    }]),
                    'existing' => true,
                ]);
            }
        }

        // For support tickets, use persistent conversation (hybrid conversational ticketing)
        if (($validated['type'] ?? 'direct') === 'support' || ($validated['type'] ?? 'direct') === 'order_support') {
            $orderId = $validated['order_id'] ?? null;

            // Use getOrCreateSupportConversation for persistent thread
            $conversation = Conversation::getOrCreateSupportConversation($user, $guestSessionId, $orderId);

            // Check if we should create a new case in this conversation
            $hasActiveCase = $conversation->activeSupportCases()->exists();

            return response()->json([
                'data' => $conversation->load(['participants', 'latestMessage', 'activeSupportCases']),
                'existing' => true,
                'has_active_case' => $hasActiveCase,
                'conversation_id' => $conversation->id,
            ]);
        }

        // For non-support conversations, create normally
        DB::beginTransaction();

        try {
            // For guests, find a system admin to satisfy FK constraint on created_by
            $createdBy = $user?->id;
            if (!$createdBy && $guestSessionId) {
                $systemUser = User::whereIn('role', ['admin', 'super_admin'])->first();
                $createdBy = $systemUser?->id;
            }

            $conversation = Conversation::create([
                'created_by' => $createdBy,
                'guest_session_id' => $user ? null : $guestSessionId,
                'type' => $validated['type'] ?? 'direct',
                'title' => $validated['title'] ?? null,
                'order_id' => $validated['order_id'] ?? null,
                'status' => 'open',
                'priority' => 'medium',
            ]);

            // Add participants
            if ($user) {
                $conversation->participants()->attach($user->id, ['joined_at' => now()]);
            }

            // Add requested participant for direct messages
            if (!empty($validated['participant_id']) && $validated['type'] === 'direct') {
                $conversation->participants()->attach($validated['participant_id'], ['joined_at' => now()]);
            }

            DB::commit();

            return response()->json([
                'data' => $conversation->load('participants'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        return response()->json([
            'data' => $conversation->load([
                'participants',
                'messages' => function ($q) {
                    $q->with(['sender', 'reactions', 'attachments'])->orderBy('created_at', 'desc')->limit(50);
                }
            ]),
        ]);
    }

    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        Message::where('conversation_id', $conversation->id)
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id)
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Search users for starting a conversation
     */
    public function searchUsers(Request $request)
    {
        $user = $request->user();
        $query = $request->get('q');

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%");
            })
            ->where('id', '!=', $user->id)
            ->select('id', 'name', 'email', 'avatar', 'role')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $users,
        ]);
    }

    /**
     * Get or create order support conversation
     */
    public function getOrderSupport(Request $request, Order $order)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Verify user owns this order
        if ($order->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin'])) {
            abort(403, 'Not your order');
        }

        // Find existing
        $existing = Conversation::where('order_id', $order->id)
            ->where('type', 'order_support')
            ->where('created_by', $user->id)
            ->where('status', '!=', 'resolved')
            ->first();

        if ($existing) {
            return response()->json([
                'data' => $existing->load('participants'),
                'existing' => true,
            ]);
        }

        // Create new
        $supportUser = User::whereIn('role', ['admin', 'super_admin'])->first();

        if (!$supportUser) {
            return response()->json(['error' => 'No support agent available'], 503);
        }

        DB::beginTransaction();

        try {
            $conversation = Conversation::create([
                'created_by' => $user->id,
                'type' => 'order_support',
                'title' => "Order Support: {$order->order_number}",
                'order_id' => $order->id,
                'status' => 'open',
                'priority' => 'medium',
            ]);

            $conversation->participants()->attach($user->id, ['joined_at' => now()]);
            if ($supportUser->id !== $user->id) {
                $conversation->participants()->attach($supportUser->id, ['joined_at' => now()]);
            }

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => null,
                'body' => "Support request for Order #{$order->order_number}. How can we help?",
                'type' => 'system',
            ]);

            // Create support case for order support
            $supportCase = SupportCase::create([
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'case_type' => 'order_issue',
                'status' => 'new',
                'priority' => 'medium',
                'order_id' => $order->id,
                'subject' => "Order Issue: {$order->order_number}",
                'description' => "Support case created from order page for Order #{$order->order_number}",
                'source' => 'web',
                'metadata' => [
                    'order_number' => $order->order_number,
                    'order_total' => $order->total,
                    'ip' => $request->ip(),
                ],
            ]);

            // Link the existing system message to the case
            $conversation->messages()
                ->whereNull('case_id')
                ->where('type', 'system')
                ->update(['case_id' => $supportCase->case_id]);

            $conversation->update(['support_case_id' => $supportCase->case_id]);

            DB::commit();

            return response()->json([
                'data' => $conversation->load('participants'),
                'support_case' => $supportCase->fresh(),
                'case_id' => $supportCase->case_id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Link guest conversations, bookings, and inquiries to authenticated user
     */
    public function linkGuestSessions(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if (!$guestSessionId) {
            return response()->json([
                'success' => true,
                'linked_count' => 0,
                'message' => 'No guest session found',
            ]);
        }

        // Link conversations
        $linkedCount = Conversation::linkGuestSessions($guestSessionId, $user);

        // Also merge service bookings and inquiries via GuestMergeService
        try {
            $mergeService = app(\App\Services\GuestMergeService::class);
            $mergeStats = $mergeService->merge($guestSessionId, $user->id);
            $linkedCount += $mergeStats['service_bookings'] ?? 0;
            $linkedCount += $mergeStats['support_cases'] ?? 0;
            $linkedCount += $mergeStats['conversations'] ?? 0;
            $linkedCount += $mergeStats['messages'] ?? 0;
        } catch (\Exception $e) {
            \Log::warning('Guest merge service failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'linked_count' => $linkedCount,
            'message' => $linkedCount > 0
                ? "Linked {$linkedCount} guest item(s) to your account"
                : 'No guest conversations found to link',
        ]);
    }

    public function pin(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $participant = $conversation->participants()
            ->where('user_id', $user?->id)
            ->first();

        if ($participant) {
            $isPinned = $participant->pivot->is_pinned ?? false;
            $conversation->participants()->updateExistingPivot($user->id, [
                'is_pinned' => !$isPinned,
            ]);
        } else {
            // For guest sessions or simple toggle, use conversation-level flag
            $conversation->update(['is_pinned' => !$conversation->is_pinned]);
        }

        return response()->json([
            'success' => true,
            'is_pinned' => !$conversation->is_pinned,
        ]);
    }

    public function archive(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $conversation->update(['is_archived' => !$conversation->is_archived]);

        return response()->json([
            'success' => true,
            'is_archived' => $conversation->is_archived,
        ]);
    }

    public function destroy(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        // Only allow deletion by creator, admin, or super_admin
        $isCreator = $user && $conversation->created_by === $user->id;
        $isAdmin = $user && in_array($user->role, ['admin', 'super_admin']);

        if (!$isCreator && !$isAdmin) {
            abort(403, 'Only the conversation creator or an admin can delete this conversation');
        }

        DB::beginTransaction();

        try {
            // Delete related records in order (respecting foreign keys)
            // 1. Delete message reactions
            \App\Models\MessageReaction::whereIn('message_id', $conversation->messages()->pluck('id'))->delete();

            // 2. Delete message attachments
            \App\Models\MessageAttachment::whereIn('message_id', $conversation->messages()->pluck('id'))->delete();

            // 3. Delete pinned messages
            $conversation->pinnedMessages()->delete();

            // 4. Delete conversation settings
            $conversation->settings()->delete();

            // 5. Delete call sessions
            $conversation->callSessions()->delete();

            // 6. Delete messages
            $conversation->messages()->delete();

            // 7. Detach participants
            $conversation->participants()->detach();

            // 8. Delete the conversation itself
            $conversation->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Conversation permanently deleted',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to delete conversation: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete conversation',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $perPage = $request->get('per_page', 50);
        $messages = $conversation->messages()
            ->with(['sender', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'type' => 'in:text,image,file,system',
            'attachment_url' => 'nullable|url|max:2048',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'guest_session_id' => $user ? null : $guestSessionId,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'attachment_url' => $validated['attachment_url'] ?? null,
            'status' => 'sent',
        ]);

        // Update conversation last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Broadcast event with controlled payload (silently fail if Reverb not configured)
        try {
            broadcast(new MessageSent($message, 'sent'))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        // Auto-mark as delivered for other participants currently online
        try {
            $otherParticipants = $conversation->participants()
                ->where('user_id', '!=', $user?->id)
                ->pluck('user_id')
                ->filter();

            foreach ($otherParticipants as $participantId) {
                broadcast(new \App\Events\MessageDelivered($message, $participantId))->toOthers();
            }
        } catch (\Exception $e) {
            \Log::warning('Delivery broadcast failed: ' . $e->getMessage());
        }

        return response()->json([
            'data' => $message->load('sender'),
        ], 201);
    }

    public function typing(Request $request, Conversation $conversation)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if (!$this->canAccess($user, null, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        try {
            broadcast(new \App\Events\UserTyping($conversation->id, $user->id, $user->name))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Typing broadcast failed: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    public function react(Request $request, Conversation $conversation, Message $message)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        if ($message->conversation_id !== $conversation->id) {
            abort(403, 'Message does not belong to this conversation');
        }

        $validated = $request->validate([
            'reaction' => 'required|string|max:50',
        ]);

        $messageReaction = \App\Models\MessageReaction::updateOrCreate(
            [
                'message_id' => $message->id,
                'user_id' => $user->id,
            ],
            [
                'reaction' => $validated['reaction'],
            ]
        );

        try {
            broadcast(new \App\Events\MessageReaction($message, $user, $validated['reaction']))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Reaction broadcast failed: ' . $e->getMessage());
        }

        return response()->json([
            'data' => $messageReaction,
        ]);
    }

    /**
     * Mark a specific message as delivered
     */
    public function markMessageDelivered(Request $request, Message $message)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $userId = $user?->id ?? $guestSessionId;

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$this->canAccess($user, $guestSessionId, $message->conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        // Update message status if not already delivered
        if (!$message->delivered_at) {
            $message->update([
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);
        }

        // Create or update delivery status record
        \App\Models\MessageDeliveryStatus::updateOrCreate(
            ['message_id' => $message->id, 'user_id' => $userId],
            ['status' => 'delivered', 'delivered_at' => now()]
        );

        // Broadcast delivery status to sender
        try {
            broadcast(new \App\Events\MessageDelivered($message, $userId))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Delivery broadcast failed: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark a specific message as read
     */
    public function markMessageRead(Request $request, Message $message)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $userId = $user?->id ?? $guestSessionId;

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$this->canAccess($user, $guestSessionId, $message->conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        // Prevent sender from marking their own message as read
        if ($message->sender_id == $userId || $message->guest_session_id === $guestSessionId) {
            return response()->json(['error' => 'Cannot mark own message as read'], 400);
        }

        // Update message read status
        if (!$message->read_at) {
            $message->update([
                'status' => 'read',
                'read_at' => now(),
            ]);
        }

        // Create read receipt
        \App\Models\MessageReadReceipt::firstOrCreate(
            ['message_id' => $message->id, 'user_id' => $userId],
            ['read_at' => now()]
        );

        // Update delivery status
        \App\Models\MessageDeliveryStatus::updateOrCreate(
            ['message_id' => $message->id, 'user_id' => $userId],
            ['status' => 'read', 'read_at' => now()]
        );

        // Broadcast read receipt to sender
        try {
            broadcast(new \App\Events\MessageRead($message, $userId))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Read broadcast failed: ' . $e->getMessage());
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark multiple messages as read (batch)
     */
    public function markMultipleRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $userId = $user?->id ?? $guestSessionId;

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $messageIds = $request->input('message_ids', []);

        if (empty($messageIds)) {
            return response()->json(['error' => 'No message IDs provided'], 400);
        }

        $messages = Message::whereIn('id', $messageIds)
            ->where('conversation_id', $conversation->id)
            ->where(function ($q) use ($userId, $guestSessionId) {
                $q->where('sender_id', '!=', $userId)
                  ->orWhereNull('sender_id');
            })
            ->whereNull('read_at')
            ->get();

        $now = now();
        $updated = 0;

        foreach ($messages as $message) {
            $message->update([
                'status' => 'read',
                'read_at' => $now,
            ]);

            \App\Models\MessageReadReceipt::firstOrCreate(
                ['message_id' => $message->id, 'user_id' => $userId],
                ['read_at' => $now]
            );

            try {
                broadcast(new \App\Events\MessageRead($message, $userId))->toOthers();
            } catch (\Exception $e) {
                \Log::warning('Read broadcast failed: ' . $e->getMessage());
            }
            $updated++;
        }

        return response()->json([
            'success' => true,
            'updated_count' => $updated,
        ]);
    }

    private function canAccess(?User $user, ?string $guestSessionId, Conversation $conversation): bool
    {
        // Admin/superadmin can access ALL conversations for monitoring
        if ($user && in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        if ($user) {
            $isParticipant = $conversation->participants()
                ->where('user_id', $user->id)
                ->exists();
            // Standardize: use created_by (not user_id) for ownership check
            $isOwner = $conversation->created_by === $user->id;
            return $isParticipant || $isOwner;
        }

        return $conversation->guest_session_id === $guestSessionId;
    }
}
