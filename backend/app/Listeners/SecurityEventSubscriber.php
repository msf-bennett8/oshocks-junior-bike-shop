<?php

namespace App\Listeners;

use App\Events\LoginFailed;
use App\Events\SecurityAlert;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Request;

class SecurityEventSubscriber
{
    /**
     * Handle user login.
     */
    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        
        // Clear failed login attempts on successful login
        cache()->forget("login_attempts:{$user->id}");
        
        // Check if new device/location
        $currentFingerprint = $this->getDeviceFingerprint();
        $lastFingerprint = $user->last_device_fingerprint;
        
        if ($lastFingerprint && $lastFingerprint !== $currentFingerprint) {
            SecurityAlert::dispatch(
                $user,
                'new_device',
                [
                    'description' => 'Login from new device/location detected',
                    'ip' => Request::ip(),
                    'user_agent' => Request::userAgent(),
                ],
                'medium'
            );
        }
        
        $user->update(['last_device_fingerprint' => $currentFingerprint]);
    }

    /**
     * Handle failed login.
     */
    public function handleFailedLogin($event): void
    {
        $email = $event->credentials['email'] ?? null;
        $ip = Request::ip();
        
        // Get user by email if exists
        $user = \App\Models\User::where('email', $email)->first();
        
        // Track attempts
        $key = $user ? "login_attempts:{$user->id}" : "login_attempts_ip:{$ip}";
        $attempts = cache()->increment($key);
        cache()->put($key, $attempts, now()->addHours(1));
        
        if ($attempts >= 3) {
            LoginFailed::dispatch($user, $ip, $attempts, [
                'email' => $email,
                'timestamp' => now(),
            ]);
        }
    }

    /**
     * Handle password reset.
     */
    public function handlePasswordReset(PasswordReset $event): void
    {
        SecurityAlert::dispatch(
            $event->user,
            'password_changed',
            [
                'description' => 'Password was reset',
                'ip' => Request::ip(),
            ],
            'high'
        );
    }

    /**
     * Handle user logout.
     */
    public function handleLogout(Logout $event): void
    {
        // Log for audit trail
        \App\Services\AuditService::logUserAction($event->user, 'logout', [
            'ip' => Request::ip(),
            'timestamp' => now(),
        ]);
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(\Illuminate\Events\Dispatcher $events): void
    {
        $events->listen(Login::class, [self::class, 'handleLogin']);
        $events->listen('Illuminate\Auth\Events\Failed', [self::class, 'handleFailedLogin']);
        $events->listen(PasswordReset::class, [self::class, 'handlePasswordReset']);
        $events->listen(Logout::class, [self::class, 'handleLogout']);
    }

    private function getDeviceFingerprint(): string
    {
        return md5(Request::userAgent() . Request::ip());
    }
}
