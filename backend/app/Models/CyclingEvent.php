<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CyclingEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_code',
        'slug',
        'title',
        'short_description',
        'description',
        'event_type',
        'difficulty',
        'terrain',
        'theme_name',
        'charity_name',
        'charity_url',
        'route_name',
        'route_description',
        'distance_km',
        'elevation_gain_m',
        'estimated_duration_hours',
        'meeting_point',
        'meeting_lat',
        'meeting_lng',
        'start_datetime',
        'end_datetime',
        'registration_deadline',
        'is_recurring',
        'recurrence_pattern',
        'max_participants',
        'min_participants',
        'price_per_person',
        'member_price',
        'early_bird_price',
        'early_bird_deadline',
        'group_discount_threshold',
        'group_discount_percent',
        'guide_included',
        'guide_name',
        'guide_bio',
        'guide_certifications',
        'bike_included',
        'included_bike_category',
        'transport_provided',
        'transport_price',
        'equipment_provided',
        'required_equipment',
        'refund_policy',
        'cancellation_policy',
        'weather_policy',
        'photos',
        'status',
        'current_participants',
        'rating',
        'review_count',
        'organizer_id',
        'tags',
        'route_gpx_url',
        'badge_earned_id',
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'registration_deadline' => 'datetime',
        'early_bird_deadline' => 'datetime',
        'is_recurring' => 'boolean',
        'guide_included' => 'boolean',
        'bike_included' => 'boolean',
        'transport_provided' => 'boolean',
        'distance_km' => 'decimal:2',
        'estimated_duration_hours' => 'decimal:1',
        'price_per_person' => 'decimal:2',
        'member_price' => 'decimal:2',
        'early_bird_price' => 'decimal:2',
        'transport_price' => 'decimal:2',
        'rating' => 'decimal:1',
        'photos' => 'array',
        'guide_certifications' => 'array',
        'equipment_provided' => 'array',
        'required_equipment' => 'array',
        'tags' => 'array',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function registrations()
    {
        return $this->hasMany(CyclingEventRegistration::class, 'event_id');
    }

    public function registeredUsers()
    {
        return $this->belongsToMany(User::class, 'cycling_event_registrations', 'event_id', 'user_id')
            ->wherePivot('status', 'registered');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>=', now());
    }

    public function scopeByDifficulty($query, $difficulty)
    {
        return $query->where('difficulty', $difficulty);
    }

    public function scopeByTerrain($query, $terrain)
    {
        return $query->where('terrain', $terrain);
    }

    public function getSeatsRemainingAttribute(): int
    {
        return max(0, $this->max_participants - $this->current_participants);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->current_participants >= $this->max_participants;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'KSh ' . number_format($this->price_per_person, 0);
    }
}
