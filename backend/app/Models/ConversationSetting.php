<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'guest_session_id',
        'is_muted',
        'muted_until',
        'notification_tone',
        'show_preview',
        'is_archived',
        'archived_at',
        'is_pinned',
        'pin_order',
    ];

    protected $casts = [
        'is_muted' => 'boolean',
        'muted_until' => 'datetime',
        'show_preview' => 'boolean',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
        'is_pinned' => 'boolean',
        'pin_order' => 'integer',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCurrentlyMuted(): bool
    {
        if (!$this->is_muted) return false;
        if ($this->muted_until === null) return true;
        return $this->muted_until->isFuture();
    }
}
