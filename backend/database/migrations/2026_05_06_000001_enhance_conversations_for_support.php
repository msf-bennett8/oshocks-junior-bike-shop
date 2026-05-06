<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Conversation type enum
            $table->enum('type', ['direct', 'support', 'order_support', 'seller_inquiry', 'system'])
                  ->default('direct')
                  ->after('guest_session_id');
            
            // Order linkage for order-contextual messaging
            $table->foreignId('order_id')->nullable()->after('type');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            
            // Support ticket system
            $table->foreignId('assigned_to')->nullable()->after('order_id');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            
            $table->enum('status', ['open', 'pending', 'in_progress', 'resolved', 'closed', 'escalated'])
                  ->default('open')
                  ->after('assigned_to');
            
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                  ->default('medium')
                  ->after('status');
            
            $table->timestamp('escalated_at')->nullable()->after('priority');
            $table->text('escalation_reason')->nullable()->after('escalated_at');
            
            // Moderation flags
            $table->boolean('flagged_for_review')->default(false)->after('escalation_reason');
            $table->text('moderation_notes')->nullable()->after('flagged_for_review');
            $table->json('detected_keywords')->nullable()->after('moderation_notes');
            
            // Timestamps
            $table->timestamp('resolved_at')->nullable()->after('moderation_notes');
            $table->timestamp('closed_at')->nullable()->after('resolved_at');
        });

        // Index for performance
        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['type', 'status']);
            $table->index(['assigned_to', 'status']);
            $table->index('order_id');
            $table->index('flagged_for_review');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['assigned_to']);
            $table->dropIndex(['type', 'status']);
            $table->dropIndex(['assigned_to', 'status']);
            $table->dropIndex(['order_id']);
            $table->dropIndex(['flagged_for_review']);
            
            $table->dropColumn([
                'type', 'order_id', 'assigned_to', 'status', 'priority',
                'escalated_at', 'escalation_reason', 'flagged_for_review',
                'moderation_notes', 'detected_keywords', 'resolved_at', 'closed_at'
            ]);
        });
    }
};
