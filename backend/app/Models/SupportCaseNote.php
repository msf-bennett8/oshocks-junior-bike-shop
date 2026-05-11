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
        'visibility',
        'message_id',
    ];

    protected $appends = ['creator_name', 'creator_role', 'creator_initials', 'is_staff_note'];

    protected $casts = [
        'is_private' => 'boolean',
    ];

    /**
     * Get visibility attribute (backward compatible with is_private)
     */
    public function getVisibilityAttribute($value): string
    {
        if ($value) return $value;
        // Backward compatibility: is_private true = private, false = public
        return $this->is_private ? 'private' : 'public';
    }

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

    /**
     * Get the creator's display name
     */
    public function getCreatorNameAttribute(): string
    {
        return $this->agent?->name ?? 'Unknown';
    }

    /**
     * Get the creator's role
     */
    public function getCreatorRoleAttribute(): ?string
    {
        return $this->agent?->role ?? null;
    }

    /**
     * Get the creator's initials for avatar
     */
    public function getCreatorInitialsAttribute(): string
    {
        return $this->agent?->name ? strtoupper(substr($this->agent->name, 0, 1)) : '?';
    }

    /**
     * Check if the note creator is staff
     */
    public function getIsStaffNoteAttribute(): bool
    {
        return in_array($this->agent?->role, ['admin', 'super_admin', 'support_agent']);
    }
}
