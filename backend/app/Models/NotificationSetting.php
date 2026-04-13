<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'channel_preferences',
        'category_preferences',
        'quiet_hours_enabled',
        'quiet_hours_start',
        'quiet_hours_end',
        'timezone',
        'desktop_notifications',
        'sound_enabled',
    ];

    protected $attributes = [
        'channel_preferences' => null,
        'category_preferences' => null,
        'quiet_hours_enabled' => false,
        'quiet_hours_start' => '22:00',
        'quiet_hours_end' => '07:00',
        'timezone' => 'Africa/Nairobi',
        'desktop_notifications' => false,
        'sound_enabled' => false,
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (is_null($model->channel_preferences)) {
                $model->channel_preferences = [
                    'push' => true,
                    'email' => true,
                    'sms' => false,
                    'in_app' => true
                ];
            }
            if (is_null($model->category_preferences)) {
                $model->category_preferences = [
                    'orders' => ['enabled' => true, 'push' => true, 'email' => true],
                    'shipping' => ['enabled' => true, 'push' => true, 'email' => true],
                    'payments' => ['enabled' => true, 'push' => true, 'email' => true],
                    'promotions' => ['enabled' => true, 'push' => false, 'email' => true],
                    'wishlist' => ['enabled' => true, 'push' => false, 'email' => false],
                    'messages' => ['enabled' => true, 'push' => true, 'email' => false],
                    'reviews' => ['enabled' => true, 'push' => false, 'email' => true],
                    'system' => ['enabled' => true, 'push' => true, 'email' => true],
                    'inventory' => ['enabled' => true, 'push' => true, 'email' => true],
                    'audit' => ['enabled' => true, 'push' => false, 'email' => true],
                    'admin' => ['enabled' => true, 'push' => true, 'email' => true]
                ];
            }
        });
    }

    protected $casts = [
        'channel_preferences' => 'array',
        'category_preferences' => 'array',
        'quiet_hours_enabled' => 'boolean',
        'desktop_notifications' => 'boolean',
        'sound_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isChannelEnabled(string $channel): bool
    {
        return $this->channel_preferences[$channel] ?? false;
    }

    public function isCategoryEnabled(string $category): bool
    {
        return $this->category_preferences[$category]['enabled'] ?? true;
    }

    public function shouldSendToChannel(string $category, string $channel): bool
    {
        if (!$this->isChannelEnabled($channel)) {
            return false;
        }
        
        $catPrefs = $this->category_preferences[$category] ?? ['enabled' => true];
        
        if (!($catPrefs['enabled'] ?? true)) {
            return false;
        }
        
        return $catPrefs[$channel] ?? ($channel === 'in_app');
    }

    public function isQuietHours(): bool
    {
        if (!$this->quiet_hours_enabled) {
            return false;
        }

        $now = now()->timezone($this->timezone);
        $currentTime = $now->format('H:i');
        
        $start = $this->quiet_hours_start;
        $end = $this->quiet_hours_end;
        
        // Handle overnight quiet hours (e.g., 22:00 - 07:00)
        if ($start > $end) {
            return $currentTime >= $start || $currentTime < $end;
        }
        
        return $currentTime >= $start && $currentTime < $end;
    }
}
