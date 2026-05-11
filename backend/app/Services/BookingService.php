<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\ServiceBooking;
use App\Models\SupportCase;
use App\Models\SupportCaseHistory;
use App\Models\User;
use App\Events\SupportCaseUpdated;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BookingService
{
    protected NotificationService $notificationService;
    protected SupportCaseIdService $idService;

    public function __construct(
        NotificationService $notificationService,
        SupportCaseIdService $idService
    ) {
        $this->notificationService = $notificationService;
        $this->idService = $idService;
    }

    /**
     * Create a service booking with full conversation thread
     *
     * Flow:
     * 1. Create SupportCase (type='service')
     * 2. Create Conversation (or use existing)
     * 3. Create ServiceBooking linked to case
     * 4. Create system message in conversation
     * 5. Return everything
     */
    public function createBooking(array $data, ?User $user = null, ?string $guestSessionId = null): array
    {
        return DB::transaction(function () use ($data, $user, $guestSessionId) {
            $userId = $user?->id;
            $now = now();

            // ─── STEP 1: Create or Find Conversation FIRST ───
            $conversation = $this->getOrCreateConversation($userId, $guestSessionId, null);

            // ─── STEP 2: Create Support Case with conversation_id ───
            $case = new SupportCase();
            $case->case_id = $this->idService->generate('service');
            $case->case_type = 'service';
            $case->status = 'new';
            $case->priority = 'medium';
            $case->subject = 'Service Booking: ' . $data['service_type'];
            $case->description = $data['service_description'] ?? 'No additional details provided.';
            $case->user_id = $userId;
            $case->guest_session_id = $guestSessionId;
            $case->source = 'web';
            $case->appointment_status = 'pending';
            $case->appointment_at = $data['requested_date'] ?? null;
            $case->service_details = [
                'service_type' => $data['service_type'],
                'requested_date' => $data['requested_date'] ?? null,
                'preferred_time' => $data['preferred_time'] ?? null,
                'shop_location' => $data['shop_location'] ?? null,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
            ];
            $case->conversation_id = $conversation->id;
            $case->save();

            // ─── STEP 3: Create Service Booking Record ───
            $booking = ServiceBooking::create([
                'case_id' => $case->case_id,
                'service_type' => $data['service_type'],
                'service_description' => $data['service_description'] ?? null,
                'estimated_price' => $data['estimated_price'] ?? null,
                'requested_date' => $data['requested_date'] ?? null,
                'preferred_time' => $data['preferred_time'] ?? null,
                'seller_id' => $data['seller_id'] ?? null,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'guest_session_id' => $guestSessionId,
                'status' => 'pending',
                'shop_location' => $data['shop_location'] ?? null,
                'customer_notes' => $data['customer_notes'] ?? null,
            ]);

            // ─── STEP 4: Create System Message ───
            $systemMessage = $this->createBookingSystemMessage($conversation->id, $case, $booking);

            // ─── STEP 5: Create Initial User Message (if notes provided) ───
            $userMessage = null;
            if (!empty($data['customer_notes'])) {
                $userMessage = Message::create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $userId,
                    'guest_session_id' => $guestSessionId,
                    'sender_name' => $data['customer_name'],
                    'sender_email' => $data['customer_email'] ?? null,
                    'body' => $data['customer_notes'],
                    'type' => 'text',
                    'case_id' => $case->case_id,
                ]);
            }

            // ─── STEP 6: Broadcast & Notify ───
            broadcast(new SupportCaseUpdated($case, 'created', $userId))->toOthers();

            // Send notification (email/SMS placeholder ready)
            $this->notifyBookingCreated($case, $booking, $user);

            return [
                'support_case' => $case->fresh(['serviceBooking', 'conversation']),
                'conversation' => $conversation->fresh(),
                'service_booking' => $booking->fresh(['seller']),
                'system_message' => $systemMessage,
                'user_message' => $userMessage,
            ];
        });
    }

    /**
     * Confirm a booking (staff action)
     */
    public function confirmBooking(string $caseId, array $data, User $staff): array
    {
        return DB::transaction(function () use ($caseId, $data, $staff) {
            $case = SupportCase::where('case_id', $caseId)
                ->where('case_type', 'service')
                ->firstOrFail();

            $booking = $case->serviceBooking;
            if (!$booking) {
                throw new \Exception('Service booking not found for this case.');
            }

            $oldStatus = $case->appointment_status;

            // Update case
            $case->appointment_status = 'confirmed';
            $case->staff_confirmed_at = now();
            $case->status = 'open';
            $case->assigned_to = $staff->id;
            $case->service_agent_id = $data['assigned_mechanic_id'] ?? $staff->id;
            $case->save();

            // Update booking
            $booking->status = 'confirmed';
            $booking->confirmed_date = $data['confirmed_date'];
            $booking->confirmed_time = $data['confirmed_time'] ?? null;
            $booking->assigned_mechanic_id = $data['assigned_mechanic_id'] ?? $staff->id;
            $booking->staff_notes = $data['staff_notes'] ?? null;
            $booking->final_price = $data['final_price'] ?? $booking->estimated_price;
            $booking->save();

            // Log history
            SupportCaseHistory::create([
                'case_id' => $case->case_id,
                'changed_by' => $staff->id,
                'from_status' => $case->status,
                'to_status' => 'open',
                'reason' => 'Booking confirmed by staff. Date: ' . $data['confirmed_date'],
                'metadata' => [
                    'confirmed_date' => $data['confirmed_date'],
                    'assigned_mechanic_id' => $data['assigned_mechanic_id'] ?? null,
                ],
            ]);

            // Create system message
            $systemMessage = Message::create([
                'conversation_id' => $case->conversation_id,
                'sender_id' => null,
                'body' => "✅ Appointment Confirmed\n\nDate: {$data['confirmed_date']}\n" .
                         (!empty($data['confirmed_time']) ? "Time: {$data['confirmed_time']}\n" : '') .
                         "Staff: {$staff->name}\n\nPlease arrive 10 minutes early.",
                'type' => 'system',
                'metadata' => [
                    'event_type' => 'booking_confirmed',
                    'case_id' => $case->case_id,
                    'confirmed_date' => $data['confirmed_date'],
                ],
                'case_id' => $case->case_id,
            ]);

            // Broadcast
            broadcast(new SupportCaseUpdated($case, 'booking_confirmed', $staff->id))->toOthers();

            // Notify customer
            $this->notifyBookingConfirmed($case, $booking);

            return [
                'support_case' => $case->fresh(),
                'service_booking' => $booking->fresh(),
                'system_message' => $systemMessage,
            ];
        });
    }

    /**
     * Reschedule a booking
     */
    public function rescheduleBooking(string $caseId, array $data, User $staff): array
    {
        return DB::transaction(function () use ($caseId, $data, $staff) {
            $case = SupportCase::where('case_id', $caseId)->firstOrFail();
            $booking = $case->serviceBooking;

            $oldDate = $booking->confirmed_date?->format('Y-m-d H:i') ?? 'Not set';

            $case->appointment_status = 'rescheduled';
            $case->appointment_at = $data['new_date'];
            $case->save();

            $booking->status = 'rescheduled';
            $booking->confirmed_date = $data['new_date'];
            $booking->staff_notes = ($booking->staff_notes ? $booking->staff_notes . "\n" : '') .
                                    "Rescheduled by {$staff->name} from {$oldDate} to {$data['new_date']}";
            $booking->save();

            // System message
            $systemMessage = Message::create([
                'conversation_id' => $case->conversation_id,
                'sender_id' => null,
                'body' => "📅 Appointment Rescheduled\n\nNew Date: {$data['new_date']}\n" .
                         ($data['reason'] ? "Reason: {$data['reason']}" : ''),
                'type' => 'system',
                'metadata' => ['event_type' => 'booking_rescheduled'],
                'case_id' => $case->case_id,
            ]);

            broadcast(new SupportCaseUpdated($case, 'booking_rescheduled', $staff->id))->toOthers();

            return [
                'support_case' => $case->fresh(),
                'service_booking' => $booking->fresh(),
                'system_message' => $systemMessage,
            ];
        });
    }

    /**
     * Mark booking as completed
     */
    public function completeBooking(string $caseId, User $staff): array
    {
        return DB::transaction(function () use ($caseId, $staff) {
            $case = SupportCase::where('case_id', $caseId)->firstOrFail();
            $booking = $case->serviceBooking;

            $case->appointment_status = 'completed';
            $case->status = 'resolved';
            $case->resolved_at = now();
            $case->resolved_by = $staff->id;
            $case->save();

            $booking->status = 'completed';
            $booking->completed_date = now();
            $booking->save();

            $systemMessage = Message::create([
                'conversation_id' => $case->conversation_id,
                'sender_id' => null,
                'body' => "✅ Service Completed\n\nThank you for choosing Oshocks! Your service has been completed.",
                'type' => 'system',
                'metadata' => ['event_type' => 'booking_completed'],
                'case_id' => $case->case_id,
            ]);

            broadcast(new SupportCaseUpdated($case, 'booking_completed', $staff->id))->toOthers();

            return [
                'support_case' => $case->fresh(),
                'service_booking' => $booking->fresh(),
                'system_message' => $systemMessage,
            ];
        });
    }

    /**
     * Cancel a booking
     */
    public function cancelBooking(string $caseId, string $reason, ?User $user = null): array
    {
        return DB::transaction(function () use ($caseId, $reason, $user) {
            $case = SupportCase::where('case_id', $caseId)->firstOrFail();
            $booking = $case->serviceBooking;

            $case->appointment_status = 'cancelled';
            $case->status = 'closed';
            $case->closed_at = now();
            $case->save();

            $booking->status = 'cancelled';
            $booking->cancelled_date = now();
            $booking->staff_notes = ($booking->staff_notes ? $booking->staff_notes . "\n" : '') .
                                    "Cancelled: {$reason}";
            $booking->save();

            $systemMessage = Message::create([
                'conversation_id' => $case->conversation_id,
                'sender_id' => null,
                'body' => "❌ Appointment Cancelled\n\nReason: {$reason}",
                'type' => 'system',
                'metadata' => ['event_type' => 'booking_cancelled'],
                'case_id' => $case->case_id,
            ]);

            broadcast(new SupportCaseUpdated($case, 'booking_cancelled', $user?->id))->toOthers();

            return [
                'support_case' => $case->fresh(),
                'service_booking' => $booking->fresh(),
                'system_message' => $systemMessage,
            ];
        });
    }

    /**
     * Get or create conversation for booking
     */
    protected function getOrCreateConversation(?int $userId, ?string $guestSessionId, ?string $caseId): Conversation
    {
        // Try to find existing conversation for this user/guest
        $query = Conversation::query();

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        }

        $conversation = $query->where('type', 'support')
            ->latest()
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'type' => 'support',
                'title' => 'Service Booking',
                'created_by' => $userId ?? 1, // Default to system user if guest
                'user_id' => $userId,
                'guest_session_id' => $guestSessionId,
                'guest_name' => request()->input('customer_name'),
                'guest_email' => request()->input('customer_email'),
                'last_message_at' => now(),
            ]);
        }

        return $conversation;
    }

    /**
     * Create system message for new booking
     */
    protected function createBookingSystemMessage(int $conversationId, SupportCase $case, ServiceBooking $booking): Message
    {
        $details = $case->service_details ?? [];
        $body = "🔧 New Service Booking Created\n\n" .
                "Case: {$case->case_id}\n" .
                "Service: {$booking->service_type}\n" .
                "Requested Date: " . ($booking->requested_date?->format('M j, Y g:i A') ?? 'Not specified') . "\n" .
                "Status: Pending Confirmation\n\n" .
                "Our team will review and confirm your appointment shortly.";

        return Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => null,
            'body' => $body,
            'type' => 'system',
            'metadata' => [
                'event_type' => 'booking_created',
                'case_id' => $case->case_id,
                'service_type' => $booking->service_type,
            ],
            'case_id' => $case->case_id,
        ]);
    }

    /**
     * Notify customer of booking creation
     */
    protected function notifyBookingCreated(SupportCase $case, ServiceBooking $booking, ?User $user): void
    {
        try {
            NotificationService::sendGuestNotification(
                $user,
                $booking->customer_email,
                $booking->customer_phone,
                'booking_created',
                [
                    'case_id' => $case->case_id,
                    'service_type' => $booking->service_type,
                    'requested_date' => $booking->requested_date?->format('M j, Y'),
                    'customer_name' => $booking->customer_name,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to send booking creation notification', [
                'case_id' => $case->case_id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Notify customer of booking confirmation
     */
    protected function notifyBookingConfirmed(SupportCase $case, ServiceBooking $booking): void
    {
        try {
            $user = $case->user_id ? User::find($case->user_id) : null;

            NotificationService::sendGuestNotification(
                $user,
                $booking->customer_email,
                $booking->customer_phone,
                'booking_confirmed',
                [
                    'case_id' => $case->case_id,
                    'service_type' => $booking->service_type,
                    'confirmed_date' => $booking->confirmed_date?->format('M j, Y g:i A'),
                    'shop_location' => $booking->shop_location,
                    'customer_name' => $booking->customer_name,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to send booking confirmation notification', [
                'case_id' => $case->case_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
