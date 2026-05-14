<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('appointment_history')) {
            return;
        }

        // Drop FK if exists (handle auto-generated constraint names)
        $fkName = $this->getForeignKeyName('appointment_history', 'case_id');
        if ($fkName) {
            Schema::table('appointment_history', function (Blueprint $table) use ($fkName) {
                $table->dropForeign($fkName);
            });
        }

        // Make case_id nullable
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->string('case_id', 13)->nullable()->change();
        });

        // Add booking_id if not exists
        if (!Schema::hasColumn('appointment_history', 'booking_id')) {
            Schema::table('appointment_history', function (Blueprint $table) {
                $table->string('booking_id', 13)->nullable()->after('case_id');
                $table->index('booking_id');
            });
        }

        // Re-add FK with ON DELETE SET NULL if not exists
        if (!$this->getForeignKeyName('appointment_history', 'case_id')) {
            Schema::table('appointment_history', function (Blueprint $table) {
                $table->foreign('case_id')
                      ->references('case_id')
                      ->on('support_cases')
                      ->onDelete('set null');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('appointment_history')) {
            return;
        }

        $fkName = $this->getForeignKeyName('appointment_history', 'case_id');
        if ($fkName) {
            Schema::table('appointment_history', function (Blueprint $table) use ($fkName) {
                $table->dropForeign($fkName);
            });
        }

        if (Schema::hasColumn('appointment_history', 'booking_id')) {
            Schema::table('appointment_history', function (Blueprint $table) {
                $table->dropIndex(['booking_id']);
                $table->dropColumn('booking_id');
            });
        }

        Schema::table('appointment_history', function (Blueprint $table) {
            $table->string('case_id', 13)->nullable(false)->change();
        });

        if (!$this->getForeignKeyName('appointment_history', 'case_id')) {
            Schema::table('appointment_history', function (Blueprint $table) {
                $table->foreign('case_id')
                      ->references('case_id')
                      ->on('support_cases')
                      ->onDelete('cascade');
            });
        }
    }

    private function getForeignKeyName(string $table, string $column): ?string
    {
        $result = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
            AND CONSTRAINT_NAME LIKE ?
        ", [$table, "%{$column}%"]);

        return $result[0]->CONSTRAINT_NAME ?? null;
    }
};
