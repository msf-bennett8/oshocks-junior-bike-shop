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
        Schema::create('payment_recorders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('recorder_type', ['delivery_agent', 'shop_attendant', 'seller']);
            $table->string('recorder_code')->unique(); // e.g., "DA001", "SA005", "SL023"
            $table->string('location')->nullable(); // e.g., "NAIROBI", "SHOP02", "ONLINE"
            $table->string('shop_id')->nullable(); // For shop attendants
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('recorder_code');
            $table->index(['recorder_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_recorders');
    }
};
