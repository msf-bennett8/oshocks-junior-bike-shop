<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_delivery_statuses', function (Blueprint $table) {
            $table->id();
            $table->uuid('message_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status', 20)->default('delivered'); // delivered | read
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->unique(['message_id', 'user_id']);
            $table->index(['user_id', 'status']);

            // Foreign key to messages.uuid
            $table->foreign('message_id')->references('uuid')->on('messages')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_delivery_statuses');
    }
};
