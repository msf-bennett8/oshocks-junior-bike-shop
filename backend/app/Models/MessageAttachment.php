<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'thumbnail_path',
        'duration_seconds',
        'cloudinary_public_id',
        'cloudinary_secure_url',
        'cloudinary_resource_type',
        'original_name',
        'width',
        'height',
        'folder_path',
    ];

    protected $appends = ['file_url', 'thumbnail_url', 'human_readable_size', 'is_image'];

    protected $casts = [
        'file_size' => 'integer',
        'duration_seconds' => 'integer',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function getFileUrl(): string
    {
        return \Storage::url($this->file_path);
    }

    public function getThumbnailUrl(): ?string
    {
        return $this->thumbnail_path ? \Storage::url($this->thumbnail_path) : null;
    }

    public function getHumanReadableSize(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;

        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }

        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }

    public function getFileUrlAttribute(): string
    {
        return $this->cloudinary_secure_url ?? \Storage::url($this->file_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if ($this->cloudinary_resource_type === 'image' && $this->cloudinary_public_id) {
            return $this->getCloudinaryThumbnailUrl();
        }
        return $this->thumbnail_path ? \Storage::url($this->thumbnail_path) : null;
    }

    public function getIsImageAttribute(): bool
    {
        return $this->file_type === 'image' || str_starts_with($this->mime_type ?? '', 'image/');
    }

    public function getCloudinaryThumbnailUrl(): ?string
    {
        if (!$this->cloudinary_public_id) return null;
        try {
            $cloudinary = app(CloudinaryService::class);
            return $cloudinary->getTransformedUrl($this->cloudinary_public_id, 'thumbnail');
        } catch (\Exception $e) {
            return $this->cloudinary_secure_url;
        }
    }
}
