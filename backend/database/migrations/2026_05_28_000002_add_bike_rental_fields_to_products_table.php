<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Listing code (Bennett Fibonacci 36th encoded, 12 chars)
            $table->string('listing_code', 12)->nullable()->unique()->after('id');

            // Modify type enum to include 'rental'
            $table->enum('type', ['bike', 'accessory', 'rental'])->change();

            // Bike-specific fields (nullable — only used when type='rental')
            $table->string('model', 100)->nullable()->after('brand');
            $table->integer('year')->nullable()->after('model');
            $table->string('frame_size', 10)->nullable()->after('year');
            $table->string('wheel_size', 10)->nullable()->after('frame_size');
            $table->enum('bike_condition', ['new', 'excellent', 'good', 'fair'])->nullable()->after('wheel_size');

            // Rental pricing
            $table->decimal('hourly_rate', 10, 2)->nullable()->after('price');
            $table->decimal('daily_rate', 10, 2)->nullable()->after('hourly_rate');
            $table->decimal('weekly_rate', 10, 2)->nullable()->after('daily_rate');
            $table->decimal('monthly_rate', 10, 2)->nullable()->after('weekly_rate');
            $table->decimal('security_deposit', 10, 2)->nullable()->after('monthly_rate');
            $table->integer('min_rental_hours')->default(1)->after('security_deposit');
            $table->integer('max_rental_days')->default(7)->after('min_rental_hours');

            // Location & pickup
            $table->string('location_address', 255)->nullable()->after('max_rental_days');
            $table->decimal('location_lat', 10, 8)->nullable()->after('location_address');
            $table->decimal('location_lng', 11, 8)->nullable()->after('location_lat');
            $table->enum('pickup_type', ['shop', 'owner_location', 'delivery'])->default('owner_location')->after('location_lng');
            $table->decimal('delivery_fee', 10, 2)->nullable()->after('pickup_type');

            // Booking settings
            $table->boolean('instant_book')->default(false)->after('delivery_fee');
            $table->integer('response_time_hours')->default(2)->after('instant_book');

            // Policies
            $table->text('rental_rules')->nullable()->after('response_time_hours');
            $table->text('cancellation_policy')->nullable()->after('rental_rules');
            $table->boolean('insurance_included')->default(false)->after('cancellation_policy');

            // Features (JSON array)
            $table->json('bike_features')->nullable()->after('specifications');

            // System fields
            $table->enum('listing_status', ['pending_review', 'approved', 'rejected', 'paused', 'delisted'])->default('pending_review')->after('is_active');
            $table->integer('total_rentals')->default(0)->after('listing_status');
            $table->boolean('is_verified')->default(false)->after('total_rentals');

            // Owner info (for peer-to-peer rentals)
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('cascade')->after('seller_id');
            $table->string('owner_type', 20)->default('user')->after('owner_id'); // 'user' or 'platform'
            $table->decimal('owner_rating', 2, 1)->default(0)->after('owner_type');

            // Indexes
            $table->index(['type', 'listing_status', 'is_active']);
            $table->index(['owner_id', 'listing_status']);
            $table->index(['category_id', 'type', 'listing_status']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'listing_code', 'model', 'year', 'frame_size', 'wheel_size', 'bike_condition',
                'hourly_rate', 'daily_rate', 'weekly_rate', 'monthly_rate', 'security_deposit',
                'min_rental_hours', 'max_rental_days', 'location_address', 'location_lat', 'location_lng',
                'pickup_type', 'delivery_fee', 'instant_book', 'response_time_hours',
                'rental_rules', 'cancellation_policy', 'insurance_included', 'bike_features',
                'listing_status', 'total_rentals', 'is_verified', 'owner_id', 'owner_type', 'owner_rating',
            ]);
        });
    }
};
