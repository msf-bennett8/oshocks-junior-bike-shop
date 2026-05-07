<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_case_history', function (Blueprint $table) {
            $table->id();
            
            $table->string('case_id', 13);
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');
            
            // Who made the change
            $table->foreignId('changed_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Status change
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20)->nullable();
            
            // Assignment change
            $table->foreignId('from_assigned_to')->nullable();
            $table->foreignId('to_assigned_to')->nullable();
            
            // Priority change
            $table->string('from_priority', 10)->nullable();
            $table->string('to_priority', 10)->nullable();
            
            // Reason for change
            $table->text('reason')->nullable();
            
            // Additional context
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            $table->index(['case_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_case_history');
    }
};
