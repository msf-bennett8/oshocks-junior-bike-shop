<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportCaseNote extends Model
{
    use HasFactory;

    protected $table = 'support_case_notes';

    protected $fillable = [
        'case_id',
        'agent_id',
        'content',
        'is_private',
        'message_id',
    ];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class, 'case_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
