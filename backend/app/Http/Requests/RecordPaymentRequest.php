<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordPaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User must be authenticated and have permission to record payments
        return $this->user() && $this->user()->canRecordPayments();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $rules = [
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|in:cash,mpesa_manual,bank_transfer,mpesa_stk,flutterwave',
            'amount' => 'required|numeric|min:0.01',
            'county' => 'required|string|max:100',
            'zone' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|regex:/^(254|0)[17]\d{8}$/',
            'notes' => 'nullable|string|max:1000',
        ];

        // Additional validation for mpesa and bank transfers
        if (in_array($this->payment_method, ['mpesa_manual', 'bank_transfer'])) {
            $rules['external_reference'] = 'required|string|min:8|max:50';
            $rules['external_transaction_id'] = 'required|string|min:10|max:50';
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'order_id.required' => 'Order ID is required',
            'order_id.exists' => 'Order not found',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Invalid payment method',
            'amount.required' => 'Payment amount is required',
            'amount.numeric' => 'Amount must be a valid number',
            'amount.min' => 'Amount must be greater than zero',
            'county.required' => 'County is required',
            'zone.required' => 'Zone is required',
            'customer_phone.regex' => 'Enter a valid Kenyan phone number (e.g., 0712345678 or 254712345678)',
            'external_reference.required' => 'Customer reference is required for M-Pesa and bank transfers',
            'external_reference.min' => 'Customer reference must be at least 8 characters',
            'external_transaction_id.required' => 'Transaction ID is required for M-Pesa and bank transfers',
            'external_transaction_id.min' => 'Transaction ID must be at least 10 characters',
        ];
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        abort(response()->json([
            'success' => false,
            'message' => 'You do not have permission to record payments'
        ], 403));
    }
}