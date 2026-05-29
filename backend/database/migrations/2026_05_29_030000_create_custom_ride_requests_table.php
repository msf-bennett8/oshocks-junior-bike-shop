<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_ride_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_id', 12)->unique()->index(); // 10-12 digit ID like support cases
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('guest_session_id', 64)->nullable()->index();
            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone', 20)->nullable();
            
            // Ride Basics
            $table->string('title', 100);
            $table->text('description');
            $table->date('preferred_date');
            $table->boolean('date_flexible')->default(false);
            $table->unsignedTinyInteger('date_flexibility_days')->default(3); // ±3 days
            
            // Group & Riders
            $table->unsignedSmallInteger('group_size')->default(1);
            $table->unsignedSmallInteger('rider_count')->default(1);
            
            // Preferences
            $table->enum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert'])->default('beginner');
            $table->enum('terrain', ['road', 'trail', 'gravel', 'mountain', 'mixed'])->default('road');
            $table->unsignedSmallInteger('distance_km')->nullable();
            $table->unsignedSmallInteger('duration_hours')->nullable();
            
            // Bike Rental
            $table->string('bike_model', 100)->nullable(); // e.g., "Giant Escape 3 City"
            $table->string('bike_size', 10)->nullable(); // e.g., "M"
            $table->json('add_ons')->nullable(); // ['helmet', 'lights', 'lock', 'repair_kit', 'bottle', 'gloves']
            
            // Pricing Breakdown
            $table->decimal('base_rental_price', 12, 2)->default(0);
            $table->decimal('add_ons_price', 12, 2)->default(0);
            $table->decimal('insurance_price', 12, 2)->default(0);
            $table->decimal('transport_price', 12, 2)->default(0);
            $table->decimal('security_deposit', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->decimal('budget_estimate', 12, 2)->nullable();
            
            // Options
            $table->boolean('insurance_included')->default(false);
            $table->boolean('transport_included')->default(false);
            $table->text('transport_notes')->nullable();
            
            // Contact
            $table->string('contact_phone', 20);
            
            // Status & Admin
            $table->enum('status', [
                'reviewing',
                'quoted',
                'accepted',
                'declined',
                'scheduled',
                'completed',
                'cancelled',
                'expired'
            ])->default('reviewing');
            $table->timestamp('quoted_at')->nullable();
            $table->foreignId('quoted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('staff_notes')->nullable();
            $table->text('customer_notes')->nullable();
            $table->json('metadata')->nullable();
            
            // Soft deletes & timestamps
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'status']);
            $table->index(['preferred_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_ride_requests');
    }
};
