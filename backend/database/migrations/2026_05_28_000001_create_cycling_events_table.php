<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cycling_events')) {
            return;
        }

        Schema::create('cycling_events', function (Blueprint $table) {
            $table->id();

            // Event code (Bennett Fibonacci 36th encoded, 12 chars)
            $table->string('event_code', 12)->unique();
            $table->string('slug', 150)->unique();

            // Step 1: Basic Info
            $table->string('title', 100);
            $table->string('short_description', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('event_type', 50); // group_ride, race, charity, etc.
            $table->string('difficulty', 50); // beginner, intermediate, advanced
            $table->string('terrain', 50); // road, gravel, mtb_trail, mixed
            $table->string('theme_name', 100)->nullable();
            $table->string('charity_name', 100)->nullable();
            $table->string('charity_url', 255)->nullable();

            // Step 2: Route & Schedule
            $table->string('route_name', 100)->nullable();
            $table->text('route_description')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->integer('elevation_gain_m')->nullable();
            $table->decimal('estimated_duration_hours', 4, 1)->nullable();
            $table->string('meeting_point', 255);
            $table->decimal('meeting_lat', 10, 8)->nullable();
            $table->decimal('meeting_lng', 11, 8)->nullable();
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->timestamp('registration_deadline')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern', 100)->nullable();

            // Step 3: Pricing & Capacity
            $table->integer('max_participants');
            $table->integer('min_participants')->nullable();
            $table->decimal('price_per_person', 10, 2);
            $table->decimal('member_price', 10, 2)->nullable();
            $table->decimal('early_bird_price', 10, 2)->nullable();
            $table->timestamp('early_bird_deadline')->nullable();
            $table->integer('group_discount_threshold')->nullable();
            $table->integer('group_discount_percent')->nullable();

            // Step 4: Guide & Logistics
            $table->boolean('guide_included')->default(false);
            $table->string('guide_name', 100)->nullable();
            $table->text('guide_bio')->nullable();
            $table->json('guide_certifications')->nullable();
            $table->boolean('bike_included')->default(false);
            $table->string('included_bike_category', 50)->nullable();
            $table->boolean('transport_provided')->default(false);
            $table->decimal('transport_price', 10, 2)->nullable();
            $table->json('equipment_provided')->nullable();
            $table->json('required_equipment')->nullable();
            $table->string('refund_policy', 50)->nullable();
            $table->text('cancellation_policy')->nullable();
            $table->text('weather_policy')->nullable();

            // Step 5: Photos & Media
            $table->json('photos')->nullable(); // Array of Cloudinary URLs

            // System fields
            $table->string('status', 20)->default('open'); // open, closed, cancelled, completed
            $table->integer('current_participants')->default(0);
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->integer('review_count')->default(0);
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->json('tags')->nullable();
            $table->string('route_gpx_url', 255)->nullable();
            $table->integer('badge_earned_id')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['status', 'start_datetime']);
            $table->index(['event_type', 'difficulty']);
            $table->index(['organizer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycling_events');
    }
};
