<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'status')) {
                $table->string('status', 20)->default('sent')->after('type');
            }
            if (!Schema::hasColumn('messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('messages', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('messages', 'edited_at')) {
                $table->timestamp('edited_at')->nullable()->after('read_at');
            }
            if (!Schema::hasColumn('messages', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('edited_at');
            }
            if (!Schema::hasColumn('messages', 'deleted_by')) {
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete()->after('is_deleted');
            }
            if (!Schema::hasColumn('messages', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('deleted_by');
            }

            // Indexes — safely add if not exists (Laravel doesn't have hasIndex, so wrap in try-catch)
            try {
                $table->index(['conversation_id', 'status']);
            } catch (\Throwable $e) {
                // Index may already exist
            }
            try {
                $table->index(['sender_id', 'status']);
            } catch (\Throwable $e) {
                // Index may already exist
            }
            try {
                $table->index(['read_at']);
            } catch (\Throwable $e) {
                // Index may already exist
            }
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['status', 'delivered_at', 'read_at', 'edited_at', 'is_deleted', 'deleted_by', 'deleted_at'] as $col) {
                if (Schema::hasColumn('messages', $col)) {
                    $columnsToDrop[] = $col;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
