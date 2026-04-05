<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('cold_storage_path', 500)->nullable()->after('integrity_hash');
            $table->timestamp('shipped_to_cold_storage_at')->nullable()->after('cold_storage_path');
            $table->index(['tier', 'shipped_to_cold_storage_at'], 'idx_cold_storage_sync');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn(['cold_storage_path', 'shipped_to_cold_storage_at']);
        });
    }
};
