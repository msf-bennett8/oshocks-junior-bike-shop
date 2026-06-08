<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ResourceItem;
use App\Models\ResourcePricingRule;
use App\Services\ResourceInventoryService;
use App\Services\ResourcePricingService;
use App\Services\ResourceImageUploadService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ResourceItemController extends Controller
{
    protected ResourceImageUploadService $imageUploadService;

    public function __construct(ResourceImageUploadService $imageUploadService)
    {
        $this->imageUploadService = $imageUploadService;
    }

    public function index(Request $request)
    {
        $query = ResourceItem::with(['uploadedBy', 'pricingRules'])
            ->where('status', 'approved')
            ->where('is_active', true);

        if ($request->has('resource_type')) {
            $query->where('resource_type', $request->resource_type);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('event_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('event_id', $request->event_id)
                  ->orWhereNull('event_id');
            });
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'in_stock': $query->where('available_quantity', '>', 0); break;
                case 'out_of_stock': $query->where('available_quantity', '<=', 0); break;
                case 'low_stock': $query->whereRaw('available_quantity <= low_stock_threshold')->where('available_quantity', '>', 0); break;
            }
        }

        $sort = $request->get('sort', 'latest');
        switch ($sort) {
            case 'price_low': $query->orderBy('current_price', 'asc'); break;
            case 'price_high': $query->orderBy('current_price', 'desc'); break;
            case 'name': $query->orderBy('name', 'asc'); break;
            default: $query->orderBy('created_at', 'desc'); break;
        }

        $perPage = $request->get('per_page', 20);
        $resources = $query->paginate($perPage);

        return response()->json(['success' => true, 'data' => $resources]);
    }

    public function show($resourceCode)
    {
        $resource = ResourceItem::with(['uploadedBy', 'pricingRules', 'event'])
            ->where('resource_code', $resourceCode)
            ->firstOrFail();

        if (request()->has('start_datetime') && request()->has('end_datetime')) {
            $availability = ResourceInventoryService::checkAvailability(
                $resource->id,
                request('start_datetime'),
                request('end_datetime'),
                request('quantity', 1)
            );
            $resource->setAttribute('availability', $availability);
        }

        return response()->json(['success' => true, 'data' => $resource]);
    }

    public function checkAvailability($resourceCode, Request $request)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();
        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'quantity' => 'integer|min:1|max:100',
        ]);

        $availability = ResourceInventoryService::checkAvailability(
            $resource->id,
            $validated['start_datetime'],
            $validated['end_datetime'],
            $validated['quantity'] ?? 1
        );

        $pricing = ResourcePricingService::calculatePrice(
            $resource->id,
            $validated['start_datetime'],
            $validated['end_datetime'],
            $validated['quantity'] ?? 1
        );

        return response()->json(['success' => true, 'data' => array_merge($availability, ['pricing' => $pricing])]);
    }

    public function availableWithConflictResolution(Request $request)
    {
        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'resource_type' => 'nullable|in:asset,ancillary',
            'category' => 'nullable|string',
            'event_id' => 'nullable|integer',
            'quantity' => 'integer|min:1|max:100',
        ]);

        $resources = ResourceInventoryService::getAvailableResourcesWithInfo(
            $validated['start_datetime'],
            $validated['end_datetime'],
            [
                'resource_type' => $validated['resource_type'] ?? null,
                'category' => $validated['category'] ?? null,
                'event_id' => $validated['event_id'] ?? null,
            ],
            $validated['quantity'] ?? 1
        );

        return response()->json(['success' => true, 'data' => $resources, 'count' => count($resources)]);
    }

    public function availableForBikeRental(Request $request)
    {
        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'resource_type' => 'nullable|in:asset,ancillary',
            'category' => 'nullable|string',
            'quantity' => 'integer|min:1|max:100',
        ]);

        $resources = ResourceInventoryService::getAvailableResourcesWithInfo(
            $validated['start_datetime'],
            $validated['end_datetime'],
            [
                'resource_type' => $validated['resource_type'] ?? 'asset',
                'category' => $validated['category'] ?? null,
            ],
            $validated['quantity'] ?? 1
        );

        return response()->json(['success' => true, 'data' => $resources]);
    }

    public function availableForEvent($eventId, Request $request)
    {
        $validated = $request->validate([
            'start_datetime' => 'required|date',
            'end_datetime' => 'required|date|after:start_datetime',
            'resource_type' => 'nullable|in:asset,ancillary',
            'quantity' => 'integer|min:1|max:100',
        ]);

        $resources = ResourceInventoryService::getAvailableResourcesWithInfo(
            $validated['start_datetime'],
            $validated['end_datetime'],
            [
                'resource_type' => $validated['resource_type'] ?? null,
                'event_id' => $eventId,
            ],
            $validated['quantity'] ?? 1
        );

        return response()->json(['success' => true, 'data' => $resources]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'resource_type' => 'required|in:asset,ancillary',
            'category' => 'required|string|max:50',
            'name' => 'required|string|max:100',
            'description' => 'required|string',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'total_quantity' => 'required|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'allow_backorder' => 'nullable|in:1,0,true,false,yes,no,on,off',
            'dynamic_pricing_enabled' => 'nullable|in:1,0,true,false,yes,no,on,off',
            'event_id' => 'nullable|exists:cycling_events,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,webp|max:10240',
        ]);

        $resourceCode = $this->generateResourceCode();

        $resource = DB::transaction(function () use ($validated, $resourceCode, $request) {
            $resource = ResourceItem::create([
                'resource_code' => $resourceCode,
                'resource_type' => $validated['resource_type'],
                'category' => $validated['category'],
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']) . '-' . $resourceCode,
                'description' => $validated['description'],
                'brand' => $validated['brand'] ?? null,
                'model' => $validated['model'] ?? null,
                'total_quantity' => $validated['total_quantity'],
                'available_quantity' => $validated['total_quantity'],
                'reserved_quantity' => 0,
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
                'allow_backorder' => filter_var($validated['allow_backorder'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'base_price' => $validated['base_price'],
                'current_price' => $validated['base_price'],
                'surge_multiplier' => 1.00,
                'dynamic_pricing_enabled' => filter_var($validated['dynamic_pricing_enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'status' => 'pending_review',
                'is_active' => false,
                'is_verified' => false,
                'event_id' => $validated['event_id'] ?? null,
                'uploaded_by' => auth()->id(),
                'photos' => [],
            ]);

            if ($request->hasFile('photos')) {
                $photos = [];
                foreach ($request->file('photos') as $photo) {
                    $result = $this->imageUploadService->uploadResourceImage($photo, $resourceCode, $validated['resource_type']);
                    if ($result['success']) {
                        $photos[] = [
                            'public_id' => $result['public_id'],
                            'url' => $result['secure_url'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['medium_url'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'format' => $result['format'],
                        ];
                    }
                }
                $resource->update(['photos' => $photos]);
            }

            ResourcePricingService::createDefaultRules($resource->id);

            AuditService::log([
                'event_type' => 'resource_item_created',
                'event_category' => 'resource',
                'action' => 'created',
                'model_type' => 'ResourceItem',
                'model_id' => $resource->id,
                'description' => "Resource item created: {$resource->name} ({$resource->resource_type})",
                'severity' => 'low',
            ]);

            return $resource;
        });

        return response()->json(['success' => true, 'data' => $resource->fresh(), 'message' => 'Resource created successfully. Awaiting approval.'], 201);
    }

    public function update(Request $request, $resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();

        if (!auth()->user()->can('update', $resource)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'sometimes|string',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'total_quantity' => 'sometimes|integer|min:0',
            'base_price' => 'sometimes|numeric|min:0',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'allow_backorder' => 'sometimes|in:1,0,true,false,yes,no,on,off',
            'dynamic_pricing_enabled' => 'sometimes|in:1,0,true,false,yes,no,on,off',
            'event_id' => 'nullable|exists:cycling_events,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,webp|max:10240',
            'remove_photos' => 'nullable|array',
            'remove_photos.*' => 'string',
        ]);

        $oldValues = $resource->only(['name', 'total_quantity', 'base_price', 'current_price', 'status']);

        DB::transaction(function () use ($resource, $validated, $request) {
            $updateData = [];
            if (isset($validated['name'])) {
                $updateData['name'] = $validated['name'];
                $updateData['slug'] = Str::slug($validated['name']) . '-' . $resource->resource_code;
            }
            if (isset($validated['description'])) $updateData['description'] = $validated['description'];
            if (isset($validated['brand'])) $updateData['brand'] = $validated['brand'];
            if (isset($validated['model'])) $updateData['model'] = $validated['model'];
            if (isset($validated['total_quantity'])) {
                $updateData['total_quantity'] = $validated['total_quantity'];
                $updateData['available_quantity'] = max(0, $validated['total_quantity'] - $resource->reserved_quantity);
            }
            if (isset($validated['base_price'])) {
                $updateData['base_price'] = $validated['base_price'];
                $updateData['current_price'] = round($validated['base_price'] * $resource->surge_multiplier, 2);
            }
            if (isset($validated['low_stock_threshold'])) $updateData['low_stock_threshold'] = $validated['low_stock_threshold'];
            if (isset($validated['allow_backorder'])) $updateData['allow_backorder'] = $validated['allow_backorder'];
            if (isset($validated['dynamic_pricing_enabled'])) $updateData['dynamic_pricing_enabled'] = $validated['dynamic_pricing_enabled'];
            if (isset($validated['event_id'])) $updateData['event_id'] = $validated['event_id'];

            $photos = $resource->photos ?? [];
            if (!empty($validated['remove_photos'])) {
                foreach ($validated['remove_photos'] as $publicId) {
                    $this->imageUploadService->deleteResourceImage($publicId);
                    $photos = array_filter($photos, fn($p) => ($p['public_id'] ?? null) !== $publicId);
                }
                $photos = array_values($photos);
            }

            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $result = $this->imageUploadService->uploadResourceImage($photo, $resource->resource_code, $resource->resource_type);
                    if ($result['success']) {
                        $photos[] = [
                            'public_id' => $result['public_id'],
                            'url' => $result['secure_url'],
                            'thumbnail_url' => $result['thumbnail_url'],
                            'medium_url' => $result['medium_url'],
                            'width' => $result['width'],
                            'height' => $result['height'],
                            'format' => $result['format'],
                        ];
                    }
                }
            }

            $updateData['photos'] = $photos;
            $resource->update($updateData);

            if (isset($validated['base_price']) || isset($validated['total_quantity'])) {
                $resource->updateCurrentPrice();
            }

            AuditService::log([
                'event_type' => 'resource_item_updated',
                'event_category' => 'resource',
                'action' => 'updated',
                'model_type' => 'ResourceItem',
                'model_id' => $resource->id,
                'description' => "Resource item updated: {$resource->name}",
                'old_values' => $oldValues,
                'new_values' => $resource->fresh()->only(['name', 'total_quantity', 'base_price', 'current_price', 'status']),
                'severity' => 'low',
            ]);
        });

        return response()->json(['success' => true, 'data' => $resource->fresh(), 'message' => 'Resource updated successfully']);
    }

    public function destroy($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();
        if (!auth()->user()->can('delete', $resource)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        foreach ($resource->photos ?? [] as $photo) {
            if (isset($photo['public_id'])) {
                $this->imageUploadService->deleteResourceImage($photo['public_id']);
            }
        }

        $resource->delete();

        AuditService::log([
            'event_type' => 'resource_item_deleted',
            'event_category' => 'resource',
            'action' => 'deleted',
            'model_type' => 'ResourceItem',
            'model_id' => $resource->id,
            'description' => "Resource item deleted: {$resource->name}",
            'severity' => 'medium',
        ]);

        return response()->json(['success' => true, 'message' => 'Resource deleted successfully']);
    }

    public function myResources(Request $request)
    {
        $query = ResourceItem::where('uploaded_by', auth()->id())->with(['pricingRules']);
        if ($request->has('resource_type')) $query->where('resource_type', $request->resource_type);
        if ($request->has('status')) $query->where('status', $request->status);
        $perPage = $request->get('per_page', 20);
        $resources = $query->paginate($perPage);
        return response()->json(['success' => true, 'data' => $resources]);
    }

    public function stats($resourceCode)
    {
        $resource = ResourceItem::where('resource_code', $resourceCode)->firstOrFail();
        $stats = [
            'total_bookings' => $resource->bookings()->count(),
            'active_bookings' => $resource->bookings()->active()->count(),
            'completed_bookings' => $resource->bookings()->completed()->count(),
            'cancelled_bookings' => $resource->bookings()->where('status', 'cancelled')->count(),
            'total_revenue' => $resource->bookings()->where('payment_status', 'paid')->sum('grand_total'),
            'current_price' => $resource->current_price,
            'base_price' => $resource->base_price,
            'surge_multiplier' => $resource->surge_multiplier,
            'price_trend' => ResourcePricingService::getPriceTrends($resource->id, 30),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }

    protected function generateResourceCode(): string
    {
        $prefix = 'RES';
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $suffix = '';
        for ($i = 0; $i < 8; $i++) {
            $suffix .= $chars[random_int(0, strlen($chars) - 1)];
        }
        $code = $prefix . '-' . $suffix;
        if (ResourceItem::where('resource_code', $code)->exists()) {
            return $this->generateResourceCode();
        }
        return $code;
    }
}
