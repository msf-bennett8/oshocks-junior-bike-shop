<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'county',
        'postal_code',
        'country',
        'type',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * Get the user that owns the address
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get orders using this address
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Scope to get default addresses
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Set this address as default and unset others
     */
    public function setAsDefault()
    {
        // Remove default from other addresses for this user
        if ($this->user_id) {
            static::where('user_id', $this->user_id)
                ->where('id', '!=', $this->id)
                ->update(['is_default' => false]);
        }

        $this->is_default = true;
        $this->save();
    }
}