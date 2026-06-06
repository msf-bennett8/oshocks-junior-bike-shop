<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEvent;
use App\Models\CyclingEventRegistration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventBookingManagementController extends Controller
{
    /**
     * List all event bookings across all events
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = CyclingEventRegistration::with(['event', 'user', 'bike'])
            ->whereHas('event');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }
        if ($request->has('event_code')) {
            $query->whereHas('event', fn($q) => $q->where('event_code', $request->event_code));
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('registration_code', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('user', fn($uq) => $uq->where('email', 'like', "%{$search}%"));
            });
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $allowedSorts = ['created_at', 'start_datetime', 'final_amount', 'participant_count'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'start_datetime') {
                $query->join('cycling_events', 'cycling_events.id', '=', 'cycling_event_registrations.event_id')
                    ->orderBy('cycling_events.start_datetime', $sortOrder)
                    ->select('cycling_event_registrations.*');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }

        $registrations = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $registrations->items(),
            'meta' => [
                'current_page' => $registrations->currentPage(),
                'last_page' => $registrations->lastPage(),
                'per_page' => $registrations->perPage(),
                'total' => $registrations->total(),
            ]
        ]);
    }

    /**
     * Get bookings for a specific event
     */
    public function eventBookings(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        $query = CyclingEventRegistration::with(['user', 'bike'])
            ->where('event_id', $event->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $registrations = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
                'registrations' => $registrations->items(),
                'summary' => [
                    'total_bookings' => $event->bookings_count,
                    'total_revenue' => $event->revenue,
                    'checked_in' => $event->checked_in_count,
                    'waitlisted' => $event->waitlist_count,
                    'capacity_percent' => $event->capacity_percent,
                ],
            ],
            'meta' => [
                'current_page' => $registrations->currentPage(),
                'last_page' => $registrations->lastPage(),
                'per_page' => $registrations->perPage(),
                'total' => $registrations->total(),
            ]
        ]);
    }

    /**
     * Check in a participant
     */
    public function checkIn(string $registrationCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('status', 'registered')
            ->firstOrFail();

        if ($registration->checked_in_at) {
            return response()->json(['error' => 'Already checked in'], 400);
        }

        $registration->update([
            'checked_in_at' => now(),
        ]);

        $fresh = $registration->fresh();
        $fresh->append('display_status');

        return response()->json([
            'success' => true,
            'message' => 'Participant checked in successfully',
            'data' => $fresh,
        ]);
    }

    /**
     * Admin cancel a booking
     */
    public function adminCancel(Request $request, string $registrationCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'refund' => 'boolean',
        ]);

        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('status', 'registered')
            ->firstOrFail();

        return DB::transaction(function () use ($registration, $validated, $user) {
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['reason'],
            ]);

            // Decrement event participants
            $registration->event->decrement('current_participants', $registration->participant_count);

            // Auto-refund if requested and paid
            if (($validated['refund'] ?? false) && $registration->payment_status === 'paid') {
                $registration->update([
                    'refund_status' => 'approved',
                    'refund_amount' => $registration->final_amount,
                    'refund_processed_at' => now(),
                    'refund_reason' => 'Admin cancellation: ' . $validated['reason'],
                ]);
            }

            // Promote waitlisted if space opens
            $this->promoteWaitlist($registration->event);

            return response()->json([
                'success' => true,
                'message' => 'Booking cancelled' . (($validated['refund'] ?? false) ? ' and refunded' : ''),
                'data' => $registration->fresh(),
            ]);
        });
    }

    /**
     * Process refund for a booking
     */
    public function processRefund(Request $request, string $registrationCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('payment_status', 'paid')
            ->firstOrFail();

        if ($registration->refund_status === 'processed') {
            return response()->json(['error' => 'Refund already processed'], 400);
        }

        $registration->update([
            'refund_status' => 'processed',
            'refund_amount' => $validated['amount'],
            'refund_processed_at' => now(),
            'refund_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund processed successfully',
            'data' => $registration->fresh(),
        ]);
    }

    /**
     * Transfer booking to another user
     */
    public function transferBooking(Request $request, string $registrationCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'new_user_id' => 'required|integer|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('status', 'registered')
            ->firstOrFail();

        $newUser = User::findOrFail($validated['new_user_id']);

        return DB::transaction(function () use ($registration, $newUser, $validated, $user) {
            // Create new registration for new user
            $newRegistration = CyclingEventRegistration::create([
                'registration_code' => app(\App\Services\BookingIdService::class)->generate(),
                'event_id' => $registration->event_id,
                'user_id' => $newUser->id,
                'participant_count' => $registration->participant_count,
                'price_per_person' => $registration->price_per_person,
                'total_amount' => $registration->total_amount,
                'discount_amount' => $registration->discount_amount,
                'final_amount' => $registration->final_amount,
                'add_ons' => $registration->add_ons,
                'bike_included' => $registration->bike_included,
                'bike_rental_id' => $registration->bike_rental_id,
                'bike_add_ons' => $registration->bike_add_ons,
                'emergency_contact_name' => $registration->emergency_contact_name,
                'emergency_contact_phone' => $registration->emergency_contact_phone,
                'waiver_signed' => $registration->waiver_signed,
                'payment_status' => $registration->payment_status,
                'payment_reference' => $registration->payment_reference,
                'payment_method' => $registration->payment_method,
                'status' => 'registered',
                'transferred_from' => $registration->id,
                'transferred_at' => now(),
                'transfer_reason' => $validated['reason'] ?? null,
            ]);

            // Mark old as transferred
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => 'Transferred to ' . $newUser->name . ($validated['reason'] ? ': ' . $validated['reason'] : ''),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking transferred to ' . $newUser->name,
                'data' => [
                    'old_registration' => $registration->fresh(),
                    'new_registration' => $newRegistration->load(['event', 'user', 'bike']),
                ],
            ]);
        });
    }

    /**
     * Bulk check-in
     */
    public function bulkCheckIn(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'registration_codes' => 'required|array',
            'registration_codes.*' => 'string',
        ]);

        $updated = CyclingEventRegistration::whereIn('registration_code', $validated['registration_codes'])
            ->where('status', 'registered')
            ->whereNull('checked_in_at')
            ->update(['checked_in_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => "{$updated} participants checked in",
        ]);
    }

    /**
     * Bulk cancel
     */
    public function bulkCancel(Request $request)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'registration_codes' => 'required|array',
            'registration_codes.*' => 'string',
            'reason' => 'required|string|max:500',
        ]);

        $registrations = CyclingEventRegistration::whereIn('registration_code', $validated['registration_codes'])
            ->where('status', 'registered')
            ->get();

        $count = 0;
        foreach ($registrations as $registration) {
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['reason'],
            ]);
            $registration->event->decrement('current_participants', $registration->participant_count);
            $count++;
        }

        // Promote waitlist for affected events
        $eventIds = $registrations->pluck('event_id')->unique();
        foreach ($eventIds as $eventId) {
            $event = CyclingEvent::find($eventId);
            if ($event) $this->promoteWaitlist($event);
        }

        return response()->json([
            'success' => true,
            'message' => "{$count} bookings cancelled",
        ]);
    }

    /**
     * Export bookings as CSV
     */
    public function exportBookings(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();

        $registrations = CyclingEventRegistration::with('user')
            ->where('event_id', $event->id)
            ->where('status', 'registered')
            ->get();

        $headers = [
            'Registration Code', 'Name', 'Email', 'Phone', 'Participants',
            'Amount Paid', 'Payment Status', 'Checked In', 'Emergency Contact',
            'Emergency Phone', 'Bike Included', 'Registered At'
        ];

        $callback = function () use ($registrations, $headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($registrations as $reg) {
                fputcsv($file, [
                    $reg->registration_code,
                    $reg->user?->name ?? 'N/A',
                    $reg->user?->email ?? 'N/A',
                    $reg->user?->phone ?? 'N/A',
                    $reg->participant_count,
                    $reg->final_amount,
                    $reg->payment_status,
                    $reg->checked_in_at ? 'Yes' : 'No',
                    $reg->emergency_contact_name,
                    $reg->emergency_contact_phone,
                    $reg->bike_included ? 'Yes' : 'No',
                    $reg->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $eventCode . '_bookings.csv"',
        ]);
    }

    /**
     * Get global booking stats
     */
    public function stats()
    {
        $user = Auth::user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total_bookings' => CyclingEventRegistration::count(),
                'active_bookings' => CyclingEventRegistration::where('status', 'registered')->count(),
                'checked_in_today' => CyclingEventRegistration::whereDate('checked_in_at', today())->count(),
                'pending_refunds' => CyclingEventRegistration::where('refund_status', 'pending')->count(),
                'total_revenue' => CyclingEventRegistration::where('status', 'registered')
                    ->where('payment_status', 'paid')
                    ->sum('final_amount'),
                'waitlisted' => CyclingEventRegistration::where('status', 'waitlisted')->count(),
                'cancelled_this_week' => CyclingEventRegistration::where('status', 'cancelled')
                    ->where('cancelled_at', '>=', now()->subWeek())
                    ->count(),
            ]
        ]);
    }

    /**
     * Promote waitlisted registrations when space opens
     */
    private function promoteWaitlist(CyclingEvent $event): void
    {
        $spotsAvailable = $event->seats_remaining;

        if ($spotsAvailable <= 0) return;

        $waitlisted = CyclingEventRegistration::where('event_id', $event->id)
            ->where('status', 'waitlisted')
            ->orderBy('waitlist_position')
            ->limit($spotsAvailable)
            ->get();

        foreach ($waitlisted as $registration) {
            $registration->update([
                'status' => 'registered',
                'waitlist_position' => null,
                'promoted_from_waitlist_at' => now(),
            ]);
            $event->increment('current_participants', $registration->participant_count);

            // TODO: Send notification to user
        }
    }
}
