<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subscription_id', 32)->unique();
            $table->string('endpoint_url', 500);
            $table->json('event_types');
            $table->string('secret_hash', 64); // SHA-256 of secret
            $table->boolean('is_active')->default(true);
            $table->timestamp('disabled_at')->nullable();
            $table->string('disabled_reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });

        // Delivery logs table
        Schema::create('webhook_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained('webhook_subscriptions')->onDelete('cascade');
            $table->string('event_id', 32);
            $table->string('event_type');
            $table->boolean('success');
            $table->integer('http_status');
            $table->text('response_body')->nullable();
            $table->text('error_message')->nullable();
            $table->float('response_time_ms');
            $table->integer('attempt_number')->default(1);
            $table->timestamps();

            $table->index(['subscription_id', 'created_at']);
            $table->index(['event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_delivery_logs');
        Schema::dropIfExists('webhook_subscriptions');
    }
};
