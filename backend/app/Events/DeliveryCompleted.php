<?php

namespace App\Events;

use App\Models\Order;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ?User $user;
    public Order $order;

    public function __construct(?User $user, Order $order)
    {
        $this->user = $user;
        $this->order = $order;
    }

    public function broadcastOn(): array
    {
        if (!$this->user) {
            return [new Channel('orders.guest')];
        }
        return [new PrivateChannel('user.' . $this->user->id)];
    }
}
