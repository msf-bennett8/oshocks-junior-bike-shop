<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Make sender_id nullable (drop FK first, then recreate)
            $table->dropForeign(['sender_id']);
            $table->unsignedBigInteger('sender_id')->nullable()->change();
            $table->foreign('sender_id')->references('id')->on('users')->nullOnDelete();

            // Add guest session support
            $table->string('guest_session_id', 64)->nullable()->after('sender_id');
            $table->string('sender_name', 100)->nullable()->after('guest_session_id');

            // Index for guest lookups
            $table->index('guest_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['guest_session_id']);
            $table->dropColumn(['guest_session_id', 'sender_name']);

            $table->dropForeign(['sender_id']);
            $table->unsignedBigInteger('sender_id')->nullable(false)->change();
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};

