<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentRecorder extends Model
{
    protected $fillable = [
        'user_id',
        'recorder_type',
        'recorder_code',
        'location',
        'shop_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'recorded_by_user_id', 'user_id');
    }

    // Helper methods
    public function isActive()
    {
        return $this->is_active;
    }

    public function isDeliveryAgent()
    {
        return $this->recorder_type === 'delivery_agent';
    }

    public function isShopAttendant()
    {
        return $this->recorder_type === 'shop_attendant';
    }

    public function isSeller()
    {
        return $this->recorder_type === 'seller';
    }
}