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
            try {
                $user = Auth::guard('sanctum')->user();

                if ($user) {
                    // Set sanctum as the default guard so Auth::user() works everywhere
                    Auth::shouldUse('sanctum');

                    // Set the user on the request so $request->user() works in controllers
                    $request->setUserResolver(function ($guard = null) use ($user) {
                        return $user;
                    });
                }
            } catch (\Exception $e) {
                \Log::warning('OptionalAuth: Failed to authenticate sanctum token', [
                    'error' => $e->getMessage(),
                ]);
            }
            // If token invalid/expired, continue as guest — no 401
        }

        // Continue regardless of auth status
        return $next($request);
    }
}
