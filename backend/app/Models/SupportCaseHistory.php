<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportCaseHistory extends Model
{
    use HasFactory;

    protected $table = 'support_case_history';

    protected $fillable = [
        'case_id',
        'changed_by',
        'from_status',
        'to_status',
        'from_assigned_to',
        'to_assigned_to',
        'from_priority',
        'to_priority',
        'reason',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
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

    public function fromAssignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_assigned_to');
    }

    public function toAssignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_assigned_to');
    }
}
