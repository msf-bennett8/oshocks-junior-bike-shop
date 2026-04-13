<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class NotificationTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'template_key',
        'name',
        'description',
        'title',
        'message',
        'channels',
        'priority',
        'icon_type',
        'icon_color',
        'icon_bg',
        'action_text',
        'variables',
        'category',
        'is_active',
        'version',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'channels' => 'array',
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($template) {
            if (Auth::check()) {
                $template->created_by = Auth::id();
                $template->updated_by = Auth::id();
            }
            $template->version = 1;
        });

        static::updating(function ($template) {
            if (Auth::check()) {
                $template->updated_by = Auth::id();
            }
            $template->version = ($template->version ?? 1) + 1;
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByKey($query, string $key)
    {
        return $query->where('template_key', $key);
    }

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Helper: Parse template variables
    public function parseVariables(array $data): array
    {
        $title = $this->title;
        $message = $this->message;
        $actionUrl = $data['action_url'] ?? null;

        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $title = str_replace($placeholder, $value, $title);
            $message = str_replace($placeholder, $value, $message);
            if ($actionUrl) {
                $actionUrl = str_replace($placeholder, $value, $actionUrl);
            }
        }

        return [
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
        ];
    }

    // Helper: Get available variables as array
    public function getVariableList(): array
    {
        return $this->variables ?? [];
    }

    // Helper: Duplicate template
    public function duplicate(string $newKey, string $newName): self
    {
        $newTemplate = $this->replicate();
        $newTemplate->template_key = $newKey;
        $newTemplate->name = $newName;
        $newTemplate->version = 1;
        $newTemplate->is_active = false; // Start as inactive
        $newTemplate->save();

        return $newTemplate;
    }
}