<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationSetting;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationPreferenceController extends Controller
{
    /**
     * Get user notification preferences
     */
    public function show()
    {
        $user = Auth::user();
        
        $settings = $user->notificationSettings;
        
        if (!$settings) {
            $settings = NotificationService::createDefaultSettings($user);
        }

        return response()->json([
            'channels' => $settings->channel_preferences,
            'categories' => $settings->category_preferences,
            'quiet_hours' => [
                'enabled' => $settings->quiet_hours_enabled,
                'start' => $settings->quiet_hours_start,
                'end' => $settings->quiet_hours_end,
            ],
            'timezone' => $settings->timezone,
            'desktop_notifications' => $settings->desktop_notifications,
            'sound_enabled' => $settings->sound_enabled,
        ]);
    }

    /**
     * Update notification preferences
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'channels' => 'sometimes|array',
            'channels.push' => 'sometimes|boolean',
            'channels.email' => 'sometimes|boolean',
            'channels.sms' => 'sometimes|boolean',
            'channels.in_app' => 'sometimes|boolean',
            
            'categories' => 'sometimes|array',
            'categories.*.enabled' => 'sometimes|boolean',
            'categories.*.push' => 'sometimes|boolean',
            'categories.*.email' => 'sometimes|boolean',
            
            'quiet_hours' => 'sometimes|array',
            'quiet_hours.enabled' => 'sometimes|boolean',
            'quiet_hours.start' => 'sometimes|date_format:H:i',
            'quiet_hours.end' => 'sometimes|date_format:H:i',
            
            'timezone' => 'sometimes|string|max:50',
            'desktop_notifications' => 'sometimes|boolean',
            'sound_enabled' => 'sometimes|boolean',
        ]);

        $settings = $user->notificationSettings;
        
        if (!$settings) {
            $settings = NotificationService::createDefaultSettings($user);
        }

        // Update channel preferences
        if (isset($validated['channels'])) {
            $settings->channel_preferences = array_merge(
                $settings->channel_preferences,
                $validated['channels']
            );
        }

        // Update category preferences
        if (isset($validated['categories'])) {
            $currentCategories = $settings->category_preferences;
            foreach ($validated['categories'] as $category => $prefs) {
                if (isset($currentCategories[$category])) {
                    $currentCategories[$category] = array_merge(
                        $currentCategories[$category],
                        $prefs
                    );
                }
            }
            $settings->category_preferences = $currentCategories;
        }

        // Update quiet hours
        if (isset($validated['quiet_hours'])) {
            if (isset($validated['quiet_hours']['enabled'])) {
                $settings->quiet_hours_enabled = $validated['quiet_hours']['enabled'];
            }
            if (isset($validated['quiet_hours']['start'])) {
                $settings->quiet_hours_start = $validated['quiet_hours']['start'];
            }
            if (isset($validated['quiet_hours']['end'])) {
                $settings->quiet_hours_end = $validated['quiet_hours']['end'];
            }
        }

        // Update other settings
        if (isset($validated['timezone'])) {
            $settings->timezone = $validated['timezone'];
        }
        if (isset($validated['desktop_notifications'])) {
            $settings->desktop_notifications = $validated['desktop_notifications'];
        }
        if (isset($validated['sound_enabled'])) {
            $settings->sound_enabled = $validated['sound_enabled'];
        }

        $settings->save();

        // Log the change
        \App\Services\AuditService::logUserAction($user, 'notification_preferences_updated', [
            'changes' => array_keys($validated),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated',
            'data' => [
                'channels' => $settings->channel_preferences,
                'categories' => $settings->category_preferences,
                'quiet_hours' => [
                    'enabled' => $settings->quiet_hours_enabled,
                    'start' => $settings->quiet_hours_start,
                    'end' => $settings->quiet_hours_end,
                ],
            ],
        ]);
    }
}
