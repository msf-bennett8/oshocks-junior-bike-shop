<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // created_by is in base migration, ensure it's nullable
            if (Schema::hasColumn('conversations', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->change();
            }

            // Guest support columns — only if not exists
            if (!Schema::hasColumn('conversations', 'guest_session_id')) {
                $table->string('guest_session_id')->nullable()->after('created_by');
            }
            if (!Schema::hasColumn('conversations', 'guest_name')) {
                $table->string('guest_name')->nullable()->after('guest_session_id');
            }
            if (!Schema::hasColumn('conversations', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }

            // Index for guest lookups
            try {
                $table->index('guest_session_id');
            } catch (\Exception $e) {
                // Index exists
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'guest_session_id')) {
                $table->dropIndex(['guest_session_id']);
                $table->dropColumn(['guest_session_id', 'guest_name', 'guest_email']);
            }
        });
    }
};
