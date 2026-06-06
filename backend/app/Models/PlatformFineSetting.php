<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformFineSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'setting_key',
        'fine_amount',
        'is_active',
        'description',
        'updated_by',
    ];

    protected $casts = [
        'fine_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function getLateReturnFine()
    {
        $setting = self::where('setting_key', 'late_return_fine')->where('is_active', true)->first();
        return $setting?->fine_amount;
    }

    public static function setLateReturnFine(?float $amount, int $userId)
    {
        return self::updateOrCreate(
            ['setting_key' => 'late_return_fine'],
            [
                'fine_amount' => $amount,
                'is_active' => $amount !== null,
                'description' => 'Automatic fine applied for late bike returns',
                'updated_by' => $userId,
            ]
        );
    }
}
