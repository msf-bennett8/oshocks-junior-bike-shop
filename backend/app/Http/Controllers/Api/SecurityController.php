<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use App\Services\DeviceFingerprintService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SecurityController extends Controller
{
    /**
     * Trust current device
     * POST /api/v1/security/trust-device
     */
    public function trustDevice(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'trust_method' => 'required|in:mfa,email,remember_me',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $fingerprintData = DeviceFingerprintService::generate($request);
        $fingerprint = $fingerprintData['hash'];

        // Store fingerprint if new
        DeviceFingerprintService::store($user->id, $fingerprint);

        // Mark as trusted
        $expiryDays = match($request->trust_method) {
            'mfa' => 90,
            'email' => 30,
            'remember_me' => 7,
            default => 7,
        };

        DeviceFingerprintService::trustDevice($user->id, $fingerprint, $request->trust_method, $expiryDays);

        AuditService::logDeviceTrusted($user, [
            'fingerprint_hash' => $fingerprint,
            'trust_method' => $request->trust_method,
            'expiry_date' => now()->addDays($expiryDays),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Device trusted successfully',
            'data' => [
                'trust_method' => $request->trust_method,
                'expires_at' => now()->addDays($expiryDays)->toIso8601String(),
            ]
        ]);
    }

    /**
     * Get security activity for user
     * GET /api/v1/security/activity
     */
    public function getActivity(Request $request)
    {
        $user = $request->user();

        $activity = \App\Models\AuditLog::where('user_id', $user->id)
            ->whereIn('event_type', [
                'LOGIN_SUCCESS',
                'LOGIN_FAILED',
                'DEVICE_FINGERPRINT_CREATED',
                'DEVICE_FINGERPRINT_MISMATCH',
                'RESOURCE_ACCESSED',
                'RESOURCE_ACCESS_DENIED',
            ])
            ->orderBy('occurred_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'event_type' => $log->event_type,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'occurred_at' => $log->occurred_at,
                    'metadata' => $log->metadata,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Get active sessions/devices
     * GET /api/v1/security/sessions
     */
    public function getSessions(Request $request)
    {
        $user = $request->user();

        // Get from personal access tokens (Sanctum)
        $sessions = $user->tokens()
            ->where('expires_at', '>', now())
            ->orWhereNull('expires_at')
            ->get()
            ->map(function ($token) {
                return [
                    'token_id' => $token->id,
                    'name' => $token->name,
                    'last_used_at' => $token->last_used_at,
                    'expires_at' => $token->expires_at,
                    'is_current' => false, // Would need to compare with current token
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $sessions
        ]);
    }

    /**
     * Revoke specific session
     * DELETE /api/v1/security/sessions/{tokenId}
     */
    public function revokeSession(Request $request, $tokenId)
    {
        $user = $request->user();

        $token = $user->tokens()->find($tokenId);

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found'
            ], 404);
        }

        $token->delete();

        AuditService::log([
            'event_type' => 'SESSION_REVOKED',
            'event_category' => 'security',
            'actor_type' => 'USER',
            'user_id' => $user->id,
            'action' => 'revoked',
            'model_type' => 'PersonalAccessToken',
            'model_id' => $tokenId,
            'description' => "Session revoked by user",
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully'
        ]);
    }

    /**
     * Report suspicious activity
     * POST /api/v1/security/report
     */
    public function reportSuspicious(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'activity_type' => 'required|string',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        AuditService::logSuspiciousActivity($request->description, [
            'user_id' => $user->id,
            'activity_type' => $request->activity_type,
            'risk_score' => 50,
            'action_taken' => 'user_reported',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report submitted successfully'
        ]);
    }
}
