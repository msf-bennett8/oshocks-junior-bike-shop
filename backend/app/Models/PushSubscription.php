<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endpoint',
        'p256dh',
        'auth',
        'device_info',
        'last_used_at',
    ];

    protected $casts = [
        'device_info' => 'array',
        'last_used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function touchLastUsed(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
