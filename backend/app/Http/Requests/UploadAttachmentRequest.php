<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|max:10240', // 10MB max in kilobytes
            'case_id' => 'required|string|size:13',
            'message_id' => 'nullable|integer|exists:messages,id',
        ];
    }

    public function messages(): array
    {
        return [
            'file.max' => 'File size must not exceed 10MB.',
            'case_id.size' => 'Invalid case ID format.',
        ];
    }
}
