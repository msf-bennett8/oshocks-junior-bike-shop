<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NotificationTemplateController extends Controller
{
    /**
     * List all templates with filtering
     */
    public function index(Request $request)
    {
        $query = NotificationTemplate::with(['creator', 'updater']);

        // Filters
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('template_key', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $templates = $query->orderBy('category')
                          ->orderBy('name')
                          ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $templates,
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Get single template
     */
    public function show($id)
    {
        $template = NotificationTemplate::with(['creator', 'updater'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    /**
     * Create new template
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'template_key' => 'required|string|unique:notification_templates|max:100|regex:/^[a-z0-9_]+$/',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'channels' => 'required|array|min:1',
            'channels.*' => 'in:in_app,email,push,sms',
            'priority' => 'required|in:low,normal,high,urgent',
            'icon_type' => 'nullable|string|max:50',
            'icon_color' => 'nullable|string|max:50',
            'icon_bg' => 'nullable|string|max:50',
            'action_text' => 'nullable|string|max:100',
            'variables' => 'nullable|array',
            'category' => 'required|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $template = NotificationTemplate::create($validator->validated());

        AuditService::log([
            'event_type' => 'NOTIFICATION_TEMPLATE_CREATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => Auth::id(),
            'action' => 'create',
            'description' => "Created notification template: {$template->name}",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'template_id' => $template->id,
                'template_key' => $template->template_key,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template created successfully',
            'data' => $template,
        ], 201);
    }

    /**
     * Update template
     */
    public function update(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'title' => 'sometimes|string|max:255',
            'message' => 'sometimes|string',
            'channels' => 'sometimes|array|min:1',
            'channels.*' => 'in:in_app,email,push,sms',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'icon_type' => 'nullable|string|max:50',
            'icon_color' => 'nullable|string|max:50',
            'icon_bg' => 'nullable|string|max:50',
            'action_text' => 'nullable|string|max:100',
            'variables' => 'nullable|array',
            'category' => 'sometimes|string|max:50',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $oldVersion = $template->version;
        $template->update($validator->validated());

        AuditService::log([
            'event_type' => 'NOTIFICATION_TEMPLATE_UPDATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => Auth::id(),
            'action' => 'update',
            'description' => "Updated notification template: {$template->name} (v{$oldVersion} → v{$template->version})",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'template_id' => $template->id,
                'template_key' => $template->template_key,
                'version_change' => "{$oldVersion} → {$template->version}",
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template updated successfully',
            'data' => $template,
        ]);
    }

    /**
     * Delete template (soft delete)
     */
    public function destroy($id)
    {
        $template = NotificationTemplate::findOrFail($id);

        // Check if template is in use
        $usageCount = \App\Models\Notification::where('template_id', $template->template_key)->count();

        if ($usageCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete template that is in use. Deactivate it instead.',
                'usage_count' => $usageCount,
            ], 422);
        }

        $template->delete();

        AuditService::log([
            'event_type' => 'NOTIFICATION_TEMPLATE_DELETED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => Auth::id(),
            'action' => 'delete',
            'description' => "Deleted notification template: {$template->name}",
            'severity' => 'MEDIUM',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'template_id' => $template->id,
                'template_key' => $template->template_key,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully',
        ]);
    }

    /**
     * Duplicate template
     */
    public function duplicate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'template_key' => 'required|string|unique:notification_templates|max:100|regex:/^[a-z0-9_]+$/',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $original = NotificationTemplate::findOrFail($id);
        $newTemplate = $original->duplicate(
            $request->template_key,
            $request->name
        );

        AuditService::log([
            'event_type' => 'NOTIFICATION_TEMPLATE_DUPLICATED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => Auth::id(),
            'action' => 'duplicate',
            'description' => "Duplicated template '{$original->name}' to '{$newTemplate->name}'",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'original_id' => $original->id,
                'new_id' => $newTemplate->id,
                'original_key' => $original->template_key,
                'new_key' => $newTemplate->template_key,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template duplicated successfully',
            'data' => $newTemplate,
        ], 201);
    }

    /**
     * Preview template with sample data
     */
    public function preview(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $sampleData = $request->get('sample_data', [
            'order.number' => 'ORD-12345',
            'order.amount' => 'KES 5,000',
            'product.name' => 'Sample Product',
            'customer.name' => 'John Doe',
        ]);

        $parsed = $template->parseVariables($sampleData);

        return response()->json([
            'success' => true,
            'data' => [
                'template' => $template,
                'parsed_title' => $parsed['title'],
                'parsed_message' => $parsed['message'],
                'sample_data' => $sampleData,
            ],
        ]);
    }

    /**
     * Get template categories
     */
    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => $this->getCategories(),
        ]);
    }

    /**
     * Sync templates from config to database
     */
    public function syncFromConfig()
    {
        $configTemplates = config('notifications.templates', []);
        $synced = 0;
        $skipped = 0;

        foreach ($configTemplates as $key => $template) {
            $exists = NotificationTemplate::withTrashed()
                ->where('template_key', $key)
                ->first();

            if ($exists) {
                $skipped++;
                continue;
            }

            NotificationTemplate::create([
                'template_key' => $key,
                'name' => $template['title'] ?? ucwords(str_replace('_', ' ', $key)),
                'description' => 'Imported from config',
                'title' => $template['title'] ?? '',
                'message' => $template['message'] ?? '',
                'channels' => $template['channels'] ?? ['in_app'],
                'priority' => $template['priority'] ?? 'normal',
                'icon_type' => $template['icon_type'] ?? null,
                'icon_color' => $template['icon_color'] ?? null,
                'icon_bg' => $template['icon_bg'] ?? null,
                'action_text' => $template['action_text'] ?? null,
                'variables' => $this->extractVariables($template['message'] ?? ''),
                'category' => $this->guessCategory($key),
                'is_active' => true,
            ]);

            $synced++;
        }

        AuditService::log([
            'event_type' => 'NOTIFICATION_TEMPLATES_SYNCED',
            'event_category' => 'admin',
            'actor_type' => 'USER',
            'user_id' => Auth::id(),
            'action' => 'sync',
            'description' => "Synced {$synced} templates from config ({$skipped} skipped)",
            'severity' => 'LOW',
            'tier' => 'TIER_2_OPERATIONAL',
            'metadata' => [
                'synced' => $synced,
                'skipped' => $skipped,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Synced {$synced} templates, {$skipped} skipped",
            'synced' => $synced,
            'skipped' => $skipped,
        ]);
    }

    /**
     * Get all categories
     */
    private function getCategories(): array
    {
        return [
            'order' => 'Order Notifications',
            'payment' => 'Payment Notifications',
            'inventory' => 'Inventory Alerts',
            'security' => 'Security Alerts',
            'audit' => 'Audit/Admin Alerts',
            'marketing' => 'Marketing/Promotions',
            'loyalty' => 'Loyalty Program',
            'support' => 'Customer Support',
            'system' => 'System Notifications',
            'general' => 'General',
        ];
    }

    /**
     * Extract variables from message template
     */
    private function extractVariables(string $message): array
    {
        preg_match_all('/\{\{([^}]+)\}\}/', $message, $matches);

        $variables = [];
        foreach ($matches[1] as $var) {
            $parts = explode('.', $var);
            $variables[$var] = [
                'name' => $var,
                'description' => ucwords(str_replace(['.', '_'], [' ', ' '], $var)),
                'example' => $this->getExampleValue($var),
            ];
        }

        return $variables;
    }

    /**
     * Guess category from template key
     */
    private function guessCategory(string $key): string
    {
        if (str_contains($key, 'order')) return 'order';
        if (str_contains($key, 'payment')) return 'payment';
        if (str_contains($key, 'stock') || str_contains($key, 'inventory')) return 'inventory';
        if (str_contains($key, 'security') || str_contains($key, 'login')) return 'security';
        if (str_contains($key, 'audit')) return 'audit';
        if (str_contains($key, 'sale') || str_contains($key, 'promo')) return 'marketing';
        if (str_contains($key, 'loyalty')) return 'loyalty';
        if (str_contains($key, 'support')) return 'support';
        if (str_contains($key, 'system') || str_contains($key, 'maintenance')) return 'system';

        return 'general';
    }

    /**
     * Get example value for variable
     */
    private function getExampleValue(string $variable): string
    {
        $examples = [
            'order.number' => 'ORD-12345',
            'order.amount' => 'KES 5,000',
            'product.name' => 'Premium Bike',
            'product.sku' => 'BIKE-001',
            'customer.name' => 'John Doe',
            'customer.email' => 'john@example.com',
            'payment.method' => 'M-Pesa',
            'payment.amount' => 'KES 2,500',
            'tracking.number' => 'TRK789456',
            'carrier' => 'SpeedEx',
        ];

        return $examples[$variable] ?? 'Sample Value';
    }
}