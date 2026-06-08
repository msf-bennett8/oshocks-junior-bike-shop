<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResourceAvailabilityBlock extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_item_id',
        'block_type',
        'start_datetime',
        'end_datetime',
        'quantity_blocked',
        'booking_id',
        'event_id',
        'reason',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'quantity_blocked' => 'integer',
    ];

    // Relationships
    public function resourceItem()
    {
        return $this->belongsTo(ResourceItem::class, 'resource_item_id');
    }

    public function booking()
    {
        return $this->belongsTo(ResourceBooking::class, 'booking_id');
    }

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeForResource($query, int $resourceItemId)
    {
        return $query->where('resource_item_id', $resourceItemId);
    }

    public function scopeActiveDuring($query, string $start, string $end)
    {
        return $query->where(function ($q) use ($start, $end) {
            $q->where('start_datetime', '<', $end)
              ->where('end_datetime', '>', $start);
        });
    }

    public function scopeBookingBlocks($query)
    {
        return $query->where('block_type', 'booking');
    }

    public function scopeMaintenanceBlocks($query)
    {
        return $query->where('block_type', 'maintenance');
    }

    public function scopeEventBlocks($query)
    {
        return $query->where('block_type', 'event_reserved');
    }
}
