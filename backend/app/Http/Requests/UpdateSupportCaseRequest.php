<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupportCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'priority' => ['sometimes', 'in:low,medium,high,urgent'],
            'status' => ['sometimes', 'in:new,open,in_progress,pending_user,resolved,closed,escalated'],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
            'resolution_notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
