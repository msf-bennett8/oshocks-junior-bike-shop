<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentHistory extends Model
{
    use HasFactory;

    protected $table = 'appointment_history';

    protected $fillable = [
        'case_id',
        'changed_by',
        'from_status',
        'to_status',
        'from_date',
        'to_date',
        'from_time',
        'to_time',
        'from_seller_id',
        'to_seller_id',
        'from_mechanic_id',
        'to_mechanic_id',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'from_date' => 'datetime',
        'to_date' => 'datetime',
    ];

    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class, 'case_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by')->withDefault([
            'name' => 'System',
        ]);
    }

    public function fromSeller(): BelongsTo
    {
        return $this->belongsTo(SellerProfile::class, 'from_seller_id');
    }

    public function toSeller(): BelongsTo
    {
        return $this->belongsTo(SellerProfile::class, 'to_seller_id');
    }

    public function fromMechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_mechanic_id');
    }

    public function toMechanic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_mechanic_id');
    }
}
