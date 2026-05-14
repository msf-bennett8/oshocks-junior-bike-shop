<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class AttachmentUploadService
{
    protected CloudinaryService $cloudinary;

    // Industry best practice: 10MB max for documents, 5MB for images
    protected const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    protected const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB

    protected const ALLOWED_MIMES = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf',
        'text/plain', 'text/csv',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip', 'application/x-zip-compressed',
        // Media
        'video/mp4', 'video/webm',
        'audio/mpeg', 'audio/wav', 'audio/mp3',
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
     * Validate file before upload - security first
     */
    public function validateFile(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());
        $name = $file->getClientOriginalName();

        // Check extension blocklist
        if (in_array($ext, self::BLOCKED_EXTENSIONS)) {
            return ['valid' => false, 'error' => "File extension '.{$ext}' is blocked for security."];
        }

        // Double extension check (e.g., file.jpg.exe)
        $nameParts = explode('.', $name);
        if (count($nameParts) > 2) {
            $lastTwo = strtolower($nameParts[count($nameParts) - 2] . '.' . end($nameParts));
            foreach (self::BLOCKED_EXTENSIONS as $blocked) {
                if (str_contains($lastTwo, $blocked)) {
                    return ['valid' => false, 'error' => 'Suspicious file name detected. Please rename your file.'];
                }
            }
        }

        // MIME type validation
        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIMES)) {
            return ['valid' => false, 'error' => "File type '{$mime}' is not allowed."];
        }

        // Size validation
        $isImage = str_starts_with($mime, 'image/');
        $maxSize = $isImage ? self::MAX_IMAGE_SIZE : self::MAX_FILE_SIZE;

        if ($file->getSize() > $maxSize) {
            $mb = $maxSize / 1024 / 1024;
            return ['valid' => false, 'error' => "File too large. Maximum size for " . ($isImage ? 'images' : 'documents') . " is {$mb}MB."];
        }

        // Virus scan placeholder - integrate ClamAV/VirusTotal here
        // TODO: Implement virus scanning before production
        // $scanResult = $this->scanForVirus($file);

        return ['valid' => true, 'error' => null];
    }

    /**
     * Upload attachment to Cloudinary cases folder
     */
    public function uploadCaseAttachment(UploadedFile $file, string $caseId, ?string $messageId = null): array
    {
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        try {
            $folder = "oshocks/cases/{$caseId}";
            $isImage = str_starts_with($file->getMimeType(), 'image/');
            $resourceType = $isImage ? 'image' : 'raw';

            // Use CloudinaryService with raw type for non-images
            $result = $this->cloudinary->uploadFile($file, $folder, [
                'resource_type' => $resourceType,
                'public_id' => $this->generatePublicId($file, $caseId),
            ]);

            if (!$result['success']) {
                return ['success' => false, 'error' => $result['error'] ?? 'Upload failed'];
            }

            return [
                'success' => true,
                'public_id' => $result['public_id'],
                'secure_url' => $result['url'],
                'resource_type' => $resourceType,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'width' => $result['width'] ?? null,
                'height' => $result['height'] ?? null,
                'folder_path' => $folder,
                'format' => $result['format'] ?? $ext,
            ];

        } catch (Exception $e) {
            Log::error('Attachment upload failed', [
                'case_id' => $caseId,
                'file' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => 'Upload failed: ' . $e->getMessage()];
        }
    }

    /**
     * Delete attachment from Cloudinary
     */
    public function deleteAttachment(string $publicId, string $resourceType = 'raw'): bool
    {
        try {
            return $this->cloudinary->deleteFile($publicId, $resourceType);
        } catch (Exception $e) {
            Log::error('Attachment delete failed', [
                'public_id' => $publicId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Generate unique public ID for Cloudinary
     */
    protected function generatePublicId(UploadedFile $file, string $caseId): string
    {
        $timestamp = now()->format('Ymd_His');
        $random = substr(uniqid(), -6);
        $safeName = preg_replace('/[^a-zA-Z0-9]/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $safeName = substr($safeName, 0, 30); // Limit length

        return "{$caseId}_{$timestamp}_{$random}_{$safeName}";
    }
}
