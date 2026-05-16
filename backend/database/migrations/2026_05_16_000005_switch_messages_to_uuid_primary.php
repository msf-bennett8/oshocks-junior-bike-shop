<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Drop foreign keys that reference messages.id (bigint)
        // Add your other tables here if they reference messages.id
        // Schema::table('message_attachments', function (Blueprint $table) {
        //     $table->dropForeign(['message_id']);
        // });

        // Step 2: Rename id -> old_id, uuid -> id
        Schema::table('messages', function (Blueprint $table) {
            $table->renameColumn('id', 'old_id');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->renameColumn('uuid', 'id');
        });

        // Step 3: Make new id (uuid) primary
        Schema::table('messages', function (Blueprint $table) {
            $table->primary('id');
            $table->dropColumn('old_id');
        });

        // Step 4: Update models to use UUID as primary key (handled in Model boot)
        // Step 5: Re-add foreign keys from child tables to messages.id (now UUID)
        // This is already done in migrations 0002 and 0003 above
    }

    public function down(): void
    {
        // Reverse is complex — restore from backup if needed
    }
};
