<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Only add guest_session_id if it doesn't exist
            if (!Schema::hasColumn('messages', 'guest_session_id')) {
                $table->string('guest_session_id', 64)->nullable()->after('sender_id');
            }

            // Make sender_id nullable (idempotent)
            if (Schema::hasColumn('messages', 'sender_id')) {
                $table->unsignedBigInteger('sender_id')->nullable()->change();
            }

            // Add sender_name if missing (different from guest_name)
            if (!Schema::hasColumn('messages', 'sender_name')) {
                $table->string('sender_name', 100)->nullable()->after('guest_session_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'guest_session_id')) {
                $table->dropColumn('guest_session_id');
            }
            if (Schema::hasColumn('messages', 'sender_name')) {
                $table->dropColumn('sender_name');
            }
        });
    }
};

