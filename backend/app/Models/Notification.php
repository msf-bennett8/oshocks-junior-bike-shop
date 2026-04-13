<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;

        protected $fillable = [
        'user_id',
        'notification_id',
        'type',
        'channel',
        'title',
        'message',
        'data',
        'metadata',
        'priority',
        'action_url',
        'action_text',
        'icon_type',
        'icon_color',
        'icon_gradient',
        'is_pinned',
        'actions',
        'audit_log',
        'template_id',
        'scheduled_for',
        'sent_at',
        'delivered_at',
        'read_at',
        'opened_at',
        'clicked_at',
        'clicked_url',
        'open_count',
        'click_count',
        'provider_message_id',
        'delivery_status',
        'expires_at',
        'is_archived',
    ];

    protected $casts = [
        'data' => 'array',
        'metadata' => 'array',
        'actions' => 'array',
        'audit_log' => 'array',
        'scheduled_for' => 'datetime',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    protected $dates = [
        'scheduled_for',
        'sent_at',
        'delivered_at',
        'read_at',
        'opened_at',
        'clicked_at',
        'expires_at',
        'deleted_at',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    public function scopeUnarchived($query)
    {
        return $query->where('is_archived', false);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')->where('expires_at', '<', now());
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>=', now());
        });
    }

    public function scopePending($query)
    {
        return $query->where('delivery_status', 'pending');
    }

    public function scopeDelivered($query)
    {
        return $query->where('delivery_status', 'delivered');
    }

    // Metrics scopes
    public function scopeWithMetrics($query)
    {
        return $query->whereNotNull('delivered_at');
    }

    public function scopeOpened($query)
    {
        return $query->whereNotNull('opened_at');
    }

    public function scopeClicked($query)
    {
        return $query->whereNotNull('clicked_at');
    }

    public function scopeByDateRange($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }

    // Accessors
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getIsReadAttribute(): bool
    {
        return !is_null($this->read_at);
    }

    public function getIsDeliveredAttribute(): bool
    {
        return $this->delivery_status === 'delivered';
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Mutators
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsDelivered(): void
    {
        $this->update([
            'delivered_at' => now(),
            'delivery_status' => 'delivered'
        ]);
    }

    public function markAsOpened(): void
    {
        $this->update([
            'opened_at' => now(),
            'open_count' => $this->open_count + 1
        ]);
    }

    public function markAsClicked(string $url): void
    {
        $this->update([
            'clicked_at' => now(),
            'click_count' => $this->click_count + 1,
            'clicked_url' => $url
        ]);
    }

    public function archive(): void
    {
        $this->update(['is_archived' => true]);
    }

    public function unarchive(): void
    {
        $this->update(['is_archived' => false]);
    }

    // Pinning
    public function pin(): void
    {
        $this->update(['is_pinned' => true]);
    }

    public function unpin(): void
    {
        $this->update(['is_pinned' => false]);
    }

    // Scope for pinned
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeUnpinned($query)
    {
        return $query->where('is_pinned', false);
    }
}
