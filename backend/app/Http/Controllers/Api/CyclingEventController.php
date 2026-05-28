<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CyclingEvent;
use App\Services\EventCodeService;
use App\Services\CloudinaryService;
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
            ->where('status', 'open')
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
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Comprehensive validation matching frontend form
        $validated = $request->validate([
            // Step 1: Basic Info
            'title' => 'required|string|min:5|max:100',
            'short_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|string|in:group_ride,race,charity,training,social,corporate,private,theme',
            'difficulty' => 'required|string|in:beginner,casual,intermediate,advanced,expert',
            'terrain' => 'required|string|in:road,gravel,mtb_trail,mixed',
            'theme_name' => 'nullable|string|max:100',
            'charity_name' => 'nullable|string|max:100',
            'charity_url' => 'nullable|url|max:255',

            // Step 2: Route & Schedule
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

            // Step 3: Pricing & Capacity
            'max_participants' => 'required|integer|min:1|max:1000',
            'min_participants' => 'nullable|integer|min:1|lte:max_participants',
            'price_per_person' => 'required|numeric|min:0',
            'member_price' => 'nullable|numeric|min:0|lte:price_per_person',
            'early_bird_price' => 'nullable|numeric|min:0|lt:price_per_person',
            'early_bird_deadline' => 'nullable|date|before:start_datetime|required_with:early_bird_price',
            'group_discount_threshold' => 'nullable|integer|min:2|lte:max_participants',
            'group_discount_percent' => 'nullable|integer|min:1|max:100|required_with:group_discount_threshold',

            // Step 4: Guide & Logistics
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

            // Step 5: Photos (array of base64 or URLs)
            'photos' => 'nullable|array',
            'photos.*' => 'string', // base64 data URI or existing URL

            // System
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:30',
            'route_gpx_url' => 'nullable|url|max:255',
            'badge_earned_id' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($validated, $user, $request) {
            // Generate event code via Bennett Fibonacci 36th
            $eventCode = $this->eventCodeService->generate();

            // Generate slug from title
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $counter = 1;
            while (CyclingEvent::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Handle photo uploads to Cloudinary
            $photoUrls = [];
            if (!empty($validated['photos'])) {
                foreach ($validated['photos'] as $photo) {
                    if (str_starts_with($photo, 'data:image')) {
                        // Base64 upload
                        $uploadResult = $this->cloudinary->uploadBase64($photo, [
                            'folder' => 'events/' . $eventCode,
                            'resource_type' => 'image',
                        ]);
                        $photoUrls[] = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? $photo;
                    } elseif (str_starts_with($photo, 'http')) {
                        // Already a URL (from mock data or external)
                        $photoUrls[] = $photo;
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
                'photos' => $photoUrls,
                'status' => 'open',
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
        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
        $user = Auth::user();

        // Authorization: organizer or admin/super_admin
        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Can only update if not cancelled/completed
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
        ]);

        // Handle new photos
        if (!empty($validated['photos'])) {
            $photoUrls = $event->photos ?? [];
            foreach ($validated['photos'] as $photo) {
                if (str_starts_with($photo, 'data:image')) {
                    $uploadResult = $this->cloudinary->uploadBase64($photo, [
                        'folder' => 'events/' . $eventCode,
                    ]);
                    $photoUrls[] = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? $photo;
                } elseif (str_starts_with($photo, 'http')) {
                    $photoUrls[] = $photo;
                }
            }
            $validated['photos'] = $photoUrls;
        }

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
        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
        $user = Auth::user();

        if ($event->organizer_id !== $user->id && !$user->hasAdminAccess()) {
            return response()->json(['error' => 'Unauthorized'], 403);
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
        $event = CyclingEvent::where('event_code', $eventCode)->firstOrFail();
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
}
