<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->string('guest_session_id', 64)->nullable()->index()->after('order_number');
            $table->foreignId('user_id')->nullable()->after('guest_session_id')->constrained('users')->nullOnDelete();
            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_email')->nullable()->after('guest_name');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->string('guest_session_id', 64)->nullable()->index()->after('metadata');
            $table->string('sender_name')->nullable()->after('guest_session_id');
            $table->string('sender_email')->nullable()->after('sender_name');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['guest_session_id', 'user_id', 'guest_name', 'guest_email']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['guest_session_id', 'sender_name', 'sender_email']);
        });
    }
};