<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && (
            auth()->user()->role === 'admin' ||
            auth()->user()->role === 'super_admin' ||
            auth()->user()->role === 'support_agent' ||
            auth()->user()->role === 'seller'
        );
    }

    public function rules(): array
    {
        return [
            'confirmed_date' => 'required|date|after_or_equal:today',
            'confirmed_time' => 'nullable|string|max:20',
            'assigned_mechanic_id' => 'nullable|exists:users,id',
            'estimated_duration' => 'nullable|string|max:50',
            'staff_notes' => 'nullable|string|max:2000',
            'final_price' => 'nullable|numeric|min:0',
        ];
    }
}
