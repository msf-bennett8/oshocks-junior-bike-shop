<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Only add columns that don't already exist
            if (!Schema::hasColumn('conversations', 'order_id')) {
                $table->foreignId('order_id')->nullable()->after('type');
                $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            }

            if (!Schema::hasColumn('conversations', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->after('order_id');
                $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            }

            if (!Schema::hasColumn('conversations', 'status')) {
                $table->enum('status', ['open', 'pending', 'in_progress', 'resolved', 'closed', 'escalated'])
                      ->default('open')
                      ->after('assigned_to');
            }

            if (!Schema::hasColumn('conversations', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])
                      ->default('medium')
                      ->after('status');
            }

            if (!Schema::hasColumn('conversations', 'escalated_at')) {
                $table->timestamp('escalated_at')->nullable()->after('priority');
            }

            if (!Schema::hasColumn('conversations', 'escalation_reason')) {
                $table->text('escalation_reason')->nullable()->after('escalated_at');
            }

            if (!Schema::hasColumn('conversations', 'flagged_for_review')) {
                $table->boolean('flagged_for_review')->default(false)->after('escalation_reason');
            }

            if (!Schema::hasColumn('conversations', 'moderation_notes')) {
                $table->text('moderation_notes')->nullable()->after('flagged_for_review');
            }

            if (!Schema::hasColumn('conversations', 'detected_keywords')) {
                $table->json('detected_keywords')->nullable()->after('moderation_notes');
            }

            if (!Schema::hasColumn('conversations', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('moderation_notes');
            }

            if (!Schema::hasColumn('conversations', 'closed_at')) {
                $table->timestamp('closed_at')->nullable()->after('resolved_at');
            }
        });

        // Add indexes safely
        Schema::table('conversations', function (Blueprint $table) {
            try {
                $table->index(['type', 'status']);
            } catch (\Exception $e) { /* already exists */ }
            try {
                $table->index(['assigned_to', 'status']);
            } catch (\Exception $e) { /* already exists */ }
            try {
                $table->index('order_id');
            } catch (\Exception $e) { /* already exists */ }
            try {
                $table->index('flagged_for_review');
            } catch (\Exception $e) { /* already exists */ }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Drop foreign keys if they exist
            try {
                $table->dropForeign(['order_id']);
            } catch (\Exception $e) { /* doesn't exist */ }
            try {
                $table->dropForeign(['assigned_to']);
            } catch (\Exception $e) { /* doesn't exist */ }

            // Drop indexes if they exist
            try {
                $table->dropIndex(['type', 'status']);
            } catch (\Exception $e) { /* doesn't exist */ }
            try {
                $table->dropIndex(['assigned_to', 'status']);
            } catch (\Exception $e) { /* doesn't exist */ }
            try {
                $table->dropIndex(['order_id']);
            } catch (\Exception $e) { /* doesn't exist */ }
            try {
                $table->dropIndex(['flagged_for_review']);
            } catch (\Exception $e) { /* doesn't exist */ }

            // Drop columns if they exist
            $columns = [
                'order_id', 'assigned_to', 'status', 'priority',
                'escalated_at', 'escalation_reason', 'flagged_for_review',
                'moderation_notes', 'detected_keywords', 'resolved_at', 'closed_at'
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('conversations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
