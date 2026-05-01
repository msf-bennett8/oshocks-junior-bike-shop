<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('typing_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_session_id', 64)->nullable()->index();
            $table->timestamp('started_at');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['conversation_id', 'user_id']);
            $table->unique(['conversation_id', 'guest_session_id']);
            $table->index(['expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('typing_indicators');
    }
};
