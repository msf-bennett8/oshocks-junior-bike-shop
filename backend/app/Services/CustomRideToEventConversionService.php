<?php

namespace App\Services;

use App\Models\CustomRideRequest;
use App\Models\CyclingEvent;
use App\Models\CustomRideRequestImage;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomRideToEventConversionService
{
    private EventCodeService $eventCodeService;
    private EventImageUploadService $eventImageUploadService;

    public function __construct(
        EventCodeService $eventCodeService,
        EventImageUploadService $eventImageUploadService
    ) {
        $this->eventCodeService = $eventCodeService;
        $this->eventImageUploadService = $eventImageUploadService;
    }

    /**
     * Convert an approved custom ride request into a cycling event
     */
    public function convert(CustomRideRequest $rideRequest, ?int $adminId = null): CyclingEvent
    {
        return DB::transaction(function () use ($rideRequest, $adminId) {
            // Generate event code
            $eventCode = $this->eventCodeService->generate();

            // Generate slug
            $slug = Str::slug($rideRequest->title);
            $originalSlug = $slug;
            $counter = 1;
            while (CyclingEvent::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-" . $counter++;
            }

            // Calculate start and end datetime
            $startDateTime = Carbon::parse($rideRequest->preferred_date)->setTime(8, 0); // Default 8 AM
            $durationHours = $rideRequest->duration_hours ?? 3;
            $endDateTime = $startDateTime->copy()->addHours($durationHours);

            // Build photos array from custom ride images
            $photos = [];
            foreach ($rideRequest->images as $image) {
                $photos[] = [
                    'url' => $image->secure_url ?? $image->url,
                    'public_id' => $image->public_id,
                    'original_name' => $image->original_name,
                    'width' => $image->width,
                    'height' => $image->height,
                    'format' => $image->format,
                    'size' => $image->file_size,
                ];
            }

            // Map bike category
            $bikeCategory = null;
            if ($rideRequest->bike_model) {
                $bikeCategory = $this->mapBikeModelToCategory($rideRequest->bike_model);
            }

            // Determine organizer
            $organizerId = $rideRequest->user_id ?? $adminId;

            // Create the cycling event
            $event = CyclingEvent::create([
                'event_code' => $eventCode,
                'slug' => $slug,
                'title' => $rideRequest->title,
                'short_description' => Str::limit($rideRequest->description, 255),
                'description' => $rideRequest->description,
                'event_type' => 'custom_ride',
                'difficulty' => $rideRequest->difficulty ?? 'beginner',
                'terrain' => $rideRequest->terrain ?? 'road',
                'distance_km' => $rideRequest->distance_km ?? 10,
                'estimated_duration_hours' => $durationHours,
                'meeting_point' => 'To be confirmed', // Admin should update this
                'start_datetime' => $startDateTime,
                'end_datetime' => $endDateTime,
                'registration_deadline' => $startDateTime->copy()->subDays(1),
                'max_participants' => $rideRequest->rider_count ?? $rideRequest->group_size ?? 10,
                'min_participants' => 1,
                'price_per_person' => $rideRequest->budget_estimate ?? 0,
                'member_price' => $rideRequest->budget_estimate ? $rideRequest->budget_estimate * 0.9 : null,
                'bike_included' => !empty($rideRequest->bike_model),
                'included_bike_category' => $bikeCategory,
                'transport_included' => $rideRequest->transport_included ?? false,
                'transport_price' => $rideRequest->transport_price ?? 0,
                'equipment_provided' => $rideRequest->add_ons ?? [],
                'refund_policy' => 'full_24h',
                'photos' => $photos,
                'status' => 'open',
                'current_participants' => 0,
                'rating' => 0.0,
                'review_count' => 0,
                'organizer_id' => $organizerId ?? $adminId,
                'tags' => ['custom-ride', 'user-requested'],
                'submitted_by' => 'custom_ride',
                'approved_by' => $adminId,
                'approved_at' => now(),
            ]);

            // Update the custom ride request with conversion reference
            $rideRequest->update([
                'status' => 'converted',
                'converted_event_code' => $eventCode,
                'converted_at' => now(),
                'converted_by' => $adminId,
            ]);

            return $event;
        });
    }

    /**
     * Map bike model string to category
     */
    private function mapBikeModelToCategory(?string $bikeModel): ?string
    {
        if (!$bikeModel) return null;

        $model = strtolower($bikeModel);

        if (str_contains($model, 'mountain') || str_contains($model, 'mtb') || str_contains($model, 'trail')) {
            return 'mountain';
        }
        if (str_contains($model, 'road') || str_contains($model, 'racing')) {
            return 'road';
        }
        if (str_contains($model, 'electric') || str_contains($model, 'e-bike') || str_contains($model, 'ebike')) {
            return 'electric';
        }
        if (str_contains($model, 'kids') || str_contains($model, 'children')) {
            return 'kids';
        }
        if (str_contains($model, 'gravel') || str_contains($model, 'adventure')) {
            return 'gravel';
        }

        return 'hybrid';
    }

    /**
     * Preview what the event would look like before converting
     */
    public function preview(CustomRideRequest $rideRequest): array
    {
        $startDateTime = Carbon::parse($rideRequest->preferred_date)->setTime(8, 0);
        $durationHours = $rideRequest->duration_hours ?? 3;

        return [
            'title' => $rideRequest->title,
            'event_type' => 'custom_ride',
            'difficulty' => $rideRequest->difficulty ?? 'beginner',
            'terrain' => $rideRequest->terrain ?? 'road',
            'distance_km' => $rideRequest->distance_km ?? 10,
            'estimated_duration_hours' => $durationHours,
            'max_participants' => $rideRequest->rider_count ?? $rideRequest->group_size ?? 10,
            'price_per_person' => $rideRequest->budget_estimate ?? 0,
            'start_datetime' => $startDateTime->toDateTimeString(),
            'end_datetime' => $startDateTime->copy()->addHours($durationHours)->toDateTimeString(),
            'bike_included' => !empty($rideRequest->bike_model),
            'photos_count' => $rideRequest->images->count(),
            'meeting_point' => 'To be confirmed — update after conversion',
        ];
    }
}
