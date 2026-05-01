<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('body');
            $table->string('type')->default('text'); // text, image, file, call_invite
            $table->json('metadata')->nullable(); // for call invites: {call_type, call_session_id}
            // ─── READ RECEIPTS ───
            $table->timestamp('read_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            
            // ─── REPLY TO ───
            $table->foreignId('reply_to')->nullable()->constrained('messages')->nullOnDelete();
            
            // ─── EDIT / DELETE ───
            $table->timestamp('edited_at')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('deleted_at')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->string('deleted_by')->nullable(); // 'sender', 'admin', 'system'
            
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['conversation_id', 'deleted_at']);
            $table->index(['sender_id', 'created_at']);
            $table->fullText('body'); // For message search
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
