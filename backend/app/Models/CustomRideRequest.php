<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomRideRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'id';
    public $incrementing = true;

    protected $fillable = [
        'request_id',
        'user_id',
        'guest_session_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'title',
        'description',
        'preferred_date',
        'date_flexible',
        'date_flexibility_days',
        'group_size',
        'rider_count',
        'difficulty',
        'terrain',
        'distance_km',
        'duration_hours',
        'bike_model',
        'bike_size',
        'add_ons',
        'base_rental_price',
        'add_ons_price',
        'insurance_price',
        'transport_price',
        'security_deposit',
        'total_price',
        'budget_estimate',
        'insurance_included',
        'transport_included',
        'transport_notes',
        'contact_phone',
        'status',
        'quoted_at',
        'quoted_by',
        'staff_notes',
        'customer_notes',
        'metadata',
    ];

    protected $casts = [
        'status' => 'string',
        'preferred_date' => 'date',
        'date_flexible' => 'boolean',
        'add_ons' => 'array',
        'base_rental_price' => 'decimal:2',
        'add_ons_price' => 'decimal:2',
        'insurance_price' => 'decimal:2',
        'transport_price' => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'total_price' => 'decimal:2',
        'budget_estimate' => 'decimal:2',
        'insurance_included' => 'boolean',
        'transport_included' => 'boolean',
        'quoted_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withDefault([
            'name' => 'Guest',
            'email' => null,
        ]);
    }

    public function images(): HasMany
    {
        return $this->hasMany(CustomRideRequestImage::class)->orderBy('display_order');
    }

    public function primaryImage(): ?CustomRideRequestImage
    {
        return $this->images()->where('is_primary', true)->first()
            ?? $this->images()->first();
    }

    public function quotedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'quoted_by');
    }

    // Scopes
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['completed', 'cancelled', 'expired']);
    }

    public function scopePendingQuote($query)
    {
        return $query->where('status', 'reviewing');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForGuest($query, string $sessionId)
    {
        return $query->where('guest_session_id', $sessionId);
    }

    // Accessors
    public function getAddOnsListAttribute(): array
    {
        $addOns = $this->add_ons ?? [];
        $labels = [
            'helmet' => 'Helmet',
            'lights' => 'Bike Lights',
            'lock' => 'U-Lock',
            'repair_kit' => 'Repair Kit',
            'bottle' => 'Water Bottle',
            'gloves' => 'Cycling Gloves',
        ];

        return array_map(fn($key) => $labels[$key] ?? $key, $addOns);
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'reviewing' => 'amber',
            'quoted' => 'blue',
            'accepted' => 'green',
            'converted' => 'purple',
            'declined' => 'red',
            'scheduled' => 'purple',
            'completed' => 'emerald',
            'cancelled' => 'gray',
            'expired' => 'slate',
            default => 'gray',
        };
    }

    public function getSubmittedByAttribute(): string
    {
        if ($this->user_id && $this->user) {
            return $this->user->name;
        }
        return $this->guest_name ?? 'Anonymous';
    }

    public function getIsGuestAttribute(): bool
    {
        return is_null($this->user_id);
    }

    // Boot for auto-generating request_id
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->request_id)) {
                $request->request_id = app(\App\Services\CustomRideRequestIdService::class)->generate();
            }
        });
    }
}
