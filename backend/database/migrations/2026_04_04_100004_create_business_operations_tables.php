<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Service Bookings (if not exists)
        if (!Schema::hasTable('service_bookings')) {
            Schema::create('service_bookings', function (Blueprint $table) {
                $table->id();
                $table->string('booking_id', 32)->unique();
                $table->foreignId('user_id')->constrained();
                $table->string('service_type');
                $table->foreignId('mechanic_id')->nullable()->constrained('users');
                $table->foreignId('product_id')->nullable()->constrained();
                $table->date('scheduled_date');
                $table->datetime('scheduled_time');
                $table->integer('duration_minutes')->default(60);
                $table->foreignId('location_id')->nullable()->constrained('addresses');
                $table->enum('status', ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])->default('pending');
                $table->integer('reschedule_count')->default(0);
                $table->foreignId('original_booking_id')->nullable()->constrained('service_bookings');
                $table->text('reschedule_reason')->nullable();
                $table->text('cancellation_reason')->nullable();
                $table->enum('cancelled_by', ['customer', 'mechanic', 'system'])->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->text('completion_notes')->nullable();
                $table->boolean('rating_prompt_sent')->default(false);
                $table->decimal('price_estimate', 10, 2)->nullable();
                $table->decimal('final_price', 10, 2)->nullable();
                $table->timestamps();

                $table->index(['user_id', 'status']);
                $table->index(['mechanic_id', 'scheduled_date']);
            });
        }

        // Reviews table upgrade
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'review_id')) {
                $table->string('review_id', 32)->unique()->after('id');
            }
            if (!Schema::hasColumn('reviews', 'booking_id')) {
                $table->foreignId('booking_id')->nullable()->constrained('service_bookings')->after('product_id');
            }
            if (!Schema::hasColumn('reviews', 'seller_id')) {
                $table->foreignId('seller_id')->nullable()->constrained('seller_profiles')->after('booking_id');
            }
            if (!Schema::hasColumn('reviews', 'review_text_hash')) {
                $table->string('review_text_hash')->nullable()->after('comment');
            }
            if (!Schema::hasColumn('reviews', 'media_count')) {
                $table->integer('media_count')->default(0)->after('review_text_hash');
            }
            if (!Schema::hasColumn('reviews', 'media_urls')) {
                $table->json('media_urls')->nullable()->after('media_count');
            }
            if (!Schema::hasColumn('reviews', 'verified_purchase')) {
                $table->boolean('verified_purchase')->default(false)->after('media_urls');
            }
            if (!Schema::hasColumn('reviews', 'verified_service')) {
                $table->boolean('verified_service')->default(false)->after('verified_purchase');
            }
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->enum('status', ['pending', 'approved', 'rejected', 'flagged', 'deleted'])->default('pending')->after('verified_service');
            }
            if (!Schema::hasColumn('reviews', 'moderation_action')) {
                $table->string('moderation_action')->nullable()->after('status');
            }
            if (!Schema::hasColumn('reviews', 'moderation_reason')) {
                $table->text('moderation_reason')->nullable()->after('moderation_action');
            }
            if (!Schema::hasColumn('reviews', 'moderated_by')) {
                $table->foreignId('moderated_by')->nullable()->constrained('users')->after('moderation_reason');
            }
            if (!Schema::hasColumn('reviews', 'moderated_at')) {
                $table->timestamp('moderated_at')->nullable()->after('moderated_by');
            }
            if (!Schema::hasColumn('reviews', 'edit_count')) {
                $table->integer('edit_count')->default(0)->after('moderated_at');
            }
            if (!Schema::hasColumn('reviews', 'original_rating')) {
                $table->integer('original_rating')->nullable()->after('edit_count');
            }
            if (!Schema::hasColumn('reviews', 'original_text_hash')) {
                $table->string('original_text_hash')->nullable()->after('original_rating');
            }
            if (!Schema::hasColumn('reviews', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('original_text_hash');
            }
            if (!Schema::hasColumn('reviews', 'deleted_by')) {
                $table->foreignId('deleted_by')->nullable()->constrained('users')->after('is_deleted');
            }
            if (!Schema::hasColumn('reviews', 'deleted_reason')) {
                $table->text('deleted_reason')->nullable()->after('deleted_by');
            }
            if (!Schema::hasColumn('reviews', 'content_archived')) {
                $table->boolean('content_archived')->default(false)->after('deleted_reason');
            }
            if (!Schema::hasColumn('reviews', 'helpful_count')) {
                $table->integer('helpful_count')->default(0)->after('content_archived');
            }
            if (!Schema::hasColumn('reviews', 'helpful_votes')) {
                $table->json('helpful_votes')->nullable()->after('helpful_count');
            }
        });

        // Loyalty/Referral tables
        if (!Schema::hasTable('loyalty_transactions')) {
            Schema::create('loyalty_transactions', function (Blueprint $table) {
                $table->id();
                $table->string('transaction_id', 32)->unique();
                $table->foreignId('user_id')->constrained();
                $table->integer('points_change');
                $table->integer('balance_after');
                $table->enum('transaction_type', ['earn', 'redeem', 'expire', 'adjust', 'bonus']);
                $table->enum('source', ['order', 'referral', 'promo', 'manual', 'system']);
                $table->string('source_id')->nullable();
                $table->text('description')->nullable();
                $table->timestamp('expiry_date')->nullable();
                $table->foreignId('processed_by')->nullable()->constrained('users');
                $table->text('adjustment_reason')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'created_at']);
            });
        }

        if (!Schema::hasTable('referral_codes')) {
            Schema::create('referral_codes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained();
                $table->string('referral_code', 20)->unique();
                $table->integer('total_uses')->default(0);
                $table->integer('successful_referrals')->default(0);
                $table->decimal('rewards_earned', 10, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();

                $table->index(['referral_code']);
                $table->index(['user_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('referral_usages')) {
            Schema::create('referral_usages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('referral_code_id')->constrained('referral_codes');
                $table->foreignId('referrer_user_id')->constrained('users');
                $table->foreignId('referee_user_id')->constrained('users');
                $table->foreignId('order_id')->nullable()->constrained();
                $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
                $table->boolean('reward_issued')->default(false);
                $table->decimal('reward_amount', 10, 2)->default(0);
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();

                $table->index(['referral_code_id', 'status']);
                $table->index(['referee_user_id']);
            });
        }

        // Product Views table
        if (!Schema::hasTable('product_views')) {
            Schema::create('product_views', function (Blueprint $table) {
                $table->id();
                $table->string('view_id', 32)->unique();
                $table->foreignId('user_id')->nullable()->constrained();
                $table->string('session_id')->nullable();
                $table->foreignId('product_id')->constrained();
                $table->enum('source', ['search', 'recommendation', 'direct', 'category', 'wishlist', 'marketing'])->default('direct');
                $table->string('search_query')->nullable();
                $table->string('recommendation_type')->nullable();
                $table->enum('device_type', ['mobile', 'desktop', 'tablet', 'unknown'])->default('unknown');
                $table->string('ip_address_hash')->nullable();
                $table->string('user_agent_hash')->nullable();
                $table->integer('view_duration_seconds')->nullable();
                $table->boolean('added_to_cart')->default(false);
                $table->boolean('purchased')->default(false);
                $table->timestamp('viewed_at');
                $table->timestamps();

                $table->index(['product_id', 'viewed_at']);
                $table->index(['user_id', 'viewed_at']);
                $table->index(['session_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_views');
        Schema::dropIfExists('referral_usages');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('loyalty_transactions');
        Schema::dropIfExists('service_bookings');
    }
};
