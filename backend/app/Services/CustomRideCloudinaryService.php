<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Custom Ride Request Image Upload Service
 * Uses the existing CloudinaryService wrapper (NOT the Laravel package binding)
 * Stores images in: oshocks/rides/custom_ride_requests/{requestId}/
 */
class CustomRideCloudinaryService
{
    protected CloudinaryService $cloudinary;

    // Industry best practice: 10MB max
    protected const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

    protected const ALLOWED_IMAGE_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    ];

    protected const BLOCKED_EXTENSIONS = [
        'exe', 'dll', 'bat', 'cmd', 'sh', 'php', 'js', 'html', 'htm',
        'jar', 'apk', 'ipa', 'scr', 'vbs', 'ps1', 'msi', 'com',
    ];

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Validate image before upload
     */
    public function validateImage(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $name = $file->getClientOriginalName();

        if (in_array($ext, self::BLOCKED_EXTENSIONS)) {
            return ['valid' => false, 'error' => "File extension '.{$ext}' is blocked."];
        }

        $nameParts = explode('.', $name);
        if (count($nameParts) > 2) {
            $lastTwo = strtolower($nameParts[count($nameParts) - 2] . '.' . end($nameParts));
            foreach (self::BLOCKED_EXTENSIONS as $blocked) {
                if (str_contains($lastTwo, $blocked)) {
                    return ['valid' => false, 'error' => 'Suspicious file name detected.'];
                }
            }
        }

        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_IMAGE_MIMES)) {
            return ['valid' => false, 'error' => "Only JPG, PNG, WebP, GIF allowed. Got: {$mime}"];
        }

        if ($file->getSize() > self::MAX_IMAGE_SIZE) {
            return ['valid' => false, 'error' => "Image too large. Max 10MB."];
        }

        return ['valid' => true, 'error' => null];
    }

    /**
     * Upload image to Cloudinary for custom ride requests
     */
    public function uploadImage(UploadedFile $file, string $requestId): array
    {
        $validation = $this->validateImage($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        try {
            $folder = "oshocks/rides/custom_ride_requests/{$requestId}";
            $originalName = $file->getClientOriginalName();
            $safeName = preg_replace('/[^a-zA-Z0-9]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
            $safeName = substr($safeName, 0, 20);
            $publicId = "{$requestId}_{$safeName}_" . substr(uniqid(), -6);

            $result = $this->cloudinary->uploadFile($file, $folder, [
                'resource_type' => 'image',
                'public_id' => $publicId,
            ]);

            if (!$result['success']) {
                return ['success' => false, 'error' => $result['error'] ?? 'Upload failed'];
            }

            Log::info('Custom ride image uploaded', [
                'request_id' => $requestId,
                'public_id' => $result['public_id'],
            ]);

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'secure_url' => $result['url'],
                'url' => $result['url'],
                'thumbnail_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'thumbnail'),
                'medium_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'medium'),
                'original_name' => $originalName,
                'folder_path' => $folder,
                'format' => $result['format'],
                'width' => $result['width'],
                'height' => $result['height'],
                'bytes' => $result['bytes'],
            ];

        } catch (Exception $e) {
            Log::error('Custom ride image upload failed', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Delete image from Cloudinary
     */
    public function deleteImage(string $publicId): bool
    {
        try {
            return $this->cloudinary->deleteFile($publicId, 'image');
        } catch (Exception $e) {
            Log::error('Failed to delete custom ride image', [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Delete all images for a ride request
     */
    public function deleteAllImages(string $requestId): bool
    {
        try {
            $images = \App\Models\CustomRideRequestImage::whereHas('customRideRequest', function ($q) use ($requestId) {
                $q->where('request_id', $requestId);
            })->get();

            foreach ($images as $image) {
                $this->deleteImage($image->public_id);
                $image->delete();
            }
            return true;
        } catch (Exception $e) {
            Log::error('Custom ride bulk delete failed', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
