<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = config('notifications.templates', []);

        foreach ($templates as $key => $template) {
            // Skip if already exists
            if (NotificationTemplate::withTrashed()->where('template_key', $key)->exists()) {
                continue;
            }

            $variables = $this->extractVariables($template['message'] ?? '');

            NotificationTemplate::create([
                'template_key' => $key,
                'name' => $template['title'] ?? ucwords(str_replace('_', ' ', $key)),
                'description' => 'Auto-imported from config',
                'title' => $template['title'] ?? '',
                'message' => $template['message'] ?? '',
                'channels' => $template['channels'] ?? ['in_app'],
                'priority' => $template['priority'] ?? 'normal',
                'icon_type' => $template['icon_type'] ?? null,
                'icon_color' => $template['icon_color'] ?? null,
                'icon_bg' => $template['icon_bg'] ?? null,
                'action_text' => $template['action_text'] ?? null,
                'variables' => $variables,
                'category' => $this->guessCategory($key),
                'is_active' => true,
            ]);
        }
    }

    private function extractVariables(string $message): array
    {
        preg_match_all('/\{\{([^}]+)\}\}/', $message, $matches);
        
        $variables = [];
        foreach ($matches[1] as $var) {
            $variables[$var] = [
                'name' => $var,
                'description' => ucwords(str_replace(['.', '_'], [' ', ' '], $var)),
            ];
        }
        
        return $variables;
    }

    private function guessCategory(string $key): string
    {
        if (str_contains($key, 'order')) return 'order';
        if (str_contains($key, 'payment')) return 'payment';
        if (str_contains($key, 'stock') || str_contains($key, 'inventory')) return 'inventory';
        if (str_contains($key, 'security') || str_contains($key, 'login')) return 'security';
        if (str_contains($key, 'audit')) return 'audit';
        if (str_contains($key, 'sale') || str_contains($key, 'promo')) return 'marketing';
        return 'general';
    }
}