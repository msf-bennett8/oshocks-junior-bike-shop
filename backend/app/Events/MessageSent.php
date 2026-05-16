<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $eventType; // sent | delivered | read | typing | reaction

    public function __construct(Message $message, string $eventType = 'sent')
    {
        $this->message = $message;
        $this->eventType = $eventType;
    }

    /**
     * The name of the queue on which to place the broadcasting job.
     */
    public function broadcastQueue(): string
    {
        return 'default';
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

    public function broadcastAs()
    {
        return 'message.' . $this->eventType;
    }

    public function broadcastWith(): array
    {
        $sender = $this->message->sender;

        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $this->message->sender_name,
            'guest_session_id' => $this->message->guest_session_id,
            'body' => $this->message->body,
            'type' => $this->message->type,
            'status' => $this->message->status,
            'metadata' => $this->message->metadata,
            'reply_to' => $this->message->reply_to,
            'case_id' => $this->message->case_id,
            'created_at' => $this->message->created_at->toIso8601String(),
            'event_type' => $this->eventType,
            'sender' => $sender ? [
                'id' => $sender->id,
                'name' => $sender->name,
                'avatar' => $sender->avatar,
            ] : null,
        ];
    }
}
