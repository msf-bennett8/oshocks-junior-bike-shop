<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            $table->enum('recirculation_status', ['available', 'rented', 'pending_return', 'maintenance'])->default('available')->after('is_active');
            $table->timestamp('last_rented_at')->nullable()->after('recirculation_status');
            $table->timestamp('next_available_at')->nullable()->after('last_rented_at');
        });
    }

    public function down(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            $table->dropColumn(['recirculation_status', 'last_rented_at', 'next_available_at']);
        });
    }
};
