<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bike_rentals', function (Blueprint $table) {
            $table->id();

            // Listing code (Bennett Fibonacci 36th encoded, 12 chars)
            $table->string('listing_code', 20)->unique();

            // Step 1: Basic Info
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->text('description');
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->integer('year');
            $table->string('category', 50); // road, mtb, hybrid, etc.
            $table->string('frame_size', 10);
            $table->string('wheel_size', 10);
            $table->enum('bike_condition', ['new', 'excellent', 'good', 'fair'])->default('good');

            // Step 2: Pricing
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('weekly_rate', 10, 2)->nullable();
            $table->decimal('monthly_rate', 10, 2)->nullable();
            $table->decimal('security_deposit', 10, 2);
            $table->integer('min_rental_hours')->default(1);
            $table->integer('max_rental_days')->default(7);

            // Step 3: Location & Pickup
            $table->string('location_address', 255);
            $table->decimal('location_lat', 10, 8)->nullable();
            $table->decimal('location_lng', 11, 8)->nullable();
            $table->enum('pickup_type', ['shop', 'owner_location', 'delivery'])->default('owner_location');
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->boolean('instant_book')->default(false);
            $table->integer('response_time_hours')->default(2);

            // Step 4: Policies
            $table->text('rental_rules')->nullable();
            $table->text('cancellation_policy')->nullable();
            $table->boolean('insurance_included')->default(false);

            // Step 5: Photos & Features
            $table->json('photos')->nullable(); // Array of Cloudinary URLs
            $table->json('bike_features')->nullable();

            // System Fields
            $table->enum('listing_status', ['pending_review', 'approved', 'rejected', 'paused', 'delisted'])->default('pending_review');
            $table->integer('total_rentals')->default(0);
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('review_count')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(false);

            // Seller profile link (for commission/payout tracking)
            $table->foreignId('seller_id')->nullable()->constrained('seller_profiles')->onDelete('set null');

            // Owner
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('owner_type', 20)->default('user'); // 'user' or 'platform'
            $table->decimal('owner_rating', 2, 1)->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['listing_status', 'is_active']);
            $table->index(['category', 'listing_status']);
            $table->index(['owner_id', 'listing_status']);
            $table->index(['bike_condition', 'listing_status']);
            $table->index(['location_lat', 'location_lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bike_rentals');
    }
};
