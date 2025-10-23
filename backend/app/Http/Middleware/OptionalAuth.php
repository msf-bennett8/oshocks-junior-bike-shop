<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OptionalAuth
{
    /**
     * Handle an incoming request.
     * Authenticates the user if a token is provided, but doesn't reject the request if missing.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If Authorization header exists, try to authenticate
        if ($request->bearerToken()) {
            try {
                // Sanctum will authenticate if token is valid
                $request->user();
            } catch (\Exception $e) {
                // Token invalid/expired - continue as guest
            }
        }
        
        // Continue regardless of auth status
        return $next($request);
    }
}