<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportCaseTag extends Model
{
    use HasFactory;

    protected $table = 'support_case_tags';

    protected $fillable = [
        'case_id',
        'tag',
    ];

    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class, 'case_id');
    }
}
