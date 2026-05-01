<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
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
                    ] : null,
                    'guest_name' => $conv->guest_name,
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

        $conversation->load(['participants', 'messages.sender']);

        // Mark messages as read
        if ($user) {
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return response()->json(['data' => $conversation]);
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
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $conversation->participants()
                ->updateExistingPivot($user->id, ['last_read_at' => now()]);
        }

        return response()->json(['success' => true]);
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
