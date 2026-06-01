<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'post_code',
        'slug',
        'title',
        'event_id',
        'ride_date',
        'ride_type',
        'ride_distance_km',
        'ride_duration_minutes',
        'elevation_gain_m',
        'avg_speed_kmh',
        'max_speed_kmh',
        'calories_burned',
        'content',
        'mood',
        'bike_used',
        'gear',
        'tags',
        'visibility',
        'allow_comments',
        'photos',
        'photo_captions',
        'user_id',
        'user_name',
        'user_avatar',
        'likes_count',
        'comments_count',
        'is_featured',
        'status',
    ];

    protected $casts = [
        'ride_distance_km' => 'decimal:2',
        'avg_speed_kmh' => 'decimal:1',
        'max_speed_kmh' => 'decimal:1',
        'ride_date' => 'date',
        'allow_comments' => 'boolean',
        'is_featured' => 'boolean',
        'photos' => 'array',
        'photo_captions' => 'array',
        'gear' => 'array',
        'tags' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(CyclingEvent::class, 'event_id');
    }

    public function postImages()
    {
        return $this->hasMany(CommunityPostImage::class, 'post_code', 'post_code')
            ->orderBy('display_order');
    }

    public function getPrimaryImageAttribute()
    {
        return $this->postImages->first();
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public')->where('status', 'active');
    }

    public function scopeVisibleTo($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('visibility', 'public')
              ->orWhere('user_id', $userId)
              ->orWhere(function ($q2) use ($userId) {
                  // followers visibility — extend when follow system is built
                  $q2->where('visibility', 'followers');
              });
        })->where('status', 'active');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('status', 'active');
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->ride_duration_minutes) return '—';
        $hours = intdiv($this->ride_duration_minutes, 60);
        $mins = $this->ride_duration_minutes % 60;
        return $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";
    }

    public function getMoodEmojiAttribute(): string
    {
        return match($this->mood) {
            'amazing' => '🤩',
            'good' => '😊',
            'tired' => '😅',
            'challenging' => '💪',
            'epic' => '🔥',
            default => '😊',
        };
    }

    /**
     * Flatten images relationship to photos array for frontend compatibility
     */
    public function getPhotosAttribute(): array
    {
        return $this->postImages->map(function ($image) {
            return $image->cloudinary_secure_url;
        })->toArray();
    }

    /**
     * Get full image objects with metadata for frontend gallery
     */
    public function getImagesAttribute(): array
    {
        return $this->postImages->map(function ($image) {
            return [
                'cloudinary_secure_url' => $image->cloudinary_secure_url,
                'cloudinary_thumbnail_url' => $image->cloudinary_thumbnail_url,
                'cloudinary_medium_url' => $image->cloudinary_medium_url,
                'caption' => $image->caption,
                'public_id' => $image->cloudinary_public_id,
            ];
        })->toArray();
    }

    /**
     * Get user initials for avatar fallback
     */
    public function getUserInitialsAttribute(): string
    {
        $name = $this->user_name ?? 'Anonymous';
        return collect(explode(' ', $name))
            ->map(fn($n) => $n[0] ?? '')
            ->join('');
    }

    protected $appends = [
        'photos',
        'images',
        'user_initials',
        'mood_emoji',
        'formatted_duration',
    ];
}
