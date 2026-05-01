<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'created_by',
        'order_number',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('joined_at', 'last_read_at', 'is_admin')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest()->limit(1);
    }

    public function callSessions(): HasMany
    {
        return $this->hasMany(CallSession::class);
    }

    public function unreadCountFor(User $user): int
    {
        $lastRead = $this->participants()
            ->where('user_id', $user->id)
            ->value('last_read_at');

        if (!$lastRead) {
            return $this->messages()->where('sender_id', '!=', $user->id)->count();
        }

        return $this->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('created_at', '>', $lastRead)
            ->count();
    }

    public function otherParticipant(User $user): ?User
    {
        return $this->participants()
            ->where('user_id', '!=', $user->id)
            ->first();
    }
}
