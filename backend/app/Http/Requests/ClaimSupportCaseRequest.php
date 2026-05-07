<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClaimSupportCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->canHandleSupportCases() ?? false;
    }

    public function rules(): array
    {
        return [
            'agent_id' => ['sometimes', 'exists:users,id'],
        ];
    }
}
