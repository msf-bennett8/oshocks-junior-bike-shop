<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        $this->authorizeAccess($request->user(), $conversation);

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
        $this->authorizeAccess($request->user(), $conversation);

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'type' => 'in:text,image,file,call_invite',
            'metadata' => 'nullable|array',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
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
