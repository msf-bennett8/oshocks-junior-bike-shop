<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Order;
use App\Services\MessageModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    protected MessageModerationService $moderationService;

    public function __construct(MessageModerationService $moderationService)
    {
        $this->moderationService = $moderationService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        $query = Conversation::with(['participants', 'messages' => function ($q) {
                $q->latest()->limit(1);
            }]);

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('participants', function ($pq) use ($user) {
                    $pq->where('user_id', $user->id);
                })->orWhere('user_id', $user->id);
            });
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        } else {
            return response()->json(['data' => []]);
        }

        $conversations = $query->orderBy('last_message_at', 'desc')->get();

        // Add computed fields
        $conversations->transform(function ($conv) use ($user) {
            $conv->unread_count = $user
                ? Message::where('conversation_id', $conv->id)
                    ->whereNull('read_at')
                    ->where('sender_id', '!=', $user->id)
                    ->count()
                : 0;

            $conv->other_participant = $conv->participants
                ->where('user_id', '!=', $user?->id)
                ->first();

            $conv->last_message = $conv->messages->first()?->body;
            $conv->last_message_at = $conv->messages->first()?->created_at;

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

        // For support tickets, find or create with support user
        if (($validated['type'] ?? 'direct') === 'support' || ($validated['type'] ?? 'direct') === 'order_support') {
            $supportUser = User::whereIn('role', ['admin', 'super_admin'])->first();

            if (!$supportUser) {
                return response()->json(['error' => 'No support agent available'], 503);
            }

            // Check for existing open support conversation for this user/order
            $existingQuery = Conversation::where('type', $validated['type'])
                ->where('status', '!=', 'resolved');

            if ($user) {
                $existingQuery->where(function ($q) use ($user) {
                    $q->whereHas('participants', function ($pq) use ($user) {
                        $pq->where('user_id', $user->id);
                    })->orWhere('created_by', $user->id);
                });
            } elseif ($guestSessionId) {
                $existingQuery->where('guest_session_id', $guestSessionId);
            }

            if (!empty($validated['order_id'])) {
                $existingQuery->where('order_id', $validated['order_id']);
            }

            $existing = $existingQuery->first();

            if ($existing) {
                return response()->json([
                    'data' => $existing->load(['participants', 'latestMessage']),
                    'existing' => true,
                ]);
            }

            $validated['title'] = $validated['title'] ?? 'Support Request';
        }

        DB::beginTransaction();

        try {
            $conversation = Conversation::create([
                'created_by' => $user?->id,
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

            // Add support user for support conversations
            if (in_array($validated['type'], ['support', 'order_support'])) {
                $supportUser = User::whereIn('role', ['admin', 'super_admin'])->first();
                if ($supportUser) {
                    $conversation->participants()->attach($supportUser->id, ['joined_at' => now()]);
                }
            }

            // Add requested participant for direct messages
            if (!empty($validated['participant_id']) && $validated['type'] === 'direct') {
                $conversation->participants()->attach($validated['participant_id'], ['joined_at' => now()]);
            }

            // System welcome message for support
            if (in_array($validated['type'], ['support', 'order_support'])) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => null,
                    'body' => 'Thank you for contacting Oshocks Support. An agent will assist you shortly.',
                    'type' => 'system',
                ]);
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
                    $q->with(['sender', 'reactions'])->orderBy('created_at', 'desc')->limit(50);
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
            ->where('user_id', $user->id)
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
            $conversation->participants()->attach($supportUser->id, ['joined_at' => now()]);

            Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => null,
                'body' => "Support request for Order #{$order->order_number}. How can we help?",
                'type' => 'system',
            ]);

            DB::commit();

            return response()->json([
                'data' => $conversation->load('participants'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Link guest conversations to authenticated user
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

        $linkedCount = Conversation::linkGuestSessions($guestSessionId, $user);

        return response()->json([
            'success' => true,
            'linked_count' => $linkedCount,
            'message' => $linkedCount > 0
                ? "Linked {$linkedCount} guest conversation(s) to your account"
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
            ->with('sender')
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
        ]);

        // Update conversation last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Broadcast event (silently fail if Reverb not configured)
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Broadcast failed: ' . $e->getMessage());
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
