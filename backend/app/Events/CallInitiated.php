<?php

namespace App\Events;

use App\Models\CallSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallInitiated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public CallSession $callSession)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->callSession->callee_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->callSession->session_id,
            'call_type' => $this->callSession->call_type,
            'caller' => [
                'id' => $this->callSession->caller->id,
                'name' => $this->callSession->caller->name,
                'avatar' => $this->callSession->caller->avatar,
            ],
            'conversation_id' => $this->callSession->conversation_id,
            'started_at' => $this->callSession->started_at->toIso8601String(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.initiated';
    }
}
