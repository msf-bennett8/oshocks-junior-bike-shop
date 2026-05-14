<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the existing FK constraint
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->dropForeign('appointment_history_case_id_foreign');
        });

        // Make case_id nullable
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->string('case_id', 13)->nullable()->change();
        });

        // Add booking_id column for standalone bookings
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->string('booking_id', 13)->nullable()->after('case_id');
            $table->index('booking_id');
        });

        // Re-add FK with ON DELETE SET NULL
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Drop the new FK and columns
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->dropForeign(['case_id']);
            $table->dropIndex(['booking_id']);
            $table->dropColumn('booking_id');
        });

        // Revert case_id to NOT NULL
        // Note: This will fail if there are NULL case_id rows — clean those first in production
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->string('case_id', 13)->nullable(false)->change();
        });

        // Re-add original FK with CASCADE
        Schema::table('appointment_history', function (Blueprint $table) {
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');
        });
    }
};
