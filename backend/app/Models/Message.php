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
        'case_id',
        'sender_id',
        'body',
        'type',
        'metadata',
        'read_at',
        'delivered_at',
        'reply_to',
        'edited_at',
        'is_edited',
        'deleted_at',
        'is_deleted',
        'deleted_by',
        'guest_session_id',
        'sender_name',
        'sender_email',
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime',
        'delivered_at' => 'datetime',
        'edited_at' => 'datetime',
        'deleted_at' => 'datetime',
        'is_edited' => 'boolean',
        'is_deleted' => 'boolean',
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

    public function isDelivered(): bool
    {
        return $this->delivered_at !== null;
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsDelivered(): void
    {
        if (!$this->delivered_at) {
            $this->update(['delivered_at' => now()]);
        }
    }

    public function markAsEdited(string $newBody): void
    {
        $this->update([
            'body' => $newBody,
            'edited_at' => now(),
            'is_edited' => true,
        ]);
    }

    public function softDelete(string $deletedBy = 'sender'): void
    {
        $this->update([
            'deleted_at' => now(),
            'is_deleted' => true,
            'deleted_by' => $deletedBy,
            'body' => 'This message was deleted',
        ]);
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }

    public function replyToMessage()
    {
        return $this->belongsTo(Message::class, 'reply_to');
    }

    public function replies()
    {
        return $this->hasMany(Message::class, 'reply_to');
    }

    public function getSenderDisplayName(): string
    {
        if ($this->is_deleted) return 'Deleted message';
        if ($this->sender) {
            return $this->sender->name;
        }
        return $this->sender_name ?? 'Guest';
    }

    public function getSenderAvatar(): ?string
    {
        return $this->sender?->avatar ?? null;
    }

    public function getStatusFor(?User $user): string
    {
        if ($this->is_deleted) return 'deleted';
        if ($this->read_at) return 'read';
        if ($this->delivered_at) return 'delivered';
        return 'sent';
    }

    /**
     * Support case note associated with this message (if any)
     */
    public function supportCaseNote()
    {
        return $this->hasOne(\App\Models\SupportCaseNote::class, 'message_id');
    }

    /**
     * Support case this message belongs to (if any)
     */
    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(\App\Models\SupportCase::class, 'case_id');
    }

    /**
     * Scope: messages belonging to a specific case
     */
    public function scopeForCase($query, ?string $caseId)
    {
        if ($caseId) {
            return $query->where('case_id', $caseId);
        }
        return $query->whereNull('case_id');
    }

    /**
     * Scope: messages not belonging to any case (general chat)
     */
    public function scopeGeneral($query)
    {
        return $query->whereNull('case_id');
    }
}
