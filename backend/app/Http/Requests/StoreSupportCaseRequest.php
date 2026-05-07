<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupportCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'case_type' => ['required', 'in:order_issue,account_help,report_problem,delivery_question'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'order_number' => [
                'nullable',
                'string',
                'max:50',
                'required_if:case_type,order_issue',
            ],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_number.required_if' => 'Order number is required for order issues.',
            'case_type.in' => 'Invalid case type selected.',
        ];
    }
}
