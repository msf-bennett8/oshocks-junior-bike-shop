<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $conversationId,
        public int $messageId,
        public ?int $readByUserId,
        public ?string $readByGuestSessionId,
        public string $readAt,
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'message_id' => $this->messageId,
            'read_by_user_id' => $this->readByUserId,
            'read_by_guest_session_id' => $this->readByGuestSessionId,
            'read_at' => $this->readAt,
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.read';
    }
}
