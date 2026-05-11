<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seller_availability', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('seller_id')
                  ->constrained('seller_profiles')
                  ->onDelete('cascade');

            // Day of week: 0=Sunday, 6=Saturday
            $table->tinyInteger('day_of_week');
            
            // Time slots (can have multiple per day)
            $table->time('start_time');
            $table->time('end_time');
            
            // Is this slot available for booking?
            $table->boolean('is_available')->default(true);
            
            // Specific date override (for holidays/special days)
            $table->date('specific_date')->nullable();
            
            // Max bookings per slot
            $table->integer('max_bookings')->default(1);

            $table->timestamps();

            $table->unique(['seller_id', 'day_of_week', 'start_time', 'specific_date'], 'unique_availability_slot');
            $table->index(['seller_id', 'day_of_week', 'is_available']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seller_availability');
    }
};
