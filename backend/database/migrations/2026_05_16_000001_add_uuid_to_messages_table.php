<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Add UUID column alongside existing bigint id
        Schema::table('messages', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
            $table->index('uuid');
        });

        // Backfill UUID v7 for all existing messages (chunked for large tables)
        DB::table('messages')->whereNull('uuid')->orderBy('id')->chunkById(1000, function ($messages) {
            foreach ($messages as $message) {
                DB::table('messages')->where('id', $message->id)->update([
                    'uuid' => (string) Str::uuid7(),
                ]);
            }
        });

        // Make UUID non-nullable
        Schema::table('messages', function (Blueprint $table) {
            $table->uuid('uuid')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['uuid']);
            $table->dropColumn('uuid');
        });
    }
};
