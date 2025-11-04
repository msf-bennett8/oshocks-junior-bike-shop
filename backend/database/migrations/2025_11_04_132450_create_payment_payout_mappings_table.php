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
        Schema::create('payment_payout_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('payout_id')->constrained('seller_payouts')->onDelete('cascade');
            $table->timestamps();

            $table->index('payment_id');
            $table->index('payout_id');
            $table->unique(['payment_id', 'payout_id']); // Prevent duplicate mappings
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_payout_mappings');
    }
};
