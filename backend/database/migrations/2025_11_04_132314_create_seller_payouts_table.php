<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('seller_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('seller_profiles')->onDelete('cascade');
            $table->date('payout_period_start');
            $table->date('payout_period_end');
            $table->decimal('total_sales', 12, 2)->default(0); // Total sales for the period
            $table->decimal('total_commission', 12, 2)->default(0); // Platform earned
            $table->decimal('payout_amount', 12, 2)->default(0); // Seller receives
            $table->enum('payout_method', ['mpesa', 'bank'])->nullable();
            $table->string('payout_reference')->nullable(); // Transaction ID when paid
            $table->enum('payout_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null'); // Admin user_id
            $table->timestamp('processed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('seller_id');
            $table->index('payout_status');
            $table->index(['seller_id', 'payout_status']);
            $table->index(['payout_period_start', 'payout_period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seller_payouts');
    }
};
