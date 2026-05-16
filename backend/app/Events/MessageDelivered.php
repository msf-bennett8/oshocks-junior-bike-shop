<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDelivered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userId;

    public function __construct(Message $message, int|string $userId)
    {
        $this->message = $message;
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastAs()
    {
        return 'message.delivered';
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->message->id,
            'user_id' => $this->userId,
            'delivered_at' => now()->toIso8601String(),
            'status' => 'delivered',
        ];
    }
}
