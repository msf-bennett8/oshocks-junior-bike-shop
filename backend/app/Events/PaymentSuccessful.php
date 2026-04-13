<?php

namespace App\Events;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessful
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;
    public Order $order;
    public Payment $payment;
    public array $metadata;

    public function __construct(User $user, Order $order, Payment $payment, array $metadata = [])
    {
        $this->user = $user;
        $this->order = $order;
        $this->payment = $payment;
        $this->metadata = $metadata;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
        ];
    }
}