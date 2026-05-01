<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(50);

        return response()->json([
            'data' => $messages->items(),
            'next_cursor' => $messages->nextCursor()?->encode(),
        ]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'type' => 'in:text,image,file,call_invite',
            'metadata' => 'nullable|array',
            'sender_name' => 'nullable|string|max:100',
            'sender_email' => 'nullable|email|max:255',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'guest_session_id' => $user ? null : $guestSessionId,
            'sender_name' => $validated['sender_name'] ?? ($user ? null : 'Guest'),
            'sender_email' => $validated['sender_email'] ?? null,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'metadata' => $validated['metadata'] ?? null,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Broadcast to all participants
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'data' => $message->load('sender'),
        ], 201);
    }

    private function canAccess(?User $user, ?string $guestSessionId, Conversation $conversation): bool
    {
        if ($user) {
            $isParticipant = $conversation->participants()
                ->where('user_id', $user->id)
                ->exists();
            $isOwner = $conversation->user_id === $user->id;
            return $isParticipant || $isOwner;
        }

        return $conversation->guest_session_id === $guestSessionId;
    }
}
