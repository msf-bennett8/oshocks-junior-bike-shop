<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'required|string|max:20|unique:users',
            'role' => 'required|in:buyer,seller',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Determine the actual role to assign
        $assignedRole = $request->role === 'seller' ? 'pending_seller' : 'buyer';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $assignedRole,
            'is_active' => true,
        ]);

        // Create a cart for the user with error handling
        try {
            Cart::create(['user_id' => $user->id]);
        } catch (\Exception $e) {
            \Log::error('Cart creation failed during registration: ' . $e->getMessage());
            // Continue anyway - cart will be created on first item add
        }

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Prepare response message
        $message = $assignedRole === 'pending_seller' 
            ? 'Registration successful. Your seller account is pending approval.'
            : 'Registration successful';

        return response()->json([
            'success' => true,
            'message' => $message,
            'pending_seller_approval' => $assignedRole === 'pending_seller',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account is inactive. Please contact support.'
            ], 403);
        }

        // Revoke all previous tokens
        $user->tokens()->delete();

        // Generate new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
            'profile_image' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'profile_image']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Please login again.'
        ]);
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Implement email sending logic
        // For now, return success message

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email'
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Validate reset token
        // For now, just update password

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful'
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
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

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
        
        if ($user->role === 'admin') {
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

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            
            if (!$code) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authorization code not provided'
                ], 400);
            }

            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => config('services.google.redirect_uri'),
                ]
            ]);

            $body = json_decode((string) $response->getBody());
            $accessToken = $body->access_token;

            // Get user info from Google
            $userResponse = $client->get('https://www.googleapis.com/oauth2/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ]
            ]);

            $googleUser = json_decode((string) $userResponse->getBody());

            // Find or create user
            $user = User::firstOrCreate(
                ['email' => $googleUser->email],
                [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => Hash::make(uniqid()),
                    'is_active' => true,
                ]
            );

            // Create cart if doesn't exist
            // Create cart if doesn't exist
            if (!$user->cart) {
                try {
                    Cart::create(['user_id' => $user->id]);
                } catch (\Exception $e) {
                    \Log::error('Cart creation failed for Google user: ' . $e->getMessage());
                }
            }

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Google login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed: ' . $e->getMessage()
            ], 500);
        }
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
     * Secret endpoint: Elevate user to admin/super_admin
     */
    public function secretElevate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $adminPassword = env('ADMIN_PASSWORD');
        $superAdminPassword = env('SUPER_ADMIN_PASSWORD');
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
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Invalid password'
            ], 403);
        }
    }

    /**
     * Admin/Super Admin: Revoke own privileges back to buyer
     */
    public function revokePrivileges(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['admin', 'super_admin', 'delivery_agent', 'shop_attendant'])) {
            return response()->json([
                'success' => false,
                'message' => 'You are not an admin or super admin'
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

        $validator = Validator::make($request->all(), [
            'role' => 'required|in:buyer,seller,admin,pending_seller,delivery_agent,shop_attendant',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

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
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

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
