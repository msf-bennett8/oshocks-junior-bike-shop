<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private messaging channel: user.{id} — for direct notifications/calls to a user
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private conversation channel: conversation.{conversationId} — for group chat
// Supports BOTH authenticated users (via $user) and guests (via request header)
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Authenticated user check
    if ($user) {
        return Conversation::where('id', $conversationId)
            ->whereHas('participants', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->exists();
    }

    // Guest check: verify guest_session_id from request header matches conversation
    $guestSessionId = request()->header('X-Guest-Session-ID');
    if ($guestSessionId) {
        return Conversation::where('id', $conversationId)
            ->where(function ($q) use ($guestSessionId) {
                $q->where('guest_session_id', $guestSessionId)
                  ->orWhereHas('participants', function ($pq) use ($guestSessionId) {
                      $pq->where('guest_session_id', $guestSessionId);
                  });
            })
            ->exists();
    }

    return false;
});

// Presence channel for online status: presence.users
Broadcast::channel('presence.users', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar,
        'role' => $user->role,
    ];
});
