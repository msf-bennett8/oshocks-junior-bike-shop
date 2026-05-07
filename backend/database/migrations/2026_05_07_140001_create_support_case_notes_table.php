<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_case_notes', function (Blueprint $table) {
            $table->id();
            
            $table->string('case_id', 13);
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');
            
            $table->foreignId('agent_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->text('content');
            
            // Internal notes are hidden from users
            $table->boolean('is_private')->default(true);
            
            // For notes linked to specific messages
            $table->foreignId('message_id')->nullable();
            
            $table->timestamps();
            
            $table->index(['case_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_case_notes');
    }
};
