<?php

namespace App\Http\Middleware;

use App\Services\BusinessOperationsService;
use Closure;
use Illuminate\Http\Request;

class ProductViewTracker
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Track product views on successful product detail requests
        if ($request->is('api/v1/products/*') && $request->isMethod('GET')) {
            $productId = $request->route('id');
            
            if ($productId && $response->isSuccessful()) {
                $user = $request->user();
                $sessionId = $request->session()->getId() ?? $request->header('X-Session-ID');
                
                BusinessOperationsService::trackProductView($user, (int) $productId, [
                    'source' => $request->header('X-Source') ?? 'direct',
                    'search_query' => $request->header('X-Search-Query'),
                    'recommendation_type' => $request->header('X-Recommendation-Type'),
                    'device_type' => $this->getDeviceType($request->userAgent()),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'session_id' => $sessionId,
                ]);
            }
        }

        return $response;
    }

    /**
     * Determine device type from user agent
     */
    private function getDeviceType(?string $userAgent): string
    {
        if (!$userAgent) return 'unknown';
        
        if (preg_match('/Mobile|Android|iPhone/i', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/Tablet|iPad/i', $userAgent)) {
            return 'tablet';
        }
        
        return 'desktop';
    }
}
