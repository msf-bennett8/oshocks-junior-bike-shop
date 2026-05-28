<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Idempotent: skip if messages table already uses UUID primary key
        $columnType = DB::selectOne(
            "SELECT DATA_TYPE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'messages'
             AND COLUMN_NAME = 'id'"
        );

        if ($columnType && $columnType->DATA_TYPE === 'varchar') {
            // Already UUID — skip
            return;
        }

        // Step 2: Rename id -> old_id, uuid -> id
        if (Schema::hasColumn('messages', 'id') && Schema::hasColumn('messages', 'uuid')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->renameColumn('id', 'old_id');
            });

            Schema::table('messages', function (Blueprint $table) {
                $table->renameColumn('uuid', 'id');
            });

            // Step 3: Make new id (uuid) primary
            Schema::table('messages', function (Blueprint $table) {
                $table->primary('id');
                if (Schema::hasColumn('messages', 'old_id')) {
                    $table->dropColumn('old_id');
                }
            });
        }
    }

    public function down(): void
    {
        // Reverse is complex — restore from backup if needed
    }
};
