<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CallSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'conversation_id',
        'caller_id',
        'callee_id',
        'call_type',
        'status',
        'started_at',
        'answered_at',
        'ended_at',
        'duration_seconds',
        'end_reason',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'answered_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function caller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    public function callee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'callee_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isEnded(): bool
    {
        return in_array($this->status, ['ended', 'missed', 'declined']);
    }

    public function markAnswered(): void
    {
        $this->update([
            'status' => 'active',
            'answered_at' => now(),
        ]);
    }

    public function markEnded(string $reason = 'completed'): void
    {
        $endedAt = now();
        $duration = $this->answered_at 
            ? $endedAt->diffInSeconds($this->answered_at) 
            : null;

        $this->update([
            'status' => 'ended',
            'ended_at' => $endedAt,
            'duration_seconds' => $duration,
            'end_reason' => $reason,
        ]);
    }
}
