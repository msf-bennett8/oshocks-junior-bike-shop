<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MassPurchaseAlert
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $adminIds;
    public Order $order;
    public int $itemCount;
    public float $total;
    public string $customerType;

    public function __construct(array $adminIds, Order $order, int $itemCount, float $total, string $customerType)
    {
        $this->adminIds = $adminIds;
        $this->order = $order;
        $this->itemCount = $itemCount;
        $this->total = $total;
        $this->customerType = $customerType;
    }

    public function broadcastOn(): array
    {
        return [new Channel('admin.alerts')];
    }
}
