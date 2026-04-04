<?php

namespace App\Services;

use App\Models\ServiceBooking;
use App\Models\Review;
use App\Models\LoyaltyTransaction;
use App\Models\ReferralCode;
use App\Models\ReferralUsage;
use App\Models\ProductView;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BusinessOperationsService
{
    // ==================== SERVICE BOOKINGS ====================

    /**
     * Create service booking with audit
     */
    public static function bookService(User $user, array $data): ServiceBooking
    {
        $booking = ServiceBooking::create([
            'booking_id' => 'bk_' . Str::random(16),
            'user_id' => $user->id,
            'service_type' => $data['service_type'],
            'mechanic_id' => $data['mechanic_id'] ?? null,
            'product_id' => $data['product_id'] ?? null,
            'scheduled_date' => $data['scheduled_date'],
            'scheduled_time' => $data['scheduled_time'],
            'duration_minutes' => $data['duration_minutes'] ?? 60,
            'location_id' => $data['location_id'],
            'status' => 'pending',
            'price_estimate' => $data['price_estimate'] ?? null,
        ]);

        AuditService::logServiceBooked($user, [
            'booking_id' => $booking->booking_id,
            'service_type' => $booking->service_type,
            'mechanic_id' => $booking->mechanic_id,
            'scheduled_date' => $booking->scheduled_date,
            'location_id' => $booking->location_id,
        ]);

        return $booking;
    }

    /**
     * Reschedule service with audit
     */
    public static function rescheduleService(ServiceBooking $booking, array $newData, string $reason): ServiceBooking
    {
        // Create new booking record linked to original
        $newBooking = ServiceBooking::create([
            'booking_id' => 'bk_' . Str::random(16),
            'user_id' => $booking->user_id,
            'service_type' => $booking->service_type,
            'mechanic_id' => $newData['mechanic_id'] ?? $booking->mechanic_id,
            'product_id' => $booking->product_id,
            'scheduled_date' => $newData['scheduled_date'],
            'scheduled_time' => $newData['scheduled_time'],
            'duration_minutes' => $newData['duration_minutes'] ?? $booking->duration_minutes,
            'location_id' => $newData['location_id'] ?? $booking->location_id,
            'status' => 'pending',
            'original_booking_id' => $booking->id,
            'reschedule_reason' => $reason,
            'price_estimate' => $booking->price_estimate,
        ]);

        // Update original booking
        $booking->update([
            'status' => 'rescheduled',
            'reschedule_count' => $booking->reschedule_count + 1,
        ]);

        AuditService::logServiceRescheduled($booking->user, [
            'booking_id' => $newBooking->booking_id,
            'original_booking_id' => $booking->booking_id,
            'old_date' => $booking->scheduled_date,
            'new_date' => $newData['scheduled_date'],
            'reschedule_reason' => $reason,
        ]);

        return $newBooking;
    }

    /**
     * Complete service with audit
     */
    public static function completeService(ServiceBooking $booking, array $data): void
    {
        $booking->update([
            'status' => 'completed',
            'completed_at' => now(),
            'final_price' => $data['final_price'] ?? $booking->price_estimate,
            'completion_notes' => $data['notes'] ?? null,
            'rating_prompt_sent' => $data['send_rating_prompt'] ?? false,
        ]);

        AuditService::logServiceCompleted($booking->user, [
            'booking_id' => $booking->booking_id,
            'completion_time' => $booking->completed_at,
            'duration_minutes' => $booking->duration_minutes,
            'final_price' => $booking->final_price,
            'rating_prompt_sent' => $booking->rating_prompt_sent,
        ]);
    }

    /**
     * Cancel service with audit
     */
    public static function cancelService(ServiceBooking $booking, string $reason, string $cancelledBy, bool $refundIssued = false): void
    {
        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_by' => $cancelledBy,
        ]);

        AuditService::logServiceCancelled($booking->user, [
            'booking_id' => $booking->booking_id,
            'cancelled_by' => $cancelledBy,
            'reason' => $reason,
            'refund_issued' => $refundIssued,
        ]);
    }

    /**
     * Mark no-show with audit
     */
    public static function markNoShow(ServiceBooking $booking, string $noShowParty, bool $rescheduleOffered = false): void
    {
        $booking->update([
            'status' => 'no_show',
        ]);

        AuditService::logServiceNoShow($booking->user, [
            'booking_id' => $booking->booking_id,
            'no_show_party' => $noShowParty, // customer, mechanic
            'reschedule_offered' => $rescheduleOffered,
        ]);
    }

    // ==================== REVIEWS ====================

    /**
     * Submit review with audit
     */
    public static function submitReview(User $user, array $data): Review
    {
        $review = Review::create([
            'review_id' => 'rev_' . Str::random(16),
            'user_id' => $user->id,
            'product_id' => $data['product_id'] ?? null,
            'booking_id' => $data['booking_id'] ?? null,
            'seller_id' => $data['seller_id'] ?? null,
            'rating' => $data['rating'],
            'review_text' => $data['review_text'],
            'review_text_hash' => hash('sha256', $data['review_text']),
            'media_count' => count($data['media'] ?? []),
            'media_urls' => $data['media'] ?? [],
            'verified_purchase' => $data['verified_purchase'] ?? false,
            'verified_service' => $data['verified_service'] ?? false,
            'status' => 'pending', // requires moderation
            'helpful_count' => 0,
            'helpful_votes' => [],
            'edit_count' => 0,
        ]);

        AuditService::logReviewSubmitted($user, [
            'review_id' => $review->review_id,
            'product_id' => $review->product_id,
            'booking_id' => $review->booking_id,
            'rating' => $review->rating,
            'review_text_hash' => $review->review_text_hash,
            'media_count' => $review->media_count,
            'verified_purchase' => $review->verified_purchase,
        ]);

        return $review;
    }

    /**
     * Moderate review with audit
     */
    public static function moderateReview(Review $review, string $action, ?string $reason, User $moderator): void
    {
        $review->update([
            'status' => $action, // approved, rejected, flagged
            'moderation_action' => $action,
            'moderation_reason' => $reason,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
        ]);

        AuditService::logReviewModerated($moderator, [
            'review_id' => $review->review_id,
            'moderation_action' => $action,
            'moderation_reason' => $reason,
            'automated' => false,
        ]);
    }

    /**
     * Edit review with audit
     */
    public static function editReview(Review $review, array $newData): void
    {
        $oldRating = $review->rating;
        $oldTextHash = $review->review_text_hash;

        $review->update([
            'rating' => $newData['rating'] ?? $review->rating,
            'review_text' => $newData['review_text'] ?? $review->review_text,
            'review_text_hash' => isset($newData['review_text']) ? hash('sha256', $newData['review_text']) : $review->review_text_hash,
            'media_count' => count($newData['media'] ?? []),
            'media_urls' => $newData['media'] ?? $review->media_urls,
            'original_rating' => $review->original_rating ?? $oldRating,
            'original_text_hash' => $review->original_text_hash ?? $oldTextHash,
            'edit_count' => $review->edit_count + 1,
            'status' => 'pending', // re-moderate after edit
        ]);

        AuditService::logReviewEdited($review->user, [
            'review_id' => $review->review_id,
            'old_rating' => $oldRating,
            'new_rating' => $review->rating,
            'changes' => [
                'rating_changed' => $oldRating !== $review->rating,
                'text_changed' => $oldTextHash !== $review->review_text_hash,
            ],
            'edit_count' => $review->edit_count,
        ]);
    }

    /**
     * Delete review with audit
     */
    public static function deleteReview(Review $review, User $deletedBy, string $reason): void
    {
        // Archive content before deletion
        $review->update([
            'is_deleted' => true,
            'deleted_by' => $deletedBy->id,
            'deleted_reason' => $reason,
            'content_archived' => true,
            'status' => 'deleted',
        ]);

        // Soft delete
        $review->delete();

        AuditService::logReviewDeleted($deletedBy, [
            'review_id' => $review->review_id,
            'product_id' => $review->product_id,
            'deleted_by' => $deletedBy->id,
            'reason' => $reason,
            'content_archived' => true,
        ]);
    }

    /**
     * Mark review helpful with audit
     */
    public static function markReviewHelpful(Review $review, User $user, bool $helpful): void
    {
        if ($helpful) {
            $review->addHelpfulVote($user->id);
        } else {
            $review->removeHelpfulVote($user->id);
        }

        AuditService::logReviewHelpfulMarked($user, [
            'review_id' => $review->review_id,
            'helpful' => $helpful,
        ]);
    }

    // ==================== LOYALTY PROGRAM ====================

    /**
     * Change loyalty tier with audit
     */
    public static function updateLoyaltyTier(User $user, string $newTier, int $qualifyingPoints, array $benefits): void
    {
        $oldTier = $user->loyalty_tier ?? 'bronze';

        $user->update([
            'loyalty_tier' => $newTier,
            'loyalty_qualifying_points' => $qualifyingPoints,
            'loyalty_benefits' => $benefits,
        ]);

        AuditService::logLoyaltyTierChanged($user, [
            'old_tier' => $oldTier,
            'new_tier' => $newTier,
            'qualifying_points' => $qualifyingPoints,
            'benefits_unlocked' => $benefits,
        ]);
    }

    // ==================== REFERRALS ====================

    /**
     * Generate referral code with audit
     */
    public static function generateReferralCode(User $user): ReferralCode
    {
        $code = strtoupper(substr($user->name, 0, 3)) . $user->id . Str::random(4);

        $referralCode = ReferralCode::create([
            'user_id' => $user->id,
            'referral_code' => $code,
            'total_uses' => 0,
            'successful_referrals' => 0,
            'rewards_earned' => 0,
            'is_active' => true,
        ]);

        AuditService::logReferralCodeGenerated($user, [
            'referral_code' => $code,
        ]);

        return $referralCode;
    }

    /**
     * Complete referral with audit
     */
    public static function completeReferral(string $code, User $referee, Order $order): void
    {
        $referralCode = ReferralCode::where('referral_code', $code)->first();
        
        if (!$referralCode) return;

        $referrer = $referralCode->user;

        $usage = ReferralUsage::create([
            'referral_code_id' => $referralCode->id,
            'referrer_user_id' => $referrer->id,
            'referee_user_id' => $referee->id,
            'order_id' => $order->id,
            'status' => 'completed',
            'reward_issued' => true,
            'reward_amount' => config('referrals.reward_amount', 500), // KES 500
            'completed_at' => now(),
        ]);

        // Update referrer stats
        $referralCode->update([
            'successful_referrals' => $referralCode->successful_referrals + 1,
            'rewards_earned' => $referralCode->rewards_earned + $usage->reward_amount,
        ]);

        AuditService::logReferralCompleted($referrer, [
            'referrer_user_id' => $referrer->id,
            'referee_user_id' => $referee->id,
            'referral_code' => $code,
            'order_id' => $order->order_id,
            'reward_issued' => $usage->reward_amount,
        ]);
    }

    // ==================== WISHLIST ====================

    /**
     * Track wishlist add with audit
     */
    public static function trackWishlistAdd(User $user, $wishlistItem): void
    {
        AuditService::logWishlistItemAdded($user, [
            'product_id' => $wishlistItem->product_id,
            'variant_id' => $wishlistItem->variant_id,
        ]);
    }

    /**
     * Track wishlist remove with audit
     */
    public static function trackWishlistRemove(User $user, $wishlistItem): void
    {
        AuditService::logWishlistItemRemoved($user, [
            'product_id' => $wishlistItem->product_id,
            'variant_id' => $wishlistItem->variant_id,
        ]);
    }

    // ==================== PRODUCT VIEWS ====================

    /**
     * Track product view with audit
     */
    public static function trackProductView(?User $user, int $productId, array $context): ProductView
    {
        $view = ProductView::create([
            'view_id' => 'vw_' . Str::random(16),
            'user_id' => $user?->id,
            'session_id' => $context['session_id'] ?? null,
            'product_id' => $productId,
            'source' => $context['source'] ?? 'direct',
            'search_query' => $context['search_query'] ?? null,
            'recommendation_type' => $context['recommendation_type'] ?? null,
            'device_type' => $context['device_type'] ?? 'unknown',
            'ip_address_hash' => isset($context['ip']) ? hash('sha256', $context['ip']) : null,
            'user_agent_hash' => isset($context['user_agent']) ? hash('sha256', $context['user_agent']) : null,
            'viewed_at' => now(),
        ]);

        // Only log analytics sample (10% for TIER_3)
        if (mt_rand(1, 10) === 1) {
            AuditService::logProductViewed($user, [
                'product_id' => $productId,
                'source' => $view->source,
                'session_id' => $view->session_id,
            ]);
        }

        return $view;
    }

    /**
     * Update view with cart/purchase conversion
     */
    public static function updateViewConversion(string $viewId, string $type): void
    {
        $view = ProductView::where('view_id', $viewId)->first();
        
        if (!$view) return;

        if ($type === 'cart') {
            $view->update(['added_to_cart' => true]);
        } elseif ($type === 'purchase') {
            $view->update(['purchased' => true]);
        }
    }
}
