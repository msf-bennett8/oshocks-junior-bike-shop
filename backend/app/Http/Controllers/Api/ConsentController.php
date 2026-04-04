<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConsentController extends Controller
{
    /**
     * Record user consent
     * POST /api/v1/user/consent
     */
    public function recordConsent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'consent_type' => 'required|in:marketing,analytics,cookies,location',
            'version' => 'required|string|max:20',
            'granted' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $consentType = $request->consent_type;
        $granted = $request->granted;

        // Update preferences based on consent type
        $preferences = UserPreference::firstOrCreate(['user_id' => $user->id]);
        
        $updates = match($consentType) {
            'marketing' => ['promotional_emails' => $granted, 'newsletter' => $granted],
            'analytics' => ['data_sharing' => $granted],
            'cookies' => [], // Handle via cookie banner
            'location' => [], // Handle via geolocation service
            default => [],
        };

        if (!empty($updates)) {
            $preferences->update($updates);
        }

        if ($granted) {
            // Log consent given
            AuditService::logConsentGiven($user, [
                'consent_type' => $consentType,
                'version' => $request->version,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } else {
            // Log consent withdrawn
            AuditService::logConsentWithdrawn($user, [
                'consent_type' => $consentType,
                'version' => $request->version,
                'ip_address' => $request->ip(),
                'withdrawal_method' => 'api',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => $granted ? 'Consent recorded' : 'Consent withdrawn',
            'data' => [
                'consent_type' => $consentType,
                'status' => $granted ? 'granted' : 'withdrawn',
                'timestamp' => now()->toIso8601String(),
            ]
        ]);
    }

    /**
     * Export consent preferences
     * GET /api/v1/user/consent/export
     */
    public function exportConsent(Request $request)
    {
        $user = $request->user();

        // Log consent export
        AuditService::logConsentPreferencesExported($user, [
            'export_format' => 'JSON',
        ]);

        $preferences = UserPreference::where('user_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'user_id_hash' => hash('sha256', $user->id),
                'exported_at' => now()->toIso8601String(),
                'consents' => [
                    'marketing' => $preferences?->promotional_emails ?? false,
                    'analytics' => $preferences?->data_sharing ?? false,
                    'newsletter' => $preferences?->newsletter ?? false,
                ],
                'privacy_settings' => [
                    'profile_visibility' => $preferences?->profile_visibility ?? 'public',
                    'show_email' => $preferences?->show_email ?? false,
                    'show_phone' => $preferences?->show_phone ?? false,
                ],
            ]
        ]);
    }

    /**
     * Submit privacy request (GDPR Article 15-22)
     * POST /api/v1/user/privacy-request
     */
    public function submitPrivacyRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'request_type' => 'required|in:deletion,access,portability,restriction,objection',
            'description' => 'nullable|string|max:1000',
            'channel' => 'required|in:web,email,phone',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $requestId = 'PRV-' . strtoupper(uniqid());

        // Determine jurisdiction based on location
        $jurisdiction = $this->determineJurisdiction($request->ip());

        // Log privacy request received
        AuditService::logPrivacyRequestReceived($user, [
            'request_id' => $requestId,
            'request_type' => $request->request_type,
            'channel' => $request->channel,
            'deadline' => now()->addDays($jurisdiction === 'GDPR' ? 30 : 45), // GDPR: 30 days, CCPA: 45 days
            'jurisdiction' => $jurisdiction,
        ]);

        // Auto-acknowledge
        AuditService::logPrivacyRequestAcknowledged($user, [
            'request_id' => $requestId,
            'acknowledgment_sent' => true,
        ]);

        // Auto-fulfill access/portability requests
        if (in_array($request->request_type, ['access', 'portability'])) {
            // Trigger data export
            return redirect()->action(
                [DataExportController::class, 'requestExport'],
                ['privacy_request_id' => $requestId]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Privacy request submitted successfully',
            'data' => [
                'request_id' => $requestId,
                'status' => 'received',
                'deadline' => now()->addDays($jurisdiction === 'GDPR' ? 30 : 45)->toIso8601String(),
                'jurisdiction' => $jurisdiction,
            ]
        ], 202);
    }

    /**
     * Determine privacy jurisdiction
     */
    private function determineJurisdiction(?string $ip): string
    {
        // Simplified - in production, use geolocation service
        // EU countries = GDPR, California = CCPA, etc.
        return 'GDPR'; // Default
    }
}
