<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\TypingIndicator;
use App\Models\User;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Events\MessageRead;
use App\Events\MessageReaction as MessageReactionEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    /**
     * List conversations for authenticated or guest user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$user && !$guestSessionId) {
            return response()->json(['data' => []]);
        }

        $query = Conversation::query()
            ->with(['latestMessage', 'participants'])
            ->orderByDesc('last_message_at');

        if ($user) {
            // Authenticated user: get their participant conversations + any guest sessions
            $query->where(function ($q) use ($user, $guestSessionId) {
                $q->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
                  ->orWhere('user_id', $user->id);
                
                if ($guestSessionId) {
                    $q->orWhere('guest_session_id', $guestSessionId);
                }
            });
        } else {
            // Guest: only their session conversations
            $query->where('guest_session_id', $guestSessionId);
        }

        $conversations = $query->paginate(20);

        return response()->json([
            'data' => $conversations->map(function ($conv) use ($user, $guestSessionId) {
                $other = $user ? $conv->otherParticipant($user) : null;
                $lastMsg = $conv->latestMessage->first();
                
                // Get conversation settings for this user
                $settings = $conv->settings()
                    ->when($user, fn($q) => $q->where('user_id', $user->id))
                    ->when(!$user && $guestSessionId, fn($q) => $q->where('guest_session_id', $guestSessionId))
                    ->first();

                // Check if anyone is typing
                $isTyping = TypingIndicator::where('conversation_id', $conv->id)
                    ->where('expires_at', '>', now())
                    ->when($user, fn($q) => $q->where('user_id', '!=', $user->id))
                    ->when(!$user && $guestSessionId, fn($q) => $q->where('guest_session_id', '!=', $guestSessionId))
                    ->exists();

                return [
                    'id' => $conv->id,
                    'type' => $conv->type,
                    'title' => $conv->getDisplayTitle($user),
                    'avatar' => $other?->avatar,
                    'last_message' => $lastMsg?->body,
                    'last_message_at' => $conv->last_message_at,
                    'unread_count' => $conv->unreadCountFor($user, $guestSessionId),
                    'other_participant' => $other ? [
                        'id' => $other->id,
                        'name' => $other->name,
                        'role' => $other->role,
                        'avatar' => $other->avatar,
                        'is_online' => $other->last_active_at && $other->last_active_at->diffInMinutes(now()) < 5,
                        'last_seen' => $other->last_active_at,
                    ] : null,
                    'guest_name' => $conv->guest_name,
                    'is_pinned' => $settings?->is_pinned ?? false,
                    'is_archived' => $settings?->is_archived ?? false,
                    'is_muted' => $settings?->isCurrentlyMuted() ?? false,
                    'is_typing' => $isTyping,
                    'typing_users' => $isTyping ? TypingIndicator::where('conversation_id', $conv->id)
                        ->where('expires_at', '>', now())
                        ->with('user')
                        ->get()
                        ->map(fn($t) => [
                            'name' => $t->user?->name ?? 'Guest',
                            'user_id' => $t->user_id,
                            'guest_session_id' => $t->guest_session_id,
                        ]) : [],
                ];
            }),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
            ],
        ]);
    }

    /**
     * Create a new conversation (auth or guest)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        $validated = $request->validate([
            'participant_id' => 'nullable|exists:users,id',
            'type' => 'in:direct,group,support',
            'title' => 'nullable|string|max:255',
            'order_number' => 'nullable|string',
            'guest_name' => 'nullable|string|max:100',
            'guest_email' => 'nullable|email|max:255',
        ]);

        // For non-support chats, require auth
        if (($validated['type'] ?? 'direct') !== 'support' && !$user) {
            return response()->json([
                'error' => 'Authentication required to start a conversation',
                'code' => 'AUTH_REQUIRED'
            ], 401);
        }

        $participantId = $validated['participant_id'] ?? null;

        // For authenticated users: prevent self-conversation
        if ($user && $participantId && $user->id == $participantId) {
            return response()->json(['error' => 'Cannot create conversation with yourself'], 422);
        }

        // Check if direct conversation already exists
        if ($user && ($validated['type'] ?? 'direct') === 'direct' && $participantId) {
            $existing = Conversation::where('type', 'direct')
                ->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
                ->whereHas('participants', fn($q) => $q->where('user_id', $participantId))
                ->first();

            if ($existing) {
                return response()->json(['data' => $existing->load('participants')]);
            }
        }

        $conversation = DB::transaction(function () use ($user, $participantId, $validated, $guestSessionId) {
            $conv = Conversation::create([
                'type' => $validated['type'] ?? 'direct',
                'title' => $validated['title'] ?? null,
                'created_by' => $user?->id,           // NULL for guests — now allowed
                'user_id' => $user?->id,              // NULL for guests
                'order_number' => $validated['order_number'] ?? null,
                'guest_session_id' => $user ? null : $guestSessionId,
                'guest_name' => $validated['guest_name'] ?? null,
                'guest_email' => $validated['guest_email'] ?? null,
            ]);

            // Attach participants for authenticated conversations
            if ($user && $participantId) {
                $conv->participants()->attach([
                    $user->id => ['joined_at' => now(), 'is_admin' => true],
                    $participantId => ['joined_at' => now(), 'is_admin' => false],
                ]);
            } elseif ($user) {
                // Support chat: only add the user, support agent joins later or via broadcast
                $conv->participants()->attach($user->id, [
                    'joined_at' => now(),
                    'is_admin' => false,
                ]);
            }
            // Guest conversations have no participants in pivot table
            // They're linked via guest_session_id

            return $conv;
        });

        return response()->json([
            'data' => $conversation->load(['participants', 'messages']),
        ], 201);
    }

    /**
     * Show a single conversation
     */
    public function show(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        // Authorize access
        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $cursor = $request->query('cursor');
        $perPage = 50;

        // Load messages with pagination, reactions, attachments
        $messagesQuery = Message::where('conversation_id', $conversation->id)
            ->with(['sender', 'reactions.user', 'attachments', 'replyToMessage.sender'])
            ->where(function ($q) {
                $q->whereNull('deleted_at')
                  ->orWhere('deleted_at', '>', now()->subDays(7));
            })
            ->orderBy('created_at', 'desc');

        if ($cursor) {
            $messagesQuery->where('id', '<', $cursor);
        }

        $messages = $messagesQuery->limit($perPage)->get()->reverse()->values();

        // Mark messages as read and broadcast
        if ($user) {
            $unreadMessages = $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->get();

            foreach ($unreadMessages as $msg) {
                $msg->markAsRead();
                
                broadcast(new MessageRead(
                    $conversation->id,
                    $msg->id,
                    $user->id,
                    null,
                    now()->toIso8601String()
                ))->toOthers();
            }

            $conversation->participants()
                ->updateExistingPivot($user->id, ['last_read_at' => now()]);
        }

        // Get pinned messages
        $pinnedMessages = $conversation->pinnedMessages()
            ->with(['message.sender', 'pinner'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'conversation' => $conversation->load('participants'),
                'messages' => $messages,
                'pinned_messages' => $pinnedMessages,
                'next_cursor' => $messages->count() >= $perPage ? $messages->last()->id : null,
            ],
        ]);
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        if ($user) {
            $unreadMessages = $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->get();

            foreach ($unreadMessages as $message) {
                $message->markAsRead();
                
                // Broadcast read receipt
                broadcast(new MessageRead(
                    $conversation->id,
                    $message->id,
                    $user->id,
                    null,
                    now()->toIso8601String()
                ))->toOthers();
            }

            $conversation->participants()
                ->updateExistingPivot($user->id, ['last_read_at' => now()]);
        } elseif ($guestSessionId) {
            // Guest read receipts
            $conversation->messages()
                ->where('guest_session_id', '!=', $guestSessionId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return response()->json(['success' => true, 'read_count' => $unreadMessages->count() ?? 0]);
    }

    /**
     * Get paginated messages for a conversation
     */
    public function messages(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $cursor = $request->query('cursor');
        $perPage = 50;

        $query = Message::where('conversation_id', $conversation->id)
            ->with(['sender', 'reactions.user', 'attachments', 'replyToMessage.sender'])
            ->where(function ($q) {
                $q->whereNull('deleted_at')
                  ->orWhere('deleted_at', '>', now()->subDays(7));
            })
            ->orderBy('created_at', 'desc');

        if ($cursor) {
            $query->where('id', '<', $cursor);
        }

        $messages = $query->limit($perPage)->get()->reverse()->values();

        return response()->json([
            'data' => $messages,
            'next_cursor' => $messages->count() >= $perPage ? $messages->last()->id : null,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'type' => 'in:text,image,file,call_invite,system',
            'metadata' => 'nullable|json',
            'reply_to' => 'nullable|exists:messages,id',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'metadata' => isset($validated['metadata']) ? json_decode($validated['metadata'], true) : null,
            'reply_to' => $validated['reply_to'] ?? null,
            'guest_session_id' => !$user ? $guestSessionId : null,
            'sender_name' => !$user ? $request->input('sender_name', 'Guest') : null,
            'sender_email' => !$user ? $request->input('sender_email') : null,
        ]);

        // Update conversation last message
        $conversation->update(['last_message_at' => now()]);

        // Load relationships for broadcast
        $message->load(['sender', 'reactions', 'attachments']);

        // Broadcast to others
        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['data' => $message]);
    }

    /**
     * Add or remove reaction
     */
    public function react(Request $request, Conversation $conversation, Message $message)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        if ($message->conversation_id !== $conversation->id) {
            abort(404, 'Message not found in this conversation');
        }

        $validated = $request->validate([
            'reaction' => 'required|string|max:10',
        ]);

        $reaction = $validated['reaction'];

        $existing = MessageReaction::where('message_id', $message->id)
            ->when($user, fn($q) => $q->where('user_id', $user->id))
            ->when(!$user && $guestSessionId, fn($q) => $q->where('guest_session_id', $guestSessionId))
            ->where('reaction', $reaction)
            ->first();

        if ($existing) {
            $existing->delete();
            $added = false;
        } else {
            MessageReaction::create([
                'message_id' => $message->id,
                'user_id' => $user?->id,
                'guest_session_id' => !$user ? $guestSessionId : null,
                'reaction' => $reaction,
            ]);
            $added = true;
        }

        broadcast(new MessageReactionEvent(
            $conversation->id,
            $message->id,
            $user?->id,
            $guestSessionId,
            $reaction,
            $added
        ))->toOthers();

        return response()->json(['success' => true, 'added' => $added]);
    }

    /**
     * Typing indicator
     */
    public function typing(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $isTyping = $request->input('is_typing', true);

        broadcast(new UserTyping(
            $conversation->id,
            $user?->id,
            !$user ? $guestSessionId : null,
            $user?->name ?? $request->input('sender_name', 'Guest'),
            $isTyping
        ))->toOthers();

        // Store/update in DB
        if ($isTyping) {
            TypingIndicator::updateOrCreate(
                [
                    'conversation_id' => $conversation->id,
                    'user_id' => $user?->id,
                    'guest_session_id' => !$user ? $guestSessionId : null,
                ],
                [
                    'started_at' => now(),
                    'expires_at' => now()->addSeconds(10),
                ]
            );
        } else {
            TypingIndicator::where('conversation_id', $conversation->id)
                ->when($user, fn($q) => $q->where('user_id', $user->id))
                ->when(!$user && $guestSessionId, fn($q) => $q->where('guest_session_id', $guestSessionId))
                ->delete();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Search messages in user's conversations
     */
    public function search(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $query = $validated['q'];

        // Use full-text search if available, fallback to LIKE
        try {
            $messages = Message::whereRaw('MATCH(body) AGAINST(? IN NATURAL LANGUAGE MODE)', [$query])
                ->whereHas('conversation', function ($q) use ($user) {
                    $q->whereHas('participants', function ($pq) use ($user) {
                        $pq->where('user_id', $user->id);
                    });
                })
                ->with(['conversation', 'sender'])
                ->limit(20)
                ->get();
        } catch (\Exception $e) {
            // Fallback to LIKE if full-text not available
            $messages = Message::where('body', 'LIKE', "%{$query}%")
                ->whereHas('conversation', function ($q) use ($user) {
                    $q->whereHas('participants', function ($pq) use ($user) {
                        $pq->where('user_id', $user->id);
                    });
                })
                ->with(['conversation', 'sender'])
                ->limit(20)
                ->get();
        }

        return response()->json(['data' => $messages]);
    }

    /**
     * Link guest conversations to authenticated user
     */
    public function linkGuestSessions(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$user || !$guestSessionId) {
            return response()->json([
                'error' => 'User must be authenticated and guest session ID required'
            ], 400);
        }

        $linkedCount = Conversation::linkGuestSessions($guestSessionId, $user);

        return response()->json([
            'success' => true,
            'linked_count' => $linkedCount,
            'message' => $linkedCount > 0 
                ? "Linked {$linkedCount} guest conversation(s) to your account" 
                : 'No guest conversations found to link',
        ]);
    }

    /**
     * Check if user/guest can access conversation
     */
    private function canAccess(?User $user, ?string $guestSessionId, Conversation $conversation): bool
    {
        if ($user) {
            // Authenticated: participant or owner
            $isParticipant = $conversation->participants()
                ->where('user_id', $user->id)
                ->exists();
            $isOwner = $conversation->user_id === $user->id;
            return $isParticipant || $isOwner;
        }

        // Guest: must match session ID
        return $conversation->guest_session_id === $guestSessionId;
    }
}
