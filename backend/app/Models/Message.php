<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'type',
        'metadata',
        'read_at',
        'guest_session_id',
        'sender_name',
        'sender_email',
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id')->withDefault([
            'name' => 'Guest',
            'email' => null,
        ]);
    }

    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function getSenderDisplayName(): string
    {
        if ($this->sender) {
            return $this->sender->name;
        }
        return $this->sender_name ?? 'Guest';
    }

    public function getSenderAvatar(): ?string
    {
        return $this->sender?->avatar ?? null;
    }
}
