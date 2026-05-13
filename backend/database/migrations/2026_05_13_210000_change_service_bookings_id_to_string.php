<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Drop foreign key on case_id temporarily (if exists)
        // Note: case_id foreign key was added in a later migration, check if it exists
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'service_bookings'
            AND TABLE_SCHEMA = DATABASE()
            AND COLUMN_NAME = 'case_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        foreach ($foreignKeys as $fk) {
            Schema::table('service_bookings', function (Blueprint $table) use ($fk) {
                $table->dropForeign($fk->CONSTRAINT_NAME);
            });
        }

        // Step 2: Drop primary key
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropPrimary();
        });

        // Step 3: Change id to string(11)
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->string('id', 11)->primary()->change();
        });

        // Step 4: Re-add foreign key on case_id (nullable)
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Reverse: drop FK, drop PK, change back to big integer
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'service_bookings'
            AND TABLE_SCHEMA = DATABASE()
            AND COLUMN_NAME = 'case_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        foreach ($foreignKeys as $fk) {
            Schema::table('service_bookings', function (Blueprint $table) use ($fk) {
                $table->dropForeign($fk->CONSTRAINT_NAME);
            });
        }

        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropPrimary();
        });

        Schema::table('service_bookings', function (Blueprint $table) {
            $table->bigIncrements('id')->primary()->change();
        });

        Schema::table('service_bookings', function (Blueprint $table) {
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');
        });
    }
};
