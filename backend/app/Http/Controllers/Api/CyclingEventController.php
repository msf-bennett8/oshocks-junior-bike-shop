<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEvent;
use App\Models\CyclingEventRegistration;
use App\Services\EventCodeService;
use App\Services\CloudinaryService;
use App\Services\EventImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CyclingEventController extends Controller
{
    private EventCodeService $eventCodeService;
    private CloudinaryService $cloudinary;

    public function __construct(EventCodeService $eventCodeService, CloudinaryService $cloudinary)
    {
        $this->eventCodeService = $eventCodeService;
        $this->cloudinary = $cloudinary;
    }

    /**
     * List all events (public)
     */
    public function index(Request $request)
    {
        $query = CyclingEvent::query()
            ->whereIn('status', ['open', 'pending'])
            ->where('start_datetime', '>=', now());

        // Filters
        if ($request->has('type')) {
            $query->where('event_type', $request->type);
        }
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }
        if ($request->has('terrain')) {
            $query->where('terrain', $request->terrain);
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('meeting_point', 'like', "%{$search}%");
            });
        }
        if ($request->has('min_price')) {
            $query->where('price_per_person', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_per_person', '<=', $request->max_price);
        }

        // Sorting
        $sortBy = $request->get('sort', 'start_datetime');
        $sortOrder = $request->get('order', 'asc');
        $allowedSorts = ['start_datetime', 'price_per_person', 'distance_km', 'created_at', 'rating'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $events = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]
        ]);
    }

    /**
     * Show single event by code (public)
     */
    public function show(string $eventCode)
    {
        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();

        return response()->json([
            'data' => $event,
            'seats_remaining' => $event->seats_remaining,
            'is_full' => $event->is_full,
        ]);
    }

        /**
     * Create new event (auth required)
     * Accepts multipart/form-data with 'images[]' files OR JSON with base64 'photos[]'
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Comprehensive validation
        $validated = $request->validate([
            'title' => 'required|string|min:5|max:100',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|string|in:group_ride,race,charity,training,social,corporate,private,theme',
            'difficulty' => 'required|string|in:beginner,casual,intermediate,advanced,expert',
            'terrain' => 'required|string|in:road,gravel,mtb_trail,mixed',
            'theme_name' => 'nullable|string|max:100',
            'charity_name' => 'nullable|string|max:100',
            'charity_url' => 'nullable|url|max:255',
            'route_name' => 'nullable|string|max:100',
            'route_description' => 'nullable|string',
            'distance_km' => 'required|numeric|min:0.1|max:500',
            'elevation_gain_m' => 'nullable|integer|min:0',
            'estimated_duration_hours' => 'required|numeric|min:0.5|max:24',
            'meeting_point' => 'required|string|max:255',
            'meeting_lat' => 'nullable|numeric|between:-90,90',
            'meeting_lng' => 'nullable|numeric|between:-180,180',
            'start_datetime' => 'required|date|after:now',
            'end_datetime' => 'required|date|after:start_datetime',
            'registration_deadline' => 'nullable|date|before:start_datetime',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|string|max:100|required_if:is_recurring,true',
            'max_participants' => 'required|integer|min:1|max:1000',
            'min_participants' => 'nullable|integer|min:1|lte:max_participants',
            'price_per_person' => 'required|numeric|min:0',
            'member_price' => 'nullable|numeric|min:0|lte:price_per_person',
            'early_bird_price' => 'nullable|numeric|min:0|lt:price_per_person',
            'early_bird_deadline' => 'nullable|date|before:start_datetime|required_with:early_bird_price',
            'group_discount_threshold' => 'nullable|integer|min:2|lte:max_participants',
            'group_discount_percent' => 'nullable|integer|min:1|max:100|required_with:group_discount_threshold',
            'guide_included' => 'boolean',
            'guide_name' => 'nullable|string|max:100|required_if:guide_included,true',
            'guide_bio' => 'nullable|string|required_if:guide_included,true',
            'guide_certifications' => 'nullable|array',
            'guide_certifications.*' => 'string|max:100',
            'bike_included' => 'boolean',
            'included_bike_category' => 'nullable|string|max:50|required_if:bike_included,true',
            'transport_provided' => 'boolean',
            'transport_price' => 'nullable|numeric|min:0|required_if:transport_provided,true',
            'equipment_provided' => 'nullable|array',
            'equipment_provided.*' => 'string|max:50',
            'required_equipment' => 'nullable|array',
            'required_equipment.*' => 'string|max:50',
            'refund_policy' => 'nullable|string|in:full_24h,full_48h,full_anytime,tiered,corporate,no_refund',
            'cancellation_policy' => 'nullable|string',
            'weather_policy' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'file|image|max:10240',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:30',
            'route_gpx_url' => 'nullable|url|max:255',
            'badge_earned_id' => 'nullable|integer',
        ]);

        // Parse JSON string arrays from FormData if needed
        $jsonFields = ['guide_certifications', 'equipment_provided', 'required_equipment', 'tags'];
        foreach ($jsonFields as $field) {
            if (isset($validated[$field]) && is_string($validated[$field])) {
                $decoded = json_decode($validated[$field], true);
                $validated[$field] = is_array($decoded) ? $decoded : [];
            }
        }

        return DB::transaction(function () use ($validated, $user, $request) {
            // Generate event code
            $eventCode = $this->eventCodeService->generate();

            // Generate slug
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $counter = 1;
            while (CyclingEvent::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Handle image uploads
            $photoData = [];
            $uploadService = app(EventImageUploadService::class);

            // 1. Handle multipart file uploads (preferred)
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $imageFile) {
                    $result = $uploadService->uploadEventImage($imageFile, $eventCode);
                    if ($result['success']) {
                        $photoData[] = [
                            'url' => $result['secure_url'],
                            'public_id' => $result['public_id'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['medium_url'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'format' => $result['format'],
                            'size' => $result['file_size'],
                        ];
                    }
                }
            }

            // 2. Handle base64 strings (fallback for JSON API)
            if (!empty($validated['photos'])) {
                foreach ($validated['photos'] as $photo) {
                    if (str_starts_with($photo, 'data:image')) {
                        $result = $uploadService->uploadBase64EventImage($photo, $eventCode);
                        if ($result['success']) {
                            $photoData[] = [
                                'url' => $result['secure_url'],
                                'public_id' => $result['public_id'],
                                'thumbnail_url' => $result['thumbnail_url'],
                                'medium_url' => $result['medium_url'],
                                'width' => $result['width'],
                                'height' => $result['height'],
                                'format' => $result['format'],
                                'size' => $result['file_size'],
                            ];
                        }
                    } elseif (str_starts_with($photo, 'http')) {
                        // External URL - store as-is (for mock data migration)
                        $photoData[] = ['url' => $photo];
                    }
                }
            }

            // Create event
            $event = CyclingEvent::create([
                'event_code' => $eventCode,
                'slug' => $slug,
                'title' => $validated['title'],
                'short_description' => $validated['short_description'] ?? null,
                'description' => $validated['description'] ?? null,
                'event_type' => $validated['event_type'],
                'difficulty' => $validated['difficulty'],
                'terrain' => $validated['terrain'],
                'theme_name' => $validated['theme_name'] ?? null,
                'charity_name' => $validated['charity_name'] ?? null,
                'charity_url' => $validated['charity_url'] ?? null,
                'route_name' => $validated['route_name'] ?? null,
                'route_description' => $validated['route_description'] ?? null,
                'distance_km' => $validated['distance_km'],
                'elevation_gain_m' => $validated['elevation_gain_m'] ?? null,
                'estimated_duration_hours' => $validated['estimated_duration_hours'],
                'meeting_point' => $validated['meeting_point'],
                'meeting_lat' => $validated['meeting_lat'] ?? null,
                'meeting_lng' => $validated['meeting_lng'] ?? null,
                'start_datetime' => $validated['start_datetime'],
                'end_datetime' => $validated['end_datetime'],
                'registration_deadline' => $validated['registration_deadline'] ?? null,
                'is_recurring' => $validated['is_recurring'] ?? false,
                'recurrence_pattern' => $validated['recurrence_pattern'] ?? null,
                'max_participants' => $validated['max_participants'],
                'min_participants' => $validated['min_participants'] ?? null,
                'price_per_person' => $validated['price_per_person'],
                'member_price' => $validated['member_price'] ?? null,
                'early_bird_price' => $validated['early_bird_price'] ?? null,
                'early_bird_deadline' => $validated['early_bird_deadline'] ?? null,
                'group_discount_threshold' => $validated['group_discount_threshold'] ?? null,
                'group_discount_percent' => $validated['group_discount_percent'] ?? null,
                'guide_included' => $validated['guide_included'] ?? false,
                'guide_name' => $validated['guide_name'] ?? null,
                'guide_bio' => $validated['guide_bio'] ?? null,
                'guide_certifications' => $validated['guide_certifications'] ?? [],
                'bike_included' => $validated['bike_included'] ?? false,
                'included_bike_category' => $validated['included_bike_category'] ?? null,
                'transport_provided' => $validated['transport_provided'] ?? false,
                'transport_price' => $validated['transport_price'] ?? null,
                'equipment_provided' => $validated['equipment_provided'] ?? [],
                'required_equipment' => $validated['required_equipment'] ?? [],
                'refund_policy' => $validated['refund_policy'] ?? null,
                'cancellation_policy' => $validated['cancellation_policy'] ?? null,
                'weather_policy' => $validated['weather_policy'] ?? null,
                'photos' => $photoData,
                'status' => $user->hasAdminAccess() ? 'open' : 'pending',
                'approved_by' => $user->hasAdminAccess() ? $user->id : null,
                'approved_at' => $user->hasAdminAccess() ? now() : null,
                'submitted_by' => $user->hasAdminAccess() ? 'admin' : 'user',
                'current_participants' => 0,
                'rating' => 0.0,
                'review_count' => 0,
                'organizer_id' => $user->id,
                'tags' => $validated['tags'] ?? [],
                'route_gpx_url' => $validated['route_gpx_url'] ?? null,
                'badge_earned_id' => $validated['badge_earned_id'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'data' => $event,
                'event_code' => $eventCode,
                'message' => 'Event created successfully',
            ], 201);
        });
    }

        /**
     * Update event (organizer or admin only)
     */
    public function update(Request $request, string $eventCode)
    {
        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();
        $user = Auth::user();

        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (in_array($event->status, ['cancelled', 'completed'])) {
            return response()->json(['error' => 'Cannot update cancelled or completed events'], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|min:5|max:100',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'max_participants' => 'sometimes|integer|min:' . ($event->current_participants + 1),
            'price_per_person' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:open,closed',
            'photos' => 'nullable|array',
            'photos.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'file|image|max:10240',
            'remove_photos' => 'nullable|array',
            'remove_photos.*' => 'string',
        ]);

        // Parse JSON string arrays from FormData if needed
        $jsonFields = ['guide_certifications', 'equipment_provided', 'required_equipment', 'tags'];
        foreach ($jsonFields as $field) {
            if (isset($validated[$field]) && is_string($validated[$field])) {
                $decoded = json_decode($validated[$field], true);
                $validated[$field] = is_array($decoded) ? $decoded : [];
            }
        }

        $uploadService = app(EventImageUploadService::class);
        $photoData = $event->photos ?? [];

        // Delete removed photos from Cloudinary
        if (!empty($validated['remove_photos'])) {
            foreach ($photoData as $idx => $photo) {
                if (isset($photo['public_id']) && in_array($photo['public_id'], $validated['remove_photos'])) {
                    $uploadService->deleteEventImage($photo['public_id']);
                    unset($photoData[$idx]);
                }
            }
            $photoData = array_values($photoData);
        }

        // Handle new multipart uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $imageFile) {
                $result = $uploadService->uploadEventImage($imageFile, $eventCode);
                if ($result['success']) {
                    $photoData[] = [
                        'url' => $result['secure_url'],
                        'public_id' => $result['public_id'],
                        'thumbnail_url' => $result['thumbnail_url'],
                        'medium_url' => $result['medium_url'],
                        'width' => $result['width'],
                        'height' => $result['height'],
                        'format' => $result['format'],
                        'size' => $result['file_size'],
                    ];
                }
            }
        }

        // Handle base64 additions
        if (!empty($validated['photos'])) {
            foreach ($validated['photos'] as $photo) {
                if (str_starts_with($photo, 'data:image')) {
                    $result = $uploadService->uploadBase64EventImage($photo, $eventCode);
                    if ($result['success']) {
                        $photoData[] = [
                            'url' => $result['secure_url'],
                            'public_id' => $result['public_id'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['medium_url'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'format' => $result['format'],
                            'size' => $result['file_size'],
                        ];
                    }
                }
            }
        }

        $validated['photos'] = $photoData;
        // Remove non-model keys
        unset($validated['images'], $validated['remove_photos']);

        $event->update($validated);

        return response()->json([
            'success' => true,
            'data' => $event,
            'message' => 'Event updated successfully',
        ]);
    }

    /**
     * Delete event (soft delete, organizer or admin only)
     */
    public function destroy(string $eventCode)
    {
        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();
        $user = Auth::user();

        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Clean up Cloudinary images
        $uploadService = app(EventImageUploadService::class);
        foreach ($event->photos ?? [] as $photo) {
            if (isset($photo['public_id'])) {
                $uploadService->deleteEventImage($photo['public_id']);
            }
        }

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully',
        ]);
    }

    /**
     * Get my events (as organizer)
     */
    public function myEvents(Request $request)
    {
        $user = Auth::user();
        $events = CyclingEvent::where('organizer_id', $user->id)
            ->orderBy('start_datetime', 'desc')
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ]
        ]);
    }

    /**
     * Get event stats (for organizer dashboard)
     */
    public function stats(string $eventCode)
    {
        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();
        $user = Auth::user();

        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => [
                'event_code' => $event->event_code,
                'title' => $event->title,
                'total_bookings' => $event->current_participants,
                'seats_remaining' => $event->seats_remaining,
                'capacity_percent' => $event->max_participants > 0
                    ? round(($event->current_participants / $event->max_participants) * 100, 1)
                    : 0,
                'revenue_estimate' => $event->current_participants * $event->price_per_person,
                'status' => $event->status,
                'is_full' => $event->is_full,
            ]
        ]);
    }

    /**
     * Register for an event (authenticated user)
     * POST /api/v1/events/{eventCode}/register
     */
    public function register(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Authentication required.'], 401);
        }

        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();

        // Check if event is open for registration
        if (!in_array($event->status, ['open', 'pending'])) {
            return response()->json(['success' => false, 'message' => 'Event is not open for registration.'], 400);
        }

        // Check if registration deadline passed
        if ($event->registration_deadline && now()->gt($event->registration_deadline)) {
            return response()->json(['success' => false, 'message' => 'Registration deadline has passed.'], 400);
        }

        // ─── Idempotency: prevent duplicate processing ───
        $idempotencyKey = $request->header('X-Idempotency-Key') ?? $request->input('_idempotency_key');
        if ($idempotencyKey) {
            $cacheKey = "event_reg:{$user->id}:{$event->id}:" . md5($idempotencyKey);
            if (\Illuminate\Support\Facades\Cache::has($cacheKey)) {
                $cached = \Illuminate\Support\Facades\Cache::get($cacheKey);
                return response()->json([
                    'success' => true,
                    'message' => 'Registration already processed.',
                    'data' => $cached,
                ], 200);
            }
        }

        // Validate request
        $validated = $request->validate([
            'participant_count' => ['required', 'integer', 'min:1', 'max:' . $event->seats_remaining],
            'add_ons' => ['nullable', 'array'],
            'add_ons.transport' => ['boolean'],
            'add_ons.insurance' => ['boolean'],
            'add_ons.nutrition' => ['boolean'],
            'bike_included' => ['boolean'],
            'bike_rental_id' => ['nullable', 'integer', 'exists:bike_rentals,id'],
            'bike_add_ons' => ['nullable', 'array'],
            'emergency_contact_name' => ['required', 'string', 'max:100'],
            'emergency_contact_phone' => ['required', 'string', 'max:20'],
            'waiver_signed' => ['required', 'boolean'],
        ]);

        $participantCount = $validated['participant_count'] ?? 1;

        // Check capacity
        if ($event->is_full || $event->seats_remaining < $participantCount) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough seats available.',
                'seats_remaining' => $event->seats_remaining,
            ], 400);
        }

        // Calculate pricing
        $pricePerPerson = $event->price_per_person;
        $totalAmount = $pricePerPerson * $participantCount;

        // Early bird discount
        $discountAmount = 0;
        if ($event->early_bird_price && $event->early_bird_deadline && now()->lte($event->early_bird_deadline)) {
            $discountAmount = ($event->price_per_person - $event->early_bird_price) * $participantCount;
        }

        // Group discount
        if ($participantCount >= $event->group_discount_threshold && $event->group_discount_percent) {
            $groupDiscount = round($totalAmount * ($event->group_discount_percent / 100), 2);
            $discountAmount += $groupDiscount;
        }

        $finalAmount = max(0, $totalAmount - $discountAmount);

        // Add-on pricing
        $addOns = $validated['add_ons'] ?? [];
        $addOnsTotal = 0;
        if (!empty($addOns['transport']) && $event->transport_provided) {
            $addOnsTotal += $event->transport_price * $participantCount;
        }
        if (!empty($addOns['insurance'])) {
            $addOnsTotal += 200 * $participantCount;
        }
        if (!empty($addOns['nutrition'])) {
            $addOnsTotal += 300 * $participantCount;
        }

        $finalAmount += $addOnsTotal;

        // Generate registration code
        $registrationCode = app(\App\Services\BookingIdService::class)->generate();

        try {
            $result = DB::transaction(function () use ($event, $user, $validated, $participantCount, $pricePerPerson, $totalAmount, $discountAmount, $finalAmount, $addOns, $registrationCode) {
                // Lock the event row to prevent race conditions on capacity
                $lockedEvent = CyclingEvent::where('id', $event->id)->lockForUpdate()->first();

                // Check if already registered (inside transaction with lock)
                $existing = CyclingEventRegistration::where('event_id', $lockedEvent->id)
                    ->where('user_id', $user->id)
                    ->where('status', '!=', 'cancelled')
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    return [
                        'type' => 'existing',
                        'registration' => $existing->load(['event', 'user', 'bike']),
                        'registration_code' => $existing->registration_code,
                        'amount_due' => $existing->final_amount,
                        'payment_required' => $existing->final_amount > 0 && $existing->payment_status !== 'paid',
                    ];
                }

                // Verify capacity again (inside locked transaction)
                if ($lockedEvent->is_full || $lockedEvent->seats_remaining < $participantCount) {
                    return [
                        'type' => 'error',
                        'message' => 'Not enough seats available.',
                        'seats_remaining' => $lockedEvent->seats_remaining,
                        'code' => 400,
                    ];
                }

                // Create registration
                $registration = CyclingEventRegistration::create([
                    'registration_code' => $registrationCode,
                    'event_id' => $lockedEvent->id,
                    'user_id' => $user->id,
                    'participant_count' => $participantCount,
                    'price_per_person' => $pricePerPerson,
                    'total_amount' => $totalAmount,
                    'discount_amount' => $discountAmount,
                    'final_amount' => $finalAmount,
                    'add_ons' => $addOns,
                    'bike_included' => $validated['bike_included'] ?? false,
                    'bike_rental_id' => $validated['bike_rental_id'] ?? null,
                    'bike_add_ons' => $validated['bike_add_ons'] ?? null,
                    'emergency_contact_name' => $validated['emergency_contact_name'],
                    'emergency_contact_phone' => $validated['emergency_contact_phone'],
                    'waiver_signed' => $validated['waiver_signed'],
                    'payment_status' => 'pending',
                    'status' => 'registered',
                ]);

                // Update event participant count
                $lockedEvent->increment('current_participants', $participantCount);

                return [
                    'type' => 'new',
                    'registration' => $registration->load(['event', 'user', 'bike']),
                    'registration_code' => $registrationCode,
                    'amount_due' => $finalAmount,
                    'payment_required' => $finalAmount > 0,
                ];
            });

            if ($result['type'] === 'error') {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                    'seats_remaining' => $result['seats_remaining'],
                ], $result['code']);
            }

            // Cache result for idempotency (5 minutes)
            if ($idempotencyKey) {
                $cacheKey = "event_reg:{$user->id}:{$event->id}:" . md5($idempotencyKey);
                \Illuminate\Support\Facades\Cache::put($cacheKey, $result, 300);
            }

            $statusCode = $result['type'] === 'existing' ? 200 : 201;
            $message = $result['type'] === 'existing' ? 'Registration already processed.' : 'Registration successful.';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'registration' => $result['registration'],
                    'registration_code' => $result['registration_code'],
                    'amount_due' => $result['amount_due'],
                    'payment_required' => $result['payment_required'],
                ],
            ], $statusCode);

        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            // Another request won the race — return existing registration
            $existing = CyclingEventRegistration::where('event_id', $event->id)
                ->where('user_id', $user->id)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => true,
                    'message' => 'Registration already processed.',
                    'data' => [
                        'registration' => $existing->load(['event', 'user', 'bike']),
                        'registration_code' => $existing->registration_code,
                        'amount_due' => $existing->final_amount,
                        'payment_required' => $existing->final_amount > 0 && $existing->payment_status !== 'paid',
                    ],
                ], 200);
            }

            throw $e;
        }
    }

    /**
     * Unregister from an event (cancel registration)
     * POST /api/v1/events/{eventCode}/unregister
     */
    public function unregister(Request $request, string $eventCode)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Authentication required.'], 401);
        }

        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();

        $registration = CyclingEventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->where('status', 'registered')
            ->first();

        if (!$registration) {
            return response()->json(['success' => false, 'message' => 'No active registration found.'], 404);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        return DB::transaction(function () use ($registration, $event, $validated) {
            // Update registration
            $registration->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $validated['reason'] ?? null,
            ]);

            // Decrement event participant count
            $event->decrement('current_participants', $registration->participant_count);

            return response()->json([
                'success' => true,
                'message' => 'Registration cancelled successfully.',
                'data' => $registration->fresh(),
            ]);
        });
    }

    /**
     * Get my event registrations
     * GET /api/v1/events/my/registrations
     */
    public function myRegistrations(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Authentication required.'], 401);
        }

        $status = $request->get('status'); // registered, cancelled, attended
        $tab = $request->get('tab', 'upcoming'); // upcoming, past, all

        $query = CyclingEventRegistration::with(['event', 'bike'])
            ->where('user_id', $user->id);

        if ($status) {
            $query->where('status', $status);
        }

        if ($tab === 'upcoming') {
            $query->whereHas('event', function ($q) {
                $q->where('start_datetime', '>=', now());
            })->where('status', '!=', 'cancelled');
        } elseif ($tab === 'past') {
            $query->whereHas('event', function ($q) {
                $q->where('start_datetime', '<', now());
            })->where('status', '!=', 'cancelled');
        } elseif ($tab === 'cancelled') {
            $query->where('status', 'cancelled');
        }

        $registrations = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 12));

        // Append computed attributes
        $registrations->getCollection()->transform(function ($reg) {
            $reg->append('is_refundable', 'qr_data', 'display_status');
            return $reg;
        });

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
     * Request refund for a registration
     */
    public function requestRefund(Request $request, string $registrationCode)
    {
        $user = Auth::user();
        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('user_id', $user->id)
            ->where('status', 'registered')
            ->where('payment_status', 'paid')
            ->whereNull('refund_status')
            ->firstOrFail();

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $registration->update([
            'refund_status' => 'pending',
            'refund_reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund request submitted for review',
            'data' => $registration->fresh(),
        ]);
    }

       /**
     * Generate event ticket with QR code (SVG-based, no GD required)
     * Returns full ticket data with base64-encoded SVG
     */
    public function downloadTicket(string $registrationCode)
    {
        $user = Auth::user();
        $registration = CyclingEventRegistration::with(['event', 'bike', 'user'])
            ->where('registration_code', $registrationCode)
            ->where('user_id', $user->id)
            ->where('status', 'registered')
            ->firstOrFail();

        $event = $registration->event;

        // Generate tamper-evident QR data with HMAC signature
        $qrPayload = [
            'v' => '1', // version
            'c' => $registration->registration_code,
            'e' => $event->event_code,
            'u' => $user->id,
            'p' => $registration->participant_count,
            't' => $registration->created_at->timestamp,
            'x' => now()->addDays(7)->timestamp, // expiry
        ];

        // Create signed payload to prevent tampering
        $payloadString = json_encode($qrPayload);
        $signature = hash_hmac('sha256', $payloadString, config('app.key'));
        $qrPayload['s'] = substr($signature, 0, 16); // truncated signature for QR

        $qrDataString = json_encode($qrPayload);

        // Generate QR code using SVG writer (no GD required!)
        $qrCode = new \Endroid\QrCode\QrCode(
            data: $qrDataString,
            encoding: new \Endroid\QrCode\Encoding\Encoding('UTF-8'),
            errorCorrectionLevel: \Endroid\QrCode\ErrorCorrectionLevel::High,
            size: 400,
            margin: 10,
            roundBlockSizeMode: \Endroid\QrCode\RoundBlockSizeMode::Margin,
            foregroundColor: new \Endroid\QrCode\Color\Color(0, 0, 0),
            backgroundColor: new \Endroid\QrCode\Color\Color(255, 255, 255)
        );

        // Use SVG writer — no GD/Imagick required
        $writer = new \Endroid\QrCode\Writer\SvgWriter();
        $result = $writer->write($qrCode);

        // SVG is text-based, so we base64 encode it for JSON transport
        $svgString = $result->getString();
        $svgBase64 = base64_encode($svgString);

        return response()->json([
            'success' => true,
            'data' => [
                'registration_code' => $registration->registration_code,
                'registration' => [
                    'participant_count' => $registration->participant_count,
                    'final_amount' => $registration->final_amount,
                    'payment_status' => $registration->payment_status,
                    'payment_method' => $registration->payment_method,
                    'add_ons' => $registration->add_ons,
                    'bike_included' => $registration->bike_included,
                    'bike_add_ons' => $registration->bike_add_ons,
                    'emergency_contact_name' => $registration->emergency_contact_name,
                    'emergency_contact_phone' => $registration->emergency_contact_phone,
                    'waiver_signed' => $registration->waiver_signed,
                    'checked_in_at' => $registration->checked_in_at,
                ],
                'event' => [
                    'title' => $event->title,
                    'event_code' => $event->event_code,
                    'slug' => $event->slug,
                    'start_datetime' => $event->start_datetime,
                    'end_datetime' => $event->end_datetime,
                    'meeting_point' => $event->meeting_point,
                    'distance_km' => $event->distance_km,
                    'difficulty' => $event->difficulty,
                    'terrain' => $event->terrain,
                    'refund_policy' => $event->refund_policy,
                    'cancellation_policy' => $event->cancellation_policy,
                    'weather_policy' => $event->weather_policy,
                    'photos' => $event->photos,
                    'organizer' => $event->organizer?->only(['name', 'email', 'phone']),
                ],
                'bike' => $registration->bike ? [
                    'brand' => $registration->bike->brand,
                    'model' => $registration->bike->model,
                    'frame_size' => $registration->bike->frame_size,
                    'bike_condition' => $registration->bike->bike_condition,
                    'category' => $registration->bike->category,
                ] : null,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'qr_base64' => $svgBase64,
                'qr_mime_type' => 'image/svg+xml',
                'qr_data' => $qrDataString,
                'signature' => $signature,
                'issued_at' => now()->toIso8601String(),
                'valid_until' => now()->addDays(7)->toIso8601String(),
            ],
        ]);
    }

    /**
     * Request transfer to another user
     */
    public function requestTransfer(Request $request, string $registrationCode)
    {
        $user = Auth::user();
        $registration = CyclingEventRegistration::where('registration_code', $registrationCode)
            ->where('user_id', $user->id)
            ->where('status', 'registered')
            ->firstOrFail();

        $validated = $request->validate([
            'new_user_email' => 'required|email|exists:users,email',
        ]);

        $newUser = User::where('email', $validated['new_user_email'])->firstOrFail();

        // Prevent self-transfer
        if ($newUser->id === $user->id) {
            return response()->json(['error' => 'Cannot transfer to yourself'], 400);
        }

        // Check capacity for new user (they might already be registered)
        $existing = CyclingEventRegistration::where('event_id', $registration->event_id)
            ->where('user_id', $newUser->id)
            ->where('status', 'registered')
            ->first();

        if ($existing) {
            return response()->json(['error' => 'User already registered for this event'], 400);
        }

        // Create transfer request (admin approval required)
        $registration->update([
            'status' => 'pending_transfer',
            'transfer_reason' => 'User requested transfer to ' . $newUser->email,
        ]);

        // TODO: Send notification to admin for approval

        return response()->json([
            'success' => true,
            'message' => 'Transfer request submitted for approval',
            'data' => $registration->fresh(),
        ]);
    }


    /**
     * Get event participants (organizer/admin only)
     * GET /api/v1/events/{eventCode}/participants
     */
    public function participants(Request $request, string $eventCode)
    {
        $user = Auth::user();
        $event = CyclingEvent::where('event_code', $eventCode)
            ->orWhere('slug', $eventCode)
            ->firstOrFail();

        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $registrations = CyclingEventRegistration::with('user')
            ->where('event_id', $event->id)
            ->where('status', 'registered')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

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
}
