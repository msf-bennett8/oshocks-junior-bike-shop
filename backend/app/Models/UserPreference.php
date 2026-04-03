<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'language',
        'currency',
        'email_notifications',
        'sms_notifications',
        'order_updates',
        'promotional_emails',
        'new_arrivals',
        'price_drop_alerts',
        'newsletter',
        'two_factor_auth',
        'profile_visibility',
        'show_email',
        'show_phone',
        'data_sharing',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
        'order_updates' => 'boolean',
        'promotional_emails' => 'boolean',
        'new_arrivals' => 'boolean',
        'price_drop_alerts' => 'boolean',
        'newsletter' => 'boolean',
        'two_factor_auth' => 'boolean',
        'show_email' => 'boolean',
        'show_phone' => 'boolean',
        'data_sharing' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
