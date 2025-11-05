<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register
        public function register(Request $request)
        {
            $request->validate([
                'name' => 'required|string|max:255',
                'username' => 'nullable|string|max:50|unique:users|regex:/^[a-zA-Z0-9_]+$/',
                'email' => 'nullable|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'phone' => 'nullable|string|max:20|unique:users',
                'address' => 'nullable|string',
            ]);

            // Ensure at least one of email, phone, or username is provided
            if (!$request->email && !$request->phone && !$request->username) {
                return response()->json([
                    'message' => 'At least one of email, phone, or username is required'
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'address' => $request->address,
                'role' => 'buyer',
            ]);

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Registration successful'
            ], 201);
        }

    // Login
        public function login(Request $request)
        {
            $request->validate([
                'login' => 'required|string',
                'password' => 'required',
            ]);

            // Determine if login is email, phone, or username
            $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 
                        (preg_match('/^[+]?[0-9]{10,15}$/', $request->login) ? 'phone' : 'username');

            $user = User::where($loginField, $request->login)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'login' => ['The provided credentials are incorrect.'],
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Login successful'
            ]);
        }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    // Get authenticated user
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    // Update profile
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
        ]);

        $user->update($request->only(['name', 'phone', 'address']));

        return response()->json([
            'user' => $user,
            'message' => 'Profile updated successfully'
        ]);
    }

    // Change password
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

    /**
     * Super Admin: Approve pending seller
     */
    public function approveSeller(Request $request, $id)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->role !== 'pending_seller') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a pending seller'
            ], 400);
        }

        $user->update(['role' => 'seller']);

        return response()->json([
            'success' => true,
            'message' => 'Seller approved successfully',
            'data' => $user
        ]);
    }

    /**
     * Super Admin: Reject pending seller
     */
    public function rejectSeller(Request $request, $id)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->role !== 'pending_seller') {
            return response()->json([
                'success' => false,
                'message' => 'User is not a pending seller'
            ], 400);
        }

        $user->update(['role' => 'buyer']);

        return response()->json([
            'success' => true,
            'message' => 'Seller request rejected. User reverted to buyer.',
            'data' => $user
        ]);
    }

    /**
     * Super Admin: Get all pending sellers
     */
    public function getPendingSellers(Request $request)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $pendingSellers = User::where('role', 'pending_seller')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $pendingSellers
        ]);
    }

    /**
     * Secret endpoint: Elevate user to admin/super_admin/delivery_agent/shop_attendant
     */
    public function secretElevate(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $superAdminPassword = env('SUPER_ADMIN_PASSWORD');
        $adminPassword = env('ADMIN_PASSWORD');
        $deliveryAgentPassword = env('DELIVERY_AGENT_PASSWORD');
        $shopAttendantPassword = env('SHOP_ATTENDANT_PASSWORD');
        $inputPassword = $request->password;

        if ($inputPassword === $superAdminPassword) {
            $request->user()->update(['role' => 'super_admin']);
            
            return response()->json([
                'success' => true,
                'message' => 'Elevated to Super Admin',
                'data' => ['role' => 'super_admin']
            ]);
        } elseif ($inputPassword === $adminPassword) {
            $request->user()->update(['role' => 'admin']);
            
            return response()->json([
                'success' => true,
                'message' => 'Elevated to Admin',
                'data' => ['role' => 'admin']
            ]);
        } elseif ($inputPassword === $deliveryAgentPassword) {
            $request->user()->update(['role' => 'delivery_agent']);
            
            return response()->json([
                'success' => true,
                'message' => 'Elevated to Delivery Agent',
                'data' => ['role' => 'delivery_agent']
            ]);
        } elseif ($inputPassword === $shopAttendantPassword) {
            $request->user()->update(['role' => 'shop_attendant']);
            
            return response()->json([
                'success' => true,
                'message' => 'Elevated to Shop Attendant',
                'data' => ['role' => 'shop_attendant']
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 403);
        }
    }

    /**
     * Admin/Super Admin/Delivery Agent/Shop Attendant: Revoke own privileges back to buyer
     */
    public function revokePrivileges(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'super_admin', 'delivery_agent', 'shop_attendant'])) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have elevated privileges to revoke'
            ], 400);
        }

        $user->update(['role' => 'buyer']);

        return response()->json([
            'success' => true,
            'message' => 'Privileges revoked. You are now a buyer.',
            'data' => $user
        ]);
    }

    /**
     * Super Admin: Change any user's role
     */
    public function changeUserRole(Request $request, $id)
    {
        if (!$request->user()->hasSuperAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Super admin access required.'
            ], 403);
        }

        $request->validate([
            'role' => 'required|in:buyer,seller,admin,pending_seller,delivery_agent,shop_attendant',
        ]);

        $user = User::findOrFail($id);

        // Prevent changing own role via this endpoint
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change your own role via this endpoint'
            ], 400);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Admin: Get all users
     */
    public function getAllUsers(Request $request)
    {
        $users = User::with(['sellerProfile', 'orders'])
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Admin: Update user status
     */
    public function updateUserStatus(Request $request, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        $user->update(['is_active' => $request->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Admin: Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        if (in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete admin user'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

}
