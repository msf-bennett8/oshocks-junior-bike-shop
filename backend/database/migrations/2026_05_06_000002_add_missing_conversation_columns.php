<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Add user_id (nullable, for conversation ownership) — only if not exists
            if (!Schema::hasColumn('conversations', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            }

            // Guest support columns — only if not exists
            if (!Schema::hasColumn('conversations', 'guest_session_id')) {
                $table->string('guest_session_id')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('conversations', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('guest_session_id');
            }
            if (!Schema::hasColumn('conversations', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }

            // Index for guest lookups — only if not exists
            if (!Schema::hasIndex('conversations', 'conversations_guest_session_id_index')) {
                $table->index('guest_session_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['guest_session_id']);
            $table->dropColumn(['user_id', 'guest_session_id', 'guest_name', 'guest_email']);
        });
    }
};

