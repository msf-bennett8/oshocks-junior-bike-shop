<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('call_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique(); // UUID for WebRTC room
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignId('caller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('callee_id')->constrained('users')->onDelete('cascade');
            $table->string('call_type')->default('voice'); // voice, video
            $table->string('status')->default('pending'); // pending, active, ended, missed, declined
            $table->timestamp('started_at')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->string('end_reason')->nullable(); // completed, declined, missed, failed, user_hung_up
            $table->timestamps();

            $table->index(['caller_id', 'status']);
            $table->index(['callee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('call_sessions');
    }
};
