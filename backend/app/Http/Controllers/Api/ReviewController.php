<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Services\BusinessOperationsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Submit review
     * POST /api/v1/reviews
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'booking_id' => 'nullable|exists:service_bookings,id',
            'seller_id' => 'nullable|exists:seller_profiles,id',
            'rating' => 'required|integer|min:1|max:5',
            'review_text' => 'required|string|min:10|max:2000',
            'media' => 'nullable|array',
            'media.*' => 'url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify purchase/service
        $verifiedPurchase = false;
        $verifiedService = false;

        if ($request->product_id) {
            $verifiedPurchase = $request->user()
                ->orders()
                ->whereHas('items', fn($q) => $q->where('product_id', $request->product_id))
                ->where('status', 'delivered')
                ->exists();
        }

        if ($request->booking_id) {
            $verifiedService = $request->user()
                ->orders() // or service bookings
                ->where('id', $request->booking_id)
                ->where('status', 'completed')
                ->exists();
        }

        $review = BusinessOperationsService::submitService($request->user(), array_merge(
            $request->all(),
            ['verified_purchase' => $verifiedPurchase, 'verified_service' => $verifiedService]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Review submitted for moderation',
            'data' => $review
        ], 201);
    }

    /**
     * Edit review
     * PUT /api/v1/reviews/{id}
     */
    public function update(Request $request, $id)
    {
        $review = Review::where('review_id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        BusinessOperationsService::editReview($review, $request->only(['rating', 'review_text', 'media']));

        return response()->json([
            'success' => true,
            'message' => 'Review updated and pending re-moderation'
        ]);
    }

    /**
     * Delete review
     * DELETE /api/v1/reviews/{id}
     */
    public function destroy(Request $request, $id)
    {
        $review = Review::where('review_id', $id)->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        // Only owner or admin can delete
        if ($review->user_id !== $request->user()->id && !$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        BusinessOperationsService::deleteReview(
            $review,
            $request->user(),
            $request->reason ?? 'user_request'
        );

        return response()->json([
            'success' => true,
            'message' => 'Review deleted'
        ]);
    }

    /**
     * Moderate review (admin only)
     * POST /api/v1/reviews/{id}/moderate
     */
    public function moderate(Request $request, $id)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approved,rejected,flagged',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $review = Review::where('review_id', $id)->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        BusinessOperationsService::moderateReview(
            $review,
            $request->action,
            $request->reason,
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => "Review {$request->action}"
        ]);
    }

    /**
     * Mark helpful
     * POST /api/v1/reviews/{id}/helpful
     */
    public function markHelpful(Request $request, $id)
    {
        $review = Review::where('review_id', $id)
            ->where('status', 'approved')
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found'
            ], 404);
        }

        $helpful = $request->boolean('helpful', true);

        BusinessOperationsService::markReviewHelpful($review, $request->user(), $helpful);

        return response()->json([
            'success' => true,
            'message' => $helpful ? 'Marked as helpful' : 'Removed helpful mark'
        ]);
    }

    /**
     * Get reviews for product
     * GET /api/v1/products/{id}/reviews
     */
    public function getByProduct(Request $request, $id)
    {
        $reviews = Review::where('product_id', $id)
            ->where('status', 'approved')
            ->where('is_deleted', false)
            ->with('user:id,name,profile_image')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        // Calculate average rating
        $avgRating = Review::where('product_id', $id)
            ->where('status', 'approved')
            ->avg('rating');

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'average_rating' => round($avgRating, 1),
            'total_reviews' => $reviews->total(),
        ]);
    }
}
