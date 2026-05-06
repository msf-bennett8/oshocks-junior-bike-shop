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
            'type' => 'in:text,image,file,call_invite,system',
            'metadata' => 'nullable|array',
            'sender_name' => 'nullable|string|max:100',
            'sender_email' => 'nullable|email|max:255',
        ]);

        // Run moderation check
        $moderationService = app(MessageModerationService::class);
        $moderationResult = $moderationService->analyze($validated['body']);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'guest_session_id' => $user ? null : $guestSessionId,
            'sender_name' => $validated['sender_name'] ?? ($user ? null : 'Guest'),
            'sender_email' => $validated['sender_email'] ?? null,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'metadata' => array_merge(
                $validated['metadata'] ?? [],
                ['moderation' => $moderationResult]
            ),
        ]);

        // Flag conversation if violations detected
        if ($moderationResult['requires_review']) {
            $conversation->update([
                'flagged_for_review' => true,
                'detected_keywords' => $moderationResult['detected_keywords'],
                'moderation_notes' => 'Auto-flagged: ' . implode(', ', $moderationResult['violations']),
            ]);
        }

        $conversation->update(['last_message_at' => now()]);

        // Broadcast to all participants
        broadcast(new MessageSent($message))->toOthers();

        $response = [
            'data' => $message->load('sender'),
        ];

        // Include warning if violations found
        if ($moderationResult['has_violations']) {
            $response['warning'] = $moderationService->getWarningMessage($moderationResult['violations']);
            $response['moderation'] = $moderationResult;
        }

        return response()->json($response, 201);
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
