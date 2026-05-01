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
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return Conversation::where('id', $conversationId)
        ->whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->exists();
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
