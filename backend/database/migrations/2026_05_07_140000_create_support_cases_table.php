<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_cases', function (Blueprint $table) {
            // Primary key is the case ID string (not auto-increment)
            $table->string('case_id', 13)->primary();
            
            // Link to conversation
            $table->foreignId('conversation_id')
                  ->constrained('conversations')
                  ->onDelete('cascade');
            
            // User who created the case (nullable for guests)
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Guest support
            $table->string('guest_session_id', 64)->nullable()->index();
            
            // Case classification
            $table->enum('case_type', [
                'order_issue',
                'account_help', 
                'report_problem',
                'delivery_question'
            ])->index();
            
            // Case status lifecycle
            $table->enum('status', [
                'new',           // Just created, unclaimed
                'open',          // Claimed by agent
                'in_progress',   // Agent actively working
                'pending_user',  // Awaiting user response
                'resolved',      // Agent marked resolved
                'closed',        // User confirmed or auto-closed
                'escalated'      // Escalated to super admin
            ])->default('new')->index();
            
            // Priority
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                  ->default('medium')
                  ->index();
            
            // Assignment
            $table->foreignId('assigned_to')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            
            // Order linkage (for order_issue type)
            $table->foreignId('order_id')
                  ->nullable()
                  ->constrained('orders')
                  ->onDelete('set null');
            
            // Content
            $table->string('subject', 255);
            $table->text('description')->nullable();
            
            // Escalation tracking
            $table->timestamp('escalated_at')->nullable();
            $table->foreignId('escalated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('escalation_reason')->nullable();
            
            // Resolution tracking
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            
            // Closure tracking
            $table->timestamp('closed_at')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // SLA tracking
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('sla_deadline')->nullable();
            $table->timestamp('first_response_deadline')->nullable();
            $table->boolean('sla_breached')->default(false);
            $table->string('breach_reason', 255)->nullable();
            
            // Satisfaction
            $table->tinyInteger('satisfaction_rating')->nullable(); // 1-5
            $table->text('satisfaction_comment')->nullable();
            
            // Source
            $table->enum('source', ['web', 'email', 'phone', 'chat'])
                  ->default('web');
            
            // Flexible metadata
            $table->json('metadata')->nullable();
            
            $table->timestamps();
            
            // Indexes for common queries
            $table->index(['status', 'priority']);
            $table->index(['assigned_to', 'status']);
            $table->index(['case_type', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['order_id']);
            $table->index(['created_at']);
            $table->index(['escalated_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_cases');
    }
};
