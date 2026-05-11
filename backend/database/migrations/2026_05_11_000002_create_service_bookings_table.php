<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Skip if table already exists (handles partial/failed previous runs)
        if (Schema::hasTable('service_bookings')) {
            return;
        }

        Schema::create('service_bookings', function (Blueprint $table) {
            $table->id();

            // Link to support case (primary tracking)
            $table->string('case_id', 13)->unique();
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');

            // Service details
            $table->string('service_type', 100); // bike_repair, custom_assembly, e_bike_service, etc.
            $table->text('service_description')->nullable();
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->decimal('final_price', 10, 2)->nullable();

            // Scheduling
            $table->timestamp('requested_date')->nullable();
            $table->string('preferred_time', 50)->nullable();
            $table->timestamp('confirmed_date')->nullable();
            $table->string('confirmed_time', 50)->nullable();
            $table->timestamp('completed_date')->nullable();
            $table->timestamp('cancelled_date')->nullable();

            // Assignment (multi-vendor)
            $table->foreignId('seller_id')
                  ->nullable()
                  ->constrained('seller_profiles')
                  ->onDelete('set null');

            $table->foreignId('assigned_mechanic_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // Customer info (for guest bookings)
            $table->string('customer_name', 100)->nullable();
            $table->string('customer_phone', 20)->nullable();
            $table->string('customer_email', 100)->nullable();
            $table->string('guest_session_id', 64)->nullable()->index();

            // Status
            $table->enum('status', [
                'pending',        // Awaiting staff confirmation
                'confirmed',      // Staff confirmed date/time
                'in_progress',    // Service being performed
                'ready',          // Ready for pickup
                'completed',      // Service done, customer picked up
                'cancelled',      // Cancelled by customer or staff
                'no_show'         // Customer didn't show up
            ])->default('pending');

            // Location
            $table->string('shop_location', 100)->nullable();

            // Notes
            $table->text('staff_notes')->nullable();
            $table->text('customer_notes')->nullable();

            // Merge tracking
            $table->foreignId('merged_to_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            $table->timestamp('merged_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['seller_id', 'status']);
            $table->index(['assigned_mechanic_id', 'status']);
            $table->index(['requested_date']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_bookings');
    }
};

