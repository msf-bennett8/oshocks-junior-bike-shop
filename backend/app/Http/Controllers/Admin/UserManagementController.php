<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PaymentRecorder;
use App\Models\SellerProfile;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    /**
     * Get all users with their profiles
     */
    public function index(Request $request)
    {
        $query = User::with(['sellerProfile', 'paymentRecorder', 'orders']);

        // Filter by role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get single user with all details
     */
    public function show($id)
    {
        $user = User::with([
            'sellerProfile',
            'paymentRecorder',
            'orders',
            'recordedPayments'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'all_roles' => $user->getAllRoles(),
                'stats' => [
                    'total_orders' => $user->orders->count(),
                    'recorded_payments' => $user->recordedPayments->count(),
                ]
            ]
        ]);
    }

    /**
     * Elevate user - Add additional roles
     */
    public function elevateUser(Request $request, $id)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'in:seller,delivery_agent,shop_attendant,admin',
        ]);

        $user = User::findOrFail($id);
        
        DB::beginTransaction();
        try {
            $addedRoles = [];
            
            foreach ($request->roles as $role) {
                if (!$user->hasRole($role)) {
                    $user->addRole($role);
                    $addedRoles[] = $role;
                    
                    // Auto-create required profiles
                    if ($role === 'seller' && !$user->sellerProfile) {
                        $this->createSellerProfile($user);
                    }
                    
                    if (in_array($role, ['delivery_agent', 'shop_attendant']) && !$user->paymentRecorder) {
                        $this->createPaymentRecorder($user, $role);
                    }
                }
            }

            AuditService::log([
                'event_type' => 'user_elevated',
                'event_category' => 'user',
                'action' => 'updated',
                'model_type' => 'User',
                'model_id' => $user->id,
                'description' => "User elevated by {$request->user()->email}",
                'new_values' => ['added_roles' => $addedRoles],
                'severity' => 'medium',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User elevated successfully',
                'data' => [
                    'user' => $user->fresh(['sellerProfile', 'paymentRecorder']),
                    'all_roles' => $user->getAllRoles(),
                    'added_roles' => $addedRoles
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to elevate user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:seller,delivery_agent,shop_attendant,admin',
        ]);

        $user = User::findOrFail($id);
        
        if ($user->role === $request->role) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove primary role. Change primary role first.'
            ], 400);
        }

        $user->removeRole($request->role);

        AuditService::log([
            'event_type' => 'user_role_removed',
            'event_category' => 'user',
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "Role removed by {$request->user()->email}",
            'old_values' => ['removed_role' => $request->role],
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Role removed successfully',
            'data' => [
                'user' => $user->fresh(),
                'all_roles' => $user->getAllRoles()
            ]
        ]);
    }

    /**
     * Create/Update PaymentRecorder profile
     */
    public function managePaymentRecorder(Request $request, $id)
    {
        $request->validate([
            'recorder_type' => 'required|in:delivery_agent,shop_attendant,seller',
            'location' => 'required|string|max:100',
            'shop_id' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $user = User::findOrFail($id);

        // Generate unique recorder code
        $prefix = strtoupper(substr($request->recorder_type, 0, 2));
        $lastCode = PaymentRecorder::where('recorder_code', 'like', "{$prefix}%")
            ->orderBy('recorder_code', 'desc')
            ->first();
        
        $number = $lastCode ? (int)substr($lastCode->recorder_code, 2) + 1 : 1;
        $recorderCode = $prefix . str_pad($number, 3, '0', STR_PAD_LEFT);

        $recorder = PaymentRecorder::updateOrCreate(
            ['user_id' => $user->id],
            [
                'recorder_type' => $request->recorder_type,
                'recorder_code' => $recorderCode,
                'location' => $request->location,
                'shop_id' => $request->shop_id,
                'is_active' => $request->is_active ?? true,
            ]
        );

        // Ensure user has the corresponding role
        if (!$user->hasRole($request->recorder_type)) {
            $user->addRole($request->recorder_type);
        }

        AuditService::log([
            'event_type' => 'payment_recorder_managed',
            'event_category' => 'user',
            'action' => 'updated',
            'model_type' => 'PaymentRecorder',
            'model_id' => $recorder->id,
            'description' => "Payment recorder profile managed by {$request->user()->email}",
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment recorder profile updated successfully',
            'data' => $recorder
        ]);
    }

    /**
     * Create/Update SellerProfile
     */
    public function manageSellerProfile(Request $request, $id)
    {
        $request->validate([
            'business_name' => 'required|string|max:255',
            'business_description' => 'nullable|string',
            'business_phone' => 'nullable|string|max:20',
            'business_email' => 'nullable|email',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:pending,approved,rejected,suspended',
        ]);

        $user = User::findOrFail($id);

        $profile = SellerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => $request->business_name,
                'business_description' => $request->business_description,
                'business_phone' => $request->business_phone,
                'business_email' => $request->business_email,
                'commission_rate' => $request->commission_rate ?? 15.00,
                'status' => $request->status ?? 'pending',
            ]
        );

        // Ensure user has seller role
        if (!$user->hasRole('seller')) {
            $user->addRole('seller');
        }

        AuditService::log([
            'event_type' => 'seller_profile_managed',
            'event_category' => 'user',
            'action' => 'updated',
            'model_type' => 'SellerProfile',
            'model_id' => $profile->id,
            'description' => "Seller profile managed by {$request->user()->email}",
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Seller profile updated successfully',
            'data' => $profile
        ]);
    }

    /**
     * Toggle user active status
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $oldStatus = $user->is_active;
        $user->is_active = !$user->is_active;
        $user->save();

        AuditService::log([
            'event_type' => 'user_status_toggled',
            'event_category' => 'user',
            'action' => 'updated',
            'model_type' => 'User',
            'model_id' => $user->id,
            'description' => "User status toggled",
            'old_values' => ['is_active' => $oldStatus],
            'new_values' => ['is_active' => $user->is_active],
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Helper: Create default seller profile
     */
    private function createSellerProfile($user)
    {
        return SellerProfile::create([
            'user_id' => $user->id,
            'business_name' => $user->name . "'s Store",
            'commission_rate' => 15.00,
            'status' => 'pending',
        ]);
    }

    /**
     * Helper: Create default payment recorder profile
     */
    private function createPaymentRecorder($user, $type)
    {
        $prefix = strtoupper(substr($type, 0, 2));
        $lastCode = PaymentRecorder::where('recorder_code', 'like', "{$prefix}%")
            ->orderBy('recorder_code', 'desc')
            ->first();
        
        $number = $lastCode ? (int)substr($lastCode->recorder_code, 2) + 1 : 1;
        $recorderCode = $prefix . str_pad($number, 3, '0', STR_PAD_LEFT);

        return PaymentRecorder::create([
            'user_id' => $user->id,
            'recorder_type' => $type,
            'recorder_code' => $recorderCode,
            'location' => 'UNASSIGNED',
            'is_active' => true,
        ]);
    }
}
