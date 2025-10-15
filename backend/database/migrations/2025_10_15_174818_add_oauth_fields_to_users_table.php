<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('strava_id')->nullable()->unique()->after('google_id');
            $table->string('avatar')->nullable()->after('profile_image');
            $table->string('provider')->nullable()->after('avatar'); // 'google', 'strava', 'email'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'strava_id', 'avatar', 'provider']);
        });
    }
};
