<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\MessageModerationService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $messages = $conversation->messages()
            ->with(['sender', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(50);

        return response()->json([
            'data' => $messages->items(),
            'next_cursor' => $messages->nextCursor()?->encode(),
        ]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$this->canAccess($user, $guestSessionId, $conversation)) {
            abort(403, 'Not a participant in this conversation');
        }

        $validated = $request->validate([
            'body' => 'required|string|max:5000',
            'type' => 'in:text,image,file,call_invite,system',
            'metadata' => 'nullable|array',
            'sender_name' => 'nullable|string|max:100',
            'sender_email' => 'nullable|email|max:255',
            'attachment_file' => 'nullable|file|max:10240',
            'case_id' => 'nullable|string|size:13',
        ]);

        // Run moderation check
        $moderationService = app(MessageModerationService::class);
        $moderationResult = $moderationService->analyze($validated['body']);

        // Prevent duplicate messages within 5 seconds (same sender, same body, same conversation)
        $recentDuplicate = Message::where('conversation_id', $conversation->id)
            ->where('body', $validated['body'])
            ->where(function ($q) use ($user, $guestSessionId) {
                if ($user) {
                    $q->where('sender_id', $user->id);
                } else {
                    $q->where('guest_session_id', $guestSessionId);
                }
            })
            ->where('created_at', '>', now()->subSeconds(5))
            ->first();

        if ($recentDuplicate) {
            \Log::warning('Duplicate message blocked', ['original_id' => $recentDuplicate->id]);
            return response()->json([
                'data' => $recentDuplicate->load('sender'),
                'warning' => 'Duplicate message detected',
            ], 200);
        }

        // Resolve guest name from headers or request body
        $guestName = null;
        if (!$user && $guestSessionId) {
            $guestName = $request->header('X-Guest-Name')
                ?? $validated['sender_name']
                ?? 'Guest';
            // Ensure anon prefix for tracking if not already set
            if ($guestName === 'Guest' && $guestSessionId) {
                $parts = explode('_', $guestSessionId);
                $lastPart = end($parts);
                if (strlen($lastPart) >= 4) {
                    $guestName = 'anon' . substr($lastPart, 0, 4);
                }
            }
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'guest_session_id' => $user ? null : $guestSessionId,
            'sender_name' => $user ? null : $guestName,
            'sender_email' => $validated['sender_email'] ?? null,
            'body' => $validated['body'],
            'type' => $validated['type'] ?? 'text',
            'metadata' => array_merge(
                $validated['metadata'] ?? [],
                ['moderation' => $moderationResult]
            ),
        ]);

        // Flag conversation if violations detected
        if ($moderationResult['requires_review']) {
            $conversation->update([
                'flagged_for_review' => true,
                'detected_keywords' => $moderationResult['detected_keywords'],
                'moderation_notes' => 'Auto-flagged: ' . implode(', ', $moderationResult['violations']),
            ]);
        }

        // ─── HANDLE ATTACHMENT UPLOAD FOR MESSAGE ───
        if ($request->hasFile('attachment_file') && !empty($validated['case_id'])) {
            try {
                $uploadService = app(\App\Services\AttachmentUploadService::class);
                $attachmentResult = $uploadService->uploadCaseAttachment(
                    $request->file('attachment_file'),
                    $validated['case_id']
                );

                if ($attachmentResult['success']) {
                    \App\Models\MessageAttachment::create([
                        'message_id' => $message->id,
                        'file_name' => $attachmentResult['original_name'],
                        'file_path' => $attachmentResult['secure_url'],
                        'file_type' => $attachmentResult['resource_type'] === 'image' ? 'image' : 'document',
                        'mime_type' => $attachmentResult['mime_type'],
                        'file_size' => $attachmentResult['file_size'],
                        'cloudinary_public_id' => $attachmentResult['public_id'],
                        'cloudinary_secure_url' => $attachmentResult['secure_url'],
                        'cloudinary_resource_type' => $attachmentResult['resource_type'],
                        'original_name' => $attachmentResult['original_name'],
                        'width' => $attachmentResult['width'],
                        'height' => $attachmentResult['height'],
                        'folder_path' => $attachmentResult['folder_path'],
                    ]);

                    $message->load('attachments');
                }
            } catch (\Exception $e) {
                \Log::warning('Attachment upload failed for message', [
                    'message_id' => $message->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Update conversation last message timestamp
        $conversation->update(['last_message_at' => now()]);

        // Auto-track first response for support cases
        if ($conversation->supportCase && !$conversation->supportCase->first_response_at) {
            $isAgent = $user?->canHandleSupportCases() ?? false;
            $isNotCreator = $conversation->supportCase->user_id !== $user?->id;
            if ($isAgent && $isNotCreator) {
                $conversation->supportCase->update(['first_response_at' => now()]);
            }
        }

        // Broadcast to all participants on private channel
        $socketId = request()->header('X-Socket-ID');
        \Log::info('Broadcasting message', [
            'message_id' => $message->id,
            'socket_id' => $socketId,
            'to_others' => $socketId ? 'yes' : 'no (sender will receive own broadcast)',
        ]);
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Exception $e) {
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        $response = [
            'data' => $message->load('sender'),
        ];

        // Include warning if violations found
        if ($moderationResult['has_violations']) {
            $response['warning'] = $moderationService->getWarningMessage($moderationResult['violations']);
            $response['moderation'] = $moderationResult;
        }

        return response()->json($response, 201);
    }

    private function canAccess(?User $user, ?string $guestSessionId, Conversation $conversation): bool
    {
        // Admin/superadmin can access ALL conversations for monitoring
        if ($user && in_array($user->role, ['admin', 'super_admin'])) {
            return true;
        }

        if ($user) {
            $isParticipant = $conversation->participants()
                ->where('user_id', $user->id)
                ->exists();
            // Standardize: use created_by (not user_id) for ownership check
            $isOwner = $conversation->created_by === $user->id;
            return $isParticipant || $isOwner;
        }

        return $conversation->guest_session_id === $guestSessionId;
    }
}
