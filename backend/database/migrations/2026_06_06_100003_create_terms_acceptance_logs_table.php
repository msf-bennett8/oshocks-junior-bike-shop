<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('terms_acceptance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('terms_type', ['renting', 'listing', 'seller_payments']);
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('accepted_at');
            $table->timestamps();
            
            $table->index(['user_id', 'terms_type']);
            $table->unique(['user_id', 'terms_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('terms_acceptance_logs');
    }
};
