<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cycling_event_registrations', function (Blueprint $table) {
            $table->id();

            // Registration code (Bennett Fibonacci 36th encoded)
            $table->string('registration_code', 20)->unique();

            // Relationships
            $table->foreignId('event_id')->constrained('cycling_events')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Registration details
            $table->integer('participant_count')->default(1);
            $table->decimal('price_per_person', 10, 2);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('final_amount', 10, 2);

            // Add-ons (JSON)
            $table->json('add_ons')->nullable(); // transport, insurance, nutrition

            // Bike rental info
            $table->boolean('bike_included')->default(false);
            $table->foreignId('bike_rental_id')->nullable()->constrained('bike_rentals')->nullOnDelete();
            $table->json('bike_add_ons')->nullable();

            // Emergency contact
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();

            // Waiver
            $table->boolean('waiver_signed')->default(false);

            // Payment
            $table->string('payment_status', 20)->default('pending'); // pending, paid, refunded, failed
            $table->string('payment_reference')->nullable();
            $table->string('payment_method')->nullable();

            // Status
            $table->enum('status', [
                'registered',      // Confirmed registration
                'waitlisted',      // Event full, on waitlist
                'cancelled',       // User cancelled
                'no_show',         // Did not attend
                'attended',        // Attended the event
            ])->default('registered');

            // Cancellation
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();

            // Check-in
            $table->timestamp('checked_in_at')->nullable();

            // Review
            $table->decimal('rating', 2, 1)->nullable();
            $table->text('review')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['event_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['event_id', 'user_id']);
            $table->unique(['event_id', 'user_id']); // One registration per user per event
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycling_event_registrations');
    }
};
