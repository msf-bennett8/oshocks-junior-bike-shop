<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_session_id', 64)->nullable()->index();
            $table->string('reaction', 50); // emoji or shortcode: 👍, ❤️, 😂, 😮, 😢, 🎉
            $table->timestamps();

            $table->unique(['message_id', 'user_id', 'reaction']);
            $table->unique(['message_id', 'guest_session_id', 'reaction']);
            $table->index(['message_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reactions');
    }
};
