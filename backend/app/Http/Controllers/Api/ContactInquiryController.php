<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactInquiryRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\SupportCase;
use App\Models\SupportCaseHistory;
use App\Services\NotificationService;
use App\Services\SupportCaseIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContactInquiryController extends Controller
{
    protected SupportCaseIdService $idService;
    protected NotificationService $notificationService;

    public function __construct(
        SupportCaseIdService $idService,
        NotificationService $notificationService
    ) {
        $this->idService = $idService;
        $this->notificationService = $notificationService;
    }

    /**
     * Submit a contact inquiry
     * POST /api/v1/contact-inquiries
     *
     * Creates:
     * 1. SupportCase (type='inquiry')
     * 2. Conversation (or reuse existing)
     * 3. System message + user message
     * 4. Auto-route to department
     */
    public function store(StoreContactInquiryRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $user = auth()->user();
            $guestSessionId = $request->input('guest_session_id') ??
                             $request->header('X-Guest-Session-ID');

            if (!$user && !$guestSessionId) {
                $guestSessionId = 'guest_' . uniqid();
            }

            $validated = $request->validated();

            // ─── 1. Create Support Case ───
            $case = new SupportCase();
            $case->case_id = $this->idService->generate('inquiry');
            $case->case_type = 'inquiry';
            $case->status = 'new';
            $case->priority = $this->determinePriority($validated['category']);
            $case->subject = $validated['subject'];
            $case->description = $validated['message'];
            $case->user_id = $user?->id;
            $case->guest_session_id = $guestSessionId;
            $case->source = 'web';
            $case->department = $validated['department'] ?? $this->autoRouteDepartment($validated['category']);
            $case->metadata = [
                'category' => $validated['category'],
                'order_number' => $validated['order_number'] ?? null,
                'customer_name' => $validated['name'],
                'customer_phone' => $validated['phone'] ?? null,
                'customer_email' => $validated['email'],
            ];
            $case->save();

            // ─── 2. Create/Find Conversation ───
            $conversation = $this->getOrCreateConversation(
                $user?->id,
                $guestSessionId,
                $validated['name'],
                $validated['email']
            );

            $case->conversation_id = $conversation->id;
            $case->save();

            // ─── 3. Create Messages ───
            $systemMessage = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => null,
                'body' => "📨 New Inquiry Received\n\nCase: {$case->case_id}\nCategory: " . ucfirst($validated['category']) . "\nDepartment: " . ucfirst($case->department ?? 'General') . "\n\nWe'll respond shortly.",
                'type' => 'system',
                'metadata' => [
                    'event_type' => 'inquiry_created',
                    'case_id' => $case->case_id,
                    'category' => $validated['category'],
                ],
                'case_id' => $case->case_id,
            ]);

            $userMessage = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'sender_name' => $validated['name'],
                'sender_email' => $validated['email'],
                'body' => $validated['message'],
                'type' => 'text',
                'case_id' => $case->case_id,
            ]);

            // ─── 4. Send auto-reply notification ───
            $this->sendAutoReply($case, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for contacting us! We have received your inquiry and will respond within 24 hours.',
                'data' => [
                    'support_case' => $case->fresh(['conversation']),
                    'system_message' => $systemMessage,
                    'user_message' => $userMessage,
                    'case_id' => $case->case_id,
                ],
            ], 201);
        });
    }

    /**
     * Get my inquiries
     * GET /api/v1/contact-inquiries/my-inquiries
     */
    public function myInquiries(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = SupportCase::with(['conversation'])
            ->where('case_type', 'inquiry')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('conversation', function ($cq) use ($user) {
                      $cq->where('user_id', $user->id);
                  });
            });

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $inquiries = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $inquiries,
        ]);
    }

    /**
     * Get inquiry queue (admin/agent)
     * GET /api/v1/contact-inquiries/queue
     */
    public function queue(Request $request): JsonResponse
    {
        $query = SupportCase::with(['conversation', 'user'])
            ->where('case_type', 'inquiry')
            ->when($request->has('department'), function ($q) use ($request) {
                return $q->where('department', $request->input('department'));
            })
            ->when($request->has('status'), function ($q) use ($request) {
                return $q->where('status', $request->input('status'));
            })
            ->orderBy('created_at', 'desc');

        $inquiries = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $inquiries,
        ]);
    }

    /**
     * Determine priority based on category
     */
    protected function determinePriority(string $category): string
    {
        return match ($category) {
            'order', 'technical' => 'high',
            'partnership', 'wholesale' => 'medium',
            default => 'low',
        };
    }

    /**
     * Auto-route to department based on category
     */
    protected function autoRouteDepartment(string $category): string
    {
        return match ($category) {
            'order', 'shipping' => 'support',
            'product', 'technical' => 'support',
            'partnership', 'wholesale' => 'sales',
            'feedback' => 'general',
            default => 'general',
        };
    }

    /**
     * Get or create conversation
     */
    protected function getOrCreateConversation(?int $userId, ?string $guestSessionId, string $name, ?string $email): Conversation
    {
        $query = Conversation::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        }

        $conversation = $query->where('type', 'support')->latest()->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'type' => 'support',
                'title' => 'Contact Inquiry',
                'created_by' => $userId ?? 1,
                'user_id' => $userId,
                'guest_session_id' => $guestSessionId,
                'guest_name' => $name,
                'guest_email' => $email,
                'last_message_at' => now(),
            ]);
        }

        return $conversation;
    }

    /**
     * Send auto-reply to customer
     */
    protected function sendAutoReply(SupportCase $case, array $data): void
    {
        try {
            $user = $case->user_id ? \App\Models\User::find($case->user_id) : null;

            // ─── Send via NotificationService (existing) ───
            $this->notificationService->send(
                recipient: $user,
                guestEmail: $data['email'],
                guestPhone: $data['phone'] ?? null,
                template: 'inquiry_received',
                data: [
                    'case_id' => $case->case_id,
                    'subject' => $data['subject'],
                    'category' => $data['category'],
                    'customer_name' => $data['name'],
                ]
            );

            // ─── Send Laravel Notification (new - for in-app + email) ───
            if ($user) {
                $user->notify(new \App\Notifications\ContactInquiryReceived($case));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send inquiry auto-reply', [
                'case_id' => $case->case_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
