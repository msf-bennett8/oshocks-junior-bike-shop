<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommunityPostImage extends Model
{
    use HasFactory;

    protected $table = 'community_post_images';

    protected $fillable = [
        'post_code',
        'cloudinary_public_id',
        'cloudinary_secure_url',
        'cloudinary_thumbnail_url',
        'cloudinary_medium_url',
        'original_name',
        'folder_path',
        'format',
        'width',
        'height',
        'file_size',
        'caption',
        'display_order',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
        'file_size' => 'integer',
        'display_order' => 'integer',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'post_code', 'post_code');
    }

    /**
     * Get human-readable file size
     */
    public function getHumanReadableSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if (!$bytes) return '—';
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;
        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }
        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }
}
