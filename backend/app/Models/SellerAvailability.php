<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SellerAvailability extends Model
{
    use HasFactory;

    protected $table = 'seller_availability';

    protected $fillable = [
        'seller_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
        'specific_date',
        'max_bookings',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'is_available' => 'boolean',
        'specific_date' => 'date',
    ];

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    /**
     * Get day name
     */
    public function getDayNameAttribute(): string
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return $days[$this->day_of_week] ?? 'Unknown';
    }

    /**
     * Scope: Available slots
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope: For a specific day
     */
    public function scopeForDay($query, int $dayOfWeek)
    {
        return $query->where('day_of_week', $dayOfWeek)
                     ->whereNull('specific_date');
    }

    /**
     * Scope: Date overrides
     */
    public function scopeDateOverride($query, string $date)
    {
        return $query->where('specific_date', $date);
    }
}
