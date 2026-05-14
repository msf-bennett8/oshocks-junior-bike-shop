<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->unsignedBigInteger('service_agent_id')->nullable()->after('assigned_mechanic_id');
            $table->foreign('service_agent_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropForeign(['service_agent_id']);
            $table->dropColumn('service_agent_id');
        });
    }
};
