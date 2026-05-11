<?php

namespace App\Events;

use App\Models\SupportCase;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportCaseUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public SupportCase $supportCase;
    public string $action;
    public ?int $actorId;
    public array $metadata;

    // Booking event types
    public const ACTION_BOOKING_CREATED = 'booking_created';
    public const ACTION_BOOKING_CONFIRMED = 'booking_confirmed';
    public const ACTION_BOOKING_RESCHEDULED = 'booking_rescheduled';
    public const ACTION_BOOKING_COMPLETED = 'booking_completed';
    public const ACTION_BOOKING_CANCELLED = 'booking_cancelled';
    public const ACTION_INQUIRY_CREATED = 'inquiry_created';

    public function __construct(SupportCase $supportCase, string $action, ?int $actorId = null, array $metadata = [])
    {
        $this->supportCase = $supportCase;
        $this->action = $action;
        $this->actorId = $actorId;
        $this->metadata = $metadata;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('support-case.' . $this->supportCase->case_id),
            new Channel('support-queue'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'support-case.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'case_id' => $this->supportCase->case_id,
            'action' => $this->action,
            'status' => $this->supportCase->status,
            'assigned_to' => $this->supportCase->assigned_to,
            'actor_id' => $this->actorId,
            'timestamp' => now()->toIso8601String(),
            'metadata' => $this->metadata,
        ];
    }
}
