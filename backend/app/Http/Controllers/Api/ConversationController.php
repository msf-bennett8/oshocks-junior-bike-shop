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
    public function index(Request $request)
    {
        $conversations = $request->user()
            ->conversations()
            ->with(['latestMessage.sender', 'participants' => function ($q) use ($request) {
                $q->where('user_id', '!=', $request->user()->id);
            }])
            ->orderByDesc('last_message_at')
            ->paginate(20);

        return response()->json([
            'data' => $conversations->map(function ($conv) use ($request) {
                $other = $conv->otherParticipant($request->user());
                return [
                    'id' => $conv->id,
                    'type' => $conv->type,
                    'title' => $conv->title ?? $other?->name ?? 'Unknown',
                    'avatar' => $other?->avatar,
                    'last_message' => $conv->latestMessage->first()?->body,
                    'last_message_at' => $conv->last_message_at,
                    'unread_count' => $conv->unreadCountFor($request->user()),
                    'other_participant' => $other ? [
                        'id' => $other->id,
                        'name' => $other->name,
                        'role' => $other->role,
                    ] : null,
                ];
            }),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'participant_id' => 'required|exists:users,id',
            'type' => 'in:direct,group,support',
            'title' => 'nullable|string|max:255',
            'order_number' => 'nullable|string',
        ]);

        $user = $request->user();
        $participantId = $validated['participant_id'];

        // Prevent self-conversation
        if ($user->id == $participantId) {
            return response()->json(['error' => 'Cannot create conversation with yourself'], 422);
        }

        // Check if direct conversation already exists
        if (($validated['type'] ?? 'direct') === 'direct') {
            $existing = Conversation::where('type', 'direct')
                ->whereHas('participants', fn($q) => $q->where('user_id', $user->id))
                ->whereHas('participants', fn($q) => $q->where('user_id', $participantId))
                ->first();

            if ($existing) {
                return response()->json(['data' => $existing->load('participants')]);
            }
        }

        $conversation = DB::transaction(function () use ($user, $participantId, $validated) {
            $conv = Conversation::create([
                'type' => $validated['type'] ?? 'direct',
                'title' => $validated['title'] ?? null,
                'created_by' => $user->id,
                'order_number' => $validated['order_number'] ?? null,
            ]);

            $conv->participants()->attach([
                $user->id => ['joined_at' => now(), 'is_admin' => true],
                $participantId => ['joined_at' => now()],
            ]);

            return $conv;
        });

        return response()->json([
            'data' => $conversation->load(['participants', 'messages']),
        ], 201);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $this->authorizeAccess($request->user(), $conversation);

        $conversation->load(['participants', 'messages.sender']);

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // Update participant last_read
        $conversation->participants()
            ->updateExistingPivot($request->user()->id, ['last_read_at' => now()]);

        return response()->json(['data' => $conversation]);
    }

    public function markAsRead(Request $request, Conversation $conversation)
    {
        $this->authorizeAccess($request->user(), $conversation);

        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->participants()
            ->updateExistingPivot($request->user()->id, ['last_read_at' => now()]);

        return response()->json(['success' => true]);
    }

    private function authorizeAccess($user, Conversation $conversation): void
    {
        $isParticipant = $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            abort(403, 'Not a participant in this conversation');
        }
    }
}
