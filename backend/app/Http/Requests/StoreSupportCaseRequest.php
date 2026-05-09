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
            'purchase_id' => [
                'nullable',
                'string',
                'max:50',
            ],
            'order_number' => [
                'nullable',
                'string',
                'max:50',
            ],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
            'metadata' => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'case_type.in' => 'Invalid case type selected.',
        ];
    }

    protected function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->input('case_type') === 'order_issue') {
                $hasOrderRef = $this->input('purchase_id') || $this->input('order_number');
                if (!$hasOrderRef) {
                    $validator->errors()->add('purchase_id', 'Purchase ID or order number is required for order issues.');
                }
            }
        });
    }
}

