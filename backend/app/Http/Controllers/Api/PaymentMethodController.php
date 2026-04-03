<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentMethodController extends Controller
{
    /**
     * Get all payment methods for authenticated user
     */
    public function index(Request $request)
    {
        $methods = $request->user()->paymentMethods()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($method) {
                return [
                    'id' => $method->id,
                    'type' => $method->type,
                    'name' => $method->type === 'mpesa' 
                        ? ($method->mpesa_name ?: 'M-Pesa (' . substr($method->phone_number, -4) . ')')
                        : ($method->card_name ?: ucfirst($method->brand) . ' Card'),
                    'phone_number' => $method->phone_number,
                    'mpesa_name' => $method->mpesa_name,
                    'last4' => $method->last4,
                    'brand' => $method->brand,
                    'expiry_month' => $method->expiry_month,
                    'expiry_year' => $method->expiry_year,
                    'card_name' => $method->card_name,
                    'isDefault' => $method->is_default,
                ];
            });

        // Return in the format expected by frontend
        return response()->json([
            'success' => true,
            'data' => [
                'mpesa' => $methods->where('type', 'mpesa')->values(),
                'cards' => $methods->where('type', 'card')->values(),
            ]
        ]);
    }

    /**
     * Store a new payment method
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:mpesa,card',
            // M-Pesa validation
            'phone_number' => 'required_if:type,mpesa|string|max:20',
            'mpesa_name' => 'nullable|string|max:255',
            // Card validation
            'last4' => 'required_if:type,card|string|size:4',
            'brand' => 'required_if:type,card|in:visa,mastercard,amex',
            'expiry_month' => 'required_if:type,card|string|size:2',
            'expiry_year' => 'required_if:type,card|string|size:2',
            'card_name' => 'required_if:type,card|string|max:255',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check for duplicate M-Pesa number
        if ($request->type === 'mpesa') {
            $existing = $user->paymentMethods()
                ->where('type', 'mpesa')
                ->where('phone_number', $request->phone_number)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'This M-Pesa number is already saved'
                ], 409);
            }
        }

        // Check for duplicate card
        if ($request->type === 'card') {
            $existing = $user->paymentMethods()
                ->where('type', 'card')
                ->where('last4', $request->last4)
                ->where('brand', $request->brand)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'This card is already saved'
                ], 409);
            }
        }

        $data = $validator->validated();
        $data['user_id'] = $user->id;

        // If first payment method, make it default
        if ($user->paymentMethods()->count() === 0) {
            $data['is_default'] = true;
        }

        $method = PaymentMethod::create($data);

        if ($data['is_default'] ?? false) {
            $method->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment method added successfully',
            'data' => $method
        ], 201);
    }

    /**
     * Update a payment method
     */
    public function update(Request $request, $id)
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'mpesa_name' => 'nullable|string|max:255',
            'card_name' => 'nullable|string|max:255',
            'expiry_month' => 'nullable|string|size:2',
            'expiry_year' => 'nullable|string|size:2',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $method->update($validator->validated());

        if ($request->is_default) {
            $method->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment method updated successfully',
            'data' => [
                'id' => $method->id,
                'type' => $method->type,
                'name' => $method->type === 'mpesa' 
                    ? ($method->mpesa_name ?: 'M-Pesa (' . substr($method->phone_number, -4) . ')')
                    : ($method->card_name ?: ucfirst($method->brand) . ' Card'),
                'phone_number' => $method->phone_number,
                'mpesa_name' => $method->mpesa_name,
                'last4' => $method->last4,
                'brand' => $method->brand,
                'expiry_month' => $method->expiry_month,
                'expiry_year' => $method->expiry_year,
                'card_name' => $method->card_name,
                'isDefault' => $method->is_default,
            ]
        ]);
    }

    /**
     * Delete a payment method
     */
    public function destroy(Request $request, $id)
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);
        
        // Don't allow deleting the default payment method
        if ($method->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete default payment method. Set another as default first.'
            ], 400);
        }

        $method->delete();

        return response()->json([
            'success' => true,
            'message' => 'Payment method deleted successfully'
        ]);
    }

    /**
     * Set payment method as default
     */
    public function setDefault(Request $request, $id)
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);
        $method->setAsDefault();

        return response()->json([
            'success' => true,
            'message' => 'Default payment method updated',
            'data' => $method
        ]);
    }
}