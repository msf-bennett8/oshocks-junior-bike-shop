<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('service_bookings', 'case_id')) {
                $table->string('case_id', 13)->unique()->after('id');
                $table->foreign('case_id')
                      ->references('case_id')
                      ->on('support_cases')
                      ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            if (Schema::hasColumn('service_bookings', 'case_id')) {
                $table->dropForeign(['case_id']);
                $table->dropColumn('case_id');
            }
        });
    }
};
