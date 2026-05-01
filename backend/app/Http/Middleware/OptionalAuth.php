<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class OptionalAuth
{
    /**
     * Handle an incoming request.
     * Authenticates the user if a valid token is provided, but allows guests through.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If Authorization header exists, try to authenticate with Sanctum
        if ($request->bearerToken()) {
            $user = Auth::guard('sanctum')->user();
            
            if ($user) {
                // Set the user on the request so $request->user() works in controllers
                $request->setUserResolver(function ($guard = null) use ($user) {
                    return $user;
                });
            }
            // If token invalid/expired, continue as guest — no 401
        }
        
        // Continue regardless of auth status
        return $next($request);
    }
}
