<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\Address;
use App\Models\Payment;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class DataExportController extends Controller
{
    /**
     * Request personal data export (GDPR Article 15/20)
     * POST /api/v1/user/data-export
     */
    public function requestExport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'export_type' => 'required|in:full,partial',
            'formats' => 'required|array|in:JSON,CSV',
            'include_orders' => 'boolean',
            'include_payments' => 'boolean',
            'include_reviews' => 'boolean',
            'include_addresses' => 'boolean',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $requestId = 'EXP-' . strtoupper(uniqid());

        // Log data export request
        AuditService::logDataExportRequested($user, [
            'request_id' => $requestId,
            'export_type' => $request->export_type,
            'formats' => $request->formats,
            'deadline' => now()->addDays(30), // GDPR: 30 days max
        ]);

        // Generate export asynchronously (in production, queue this)
        $exportData = $this->generateExportData($user, $request->all());
        
        // Create export file
        $filename = "data-export-{$user->id}-{$requestId}";
        $filepath = "exports/{$filename}.json";
        Storage::disk('private')->put($filepath, json_encode($exportData, JSON_PRETTY_PRINT));

        // Calculate checksum
        $fileContent = Storage::disk('private')->get($filepath);
        $checksum = hash('sha256', $fileContent);

        // Log export generated
        AuditService::logDataExportGenerated($user, [
            'request_id' => $requestId,
            'file_size' => strlen($fileContent),
            'checksum' => $checksum,
            'download_url_hash' => hash('sha256', $filepath),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data export requested. You will be notified when ready.',
            'data' => [
                'request_id' => $requestId,
                'status' => 'processing',
                'estimated_completion' => now()->addHours(24)->toIso8601String(),
                'deadline' => now()->addDays(30)->toIso8601String(),
            ]
        ], 202);
    }

    /**
     * Download generated data export
     * GET /api/v1/user/data-export/{requestId}/download
     */
    public function downloadExport(Request $request, $requestId)
    {
        $user = $request->user();
        $filepath = "exports/data-export-{$user->id}-{$requestId}.json";

        if (!Storage::disk('private')->exists($filepath)) {
            return response()->json([
                'success' => false,
                'message' => 'Export not found or expired'
            ], 404);
        }

        // Log download
        AuditService::logDataExportDownloaded($user, [
            'request_id' => $requestId,
            'ip_address' => $request->ip(),
        ]);

        $content = Storage::disk('private')->get($filepath);
        
        return response($content)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', "attachment; filename=\"personal-data-export-{$requestId}.json\"");
    }

    /**
     * Delete user account (GDPR Right to Erasure / Account Deletion)
     * DELETE /api/v1/user/account
     */
    public function deleteAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
            'confirm_delete' => 'required|boolean|accepted',
            'password' => 'required_if:has_password,true',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verify password if user has one
        if ($user->password && !\Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password is incorrect'
            ], 403);
        }

        $deletionType = 'GDPR'; // or 'standard'
        $reason = $request->reason ?? 'user_request';

        // Log account deletion BEFORE deleting
        AuditService::logAccountDeleted($user, [
            'deleted_by' => $user->id,
            'reason' => $reason,
            'deletion_type' => $deletionType,
            'data_retention_expiry' => now()->addYears(7), // Legal retention
        ]);

        // Anonymize or delete related data
        $this->anonymizeUserData($user);

        // Soft delete or hard delete based on policy
        // For GDPR, we typically anonymize rather than hard delete to preserve order history
        $user->delete(); // or $user->forceDelete()

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully. Some data may be retained for legal purposes.',
            'data' => [
                'deletion_type' => $deletionType,
                'data_retention_expiry' => now()->addYears(7)->toIso8601String(),
            ]
        ]);
    }

    /**
     * Deactivate account (temporary)
     * POST /api/v1/user/account/deactivate
     */
    public function deactivateAccount(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        $user->update([
            'is_active' => false,
            'deactivated_at' => now(),
            'deactivation_reason' => $request->reason,
        ]);

        // Log deactivation
        AuditService::logAccountDeactivated($user, [
            'reason' => $request->reason,
            'deactivated_by' => $user->id,
            'reactivation_eligible_date' => now()->addDays(30),
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deactivated successfully',
            'data' => [
                'reactivation_eligible_date' => now()->addDays(30)->toIso8601String(),
            ]
        ]);
    }

    /**
     * Reactivate account
     * POST /api/v1/user/account/reactivate
     */
    public function reactivateAccount(Request $request)
    {
        $user = $request->user();

        if ($user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is already active'
            ], 400);
        }

        $user->update([
            'is_active' => true,
            'reactivated_at' => now(),
        ]);

        // Log reactivation
        AuditService::logAccountReactivated($user, [
            'reactivation_method' => 'self_service',
        ]);

        // Generate new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Account reactivated successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ]);
    }

    /**
     * Generate export data
     */
    private function generateExportData($user, array $options): array
    {
        $data = [
            'export_metadata' => [
                'generated_at' => now()->toIso8601String(),
                'user_id_hash' => hash('sha256', $user->id),
                'version' => '1.0',
            ],
            'personal_data' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'username' => $user->username,
                'created_at' => $user->created_at,
            ],
        ];

        // Include orders if requested
        if ($options['include_orders'] ?? true) {
            $data['orders'] = Order::where('user_id', $user->id)
                ->with('orderItems')
                ->get()
                ->map(function($order) {
                    return [
                        'order_number' => $order->order_number,
                        'total' => $order->total,
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                        'items' => $order->orderItems->map(fn($item) => [
                            'product_name' => $item->product_name,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                        ]),
                    ];
                });
        }

        // Include addresses if requested
        if ($options['include_addresses'] ?? true) {
            $data['addresses'] = Address::where('user_id', $user->id)
                ->get()
                ->map(fn($addr) => [
                    'type' => $addr->type,
                    'city' => $addr->city,
                    'county' => $addr->county,
                    'country' => $addr->country,
                ]);
        }

        // Include payments if requested
        if ($options['include_payments'] ?? true) {
            $data['payments'] = Payment::whereHas('order', fn($q) => $q->where('user_id', $user->id))
                ->get()
                ->map(fn($pay) => [
                    'transaction_reference' => $pay->transaction_reference,
                    'amount' => $pay->amount,
                    'status' => $pay->status,
                    'created_at' => $pay->created_at,
                ]);
        }

        // Include reviews if requested
        if ($options['include_reviews'] ?? true) {
            $data['reviews'] = Review::where('user_id', $user->id)
                ->get()
                ->map(fn($rev) => [
                    'rating' => $rev->rating,
                    'comment_hash' => hash('sha256', $rev->comment),
                    'created_at' => $rev->created_at,
                ]);
        }

        return $data;
    }

    /**
     * Anonymize user data for GDPR deletion
     */
    private function anonymizeUserData($user): void
    {
        $anonymizedId = 'ANON-' . strtoupper(uniqid());

        // Log anonymization
        AuditService::logDataAnonymized($user, [
            'anonymized_user_id' => $anonymizedId,
            'retention_reason' => 'legal', // legal, tax, fraud
            'orders_retained' => $user->orders()->pluck('id')->toArray(),
        ]);

        // Anonymize orders (keep for tax/legal, but remove PII link)
        $user->orders()->update(['user_id' => null, 'anonymized_user_id' => $anonymizedId]);

        // Delete personal data
        $user->addresses()->delete();
        $user->wishlists()->delete();
        $user->reviews()->update(['user_id' => null, 'is_anonymized' => true]);
    }
}
