<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Exception;

class BikeImageUploadService
{
    protected CloudinaryService $cloudinary;

    // Industry best practice: 10MB max for bike listing images
    protected const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

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
     * Validate image before upload - security first
     */
    public function validateImage(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $name = $file->getClientOriginalName();

        // Check extension blocklist
        if (in_array($ext, self::BLOCKED_EXTENSIONS)) {
            return ['valid' => false, 'error' => "File extension '.{$ext}' is blocked for security."];
        }

        // Double extension check
        $nameParts = explode('.', $name);
        if (count($nameParts) > 2) {
            $lastTwo = strtolower($nameParts[count($nameParts) - 2] . '.' . end($nameParts));
            foreach (self::BLOCKED_EXTENSIONS as $blocked) {
                if (str_contains($lastTwo, $blocked)) {
                    return ['valid' => false, 'error' => 'Suspicious file name detected.'];
                }
            }
        }

        // MIME type validation
        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_IMAGE_MIMES)) {
            return ['valid' => false, 'error' => "Only JPG, PNG, WebP, GIF allowed. Got: {$mime}"];
        }

        // Size validation
        if ($file->getSize() > self::MAX_IMAGE_SIZE) {
            return ['valid' => false, 'error' => "Image too large. Max 10MB."];
        }

        return ['valid' => true, 'error' => null];
    }

    /**
     * Upload bike listing image to Cloudinary
     * Stores in: oshocks/bikes/listed_bikes/{listingCode}/
     */
    public function uploadBikeImage(UploadedFile $file, string $listingCode): array
    {
        $validation = $this->validateImage($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        try {
            $folder = "oshocks/bikes/listed_bikes/{$listingCode}";

            $result = $this->cloudinary->uploadFile($file, $folder, [
                'resource_type' => 'image',
                'public_id' => $this->generatePublicId($file, $listingCode),
            ]);

            if (!$result['success']) {
                return ['success' => false, 'error' => $result['error'] ?? 'Upload failed'];
            }

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'secure_url' => $result['url'],
                'thumbnail_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'thumbnail'),
                'medium_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'medium'),
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'file_size' => $result['bytes'],
                'original_name' => $file->getClientOriginalName(),
                'folder_path' => $folder,
            ];

        } catch (Exception $e) {
            Log::error('Bike image upload failed', [
                'listing_code' => $listingCode,
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => 'Upload failed: ' . $e->getMessage()];
        }
    }

    /**
     * Upload base64 image for bike listing
     */
    public function uploadBase64BikeImage(string $base64String, string $listingCode): array
    {
        try {
            $folder = "oshocks/bikes/listed_bikes/{$listingCode}";

            $result = $this->cloudinary->uploadBase64($base64String, [
                'folder' => $folder,
                'resource_type' => 'image',
            ]);

            if (!$result['success']) {
                return ['success' => false, 'error' => $result['error'] ?? 'Upload failed'];
            }

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'secure_url' => $result['secure_url'],
                'thumbnail_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'thumbnail'),
                'medium_url' => $this->cloudinary->getTransformedUrl($result['public_id'], 'medium'),
                'width' => $result['width'],
                'height' => $result['height'],
                'format' => $result['format'],
                'file_size' => $result['bytes'],
                'folder_path' => $folder,
            ];

        } catch (Exception $e) {
            Log::error('Bike base64 image upload failed', [
                'listing_code' => $listingCode,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => 'Upload failed: ' . $e->getMessage()];
        }
    }

    /**
     * Delete bike image from Cloudinary
     */
    public function deleteBikeImage(string $publicId): bool
    {
        try {
            return $this->cloudinary->deleteFile($publicId, 'image');
        } catch (Exception $e) {
            Log::error('Bike image delete failed', [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Generate unique public ID
     */
    protected function generatePublicId(UploadedFile $file, string $listingCode): string
    {
        $timestamp = now()->format('Ymd_His');
        $random = substr(uniqid(), -6);
        $safeName = preg_replace('/[^a-zA-Z0-9]/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $safeName = substr($safeName, 0, 20);

        return "{$listingCode}_{$timestamp}_{$random}_{$safeName}";
    }
}
