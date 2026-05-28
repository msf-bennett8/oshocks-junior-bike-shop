<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Helper: safely drop foreign key if column exists and FK is present
        $safeDropFkAndColumn = function (string $tableName, string $columnName, string $fkName): void {
            if (!Schema::hasColumn($tableName, $columnName)) {
                return;
            }

            // Check if FK exists before dropping
            $fkExists = DB::selectOne(
                "SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
                 WHERE TABLE_SCHEMA = DATABASE()
                 AND TABLE_NAME = ?
                 AND CONSTRAINT_NAME = ?",
                [$tableName, $fkName]
            );

            Schema::table($tableName, function (Blueprint $table) use ($columnName, $fkName, $fkExists) {
                if ($fkExists) {
                    $table->dropForeign($fkName);
                }
                $table->dropColumn($columnName);
            });
        };

        // Fix message_attachments
        $safeDropFkAndColumn('message_attachments', 'message_id', 'message_attachments_message_id_foreign');
        if (!Schema::hasColumn('message_attachments', 'message_id')) {
            Schema::table('message_attachments', function (Blueprint $table) {
                $table->uuid('message_id')->after('id');
                $table->index('message_id');
            });
        }

        // Fix message_read_receipts
        $safeDropFkAndColumn('message_read_receipts', 'message_id', 'message_read_receipts_message_id_foreign');
        if (!Schema::hasColumn('message_read_receipts', 'message_id')) {
            Schema::table('message_read_receipts', function (Blueprint $table) {
                $table->uuid('message_id')->after('id');
                $table->index(['message_id', 'user_id']);
            });
        }

        // Fix message_delivery_statuses
        $safeDropFkAndColumn('message_delivery_statuses', 'message_id', 'message_delivery_statuses_message_id_foreign');
        if (!Schema::hasColumn('message_delivery_statuses', 'message_id')) {
            Schema::table('message_delivery_statuses', function (Blueprint $table) {
                $table->uuid('message_id')->after('id');
                $table->index(['message_id', 'user_id']);
            });
        }

        // Fix message_reactions
        $safeDropFkAndColumn('message_reactions', 'message_id', 'message_reactions_message_id_foreign');
        if (!Schema::hasColumn('message_reactions', 'message_id')) {
            Schema::table('message_reactions', function (Blueprint $table) {
                $table->uuid('message_id')->after('id');
                $table->index('message_id');
            });
        }
    }

    public function down(): void
    {
        foreach (['message_attachments', 'message_read_receipts', 'message_delivery_statuses', 'message_reactions'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropColumn('message_id');
                $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            });
        }
    }
};
