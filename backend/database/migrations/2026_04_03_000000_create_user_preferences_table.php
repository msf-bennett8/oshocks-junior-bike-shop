<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('language', 10)->default('en');
            $table->string('currency', 10)->default('KES');
            $table->boolean('email_notifications')->default(true);
            $table->boolean('sms_notifications')->default(true);
            $table->boolean('order_updates')->default(true);
            $table->boolean('promotional_emails')->default(true);
            $table->boolean('new_arrivals')->default(false);
            $table->boolean('price_drop_alerts')->default(true);
            $table->boolean('newsletter')->default(true);
            $table->boolean('two_factor_auth')->default(false);
            $table->timestamps();
            
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
