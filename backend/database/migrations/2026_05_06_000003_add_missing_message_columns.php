<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('read_at');
            }
            if (!Schema::hasColumn('messages', 'reply_to')) {
                $table->foreignId('reply_to')->nullable()->after('delivered_at');
                $table->foreign('reply_to')->references('id')->on('messages')->onDelete('set null');
            }
            if (!Schema::hasColumn('messages', 'edited_at')) {
                $table->timestamp('edited_at')->nullable()->after('reply_to');
            }
            if (!Schema::hasColumn('messages', 'is_edited')) {
                $table->boolean('is_edited')->default(false)->after('edited_at');
            }
            if (!Schema::hasColumn('messages', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable()->after('is_edited');
            }
            if (!Schema::hasColumn('messages', 'is_deleted')) {
                $table->boolean('is_deleted')->default(false)->after('deleted_at');
            }
            if (!Schema::hasColumn('messages', 'deleted_by')) {
                $table->string('deleted_by', 50)->nullable()->after('is_deleted');
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $columns = ['delivered_at', 'reply_to', 'edited_at', 'is_edited', 'deleted_at', 'is_deleted', 'deleted_by'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('messages', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
