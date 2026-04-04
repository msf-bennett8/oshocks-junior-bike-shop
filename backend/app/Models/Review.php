<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'review_id',
        'user_id',
        'product_id',
        'booking_id', // for service reviews
        'seller_id', // for seller reviews
        'rating', // 1-5 stars
        'review_text',
        'review_text_hash', // hashed for privacy
        'media_count', // photos/videos attached
        'media_urls', // JSON array
        'verified_purchase', // did they actually buy it?
        'verified_service', // did they actually use the service?
        'status', // pending, approved, rejected, flagged
        'moderation_action', // approved, rejected, flagged
        'moderation_reason',
        'moderated_by',
        'moderated_at',
        'edit_count',
        'original_rating', // before edit
        'original_text_hash', // before edit
        'is_deleted',
        'deleted_by',
        'deleted_reason',
        'content_archived', // full text archived before deletion
        'helpful_count', // number of "helpful" votes
        'helpful_votes', // JSON array of user IDs who voted
    ];

    protected $casts = [
        'media_urls' => 'array',
        'verified_purchase' => 'boolean',
        'verified_service' => 'boolean',
        'moderated_at' => 'datetime',
        'is_deleted' => 'boolean',
        'content_archived' => 'boolean',
        'helpful_votes' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function booking()
    {
        return $this->belongsTo(ServiceBooking::class);
    }

    public function seller()
    {
        return $this->belongsTo(SellerProfile::class, 'seller_id');
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

    /**
     * Check if user has already voted helpful
     */
    public function hasUserVotedHelpful(int $userId): bool
    {
        return in_array($userId, $this->helpful_votes ?? []);
    }

    /**
     * Add helpful vote
     */
    public function addHelpfulVote(int $userId): void
    {
        $votes = $this->helpful_votes ?? [];
        if (!in_array($userId, $votes)) {
            $votes[] = $userId;
            $this->update([
                'helpful_votes' => $votes,
                'helpful_count' => count($votes),
            ]);
        }
    }

    /**
     * Remove helpful vote
     */
    public function removeHelpfulVote(int $userId): void
    {
        $votes = $this->helpful_votes ?? [];
        $key = array_search($userId, $votes);
        if ($key !== false) {
            unset($votes[$key]);
            $this->update([
                'helpful_votes' => array_values($votes),
                'helpful_count' => count($votes),
            ]);
        }
    }
}
