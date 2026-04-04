<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'user_id',
        'service_type',
        'mechanic_id',
        'product_id', // bike being serviced
        'scheduled_date',
        'scheduled_time',
        'duration_minutes',
        'location_id', // shop location or mobile service area
        'status', // pending, confirmed, in_progress, completed, cancelled, no_show
        'reschedule_count',
        'original_booking_id', // for reschedules
        'reschedule_reason',
        'cancellation_reason',
        'cancelled_by', // customer, mechanic, system
        'completed_at',
        'completion_notes',
        'rating_prompt_sent',
        'price_estimate',
        'final_price',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime',
        'completed_at' => 'datetime',
        'price_estimate' => 'decimal:2',
        'final_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function location()
    {
        return $this->belongsTo(Address::class, 'location_id');
    }

    public function originalBooking()
    {
        return $this->belongsTo(self::class, 'original_booking_id');
    }

    public function reschedules()
    {
        return $this->hasMany(self::class, 'original_booking_id');
    }
}
