<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_read_receipts', function (Blueprint $table) {
            $table->id();
            $table->uuid('message_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('read_at');
            $table->timestamps();

            $table->unique(['message_id', 'user_id']);
            $table->index(['user_id', 'read_at']);

            // Foreign key to messages.uuid (added after messages.uuid is populated)
            $table->foreign('message_id')->references('uuid')->on('messages')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_read_receipts');
    }
};
