<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_items', function (Blueprint $table) {
            $table->id();

            // Unique resource code (Bennett Fibonacci 36th encoded, 12 chars)
            $table->string('resource_code', 20)->unique();

            // Classification
            $table->enum('resource_type', ['asset', 'ancillary'])->default('asset');
            $table->string('category', 50); // helmet, bike_light, u_lock, repair_kit, water_bottle, gloves, cycling_kit, nutrition_pack, insurance, transport, etc.

            // Basic Info
            $table->string('name', 100);
            $table->string('slug', 150)->unique();
            $table->text('description');
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();

            // Inventory Management (REAL quantities - not unlimited)
            $table->integer('total_quantity')->default(0);
            $table->integer('available_quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->boolean('allow_backorder')->default(false);

            // Pricing
            $table->decimal('base_price', 10, 2);
            $table->decimal('current_price', 10, 2);
            $table->decimal('surge_multiplier', 3, 2)->default(1.00); // 1.0 = base price, 1.5 = 50% surge
            $table->boolean('dynamic_pricing_enabled')->default(true);

            // Photos (Cloudinary JSON array)
            $table->json('photos')->nullable();

            // Status & Moderation
            $table->enum('status', ['pending_review', 'approved', 'rejected', 'paused', 'out_of_stock', 'delisted'])->default('pending_review');
            $table->boolean('is_active')->default(false);
            $table->boolean('is_verified')->default(false);

            // Event linkage (optional - for event-specific resources)
            $table->foreignId('event_id')->nullable()->constrained('cycling_events')->onDelete('set null');

            // Who uploaded/moderated
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            // Rejection / moderation notes
            $table->text('rejection_reason')->nullable();
            $table->text('moderation_notes')->nullable();

            // Soft deletes & timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['resource_type', 'status', 'is_active']);
            $table->index(['category', 'status']);
            $table->index(['available_quantity', 'status']);
            $table->index(['event_id', 'status']);
            $table->index(['uploaded_by', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_items');
    }
};
