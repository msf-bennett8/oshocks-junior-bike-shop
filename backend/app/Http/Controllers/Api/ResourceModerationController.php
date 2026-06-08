<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResourceItem;
use App\Models\ResourceBooking;
use App\Services\ResourceInventoryService;
use App\Services\ResourceRecirculationService;
use App\Services\ResourcePricingService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResourceModerationController extends Controller
{
    /**
     * List all resources for moderation
     */
    public function index(Request $request)
    {
        $query = ResourceItem::with(['uploadedBy', 'approvedBy', 'event']);

        // Filter by status tab
        $tab = $request->get('tab', 'all');
        switch ($tab) {
            case 'pending':
                $query->where('status', 'pending_review');
                break;
            case 'approved':
                $query->where('status', 'approved')->where('is_active', true);
                break;
            case 'paused':
                $query->where('status', 'paused');
                break;
            case 'rejected':
                $query->where('status', 'rejected');
                break;
            case 'out_of_stock':
                $query->where('available_quantity', '<=', 0);
                break;
            case 'low_stock':
                $query->whereRaw('available_quantity <= low_stock_threshold')
                      ->where('available_quantity', '>', 0);
                break;
            case 'assets':
                $query->where('resource_type', 'asset');
                break;
            case 'ancillary':
                $query->where('resource_type', 'ancillary');
                break;
            case 'all':
            default:
                break;
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('resource_code', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 20);
        $resources = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $resources,
        ]);
    }

    /**
     * Get moderation stats
     */
    public function stats()
    {
        $stats = [
            'total_resources' => ResourceItem::count(),
            'pending_review' => ResourceItem::where('status', 'pending_review')->count(),
            'approved_active' => ResourceItem::where('status', 'approved')->where('is_active', true)->count(),
            'approved_inactive' => ResourceItem::where('status', 'approved')->where('is_active', false)->count(),
            'paused' => ResourceItem::where('status', 'paused')->count(),
            'rejected' => ResourceItem::where('status', 'rejected')->count(),
            'out_of_stock' => ResourceItem::where('available_quantity', '<=', 0)->count(),
            'low_stock' => ResourceItem::whereRaw('available_quantity <= low_stock_threshold')
                ->where('available_quantity', '>', 0)->count(),
            'total_assets' => ResourceItem::where('resource_type', 'asset')->count(),
            'total_ancillary' => ResourceItem::where('resource_type', 'ancillary')->count(),
            'total_bookings' => ResourceBooking::count(),
            'active_bookings' => ResourceBooking::active()->count(),
            'pending_bookings' => ResourceBooking::pending()->count(),
            'completed_bookings' => ResourceBooking::completed()->count(),
            'overdue_bookings' => ResourceBooking::overdue()->count(),
            'pending_recirculation' => ResourceBooking::where('status', 'returned')
                ->where('recirculated', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Approve resource
     */
    public function approve($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        if ($resource->status !== 'pending_review') {
            return response()->json([
                'success' => false,
                'message' => 'Resource is not pending review',
            ], 422);
        }

        $resource->update([
            'status' => 'approved',
            'is_active' => true,
            'is_verified' => true,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        AuditService::log([
            'event_type' => 'resource_item_approved',
            'event_category' => 'resource_moderation',
            'action' => 'approved',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource approved: {$resource->name}",
            'severity' => 'low',
        ]);

        return response()->json([
            'success' => true,
            'data' => $resource->fresh(),
            'message' => 'Resource approved successfully',
        ]);
    }

    /**
     * Reject resource
     */
    public function reject(Request $request, $resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $validated = $request->validate([
            'reason' => 'required|string',
        ]);

        $resource->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'is_active' => false,
        ]);

        AuditService::log([
            'event_type' => 'resource_item_rejected',
            'event_category' => 'resource_moderation',
            'action' => 'rejected',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource rejected: {$resource->name}",
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'data' => $resource->fresh(),
            'message' => 'Resource rejected',
        ]);
    }

    /**
     * Pause resource
     */
    public function pause($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $resource->update([
            'status' => 'paused',
            'is_active' => false,
        ]);

        AuditService::log([
            'event_type' => 'resource_item_paused',
            'event_category' => 'resource_moderation',
            'action' => 'paused',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource paused: {$resource->name}",
            'severity' => 'low',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource paused',
        ]);
    }

    /**
     * Resume resource
     */
    public function resume($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $resource->update([
            'status' => 'approved',
            'is_active' => true,
        ]);

        AuditService::log([
            'event_type' => 'resource_item_resumed',
            'event_category' => 'resource_moderation',
            'action' => 'resumed',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource resumed: {$resource->name}",
            'severity' => 'low',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource resumed',
        ]);
    }

    /**
     * Mark resource as out of service
     */
    public function markOutOfService(Request $request, $resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $validated = $request->validate([
            'reason' => 'required|string',
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
        ]);

        $resource->update([
            'status' => 'out_of_stock',
            'is_active' => false,
        ]);

        // Create availability block
        ResourceAvailabilityBlock::create([
            'resource_item_id' => $resource->id,
            'block_type' => 'out_of_service',
            'start_datetime' => $validated['start_datetime'],
            'end_datetime' => $validated['end_datetime'],
            'reason' => $validated['reason'],
            'created_by' => auth()->id(),
        ]);

        AuditService::log([
            'event_type' => 'resource_out_of_service',
            'event_category' => 'resource_moderation',
            'action' => 'updated',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource marked out of service: {$resource->name}",
            'severity' => 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Resource marked as out of service',
        ]);
    }

    /**
     * List all bookings for moderation
     */
    public function bookings(Request $request)
    {
        $query = ResourceBooking::with(['resourceItem', 'user', 'event']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by resource
        if ($request->has('resource_code')) {
            $query->whereHas('resourceItem', function ($q) use ($request) {
                $q->where('resource_code', $request->resource_code);
            });
        }

        // Overdue filter
        if ($request->boolean('overdue')) {
            $query->overdue();
        }

        // Pending recirculation
        if ($request->boolean('pending_recirculation')) {
            $query->where('status', 'returned')->where('recirculated', false);
        }

        $perPage = $request->get('per_page', 20);
        $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    /**
     * Mark booking as returned (admin)
     */
    public function markReturned(Request $request, $bookingCode)
    {
        $booking = ResourceBooking::where('booking_code', $bookingCode)->firstOrFail();

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $result = ResourceRecirculationService::markAsReturned(
            $booking->id,
            auth()->id(),
            $validated['notes'] ?? null
        );

        return response()->json($result);
    }

    /**
     * Complete recirculation (admin)
     */
    public function completeRecirculation($bookingCode)
    {
        $booking = ResourceBooking::where('booking_code', $bookingCode)->firstOrFail();

        $result = ResourceRecirculationService::completeRecirculation($booking->id, auth()->id());

        return response()->json($result);
    }

    /**
     * Batch recirculate bookings
     */
    public function batchRecirculate(Request $request)
    {
        $validated = $request->validate([
            'booking_ids' => 'required|array',
            'booking_ids.*' => 'integer|exists:resource_bookings,id',
        ]);

        $result = ResourceRecirculationService::batchRecirculate(
            $validated['booking_ids'],
            auth()->id()
        );

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Auto-recirculate expired bookings
     */
    public function autoRecirculate()
    {
        $result = ResourceRecirculationService::autoRecirculateExpired();

        return response()->json([
            'success' => true,
            'data' => $result,
            'message' => $result['recirculated_count'] . ' bookings auto-recirculated',
        ]);
    }

    /**
     * Auto-recirculate for event end
     */
    public function autoRecirculateEvent($eventId)
    {
        $result = ResourceRecirculationService::autoRecirculateForEvent($eventId);

        return response()->json($result);
    }

    /**
     * Get pending recirculation list
     */
    public function pendingRecirculation()
    {
        $pending = ResourceRecirculationService::getPendingRecirculation();

        return response()->json([
            'success' => true,
            'data' => $pending,
            'count' => count($pending),
        ]);
    }

    /**
     * Get pending auto-return list
     */
    public function pendingAutoReturn()
    {
        $pending = ResourceRecirculationService::getPendingAutoReturn();

        return response()->json([
            'success' => true,
            'data' => $pending,
            'count' => count($pending),
        ]);
    }

    /**
     * Update pricing rules for a resource
     */
    public function updatePricingRules(Request $request, $resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $validated = $request->validate([
            'rules' => 'required|array',
            'rules.*.rule_type' => 'required|in:low_stock_surge,deadline_proximity,rush_hour_surge,event_premium,seasonal_adjustment,custom',
            'rules.*.is_active' => 'boolean',
            'rules.*.priority' => 'integer|min:0|max:100',
            'rules.*.low_stock_threshold' => 'nullable|integer|min:0',
            'rules.*.low_stock_multiplier' => 'nullable|numeric|min:1',
            'rules.*.deadline_hours' => 'nullable|integer|min:1',
            'rules.*.deadline_multiplier' => 'nullable|numeric|min:1',
            'rules.*.rush_start_time' => 'nullable|date_format:H:i:s',
            'rules.*.rush_end_time' => 'nullable|date_format:H:i:s',
            'rules.*.rush_multiplier' => 'nullable|numeric|min:1',
            'rules.*.rush_days' => 'nullable|array',
            'rules.*.event_id' => 'nullable|exists:cycling_events,id',
            'rules.*.event_multiplier' => 'nullable|numeric|min:1',
            'rules.*.valid_from' => 'nullable|date',
            'rules.*.valid_until' => 'nullable|date|after:valid_from',
        ]);

        DB::transaction(function () use ($resource, $validated) {
            // Delete existing rules
            $resource->pricingRules()->delete();

            // Create new rules
            foreach ($validated['rules'] as $ruleData) {
                ResourcePricingRule::create(array_merge($ruleData, [
                    'resource_item_id' => $resource->id,
                ]));
            }

            // Recalculate current price
            $resource->updateCurrentPrice();

            AuditService::log([
                'event_type' => 'resource_pricing_rules_updated',
                'event_category' => 'resource_moderation',
                'action' => 'updated',
                'model_type' => 'ResourceItem',
                'model_id' => $resource->id,
                'description' => "Pricing rules updated for: {$resource->name}",
                'severity' => 'low',
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $resource->fresh(['pricingRules']),
            'message' => 'Pricing rules updated',
        ]);
    }

    /**
     * Force price update (admin)
     */
    public function forcePriceUpdate($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $resource->updateCurrentPrice();

        return response()->json([
            'success' => true,
            'data' => [
                'resource_code' => $resource->resource_code,
                'base_price' => $resource->base_price,
                'current_price' => $resource->current_price,
                'surge_multiplier' => $resource->surge_multiplier,
            ],
            'message' => 'Price updated successfully',
        ]);
    }

    /**
     * Adjust inventory quantity (admin)
     */
    public function adjustInventory(Request $request, $resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        $validated = $request->validate([
            'adjustment' => 'required|integer',
            'reason' => 'required|string',
        ]);

        $oldQuantity = $resource->total_quantity;

        DB::transaction(function () use ($resource, $validated) {
            $newTotal = max(0, $resource->total_quantity + $validated['adjustment']);
            $newAvailable = max(0, $newTotal - $resource->reserved_quantity);

            $resource->update([
                'total_quantity' => $newTotal,
                'available_quantity' => $newAvailable,
            ]);

            $resource->updateCurrentPrice();

            AuditService::log([
                'event_type' => 'resource_inventory_adjusted',
                'event_category' => 'resource_moderation',
                'action' => 'updated',
                'model_type' => 'ResourceItem',
                'model_id' => $resource->id,
                'description' => "Inventory adjusted: {$validated['reason']}",
                'old_values' => ['total_quantity' => $oldQuantity],
                'new_values' => ['total_quantity' => $newTotal],
                'severity' => 'medium',
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $resource->fresh(),
            'message' => 'Inventory adjusted successfully',
        ]);
    }
}
