<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BikeRentalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $owner = $this->whenLoaded('owner');
        
        // Transform photos array to images array (extract URLs)
        $images = [];
        if (!empty($this->photos)) {
            foreach ($this->photos as $photo) {
                if (is_array($photo) && isset($photo['url'])) {
                    $images[] = $photo['url'];
                } elseif (is_string($photo)) {
                    $images[] = $photo;
                }
            }
        }
        
        // Fallback if no images
        if (empty($images)) {
            $images = ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80'];
        }

        return [
            'id' => $this->id,
            'listing_code' => $this->listing_code,
            'owner_id' => $this->owner_id,
            'owner_type' => $this->owner_type,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->brand,
            'model' => $this->model,
            'year' => $this->year,
            'category' => $this->category,
            'frame_size' => $this->frame_size,
            'wheel_size' => $this->wheel_size,
            // Frontend expects 'condition', backend stores 'bike_condition'
            'condition' => $this->bike_condition,
            'bike_condition' => $this->bike_condition,
            'description' => $this->description,
            'hourly_rate' => (float) $this->hourly_rate,
            'daily_rate' => (float) $this->daily_rate,
            'weekly_rate' => (float) $this->weekly_rate,
            'monthly_rate' => (float) $this->monthly_rate,
            'security_deposit' => (float) $this->security_deposit,
            'min_rental_hours' => (int) $this->min_rental_hours,
            'max_rental_days' => (int) $this->max_rental_days,
            'location_lat' => $this->location_lat,
            'location_lng' => $this->location_lng,
            'location_address' => $this->location_address,
            'pickup_type' => $this->pickup_type,
            'delivery_fee' => (float) $this->delivery_fee,
            'instant_book' => (bool) $this->instant_book,
            'response_time_hours' => (int) $this->response_time_hours,
            'rental_rules' => $this->rental_rules,
            'cancellation_policy' => $this->cancellation_policy,
            'insurance_included' => (bool) $this->insurance_included,
            // Frontend expects 'images' array of strings
            'images' => $images,
            'photos' => $this->photos,
            // Frontend expects 'features' array
            'features' => $this->bike_features ?? [],
            'bike_features' => $this->bike_features ?? [],
            'listing_status' => $this->listing_status,
            'total_rentals' => (int) $this->total_rentals,
            'rating' => (float) $this->rating,
            'review_count' => (int) $this->review_count,
            'is_verified' => (bool) $this->is_verified,
            'is_active' => (bool) $this->is_active,
            'is_available' => $this->is_available,
            'owner_name' => $owner?->name ?? ($this->owner_type === 'platform' ? 'Oshocks Platform' : 'Unknown Owner'),
            'owner_avatar' => $owner?->avatar ?? $owner?->profile_image ?? null,
            'owner_rating' => (float) ($this->owner_rating ?? $owner?->rating ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
