<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreCustomRideRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = Auth::user();
        $isGuest = is_null($user);

        return [
            // Ride Basics
            'title' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:5000'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'date_flexible' => ['sometimes', 'boolean'],
            'date_flexibility_days' => ['sometimes', 'integer', 'min:0', 'max:14'],

            // Group
            'group_size' => ['required', 'integer', 'min:1', 'max:50'],
            'rider_count' => ['sometimes', 'integer', 'min:1', 'max:50'],

            // Preferences
            'difficulty' => ['required', 'in:beginner,intermediate,advanced,expert'],
            'terrain' => ['required', 'in:road,trail,gravel,mountain,mixed'],
            'distance_km' => ['nullable', 'integer', 'min:1', 'max:500'],
            'duration_hours' => ['nullable', 'integer', 'min:1', 'max:72'],

            // Bike
            'bike_model' => ['nullable', 'string', 'max:100'],
            'bike_size' => ['nullable', 'string', 'max:10'],
            'add_ons' => ['nullable', 'array'],
            'add_ons.*' => ['in:helmet,lights,lock,repair_kit,bottle,gloves'],

            // Pricing
            'base_rental_price' => ['nullable', 'numeric', 'min:0'],
            'add_ons_price' => ['nullable', 'numeric', 'min:0'],
            'insurance_price' => ['nullable', 'numeric', 'min:0'],
            'transport_price' => ['nullable', 'numeric', 'min:0'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'total_price' => ['nullable', 'numeric', 'min:0'],
            'budget_estimate' => ['nullable', 'numeric', 'min:0'],

            // Options
            'insurance_included' => ['sometimes', 'boolean'],
            'transport_included' => ['sometimes', 'boolean'],
            'transport_notes' => ['nullable', 'string', 'max:500'],

            // Contact
            'contact_phone' => ['required', 'string', 'max:20'],

            // Guest info — ONLY required when not authenticated
            'guest_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:100'],
            'guest_email' => [$isGuest ? 'required' : 'nullable', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:20'],

            // Images
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpeg,png,webp', 'max:10240'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Convert string booleans from FormData
        $booleans = ['date_flexible', 'insurance_included', 'transport_included'];
        $converted = [];

        foreach ($booleans as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                $converted[$field] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }
        }

        if (!empty($converted)) {
            $this->merge($converted);
        }
    }
}
