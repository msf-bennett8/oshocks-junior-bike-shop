<?php

namespace App\Events;

use App\Models\CallSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignal implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public CallSession $callSession,
        public string $signalType,
        public array $payload,
        public int $fromUserId,
    ) {
    }

    public function broadcastOn(): array
    {
        // Send to the conversation channel so both parties receive
        return [
            new Channel('conversation.' . $this->callSession->conversation_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->callSession->session_id,
            'signal_type' => $this->signalType,
            'payload' => $this->payload,
            'from_user_id' => $this->fromUserId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.signal';
    }
}
