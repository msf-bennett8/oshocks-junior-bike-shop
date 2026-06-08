<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_availability_blocks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('resource_item_id')->constrained('resource_items')->onDelete('cascade');

            // Block type
            $table->enum('block_type', [
                'booking',           // Quantity reserved for a booking
                'maintenance',       // Under maintenance
                'out_of_service',    // Temporarily unavailable
                'event_reserved',    // Reserved for a specific event
                'blackout',          // Platform blackout
            ])->default('booking');

            // Time range
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');

            // Quantity blocked (for partial inventory blocking)
            $table->integer('quantity_blocked')->default(1);

            // Optional references
            $table->foreignId('booking_id')->nullable()->constrained('resource_bookings')->onDelete('cascade');
            $table->foreignId('event_id')->nullable()->constrained('cycling_events')->onDelete('cascade');

            // Reason / notes
            $table->string('reason', 255)->nullable();
            $table->text('notes')->nullable();

            // Who created the block
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            // Critical index for overlap queries (prevents over-booking)
            $table->index(['resource_item_id', 'start_datetime', 'end_datetime'], 'res_avail_blocks_time_idx');
            $table->index(['resource_item_id', 'block_type']);
            $table->index(['event_id', 'block_type'], 'res_avail_blocks_event_type_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_availability_blocks');
    }
};
