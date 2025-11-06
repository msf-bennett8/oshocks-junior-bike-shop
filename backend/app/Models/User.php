<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
    'name',
    'username',
    'email',
    'password',
    'phone',
    'address',
    'role',
    'profile_image',
    'google_id', 
    'strava_id', 
    'avatar', 
    'provider', 
    'is_active',
    'email_verified_at',
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'is_active' => 'boolean',
    ];

    // ADD THIS METHOD at the bottom of the class
    public function isOAuthUser()
    {
        return in_array($this->provider, ['google', 'strava']);
    }

    // Relationships
    public function sellerProfile()
    {
        return $this->hasOne(SellerProfile::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function cart()
    {
        return $this->hasOne(Cart::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function paymentRecorder()
    {
        return $this->hasOne(PaymentRecorder::class);
    }

    public function recordedPayments()
    {
        return $this->hasMany(Payment::class, 'recorded_by_user_id');
    }

    public function processedPayouts()
    {
        return $this->hasMany(SellerPayout::class, 'processed_by');
    }

    // Helper methods
    public function isSeller()
    {
        return $this->role === 'seller';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isBuyer()
    {
        return $this->role === 'buyer';
    }

    public function isPendingSeller()
    {
        return $this->role === 'pending_seller';
    }

    public function isSuperAdmin()
    {
        return $this->role === 'super_admin';
    }

    public function hasSellerAccess()
    {
        return in_array($this->role, ['seller', 'admin', 'super_admin']);
    }

    public function hasAdminAccess()
    {
        return in_array($this->role, ['admin', 'super_admin']);
    }

    public function hasSuperAdminAccess()
    {
        return $this->role === 'super_admin';
    }

    public function isDeliveryAgent()
    {
        return $this->role === 'delivery_agent';
    }

    public function isShopAttendant()
    {
        return $this->role === 'shop_attendant';
    }

    public function canRecordPayments()
    {
        return in_array($this->role, ['delivery_agent', 'shop_attendant', 'seller', 'admin', 'super_admin']);
    }
    
    // Multi-role support methods
    public function getAdditionalRolesAttribute($value)
    {
        return $value ? json_decode($value, true) : [];
    }

    public function setAdditionalRolesAttribute($value)
    {
        $this->attributes['additional_roles'] = json_encode($value);
    }

    public function getAllRoles()
    {
        $roles = [$this->role];
        if ($this->additional_roles) {
            $roles = array_merge($roles, $this->additional_roles);
        }
        return array_unique($roles);
    }

    public function hasRole($role)
    {
        return in_array($role, $this->getAllRoles());
    }

    public function hasAnyRole($roles)
    {
        return !empty(array_intersect($roles, $this->getAllRoles()));
    }

    public function addRole($role)
    {
        $additionalRoles = $this->additional_roles;
        if (!in_array($role, $additionalRoles) && $role !== $this->role) {
            $additionalRoles[] = $role;
            $this->additional_roles = $additionalRoles;
            $this->save();
        }
    }

    public function removeRole($role)
    {
        $additionalRoles = $this->additional_roles;
        $key = array_search($role, $additionalRoles);
        if ($key !== false) {
            unset($additionalRoles[$key]);
            $this->additional_roles = array_values($additionalRoles);
            $this->save();
        }
    }
}
