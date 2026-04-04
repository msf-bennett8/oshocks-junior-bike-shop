<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class NotificationPreferenceController extends Controller
{
    /**
     * Get notification preferences
     * GET /api/v1/user/notification-preferences
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        $preferences = Cache::remember("user:{$user->id}:notification_preferences", 3600, function() use ($user) {
            return $user->notification_preferences ?? $this->getDefaultPreferences();
        });

        return response()->json([
            'success' => true,
            'data' => $preferences
        ]);
    }

    /**
     * Update notification preferences
     * PUT /api/v1/user/notification-preferences
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'nullable|array',
            'channels' => 'nullable|array',
            'quiet_hours' => 'nullable|array',
            'desktop_notifications' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $oldPreferences = $user->notification_preferences ?? $this->getDefaultPreferences();
        
        $newPreferences = array_merge($oldPreferences, array_filter([
            'settings' => $request->settings,
            'channels' => $request->channels,
            'quiet_hours' => $request->quiet_hours,
            'desktop_notifications_enabled' => $request->desktop_notifications,
        ]));

        // Save to user (would need notification_preferences column or separate table)
        // $user->notification_preferences = $newPreferences;
        // $user->save();

        // Update cache
        Cache::put("user:{$user->id}:notification_preferences", $newPreferences, now()->addDays(30));

        // Audit preference changes
        if ($request->has('settings')) {
            foreach ($request->settings as $key => $value) {
                $oldValue = $oldPreferences['settings'][$key] ?? null;
                if ($oldValue !== $value) {
                    AuditService::logNotificationSettingsChanged($user, [
                        'setting_key' => $key,
                        'old_value' => $oldValue,
                        'new_value' => $value,
                    ]);
                }
            }
        }

        if ($request->has('channels')) {
            AuditService::logChannelPreferencesUpdated($user, [
                'channels' => $request->channels,
                'enabled_status' => collect($request->channels)->map(fn($c) => $c['enabled'] ?? true)->toArray(),
                'source' => 'user',
            ]);
        }

        if ($request->has('quiet_hours')) {
            $oldQuietHours = $oldPreferences['quiet_hours'] ?? [];
            $newQuietHours = $request->quiet_hours;
            
            if (($oldQuietHours['enabled'] ?? false) !== ($newQuietHours['enabled'] ?? false)) {
                AuditService::logQuietHoursToggled($user, [
                    'enabled' => $newQuietHours['enabled'] ?? false,
                    'start_time' => $newQuietHours['start'] ?? '22:00',
                    'end_time' => $newQuietHours['end'] ?? '08:00',
                    'timezone' => $newQuietHours['timezone'] ?? 'UTC',
                ]);
            }
        }

        if ($request->has('desktop_notifications')) {
            AuditService::logDesktopNotificationsToggled($user, [
                'enabled' => $request->desktop_notifications,
                'permission_status' => $request->desktop_notifications ? 'granted' : 'denied',
                'browser' => $request->header('User-Agent'),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated',
            'data' => $newPreferences
        ]);
    }

    /**
     * Get default preferences
     */
    private function getDefaultPreferences(): array
    {
        return [
            'settings' => [
                'order_updates' => true,
                'promotions' => true,
                'security_alerts' => true,
                'newsletter' => false,
                'price_drops' => true,
            ],
            'channels' => [
                'email' => ['enabled' => true, 'address' => null],
                'sms' => ['enabled' => false, 'phone' => null],
                'push' => ['enabled' => false],
                'in_app' => ['enabled' => true],
            ],
            'quiet_hours' => [
                'enabled' => false,
                'start' => '22:00',
                'end' => '08:00',
                'timezone' => 'UTC',
            ],
            'desktop_notifications_enabled' => false,
        ];
    }
}
