<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomRideRequestRequest;
use App\Models\CustomRideRequest;
use App\Models\CustomRideRequestImage;
use App\Services\CustomRideRequestIdService;
use App\Services\CustomRideCloudinaryService;
use App\Services\CustomRideToEventConversionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomRideRequestController extends Controller
{
    protected CustomRideCloudinaryService $cloudinaryService;

    public function __construct(CustomRideCloudinaryService $cloudinaryService)
    {
        $this->cloudinaryService = $cloudinaryService;
    }

    /**
     * Create a new custom ride request
     * POST /api/v1/custom-ride-requests
     */
    public function store(StoreCustomRideRequestRequest $request): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = !$user ? $request->header('X-Guest-Session-ID') : null;

        return DB::transaction(function () use ($request, $user, $guestSessionId) {
            $validated = $request->validated();

            //Build data array
            $data = [
                'user_id' => $user?->id,
                'guest_session_id' => $guestSessionId,
                'guest_name' => $user ? null : ($validated['guest_name'] ?? 'Guest'),
                'guest_email' => $user ? null : ($validated['guest_email'] ?? null),
                'guest_phone' => $user ? null : ($validated['guest_phone'] ?? null),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'preferred_date' => $validated['preferred_date'],
                'date_flexible' => $validated['date_flexible'] ?? false,
                'date_flexibility_days' => $validated['date_flexibility_days'] ?? 3,
                'group_size' => $validated['group_size'],
                'rider_count' => $validated['rider_count'] ?? $validated['group_size'],
                'difficulty' => $validated['difficulty'],
                'terrain' => $validated['terrain'],
                'distance_km' => $validated['distance_km'] ?? null,
                'duration_hours' => $validated['duration_hours'] ?? null,
                'bike_model' => $validated['bike_model'] ?? null,
                'bike_size' => $validated['bike_size'] ?? null,
                'add_ons' => $validated['add_ons'] ?? [],
                'base_rental_price' => $validated['base_rental_price'] ?? 0,
                'add_ons_price' => $validated['add_ons_price'] ?? 0,
                'insurance_price' => $validated['insurance_price'] ?? 0,
                'transport_price' => $validated['transport_price'] ?? 0,
                'security_deposit' => $validated['security_deposit'] ?? 0,
                'total_price' => $validated['total_price'] ?? 0,
                'budget_estimate' => $validated['budget_estimate'] ?? null,
                'insurance_included' => $validated['insurance_included'] ?? false,
                'transport_included' => $validated['transport_included'] ?? false,
                'transport_notes' => $validated['transport_notes'] ?? null,
                'contact_phone' => $validated['contact_phone'],
                'status' => 'reviewing',
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'source' => $user ? 'web_auth' : 'web_guest',
                ],
            ];

            // Create the request (triggers boot for ID generation)
            $rideRequest = CustomRideRequest::create($data);

            // Handle image uploads
            $uploadedImages = [];
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $uploadResult = $this->cloudinaryService->uploadImage(
                        $image,
                        $rideRequest->request_id
                    );

                    if ($uploadResult['success']) {
                        $imageRecord = CustomRideRequestImage::create([
                            'custom_ride_request_id' => $rideRequest->id,
                            'public_id' => $uploadResult['public_id'],
                            'secure_url' => $uploadResult['secure_url'],
                            'url' => $uploadResult['url'] ?? $uploadResult['secure_url'],
                            'original_name' => $uploadResult['original_name'],
                            'mime_type' => $image->getMimeType(),
                            'file_size' => $image->getSize(),
                            'width' => $uploadResult['width'],
                            'height' => $uploadResult['height'],
                            'format' => $uploadResult['format'],
                            'folder_path' => $uploadResult['folder_path'],
                            'display_order' => $index,
                            'is_primary' => $index === 0,
                        ]);

                        $uploadedImages[] = $imageRecord;
                    } else {
                        Log::warning('Image upload failed for custom ride request', [
                            'request_id' => $rideRequest->request_id,
                            'error' => $uploadResult['error'] ?? 'Unknown error',
                        ]);
                    }
                }
            }

            // Load relationships for response
            $rideRequest->load(['images', 'user']);

            // Broadcast event for real-time notifications (if you have Reverb/Pusher)
            try {
                // broadcast(new \App\Events\CustomRideRequestCreated($rideRequest))->toOthers();
            } catch (\Exception $e) {
                Log::warning('Failed to broadcast custom ride request creation', [
                    'request_id' => $rideRequest->request_id,
                    'error' => $e->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Custom ride request submitted successfully! We will send you a detailed quote within 24 hours.',
                'data' => [
                    'ride_request' => $rideRequest,
                    'images' => $uploadedImages,
                    'request_id' => $rideRequest->request_id,
                ],
            ], 201);
        });
    }

    /**
     * Get my ride requests (auth user + guest)
     * GET /api/v1/custom-ride-requests/my-requests
     */
    public function myRequests(Request $request): JsonResponse
    {
        $user = Auth::user();
        $guestSessionId = $request->header('X-Guest-Session-ID');

        if (!$user && !$guestSessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $query = CustomRideRequest::with(['images', 'user'])
            ->orderBy('created_at', 'desc');

        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->where('guest_session_id', $guestSessionId);
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $requests = $request->has('per_page')
            ? $query->paginate($request->input('per_page', 20))
            : $query->get();

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Get single ride request
     * GET /api/v1/custom-ride-requests/{requestId}
     */
    public function show(string $requestId): JsonResponse
    {
        $rideRequest = CustomRideRequest::with(['images', 'user', 'quotedBy'])
            ->where('request_id', $requestId)
            ->firstOrFail();

        $user = Auth::user();

        // Authorization
        if ($user) {
            if ($rideRequest->user_id !== $user->id && !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        } else {
            $guestSessionId = request()->header('X-Guest-Session-ID');
            if ($rideRequest->guest_session_id !== $guestSessionId) {
                return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $rideRequest,
        ]);
    }

    /**
     * Get all ride requests (admin/staff)
     * GET /api/v1/custom-ride-requests
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $query = CustomRideRequest::with(['images', 'user'])
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('from_date')) {
            $query->whereDate('preferred_date', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('preferred_date', '<=', $request->input('to_date'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('request_id', 'like', "%{$search}%")
                  ->orWhere('contact_phone', 'like', "%{$search}%");
            });
        }

        $requests = $query->paginate($request->input('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Update status (staff only - quote, accept, decline, etc.)
     * POST /api/v1/custom-ride-requests/{requestId}/status
     */
    public function updateStatus(Request $request, string $requestId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'status' => ['required', 'in:quoted,accepted,converted,declined,scheduled,completed,cancelled'],
            'staff_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $rideRequest = CustomRideRequest::where('request_id', $requestId)->firstOrFail();

        $oldStatus = $rideRequest->status;
        $newStatus = $request->input('status');

        $updateData = [
            'status' => $newStatus,
            'staff_notes' => $request->input('staff_notes'),
        ];

        if ($newStatus === 'quoted') {
            $updateData['quoted_at'] = now();
            $updateData['quoted_by'] = $user->id;
        }

        $rideRequest->update($updateData);

        // Log status change
        Log::info('Custom ride request status updated', [
            'request_id' => $requestId,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Request status updated to {$newStatus}.",
            'data' => $rideRequest->fresh(['images', 'user', 'quotedBy']),
        ]);
    }

    /**
     * Get stats (staff dashboard)
     * GET /api/v1/custom-ride-requests/stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $statuses = ['reviewing', 'quoted', 'accepted', 'converted', 'declined', 'scheduled', 'completed', 'cancelled', 'expired'];
        $counts = [];

        foreach ($statuses as $status) {
            $counts[$status] = CustomRideRequest::where('status', $status)->count();
        }

        $counts['total'] = CustomRideRequest::count();
        $counts['today'] = CustomRideRequest::whereDate('created_at', today())->count();
        $counts['this_week'] = CustomRideRequest::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

        return response()->json([
            'success' => true,
            'data' => $counts,
        ]);
    }

    /**
     * Preview event conversion (admin/staff)
     * GET /api/v1/custom-ride-requests/{requestId}/conversion-preview
     */
    public function conversionPreview(string $requestId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $rideRequest = CustomRideRequest::with(['images', 'user'])
            ->where('request_id', $requestId)
            ->firstOrFail();

        $converter = app(\App\Services\CustomRideToEventConversionService::class);
        $preview = $converter->preview($rideRequest);

        return response()->json([
            'success' => true,
            'data' => [
                'ride_request' => $rideRequest,
                'event_preview' => $preview,
            ],
        ]);
    }

    /**
     * Quote a custom ride request (admin/staff)
     * POST /api/v1/custom-ride-requests/{requestId}/quote
     */
    public function quote(Request $request, string $requestId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'base_rental_price' => ['nullable', 'numeric', 'min:0'],
            'add_ons_price' => ['nullable', 'numeric', 'min:0'],
            'insurance_price' => ['nullable', 'numeric', 'min:0'],
            'transport_price' => ['nullable', 'numeric', 'min:0'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'total_price' => ['nullable', 'numeric', 'min:0'],
            'staff_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $rideRequest = CustomRideRequest::where('request_id', $requestId)->firstOrFail();

        $updateData = [
            'status' => 'quoted',
            'quoted_at' => now(),
            'quoted_by' => $user->id,
            'staff_notes' => $request->input('staff_notes'),
        ];

        // Only update pricing fields if provided
        $pricingFields = ['base_rental_price', 'add_ons_price', 'insurance_price', 'transport_price', 'security_deposit', 'total_price'];
        foreach ($pricingFields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $request->input($field);
            }
        }

        $rideRequest->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Quote sent successfully.',
            'data' => $rideRequest->fresh(['images', 'user', 'quotedBy']),
        ]);
    }
    /**
     * Convert to event (admin/staff)
     * POST /api/v1/custom-ride-requests/{requestId}/convert-to-event
     */
    public function convertToEvent(Request $request, string $requestId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'super_admin', 'owner', 'support_agent'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $rideRequest = CustomRideRequest::with(['images', 'user'])
            ->where('request_id', $requestId)
            ->firstOrFail();

        // Only allow conversion from certain statuses
        if (!in_array($rideRequest->status, ['accepted', 'quoted', 'reviewing'])) {
            return response()->json([
                'success' => false,
                'message' => "Cannot convert request with status '{$rideRequest->status}'. Must be accepted, quoted, or reviewing.",
            ], 400);
        }

        // Already converted?
        if ($rideRequest->converted_event_code) {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been converted to an event.',
                'data' => ['event_code' => $rideRequest->converted_event_code],
            ], 400);
        }

        try {
            $converter = app(\App\Services\CustomRideToEventConversionService::class);
            $event = $converter->convert($rideRequest, $user->id);

            Log::info('Custom ride request converted to event', [
                'request_id' => $requestId,
                'event_code' => $event->event_code,
                'converted_by' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Custom ride request converted to event successfully.',
                'data' => [
                    'event' => $event,
                    'event_code' => $event->event_code,
                    'ride_request' => $rideRequest->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to convert custom ride request to event', [
                'request_id' => $requestId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to convert request: ' . $e->getMessage(),
            ], 500);
        }
    }
}
