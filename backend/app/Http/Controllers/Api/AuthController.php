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
}
