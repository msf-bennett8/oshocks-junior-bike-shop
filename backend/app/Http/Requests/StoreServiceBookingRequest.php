<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Allow guests + auth users
    }

    public function rules(): array
    {
        return [
            // Customer info (required for guests, optional if auth)
            'customer_name' => 'required_without:user|nullable|string|max:100',
            'customer_phone' => 'required_without:user|nullable|string|max:20',
            'customer_email' => 'nullable|email|max:100',

            // Service details
            'service_type' => 'required|string|max:100',
            'service_description' => 'nullable|string|max:2000',
            'shop_location' => 'nullable|string|max:100',

            // Scheduling
            'requested_date' => 'required|date|after_or_equal:today',
            'preferred_time' => 'nullable|string|max:50', // e.g., "morning", "afternoon", "10:00 AM"

            // Optional seller preference
            'seller_id' => 'nullable|exists:seller_profiles,id',

            // Pricing
            'estimated_price' => 'nullable|numeric|min:0',

            // Notes
            'customer_notes' => 'nullable|string|max:2000',

            // Guest session (auto-populated by middleware)
            'guest_session_id' => 'nullable|string|max:64',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required_without' => 'Please provide your name.',
            'customer_phone.required_without' => 'Please provide your phone number.',
            'service_type.required' => 'Please select a service type.',
            'requested_date.required' => 'Please select a preferred date.',
            'requested_date.after_or_equal' => 'The appointment date must be today or later.',
            'seller_id.exists' => 'The selected shop is not available.',
        ];
    }

    /**
     * Prepare data for validation (auto-fill auth user details)
     */
    protected function prepareForValidation(): void
    {
        if (auth()->check()) {
            $user = auth()->user();
            $this->merge([
                'customer_name' => $this->input('customer_name', $user->name),
                'customer_email' => $this->input('customer_email', $user->email),
                'customer_phone' => $this->input('customer_phone', $user->phone),
            ]);
        }
    }
}
