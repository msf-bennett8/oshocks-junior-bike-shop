<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'title',
        'created_by',
        'order_number',
        'last_message_at',
        'guest_session_id',
        'guest_name',
        'guest_email',
        'order_id',
        'assigned_to',
        'status',
        'priority',
        'escalated_at',
        'escalation_reason',
        'flagged_for_review',
        'moderation_notes',
        'detected_keywords',
        'resolved_at',
        'closed_at',
        'is_pinned',
        'is_archived',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'escalated_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'detected_keywords' => 'array',
        'flagged_for_review' => 'boolean',
        'is_pinned' => 'boolean',
        'is_archived' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withDefault([
            'name' => 'Guest',
            'email' => null,
        ]);
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

    public function settings(): HasMany
    {
        return $this->hasMany(ConversationSetting::class);
    }

    public function pinnedMessages(): HasMany
    {
        return $this->hasMany(PinnedMessage::class);
    }

    public function callSessions(): HasMany
    {
        return $this->hasMany(CallSession::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
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
            ->where('users.id', '!=', $user->id)
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
     * The primary support case associated with this conversation (first one)
     */
    public function supportCase()
    {
        return $this->hasOne(\App\Models\SupportCase::class, 'conversation_id')->latest();
    }

    /**
     * All support cases in this conversation (for threaded ticketing)
     */
    public function supportCases()
    {
        return $this->hasMany(\App\Models\SupportCase::class, 'conversation_id')->orderBy('created_at', 'desc');
    }

    /**
     * Active (non-resolved/closed) support cases in this conversation
     */
    public function activeSupportCases()
    {
        return $this->hasMany(\App\Models\SupportCase::class, 'conversation_id')
            ->whereNotIn('status', ['resolved', 'closed'])
            ->orderBy('created_at', 'desc');
    }

    /**
     * Check if this conversation is a support conversation
     */
    public function isSupportCase(): bool
    {
        return $this->type === 'support' || $this->type === 'order_support';
    }

    /**
     * Scope: only support case conversations
     */
    public function scopeSupportCases($query)
    {
        return $query->whereIn('type', ['support', 'order_support']);
    }

    /**
     * Get or create a persistent support conversation for a user
     */
    public static function getOrCreateSupportConversation(?User $user, ?string $guestSessionId, ?int $orderId = null): self
    {
        $query = self::whereIn('type', ['support', 'order_support'])
            ->whereNull('deleted_at');

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                  ->orWhereHas('participants', function ($pq) use ($user) {
                      $pq->where('user_id', $user->id);
                  });
            });
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        }

        if ($orderId) {
            $query->where('order_id', $orderId);
        } else {
            $query->whereNull('order_id'); // General support, not order-specific
        }

        $existing = $query->first();

        if ($existing) {
            return $existing;
        }

        // Create new conversation
        $supportUser = User::whereIn('role', ['admin', 'super_admin'])->first();

        $conversation = self::create([
            'created_by' => $user?->id,
            'guest_session_id' => $user ? null : $guestSessionId,
            'type' => $orderId ? 'order_support' : 'support',
            'title' => $orderId ? 'Order Support' : 'Oshocks Support',
            'order_id' => $orderId,
            'status' => 'open',
            'priority' => 'medium',
        ]);

        if ($user) {
            $conversation->participants()->attach($user->id, ['joined_at' => now()]);
        }

        if ($supportUser && $supportUser->id !== $user?->id) {
            $conversation->participants()->attach($supportUser->id, ['joined_at' => now(), 'is_admin' => true]);
        }

        // System welcome message
        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => null,
            'body' => 'Welcome to Oshocks Support! You can create a new case anytime by clicking "New Case" below.',
            'type' => 'system',
        ]);

        return $conversation;
    }

    /**
     * Link guest session conversations to a user account
     */
    public static function linkGuestSessions(string $guestSessionId, User $user): int
    {
        $linkedCount = 0;

        // Find all guest conversations for this session that are support chats
        $conversations = self::where('guest_session_id', $guestSessionId)
            ->whereNull('created_by')
            ->get();

        foreach ($conversations as $conversation) {
            // Update conversation ownership
            $conversation->update([
                'created_by' => $user->id,
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
