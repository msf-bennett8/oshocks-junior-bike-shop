<?php

namespace App\Events;

use App\Models\Order;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderShipped
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ?User $user;
    public Order $order;
    public ?string $trackingNumber;
    public string $carrier;

    public function __construct(?User $user, Order $order, ?string $trackingNumber, string $carrier)
    {
        $this->user = $user;
        $this->order = $order;
        $this->trackingNumber = $trackingNumber;
        $this->carrier = $carrier;
    }

    public function broadcastOn(): array
    {
        if (!$this->user) {
            return [new Channel('orders.guest')];
        }
        return [new PrivateChannel('user.' . $this->user->id)];
    }
}
