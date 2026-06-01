<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bike_rental_bookings', function (Blueprint $table) {
            $table->id();

            // Booking reference (Bennett Fibonacci 36th encoded)
            $table->string('booking_code', 20)->unique();

            // Relationships
            $table->foreignId('bike_rental_id')->constrained('bike_rentals')->onDelete('cascade');
            $table->foreignId('renter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');

            // Rental period
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->integer('duration_days')->default(1);
            $table->integer('duration_hours')->nullable();

            // Pricing
            $table->decimal('daily_rate', 10, 2);
            $table->decimal('total_rental_fee', 10, 2);
            $table->decimal('security_deposit', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->decimal('insurance_fee', 10, 2)->nullable();
            $table->decimal('add_ons_fee', 10, 2)->nullable();
            $table->decimal('platform_fee', 10, 2);
            $table->decimal('owner_payout', 10, 2);
            $table->decimal('grand_total', 10, 2);

            // Add-ons (JSON)
            $table->json('add_ons')->nullable();

            // Status
            $table->enum('status', [
                'pending_payment',      // Awaiting payment
                'confirmed',            // Paid, awaiting pickup
                'active',               // Currently rented out
                'returned',             // Returned, awaiting inspection
                'completed',            // Inspection passed, deposit released
                'cancelled',            // Cancelled by renter
                'disputed',             // Damage/late return dispute
                'refunded',             // Full refund issued
            ])->default('pending_payment');

            // Pickup & Return
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->text('pickup_notes')->nullable();
            $table->text('return_notes')->nullable();
            $table->json('pre_rental_photos')->nullable();
            $table->json('post_rental_photos')->nullable();

            // Damage / Late fees
            $table->decimal('damage_fee', 10, 2)->nullable();
            $table->decimal('late_fee', 10, 2)->nullable();
            $table->text('damage_description')->nullable();

            // Review
            $table->decimal('renter_rating', 2, 1)->nullable();
            $table->text('renter_review')->nullable();
            $table->decimal('owner_rating', 2, 1)->nullable();
            $table->text('owner_review')->nullable();

            // Payment
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for availability queries
            $table->index(['bike_rental_id', 'status']);
            $table->index(['bike_rental_id', 'start_datetime', 'end_datetime']);
            $table->index(['renter_id', 'status']);
            $table->index(['owner_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bike_rental_bookings');
    }
};
