<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'phone_number',
        'mpesa_name',
        'last4',
        'brand',
        'expiry_month',
        'expiry_year',
        'card_name',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Set this payment method as default and unset others
     */
    public function setAsDefault()
    {
        if ($this->user_id) {
            static::where('user_id', $this->user_id)
                ->where('id', '!=', $this->id)
                ->update(['is_default' => false]);
        }

        $this->is_default = true;
        $this->save();
    }
}