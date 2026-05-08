<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fix conversations table
        Schema::table('conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('conversations', 'deleted_at')) {
                $table->softDeletes();
            }

            if (Schema::hasColumn('conversations', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->change();
            }

            if (!Schema::hasColumn('conversations', 'guest_session_id')) {
                $table->string('guest_session_id')->nullable()->after('created_by');
            }
            if (!Schema::hasColumn('conversations', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('guest_session_id');
            }
            if (!Schema::hasColumn('conversations', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }

            // Idempotent index creation
            $existingIndexes = DB::select(
                "SHOW INDEX FROM conversations WHERE Key_name = 'conversations_guest_session_id_index'"
            );
            if (empty($existingIndexes)) {
                $table->index('guest_session_id');
            }
        });

        // Fix messages table
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'guest_session_id')) {
                $table->string('guest_session_id', 64)->nullable()->after('sender_id');
            }

            if (Schema::hasColumn('messages', 'sender_id')) {
                $table->unsignedBigInteger('sender_id')->nullable()->change();
            }

            if (!Schema::hasColumn('messages', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('guest_session_id');
            }

            if (!Schema::hasColumn('messages', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }
        });

        $this->markMigrationAsRan('2026_05_07_180300_make_messages_sender_nullable_and_add_guest_fields');
    }

    public function down(): void
    {
        //
    }

    private function markMigrationAsRan(string $migrationName): void
    {
        $exists = DB::table('migrations')->where('migration', $migrationName)->exists();

        if (!$exists) {
            $maxBatch = DB::table('migrations')->max('batch') ?? 0;

            DB::table('migrations')->insert([
                'migration' => $migrationName,
                'batch' => $maxBatch,
            ]);
        }
    }
};

