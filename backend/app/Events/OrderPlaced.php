<?php

namespace App\Events;

use App\Models\Order;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;

class OrderPlaced
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public ?User $user;
    public array $metadata;

    public function __construct(Order $order, ?User $user = null, array $metadata = [])
    {
        $this->order = $order;
        $this->user = $user;
        $this->metadata = $metadata;
    }

    public function broadcastOn(): array
    {
        // For guest orders, broadcast on a public channel or skip
        if (!$this->user) {
            return [
                new Channel('orders.guest'),
            ];
        }
        return [
            new PrivateChannel('orders.' . $this->order->id),
            new PrivateChannel('user.' . $this->user->id),
        ];
    }
}
