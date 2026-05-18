<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix message_attachments
        Schema::table('message_attachments', function (Blueprint $table) {
            $table->dropForeign(['message_id']);
            $table->dropColumn('message_id');
        });
        Schema::table('message_attachments', function (Blueprint $table) {
            $table->uuid('message_id')->after('id');
            $table->index('message_id');
        });

        // Fix message_read_receipts
        Schema::table('message_read_receipts', function (Blueprint $table) {
            $table->dropForeign(['message_id']);
            $table->dropColumn('message_id');
        });
        Schema::table('message_read_receipts', function (Blueprint $table) {
            $table->uuid('message_id')->after('id');
            $table->index(['message_id', 'user_id']);
        });

        // Fix message_delivery_statuses
        Schema::table('message_delivery_statuses', function (Blueprint $table) {
            $table->dropForeign(['message_id']);
            $table->dropColumn('message_id');
        });
        Schema::table('message_delivery_statuses', function (Blueprint $table) {
            $table->uuid('message_id')->after('id');
            $table->index(['message_id', 'user_id']);
        });

        // Fix message_reactions
        Schema::table('message_reactions', function (Blueprint $table) {
            $table->dropForeign(['message_id']);
            $table->dropColumn('message_id');
        });
        Schema::table('message_reactions', function (Blueprint $table) {
            $table->uuid('message_id')->after('id');
            $table->index('message_id');
        });
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
