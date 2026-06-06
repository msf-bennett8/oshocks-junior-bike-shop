<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TermsAcceptanceLog extends Model
{
    use HasFactory;

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'terms_type',
        'ip_address',
        'user_agent',
        'accepted_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function hasAccepted(int $userId, string $termsType): bool
    {
        return self::where('user_id', $userId)
            ->where('terms_type', $termsType)
            ->exists();
    }

    public static function recordAcceptance(int $userId, string $termsType): self
    {
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'terms_type' => $termsType,
            ],
            [
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'accepted_at' => now(),
            ]
        );
    }
}
