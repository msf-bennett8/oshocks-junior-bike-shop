<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required_without:user|nullable|string|max:100',
            'email' => 'required|email|max:100',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:general,product,order,technical,partnership,feedback,wholesale,other',
            'message' => 'required|string|min:20|max:5000',
            'order_number' => 'nullable|string|max:50',
            'department' => 'nullable|string|in:sales,support,service,general',
            'guest_session_id' => 'nullable|string|max:64',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required_without' => 'Please provide your name.',
            'email.required' => 'Please provide your email address.',
            'email.email' => 'Please enter a valid email address.',
            'subject.required' => 'Please enter a subject.',
            'message.required' => 'Please enter your message.',
            'message.min' => 'Please provide more details (at least 20 characters).',
            'category.in' => 'Please select a valid inquiry category.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (auth()->check()) {
            $user = auth()->user();
            $this->merge([
                'name' => $this->input('name', $user->name),
                'email' => $this->input('email', $user->email),
                'phone' => $this->input('phone', $user->phone),
            ]);
        }
    }
}
