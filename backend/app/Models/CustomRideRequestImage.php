<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomRideRequestImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_ride_request_id',
        'public_id',
        'secure_url',
        'url',
        'original_name',
        'mime_type',
        'file_size',
        'width',
        'height',
        'format',
        'folder_path',
        'display_order',
        'is_primary',
        'guest_session_id' ,
        'guest_name',
        'guest_email',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'display_order' => 'integer',
        'is_primary' => 'boolean',
    ];

    public function customRideRequest(): BelongsTo
    {
        return $this->belongsTo(CustomRideRequest::class);
    }

    public function getCloudinaryUrlAttribute(): string
    {
        return $this->secure_url ?? $this->url ?? '';
    }
}
