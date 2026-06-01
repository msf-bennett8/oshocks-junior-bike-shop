<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bike_availability_blocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('bike_rental_id')->constrained('bike_rentals')->onDelete('cascade');

            // Block type
            $table->enum('block_type', [
                'booking',           // Already rented
                'maintenance',       // Under maintenance
                'out_of_service',    // Temporarily unavailable
                'owner_unavailable', // Owner blocked dates
                'blackout',          // Platform blackout
            ])->default('booking');

            // Time range
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');

            // Optional reference
            $table->foreignId('booking_id')->nullable()->constrained('bike_rental_bookings')->onDelete('cascade');

            // Reason / notes
            $table->string('reason', 255)->nullable();
            $table->text('notes')->nullable();

            // Who created the block
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            // Critical index for overlap queries (prevents double-booking)
            $table->index(['bike_rental_id', 'start_datetime', 'end_datetime']);
            $table->index(['bike_rental_id', 'block_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bike_availability_blocks');
    }
};
