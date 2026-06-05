<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->enum('status', [
                'reviewing',
                'quoted',
                'accepted',
                'declined',
                'scheduled',
                'completed',
                'converted',
                'cancelled',
                'expired'
            ])->default('reviewing')->change();
        });
    }

    public function down(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->enum('status', [
                'reviewing',
                'quoted',
                'accepted',
                'declined',
                'scheduled',
                'completed',
                'cancelled',
                'expired'
            ])->default('reviewing')->change();
        });
    }
};
