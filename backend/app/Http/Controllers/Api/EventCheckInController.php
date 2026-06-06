<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEventRegistration;
use Illuminate\Http\Request;

class EventCheckInController extends Controller
{
    /**
     * Validate QR code and check in participant
     * POST /api/v1/admin/check-in/validate
     */
    public function validateQr(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'qr_data' => 'required|string',
        ]);

        try {
            $qrPayload = json_decode($validated['qr_data'], true);

            if (!$qrPayload || !isset($qrPayload['c'], $qrPayload['e'], $qrPayload['s'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code format',
                ], 400);
            }

            // Verify signature
            $receivedSig = $qrPayload['s'];
            unset($qrPayload['s']);
            $payloadString = json_encode($qrPayload);
            $expectedSig = substr(hash_hmac('sha256', $payloadString, config('app.key')), 0, 16);

            if (!hash_equals($expectedSig, $receivedSig)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid QR code signature — possible tampering',
                ], 400);
            }

            // Check expiry
            if (isset($qrPayload['x']) && now()->timestamp > $qrPayload['x']) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired',
                ], 400);
            }

            // Find registration
            $registration = CyclingEventRegistration::with(['event', 'user'])
                ->where('registration_code', $qrPayload['c'])
                ->where('status', 'registered')
                ->first();

            if (!$registration) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration not found or already cancelled',
                ], 404);
            }

            // Check if already checked in
            if ($registration->checked_in_at) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already checked in at ' . $registration->checked_in_at->format('Y-m-d H:i:s'),
                    'data' => [
                        'registration' => $registration,
                        'checked_in_at' => $registration->checked_in_at,
                    ],
                ], 400);
            }

            // Perform check-in
            $registration->update([
                'checked_in_at' => now(),
                'check_in_code' => $qrPayload['s'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Check-in successful',
                'data' => [
                    'registration' => $registration->fresh(),
                    'participant_name' => $registration->user?->name,
                    'event_title' => $registration->event?->title,
                    'checked_in_at' => now()->toIso8601String(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to validate QR code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Manual check-in by registration code (fallback)
     */
    public function manualCheckIn(Request $request)
    {
        $user = $request->user();
        if (!$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'registration_code' => 'required|string',
            'event_code' => 'required|string',
        ]);

        $registration = CyclingEventRegistration::with(['event', 'user'])
            ->where('registration_code', $validated['registration_code'])
            ->whereHas('event', function ($q) use ($validated) {
                $q->where('event_code', $validated['event_code']);
            })
            ->where('status', 'registered')
            ->first();

        if (!$registration) {
            return response()->json([
                'success' => false,
                'message' => 'Registration not found',
            ], 404);
        }

        if ($registration->checked_in_at) {
            return response()->json([
                'success' => false,
                'message' => 'Already checked in',
            ], 400);
        }

        $registration->update([
            'checked_in_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful',
            'data' => $registration->fresh(),
        ]);
    }
}
