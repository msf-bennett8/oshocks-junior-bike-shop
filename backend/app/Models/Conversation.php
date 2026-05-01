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
        'guest_session_id',
        'user_id',
        'guest_name',
        'guest_email',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withDefault([
            'name' => 'Guest',
            'email' => null,
        ]);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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

    public function unreadCountFor(?User $user, ?string $guestSessionId = null): int
    {
        if (!$user && !$guestSessionId) return 0;

        $lastRead = null;
        if ($user) {
            $lastRead = $this->participants()
                ->where('user_id', $user->id)
                ->value('last_read_at');
        }

        $query = $this->messages()
            ->where(function ($q) use ($user, $guestSessionId) {
                if ($user) {
                    $q->where('sender_id', '!=', $user->id)
                      ->orWhereNull('sender_id');
                }
                if ($guestSessionId) {
                    $q->orWhere('guest_session_id', '!=', $guestSessionId);
                }
            })
            ->whereNull('read_at');

        if ($lastRead) {
            $query->where('created_at', '>', $lastRead);
        }

        return $query->count();
    }

    public function otherParticipant(User $user): ?User
    {
        return $this->participants()
            ->where('user_id', '!=', $user->id)
            ->first();
    }

    public function getDisplayTitle(?User $user = null, ?string $guestName = null): string
    {
        if ($this->title) return $this->title;
        if ($user) {
            $other = $this->otherParticipant($user);
            return $other?->name ?? 'Support';
        }
        return $guestName ?? 'Support';
    }

    /**
     * Link guest session conversations to a user account
     */
    public static function linkGuestSessions(string $guestSessionId, User $user): int
    {
        $linkedCount = 0;

        // Find all guest conversations for this session that are support chats
        $conversations = self::where('guest_session_id', $guestSessionId)
            ->whereNull('user_id')
            ->get();

        foreach ($conversations as $conversation) {
            // Update conversation ownership
            $conversation->update([
                'user_id' => $user->id,
                'guest_session_id' => null,
            ]);

            // Add user as participant if not already
            $isParticipant = $conversation->participants()
                ->where('user_id', $user->id)
                ->exists();

            if (!$isParticipant) {
                $conversation->participants()->attach($user->id, [
                    'joined_at' => now(),
                    'is_admin' => false,
                ]);
            }

            // Update messages to point to user
            $conversation->messages()
                ->where('guest_session_id', $guestSessionId)
                ->update([
                    'sender_id' => $user->id,
                    'guest_session_id' => null,
                    'sender_name' => null,
                ]);

            $linkedCount++;
        }

        return $linkedCount;
    }
}
