<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversation_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_session_id', 64)->nullable()->index();
            $table->boolean('is_muted')->default(false);
            $table->timestamp('muted_until')->nullable();
            $table->string('notification_tone')->default('default'); // default, silent, custom
            $table->boolean('show_preview')->default(true);
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->integer('pin_order')->default(0);
            $table->timestamps();

            $table->unique(['conversation_id', 'user_id']);
            $table->unique(['conversation_id', 'guest_session_id']);
            $table->index(['user_id', 'is_archived', 'is_pinned']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversation_settings');
    }
};
