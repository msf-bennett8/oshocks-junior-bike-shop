<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) \Illuminate\Support\Str::uuid7();
            }
        });
    }

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
        'status',
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
        'body' => 'string',
    ];

    protected $attributes = [
        'status' => 'sent',
        'is_deleted' => false,
    ];

    // Scopes
    public function scopeUnread($query, $userId)
    {
        return $query->whereNull('read_at')
            ->where('sender_id', '!=', $userId);
    }

    public function scopeDelivered($query)
    {
        return $query->whereNotNull('delivered_at');
    }

    public function scopeNotDeleted($query)
    {
        return $query->where('is_deleted', false);
    }

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

    public function readReceipts()
    {
        return $this->hasMany(MessageReadReceipt::class, 'message_id', 'id');
    }

    public function readers()
    {
        return $this->belongsToMany(User::class, 'message_read_receipts', 'message_id', 'user_id')
            ->withPivot('read_at')
            ->withTimestamps();
    }

    public function deliveryStatuses()
    {
        return $this->hasMany(MessageDeliveryStatus::class, 'message_id', 'id');
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
        // For guest messages, show anonXXXX or stored sender_name
        if ($this->sender_name && str_starts_with($this->sender_name, 'anon')) {
            return $this->sender_name;
        }
        // Extract anon ID from guest_session_id if available
        if ($this->guest_session_id) {
            $parts = explode('_', $this->guest_session_id);
            $lastPart = end($parts);
            if (strlen($lastPart) >= 4) {
                return 'anon' . substr($lastPart, 0, 4);
            }
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
