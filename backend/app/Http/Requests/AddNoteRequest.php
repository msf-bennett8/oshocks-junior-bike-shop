<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->canHandleSupportCases() ?? false;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:5000',
            'is_private' => 'boolean',
            'message_id' => 'nullable|integer|exists:messages,id',
        ];
    }
}
