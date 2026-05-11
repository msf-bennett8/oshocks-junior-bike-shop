<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentNote extends Model
{
    use HasFactory;

    protected $table = 'appointment_notes';

    protected $fillable = [
        'case_id',
        'user_id',
        'content',
        'visibility',
        'message_id',
    ];

    protected $casts = [
        'visibility' => 'string',
    ];

    protected $appends = ['creator_name', 'creator_role', 'creator_initials', 'is_staff_note'];

    public function supportCase(): BelongsTo
    {
        return $this->belongsTo(SupportCase::class, 'case_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function getCreatorNameAttribute(): string
    {
        return $this->user?->name ?? 'Unknown';
    }

    public function getCreatorRoleAttribute(): ?string
    {
        return $this->user?->role ?? null;
    }

    public function getCreatorInitialsAttribute(): string
    {
        return $this->user?->name ? strtoupper(substr($this->user->name, 0, 1)) : '?';
    }

    public function getIsStaffNoteAttribute(): bool
    {
        return in_array($this->user?->role, ['admin', 'super_admin', 'support_agent', 'service_agent']);
    }

    /**
     * Check if this note is visible to a given user
     */
    public function isVisibleTo(?User $user): bool
    {
        if (!$user) return false;

        // Public notes visible to everyone
        if ($this->visibility === 'public') return true;

        $isStaff = in_array($user->role, ['admin', 'super_admin', 'support_agent', 'service_agent']);

        // Staff-public: visible to all staff
        if ($this->visibility === 'staff_public') return $isStaff;

        // Private: only visible to staff
        if ($this->visibility === 'private') return $isStaff;

        // Note creator can always see their own notes
        if ($this->user_id === $user->id) return true;

        return false;
    }
}
