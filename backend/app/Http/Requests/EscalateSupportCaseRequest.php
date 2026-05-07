<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EscalateSupportCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'escalation_type' => ['sometimes', 'in:user_request,auto_sla,agent_request'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Please provide a reason for escalation.',
            'reason.min' => 'Escalation reason must be at least 10 characters.',
        ];
    }
}
