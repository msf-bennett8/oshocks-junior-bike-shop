<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['mpesa', 'card'])->default('mpesa');
            // M-Pesa fields
            $table->string('phone_number')->nullable();
            $table->string('mpesa_name')->nullable();
            // Card fields
            $table->string('last4')->nullable();
            $table->string('brand')->nullable(); // visa, mastercard, amex
            $table->string('expiry_month')->nullable();
            $table->string('expiry_year')->nullable();
            $table->string('card_name')->nullable();
            // Common fields
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};