<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Check for effective role (role switching for super_admin)
        $effectiveRole = $request->attributes->get('effective_role');
        $currentRole = $effectiveRole ?? $request->user()->role;

        // Support comma-separated roles in a single parameter (e.g., 'role:admin,super_admin')
        $allowedRoles = [];
        foreach ($roles as $role) {
            if (str_contains($role, ',')) {
                $allowedRoles = array_merge($allowedRoles, array_map('trim', explode(',', $role)));
            } else {
                $allowedRoles[] = trim($role);
            }
        }

        if (!in_array($currentRole, $allowedRoles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. This action requires ' . implode(' or ', $allowedRoles) . ' role.'
            ], 403);
        }

        return $next($request);
    }
}
