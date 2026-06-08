<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_bookings', function (Blueprint $table) {
            $table->id();

            // Booking reference (Bennett Fibonacci 36th encoded)
            $table->string('booking_code', 20)->unique();

            // Relationships
            $table->foreignId('resource_item_id')->constrained('resource_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Event linkage (optional - for event bookings)
            $table->foreignId('event_id')->nullable()->constrained('cycling_events')->onDelete('set null');
            $table->foreignId('bike_rental_booking_id')->nullable()->constrained('bike_rental_bookings')->onDelete('set null');

            // Booking period
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->integer('quantity_booked')->default(1);
            $table->integer('duration_days')->default(1);

            // Pricing at time of booking
            $table->decimal('unit_price', 10, 2);
            $table->decimal('surge_multiplier_applied', 3, 2)->default(1.00);
            $table->decimal('total_price', 10, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2);

            // Status
            $table->enum('status', [
                'pending_payment',
                'confirmed',
                'picked_up',
                'active',
                'returned',
                'completed',
                'cancelled',
                'no_show',
            ])->default('pending_payment');

            // Pickup & Return tracking
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->foreignId('picked_up_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('returned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->text('pickup_notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->json('pre_rental_photos')->nullable();
            $table->json('post_rental_photos')->nullable();

            // Damage / Late fees
            $table->decimal('damage_fee', 10, 2)->nullable();
            $table->decimal('late_fee', 10, 2)->nullable();
            $table->text('damage_description')->nullable();

            // Payment
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();

            // Recirculation (return to inventory)
            $table->boolean('recirculated')->default(false);
            $table->timestamp('recirculated_at')->nullable();
            $table->foreignId('recirculated_by')->nullable()->constrained('users')->onDelete('set null');

            // Event end auto-return
            $table->boolean('auto_returned')->default(false);
            $table->timestamp('auto_returned_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['resource_item_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['event_id', 'status']);
            $table->index(['bike_rental_booking_id', 'status']);
            $table->index(['status', 'start_datetime', 'end_datetime']);
            $table->index(['recirculated', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_bookings');
    }
};
