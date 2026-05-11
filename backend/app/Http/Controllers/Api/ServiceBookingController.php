<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceBookingRequest;
use App\Http\Requests\ConfirmBookingRequest;
use App\Models\ServiceBooking;
use App\Models\SupportCase;
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
                'message' => 'Service booking created successfully. Our team will confirm your appointment shortly.',
                'data' => $result,
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
        $query = ServiceBooking::with(['supportCase', 'seller', 'assignedMechanic', 'cancellationRequester', 'cancellationReviewer']);

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
     * Get single booking
     * GET /api/v1/service-bookings/{caseId}
     */
    public function show(string $caseId): JsonResponse
    {
        $booking = ServiceBooking::with(['supportCase', 'seller', 'assignedMechanic', 'cancellationRequester', 'cancellationReviewer'])
            ->where('case_id', $caseId)
            ->firstOrFail();

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
                caseId: $caseId,
                data: $request->validated(),
                staff: auth()->user()
            );

            // ─── Send notification to customer ───
            $booking = $result['service_booking'] ?? null;
            $supportCase = $result['support_case'] ?? null;

            if ($booking && $supportCase) {
                // Notify the customer
                $customer = $supportCase->user;
                if ($customer) {
                    $customer->notify(new \App\Notifications\ServiceBookingConfirmed($booking, $supportCase));
                }

                // Broadcast real-time update
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
        $booking = ServiceBooking::where('case_id', $caseId)->firstOrFail();

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
        $booking = ServiceBooking::where('case_id', $caseId)->firstOrFail();

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

        $query = ServiceBooking::with(['supportCase.conversation', 'seller', 'cancellationRequester', 'cancellationReviewer'])
            ->orderBy('created_at', 'desc');

        if ($user) {
            $query->where(function ($q) use ($user) {
                $q->whereHas('supportCase', function ($sq) use ($user) {
                    $sq->where('user_id', $user->id);
                })
                ->orWhere('merged_to_user_id', $user->id);
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
        return $booking->supportCase?->user_id === $user->id ||
               $booking->merged_to_user_id === $user->id;
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

        // Create system message in conversation
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

        return response()->json([
            'success' => true,
            'message' => 'Marked as no-show.',
            'data' => $booking,
        ]);
    }
}
