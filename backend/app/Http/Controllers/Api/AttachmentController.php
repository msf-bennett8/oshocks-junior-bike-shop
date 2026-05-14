<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttachmentUploadService;
use App\Models\MessageAttachment;
use App\Models\SupportCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AttachmentController extends Controller
{
    protected AttachmentUploadService $uploadService;

    public function __construct(AttachmentUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    /**
     * Upload attachment for a case (pre-case creation or message attachment)
     */
    public function uploadCaseAttachment(Request $request, string $caseId)
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $case = SupportCase::find($caseId);
        if (!$case) {
            return response()->json(['message' => 'Case not found'], 404);
        }

        $file = $request->file('file');
        $result = $this->uploadService->uploadCaseAttachment($file, $caseId);

        if (!$result['success']) {
            return response()->json(['message' => $result['error']], 422);
        }

        // Create attachment record (message_id will be linked later)
        $attachment = MessageAttachment::create([
            'message_id' => $request->input('message_id'), // nullable until message created
            'file_name' => $result['original_name'],
            'file_path' => $result['secure_url'],
            'file_type' => $result['resource_type'] === 'image' ? 'image' : 'document',
            'mime_type' => $result['mime_type'],
            'file_size' => $result['file_size'],
            'cloudinary_public_id' => $result['public_id'],
            'cloudinary_secure_url' => $result['secure_url'],
            'cloudinary_resource_type' => $result['resource_type'],
            'original_name' => $result['original_name'],
            'width' => $result['width'],
            'height' => $result['height'],
            'folder_path' => $result['folder_path'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $attachment,
        ]);
    }

    /**
     * Get attachment by ID
     */
    public function show(string $id)
    {
        $attachment = MessageAttachment::findOrFail($id);
        return response()->json(['data' => $attachment]);
    }

    /**
     * Delete attachment
     */
    public function destroy(string $id)
    {
        $attachment = MessageAttachment::findOrFail($id);

        // Delete from Cloudinary
        if ($attachment->cloudinary_public_id) {
            $this->uploadService->deleteAttachment(
                $attachment->cloudinary_public_id,
                $attachment->cloudinary_resource_type
            );
        }

        $attachment->delete();

        return response()->json(['success' => true]);
    }
}
