<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_cases', function (Blueprint $table) {
            // Drop existing foreign key first
            $table->dropForeign(['conversation_id']);
            // Make nullable and re-add foreign key
            $table->unsignedBigInteger('conversation_id')->nullable()->change();
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('support_cases', function (Blueprint $table) {
            $table->dropForeign(['conversation_id']);
            $table->unsignedBigInteger('conversation_id')->nullable(false)->change();
            $table->foreign('conversation_id')
                  ->references('id')
                  ->on('conversations')
                  ->onDelete('cascade');
        });
    }
};
