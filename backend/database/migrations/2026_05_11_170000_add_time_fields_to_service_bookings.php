<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->string('preferred_time', 50)->nullable()->after('requested_date');
            $table->string('confirmed_time', 50)->nullable()->after('confirmed_date');
        });
    }

    public function down(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropColumn(['preferred_time', 'confirmed_time']);
        });
    }
};
