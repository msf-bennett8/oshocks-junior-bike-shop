<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
        protected $fillable = [
        'order_number',
        'order_code',
        'order_display',
        'purchase_id',
        'routing_id',
        'location_code',
        'user_id',
        'seller_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'address_id',
        'county',
        'delivery_zone',
        'postal_code',
        'delivery_instructions',
        'subtotal',
        'shipping_fee',
        'tax',
        'discount',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'transaction_reference',
        'transaction_id_display',
        'notes',
        'paid_at',
        'shipped_at',
        'delivered_at',
        'cancellation_reason',
        'cancelled_by',
        'tracking_number',
        'carrier',
        'delivery_agent_details',
        'delivery_proof_url',
        'refund_amount',
        'refund_reference',
        'refund_initiated_at',
        'estimated_delivery_date',
        'email_sent_order_placed',
        'email_sent_processing',
        'email_sent_shipped',
        'email_sent_out_for_delivery',
        'email_sent_delivered',
        'email_sent_payment_received',
        'email_sent_cancelled',
        'email_sent_refunded',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'delivery_agent_details' => 'array',
        'refund_amount' => 'decimal:2',
        'refund_initiated_at' => 'datetime',
        'estimated_delivery_date' => 'date',
        'email_sent_order_placed' => 'datetime',
        'email_sent_processing' => 'datetime',
        'email_sent_shipped' => 'datetime',
        'email_sent_out_for_delivery' => 'datetime',
        'email_sent_delivered' => 'datetime',
        'email_sent_payment_received' => 'datetime',
        'email_sent_cancelled' => 'datetime',
        'email_sent_refunded' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Alias for easier access
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    // Helper methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isProcessing()
    {
        return $this->status === 'processing';
    }

    public function isShipped()
    {
        return $this->status === 'shipped';
    }

    public function isDelivered()
    {
        return $this->status === 'delivered';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }

    public function isCOD()
    {
        return $this->payment_method === 'cod';
    }

    /**
     * Get customer name with fallback to user
     * (Use getDisplayName() method instead of attribute accessor)
     */
    public function getDisplayName()
    {
        return $this->customer_name ?? $this->user?->name ?? 'Guest';
    }

    /**
     * Get customer email with fallback to user
     * (Use getDisplayEmail() method instead of attribute accessor)
     */
    public function getDisplayEmail()
    {
        return $this->customer_email ?? $this->user?->email ?? null;
    }

    /**
     * Get customer phone with fallback to user
     * (Use getDisplayPhone() method instead of attribute accessor)
     */
    public function getDisplayPhone()
    {
        return $this->customer_phone ?? $this->user?->phone ?? null;
    }
}