<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Get all addresses for authenticated user
     */
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'county' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'delivery_instructions' => 'nullable|string|max:1000',
            'country' => 'required|string|max:100',
            'type' => 'required|in:home,work,other',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate address (same location details)
        $existing = $request->user()->addresses()
            ->where('address_line1', $request->address_line1)
            ->where('city', $request->city)
            ->where('county', $request->county)
            ->where('postal_code', $request->postal_code ?? '')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This address already exists in your saved addresses'
            ], 409);
        }

        $address = $request->user()->addresses()->create($validator->validated());

        if ($request->is_default) {
            $address->setAsDefault();
        }

        // Log address added
        \App\Services\AuditService::logAddressAdded($request->user(), $address, [
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Address created successfully',
            'data' => $address
        ], 201);
    }

    /**
     * Update an address
     */
    public function update(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'string|max:255',
            'phone' => 'string|max:20',
            'address_line1' => 'string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'string|max:100',
            'county' => 'string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'delivery_instructions' => 'nullable|string|max:1000',
            'country' => 'string|max:100',
            'type' => 'in:home,work,other',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $address->update($validator->validated());

        // Log address update
        $changes = $validator->validated();
        \App\Services\AuditService::logAddressUpdated($request->user(), $address, $changes, [
            'ip_address' => $request->ip(),
        ]);

        if ($request->is_default) {
            $address->setAsDefault();
        }

        return response()->json([
            'success' => true,
            'message' => 'Address updated successfully',
            'data' => $address
        ]);
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        // Log address deletion BEFORE deleting
        \App\Services\AuditService::logAddressDeleted($request->user(), $address, [
            'ip_address' => $request->ip(),
        ]);
        
        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Address deleted successfully'
        ]);
    }

    /**
     * Set address as default
     */
    public function setDefault(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->setAsDefault();

        return response()->json([
            'success' => true,
            'message' => 'Default address updated',
            'data' => $address
        ]);
    }
}