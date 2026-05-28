<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('community_posts')) {
            return;
        }

        Schema::create('community_posts', function (Blueprint $table) {
            $table->id();

            // Post code (Bennett Fibonacci 36th encoded, 12 chars)
            $table->string('post_code', 12)->unique();
            $table->string('slug', 150)->unique();

            // Step 1: Ride Info
            $table->string('title', 100);
            $table->unsignedBigInteger('event_id')->nullable();
            $table->date('ride_date');
            $table->string('ride_type', 50)->default('solo'); // solo, group, race, training, leisure

            // Step 2: Ride Stats
            $table->decimal('ride_distance_km', 8, 2)->nullable();
            $table->integer('ride_duration_minutes')->nullable();
            $table->integer('elevation_gain_m')->nullable();
            $table->decimal('avg_speed_kmh', 4, 1)->nullable();
            $table->decimal('max_speed_kmh', 4, 1)->nullable();
            $table->integer('calories_burned')->nullable();

            // Step 3: Story & Details
            $table->text('content');
            $table->string('mood', 50)->default('good'); // amazing, good, tired, challenging, epic
            $table->string('bike_used', 100)->nullable();
            $table->json('gear')->nullable(); // Array of gear items
            $table->json('tags')->nullable(); // Array of hashtags
            $table->string('visibility', 20)->default('public'); // public, followers, private
            $table->boolean('allow_comments')->default(true);

            // Step 3: Photos
            $table->json('photos')->nullable(); // Array of Cloudinary URLs
            $table->json('photo_captions')->nullable(); // Array matching photos index

            // System Fields
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('user_name', 100);
            $table->string('user_avatar', 255)->nullable();
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['active', 'hidden', 'removed'])->default('active');

            $table->timestamps();
            $table->softDeletes();

            // Conditional foreign key — only if cycling_events table exists
            if (Schema::hasTable('cycling_events')) {
                $table->foreign('event_id')->references('id')->on('cycling_events')->onDelete('set null');
            }

            // Indexes
            $table->index(['status', 'visibility', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index(['ride_type', 'status']);
            $table->index(['mood', 'status']);
            $table->fullText('title');
            $table->fullText('content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_posts');
    }
};
