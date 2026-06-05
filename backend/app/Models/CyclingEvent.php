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

    public function getIsPendingApprovalAttribute(): bool
    {
        return $this->status === 'pending';
    }

    public function getIsPublishedAttribute(): bool
    {
        return in_array($this->status, ['open', 'closed']) && !$this->is_archived && !$this->scheduled_for_deletion_at;
    }

    public function getBookingsCountAttribute(): int
    {
        return $this->registrations()->where('status', 'registered')->count();
    }

    public function getWaitlistCountAttribute(): int
    {
        return $this->registrations()->where('status', 'waitlisted')->count();
    }

    public function getCheckedInCountAttribute(): int
    {
        return $this->registrations()->whereNotNull('checked_in_at')->count();
    }

    public function getRevenueAttribute(): float
    {
        return $this->registrations()
            ->where('status', 'registered')
            ->where('payment_status', 'paid')
            ->sum('final_amount');
    }

    public function getCapacityPercentAttribute(): float
    {
        return $this->max_participants > 0
            ? round(($this->current_participants / $this->max_participants) * 100, 1)
            : 0;
    }

    public function getIsAlmostSoldOutAttribute(): bool
    {
        return $this->max_participants > 0 &&
            $this->seats_remaining > 0 &&
            $this->seats_remaining <= max(3, ceil($this->max_participants * 0.1));
    }

    public function scopePublished($query)
    {
        return $query->whereIn('status', ['open', 'closed'])
            ->where('is_archived', false)
            ->whereNull('scheduled_for_deletion_at');
    }

    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending')->whereNull('deleted_at');
    }

    public function scopeNeedsModeration($query)
    {
        return $query->where('status', 'pending')
            ->whereNull('deleted_at')
            ->whereNull('approved_at');
    }
}
