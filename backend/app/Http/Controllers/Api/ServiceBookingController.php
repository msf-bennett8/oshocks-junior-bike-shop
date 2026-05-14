<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceBookingRequest;
use App\Http\Requests\ConfirmBookingRequest;
use App\Models\ServiceBooking;
use App\Models\SupportCase;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ServiceBookingController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Create a new service booking
     * POST /api/v1/service-bookings
     */
    public function store(StoreServiceBookingRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $guestSessionId = $request->input('guest_session_id') ??
                             $request->header('X-Guest-Session-ID');

            // Generate guest session if not provided
            if (!$user && !$guestSessionId) {
                $guestSessionId = 'guest_' . uniqid();
            }

            $result = $this->bookingService->createBooking(
                data: $request->validated(),
                user: $user,
                guestSessionId: $guestSessionId
            );

            return response()->json([
                'success' => true,
                'message' => $result['conversation']
                    ? 'Service booking created. Our team will confirm your appointment shortly. Check your messages for updates.'
                    : 'Booking request received! Check your email for confirmation. Our team will contact you shortly.',
                'data' => [
                    'service_booking' => $result['service_booking'],
                    'support_case' => $result['support_case'],
                    'conversation' => $result['conversation'],
                    'system_message' => $result['system_message'],
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Service booking creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get all bookings (admin/agent/seller view)
     * GET /api/v1/service-bookings
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Role-based filtering
        $query = ServiceBooking::with(['supportCase', 'supportCase.conversation', 'seller', 'assignedMechanic', 'cancellationRequester', 'cancellationReviewer']);

        if ($user->role === 'seller') {
            // Sellers see only their shop's bookings
            $sellerProfile = $user->sellerProfile;
            if ($sellerProfile) {
                $query->where('seller_id', $sellerProfile->id);
            }
        } elseif (!in_array($user->role, ['admin', 'super_admin', 'support_agent'])) {
            // Regular users see only their own
            $query->whereHas('supportCase', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('cancellation_status')) {
            $query->where('cancellation_request_status', $request->input('cancellation_status'));
        }

        // Exclude scheduled-for-deletion from normal views unless explicitly requested
        if (!$request->has('include_scheduled')) {
            $query->whereNull('scheduled_for_deletion_at');
        }

        // Date range
        if ($request->has('from_date')) {
            $query->whereDate('requested_date', '>=', $request->input('from_date'));
        }
        if ($request->has('to_date')) {
            $query->whereDate('requested_date', '<=', $request->input('to_date'));
        }

        $bookings = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Get booking stats for inbox tabs
     * GET /api/v1/service-bookings/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Base query with same role-based filtering as index()
        $baseQuery = ServiceBooking::query();

        if ($user->role === 'seller') {
            $sellerProfile = $user->sellerProfile;
            if ($sellerProfile) {
                $baseQuery->where('seller_id', $sellerProfile->id);
            }
        } elseif (!in_array($user->role, ['admin', 'super_admin', 'support_agent'])) {
            $baseQuery->whereHas('supportCase', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Count by status
        $statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
        $counts = [];
        foreach ($statuses as $status) {
            $counts[$status] = (clone $baseQuery)->where('status', $status)->whereNull('scheduled_for_deletion_at')->count();
        }

        // Pending cancellation requests
        $counts['pending_review'] = (clone $baseQuery)
            ->where('cancellation_request_status', 'pending_review')
            ->whereNull('scheduled_for_deletion_at')
            ->count();

        // Scheduled for deletion (super admin only)
        $counts['scheduled'] = $user->hasSuperAdminAccess()
            ? (clone $baseQuery)->whereNotNull('scheduled_for_deletion_at')->count()
            : 0;

        // Total active (not scheduled for deletion)
        $counts['all'] = (clone $baseQuery)->whereNull('scheduled_for_deletion_at')->count();

        return response()->json([
            'success' => true,
            'data' => $counts,
        ]);
    }

    /**
     * Get single booking
     * GET /api/v1/service-bookings/{caseId}
     */
    public function show(string $caseId): JsonResponse
    {
        // Support both case_id (for case-linked) and id (for standalone)
        $booking = ServiceBooking::with(['supportCase', 'seller', 'assignedMechanic', 'cancellationRequester', 'cancellationReviewer'])
            ->where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })
            ->firstOrFail();

        // Load conversation for standalone bookings (conversation_id in metadata)
        if (!$booking->case_id && !empty($booking->metadata['conversation_id'])) {
            $booking->setRelation('conversation', \App\Models\Conversation::with(['participants', 'messages'])->find($booking->metadata['conversation_id']));
        }

        // Authorization check
        $user = auth()->user();
        if (!$this->canView($booking, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }

    /**
     * Confirm a booking (staff only)
     * POST /api/v1/service-bookings/{caseId}/confirm
     */
    public function confirm(ConfirmBookingRequest $request, string $caseId): JsonResponse
    {
        try {
            $result = $this->bookingService->confirmBooking(
                $caseId,
                $request->validated(),
                auth()->user()
            );

            // ─── Send notification to customer ───
            $booking = $result['service_booking'] ?? null;
            $supportCase = $result['support_case'] ?? null;

            if ($booking) {
                // Notify the customer (email/SMS regardless of case-linked or standalone)
                $customer = $supportCase?->user ?? ($booking->mergedToUser ?? null);
                if ($customer) {
                    $customer->notify(new \App\Notifications\ServiceBookingConfirmed($booking, $supportCase));
                }

                // Broadcast real-time update (only if case-linked)
                if ($supportCase) {
                    event(new \App\Events\SupportCaseUpdated(
                        $supportCase,
                        'appointment_confirmed',
                        auth()->id(),
                        [
                            'booking_id' => $booking->id,
                            'confirmed_date' => $booking->confirmed_date,
                            'seller_id' => $booking->seller_id,
                            'seller_name' => $booking->seller?->shop_name ?? null,
                        ]
                    ));
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking confirmed successfully. Customer has been notified.',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            Log::error('Booking confirmation failed', [
                'case_id' => $caseId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reschedule a booking (staff or customer)
     * POST /api/v1/service-bookings/{caseId}/reschedule
     */
    public function reschedule(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'new_date' => 'required|date|after_or_equal:today',
            'reason' => 'required|string|max:500',
        ]);

        $user = auth()->user();
        $booking = ServiceBooking::where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })->firstOrFail();

        // Authorization: staff can reschedule any, customers can reschedule their own
        $canReschedule = false;
        if ($user) {
            $canReschedule = in_array($user->role, ['admin', 'super_admin', 'support_agent'])
                || $booking->supportCase?->user_id === $user->id;
        }

        if (!$canReschedule) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        try {
            $result = $this->bookingService->rescheduleBooking(
                caseId: $caseId,
                data: $request->only(['new_date', 'reason']),
                staff: $user
            );

            return response()->json([
                'success' => true,
                'message' => 'Booking rescheduled successfully.',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Complete a booking
     * POST /api/v1/service-bookings/{caseId}/complete
     */
    public function complete(string $caseId): JsonResponse
    {
        try {
            $result = $this->bookingService->completeBooking(
                caseId: $caseId,
                staff: auth()->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Booking marked as completed.',
                'data' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Request cancellation (user) or approve/deny (staff)
     * POST /api/v1/service-bookings/{caseId}/cancel
     */
    public function cancel(Request $request, string $caseId): JsonResponse
    {
        $user = auth()->user();
        $booking = ServiceBooking::where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })->firstOrFail();

        // ─── STAFF: Approve or Deny a pending cancellation request ───
        if ($user && in_array($user->role, ['admin', 'super_admin', 'support_agent'])) {
            $request->validate([
                'action' => 'required|in:approve,deny',
                'denial_reason' => 'required_if:action,deny|string|max:500|nullable',
            ]);

            if ($booking->cancellation_request_status !== 'pending_review') {
                return response()->json([
                    'success' => false,
                    'message' => 'No pending cancellation request for this booking.',
                ], 400);
            }

            $action = $request->input('action');

            if ($action === 'approve') {
                $result = $this->bookingService->cancelBooking(
                    caseId: $caseId,
                    reason: $booking->cancellation_reason,
                    user: $user
                );

                $booking->cancellation_request_status = 'approved';
                $booking->cancellation_reviewed_by = $user->id;
                $booking->cancellation_reviewed_at = now();
                $booking->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Cancellation approved. Booking cancelled.',
                    'data' => $result,
                ]);
            } else {
                $booking->cancellation_request_status = 'denied';
                $booking->cancellation_denial_reason = $request->input('denial_reason');
                $booking->cancellation_reviewed_by = $user->id;
                $booking->cancellation_reviewed_at = now();
                $booking->save();

                if ($booking->supportCase?->conversation_id) {
                    \App\Models\Message::create([
                        'conversation_id' => $booking->supportCase->conversation_id,
                        'sender_id' => null,
                        'body' => "❌ Cancellation Request Denied\n\nReason: {$request->input('denial_reason')}\n\nYour appointment remains active. Contact us if you have concerns.",
                        'type' => 'system',
                        'metadata' => ['event_type' => 'cancellation_denied'],
                        'case_id' => $booking->case_id,
                    ]);
                }
                // Standalone bookings: no conversation, customer gets email notification only

                return response()->json([
                    'success' => true,
                    'message' => 'Cancellation request denied.',
                    'data' => $booking->fresh(),
                ]);
            }
        }

        // ─── USER: Submit cancellation request ───
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $canRequest = false;
        if ($user) {
            $canRequest = $booking->supportCase?->user_id === $user->id
                || $booking->merged_to_user_id === $user->id;
        }

        if (!$canRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only request cancellation for your own bookings.',
            ], 403);
        }

        if ($booking->cancellation_request_status === 'pending_review') {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending cancellation request.',
            ], 400);
        }

        if (!in_array($booking->status, ['pending', 'confirmed', 'rescheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'This booking cannot be cancelled at its current status.',
            ], 400);
        }

        $booking->cancellation_request_status = 'pending_review';
        $booking->cancellation_reason = $request->input('reason');
        $booking->cancellation_requested_by = $user->id;
        $booking->cancellation_requested_at = now();
        $booking->save();

        if ($booking->supportCase?->conversation_id) {
            \App\Models\Message::create([
                'conversation_id' => $booking->supportCase->conversation_id,
                'sender_id' => null,
                'body' => "⏳ Cancellation Requested by Customer\n\nReason: {$request->input('reason')}\n\nAwaiting staff review.",
                'type' => 'system',
                'metadata' => ['event_type' => 'cancellation_requested'],
                'case_id' => $booking->case_id,
            ]);
        }
        // Standalone bookings: no conversation, staff sees in inbox + email notification

        return response()->json([
            'success' => true,
            'message' => 'Cancellation request submitted. Awaiting staff approval.',
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Get available sellers/service providers
     * GET /api/v1/service-bookings/sellers
     */
    public function availableSellers(Request $request): JsonResponse
    {
        $sellers = \App\Models\SellerProfile::with(['user'])
            ->where('status', 'approved')
            ->when($request->has('service_type'), function ($q) use ($request) {
                // Future: filter by service types offered
                return $q;
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sellers,
        ]);
    }

    /**
     * Get available mechanics/service agents
     * GET /api/v1/service-bookings/mechanics
     */
    public function getMechanics(Request $request): JsonResponse
    {
        $mechanics = User::whereIn('role', ['service_agent', 'support_agent', 'admin', 'super_admin'])
            ->where('is_active', true)
            ->select(['id', 'name', 'email', 'phone', 'role'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $mechanics,
        ]);
    }

    /**
     * Get my bookings (customer view - auth + guest)
     * GET /api/v1/service-bookings/my-bookings
     */
    public function myBookings(Request $request): JsonResponse
    {
        $user = auth()->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$user && !$guestSessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $query = ServiceBooking::with(['supportCase', 'supportCase.conversation', 'seller', 'assignedMechanic', 'cancellationRequester', 'cancellationReviewer'])
            ->orderBy('created_at', 'desc');

        // Eager load conversation for standalone bookings (conversation_id stored in metadata)
        // We can't eager load via relationship, so we append it in the resource/transform

        if ($user) {
            $query->where(function ($q) use ($user) {
                // Case-linked bookings (via supportCase user_id)
                $q->whereHas('supportCase', function ($sq) use ($user) {
                    $sq->where('user_id', $user->id);
                })
                // Merged bookings
                ->orWhere('merged_to_user_id', $user->id)
                // Standalone bookings: match by email
                ->orWhere(function ($sq) use ($user) {
                    $sq->whereNull('case_id')
                       ->where('customer_email', $user->email);
                });
            });
        } elseif ($guestSessionId) {
            $query->where('guest_session_id', $guestSessionId);
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $bookings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

        /**
     * Authorization helper
     */
    protected function canView(ServiceBooking $booking, $user): bool
    {
        if (in_array($user->role, ['admin', 'super_admin', 'support_agent'])) {
            return true;
        }

        if ($user->role === 'seller') {
            return $booking->seller_id === $user->sellerProfile?->id;
        }

        // Customer: own booking only
        // Case-linked: via supportCase user_id or merged_to_user_id
        // Standalone: via email match or merged_to_user_id
        return $booking->supportCase?->user_id === $user->id ||
               $booking->merged_to_user_id === $user->id ||
               ($booking->customer_email && $booking->customer_email === $user->email);
    }

    /**
     * Get notes for a booking
     * GET /api/v1/service-bookings/{caseId}/notes
     */
    public function getNotes(string $caseId): JsonResponse
    {
        $user = auth()->user();
        $booking = ServiceBooking::where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })->firstOrFail();

        if (!$this->canView($booking, $user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $isStaff = in_array($user->role, ['admin', 'super_admin', 'support_agent', 'service_agent']);

        $query = $booking->appointmentNotes()->with('user');

        // Non-staff: only see public notes + their own notes
        if (!$isStaff) {
            $query->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                  ->orWhere('user_id', $user->id);
            });
        }

        $notes = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * Add note to a booking
     * POST /api/v1/service-bookings/{caseId}/notes
     */
    public function addNote(Request $request, string $caseId): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'visibility' => ['nullable', 'in:private,staff_public,public'],
        ]);

        $user = auth()->user();
        $booking = ServiceBooking::where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })->firstOrFail();

        if (!$this->canView($booking, $user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $isStaff = in_array($user->role, ['admin', 'super_admin', 'support_agent', 'service_agent']);

        // Determine visibility
        $visibility = $request->input('visibility', 'public');

        // Non-staff can only create public notes
        if (!$isStaff) {
            $visibility = 'public';
        }

        // Staff default to private if not specified
        if ($isStaff && !$request->has('visibility')) {
            $visibility = 'private';
        }

        $note = \App\Models\AppointmentNote::create([
            'case_id' => $caseId,
            'user_id' => $user->id,
            'content' => $request->input('content'),
            'visibility' => $visibility,
        ]);

        return response()->json([
            'success' => true,
            'data' => $note->load('user'),
        ], 201);
    }

    /**
     * Get appointment history/audit trail
     * GET /api/v1/service-bookings/{caseId}/history
     */
    public function getHistory(string $caseId): JsonResponse
    {
        $user = auth()->user();
        $booking = ServiceBooking::where(function ($q) use ($caseId) {
                $q->where('case_id', $caseId)
                  ->orWhere('id', $caseId);
            })->firstOrFail();

        if (!$this->canView($booking, $user)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $history = $booking->appointmentHistory()
            ->with(['changedBy', 'fromSeller', 'toSeller', 'fromMechanic', 'toMechanic'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Get all appointments for a user (for the History tab)
     * GET /api/v1/service-bookings/user/{userId}/all
     */
    public function getUserAppointments(int $userId): JsonResponse
    {
        $currentUser = auth()->user();

        // Authorization: staff can see any user's appointments, users can only see their own
        $isStaff = in_array($currentUser->role, ['admin', 'super_admin', 'support_agent', 'service_agent']);
        if (!$isStaff && $currentUser->id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $user = \App\Models\User::find($userId);
        $appointments = ServiceBooking::with(['supportCase', 'supportCase.conversation', 'seller', 'assignedMechanic'])
            ->where(function ($q) use ($userId, $user) {
                $q->whereHas('supportCase', function ($sq) use ($userId) {
                    $sq->where('user_id', $userId);
                })
                ->orWhere('merged_to_user_id', $userId)
                // Standalone bookings matched by email
                ->orWhere(function ($sq) use ($user) {
                    if ($user?->email) {
                        $sq->whereNull('case_id')
                           ->where('customer_email', $user->email);
                    }
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments,
        ]);
    }

    /**
     * Get bookings scheduled for deletion (super admin only)
     * GET /api/v1/service-bookings/scheduled
     */
    public function scheduled(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $query = ServiceBooking::with(['supportCase', 'seller', 'assignedMechanic', 'deletedByUser'])
            ->scheduledForDeletion()
            ->orderBy('scheduled_for_deletion_at', 'asc');

        $bookings = $request->per_page === 'all'
            ? $query->get()
            : $query->paginate($request->per_page ?? 25);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Schedule a completed/cancelled booking for deletion (super admin only)
     * POST /api/v1/service-bookings/{id}/schedule
     */
    public function scheduleForDeletion(Request $request, string $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $booking = ServiceBooking::findOrFail($id);

        if (!$booking->canBeScheduledForDeletion()) {
            return response()->json([
                'success' => false,
                'message' => 'Only completed, cancelled, or no-show bookings can be scheduled for deletion.',
            ], 422);
        }

        $booking->update([
            'scheduled_for_deletion_at' => now()->addDays(30),
            'deleted_by' => $user->id,
            'deletion_reason' => $request->reason,
        ]);

        \Log::info('Booking scheduled for deletion', [
            'booking_id' => $booking->id,
            'scheduled_by' => $user->id,
            'deletion_date' => $booking->scheduled_for_deletion_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking scheduled for deletion in 30 days.',
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Restore a booking from scheduled deletion (super admin only)
     * POST /api/v1/service-bookings/{id}/restore
     */
    public function restoreFromScheduled(string $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $booking = ServiceBooking::findOrFail($id);

        if (!$booking->scheduled_for_deletion_at) {
            return response()->json([
                'success' => false,
                'message' => 'Booking is not scheduled for deletion.',
            ], 422);
        }

        $booking->update([
            'scheduled_for_deletion_at' => null,
            'deleted_by' => null,
            'deletion_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking restored from scheduled deletion.',
            'data' => $booking->fresh(),
        ]);
    }

    /**
     * Permanently delete a scheduled booking (super admin only)
     * DELETE /api/v1/service-bookings/{id}/permanent
     */
    public function permanentDelete(string $id): JsonResponse
    {
        $user = auth()->user();
        if (!$user->hasSuperAdminAccess()) {
            return response()->json(['success' => false, 'message' => 'Super admin access required.'], 403);
        }

        $booking = ServiceBooking::withTrashed()->findOrFail($id);

        if (!$booking->scheduled_for_deletion_at) {
            return response()->json([
                'success' => false,
                'message' => 'Booking must be scheduled for deletion before permanent deletion.',
            ], 422);
        }

        DB::transaction(function () use ($booking) {
            // Delete appointment notes
            $booking->appointmentNotes()->delete();
            // Delete appointment history
            $booking->appointmentHistory()->delete();
            // Force delete the booking
            $booking->forceDelete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking permanently deleted.',
        ]);
    }

    /**
     * Mark booking as no-show (staff only)
     * POST /api/v1/service-bookings/{id}/no-show
     */
    public function markNoShow(string $id): JsonResponse
    {
        $user = auth()->user();

        if (!in_array($user->role, ['admin', 'super_admin', 'support_agent'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $booking = ServiceBooking::findOrFail($id);
        $booking->status = 'no_show';
        $booking->save();

        // Create system message in conversation (only for case-linked bookings)
        if ($booking->supportCase?->conversation_id) {
            \App\Models\Message::create([
                'conversation_id' => $booking->supportCase->conversation_id,
                'sender_id' => null,
                'body' => "❌ Customer No-Show\n\nThe customer did not arrive for the scheduled appointment.",
                'type' => 'system',
                'metadata' => ['event_type' => 'booking_no_show'],
                'case_id' => $booking->case_id,
            ]);
        }
        // Standalone bookings: no conversation, staff handles via inbox + email

        return response()->json([
            'success' => true,
            'message' => 'Marked as no-show.',
            'data' => $booking,
        ]);
    }
}
