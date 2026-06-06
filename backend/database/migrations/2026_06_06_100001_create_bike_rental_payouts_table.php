<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bike_rental_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('seller_profiles')->onDelete('cascade');
            $table->foreignId('booking_id')->constrained('bike_rental_bookings')->onDelete('cascade');
            
            // Payout details
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('platform_commission', 10, 2);
            $table->decimal('net_payout', 10, 2);
            
            // Status
            $table->enum('status', ['pending', 'requested', 'processing', 'paid', 'delayed'])->default('pending');
            
            // Request & Payment
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('payout_reference')->nullable();
            $table->string('payout_method')->nullable();
            
            // Delay tracking
            $table->timestamp('delayed_at')->nullable();
            $table->foreignId('delayed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('delay_notes')->nullable();
            $table->boolean('delay_watermark')->default(false);
            
            // Period tracking
            $table->enum('payout_period', ['weekly', 'monthly'])->default('weekly');
            $table->date('period_start');
            $table->date('period_end');
            
            $table->timestamps();
            
            $table->index(['seller_id', 'status']);
            $table->index(['booking_id', 'status']);
            $table->index(['period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bike_rental_payouts');
    }
};
