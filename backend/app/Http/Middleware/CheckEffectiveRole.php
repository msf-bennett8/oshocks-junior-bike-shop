<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEffectiveRole
{
    /**
     * Handle an incoming request.
     * Checks if super_admin is switching roles and stores effective role in request attributes.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only process if user is authenticated
        $user = $request->user();
        
        if (!$user) {
            return $next($request);
        }

        $effectiveRole = $request->header('X-Effective-Role');

        // Only allow role switching if:
        // 1. User is super_admin
        // 2. A valid X-Effective-Role header is provided
        if ($user->role === 'super_admin' && $effectiveRole) {
            $validRoles = [
                'user', 'buyer', 'seller', 'admin', 'super_admin',
                'delivery_agent', 'shop_attendant', 'payment_recorder', 'pending_seller'
            ];

            if (in_array($effectiveRole, $validRoles)) {
                // Store effective role in request attributes for other middleware/controllers to use
                $request->attributes->set('effective_role', $effectiveRole);
                
                // Log role switch for audit
                \Log::info('Role switch activated', [
                    'user_id' => $user->id,
                    'actual_role' => $user->role,
                    'effective_role' => $effectiveRole,
                    'url' => $request->url(),
                    'method' => $request->method()
                ]);
            }
        }

        return $next($request);
    }
}