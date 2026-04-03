<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->enum('profile_visibility', ['public', 'private'])->default('public')->after('two_factor_auth');
            $table->boolean('show_email')->default(false)->after('profile_visibility');
            $table->boolean('show_phone')->default(false)->after('show_email');
            $table->boolean('data_sharing')->default(false)->after('show_phone');
        });
    }

    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn(['profile_visibility', 'show_email', 'show_phone', 'data_sharing']);
        });
    }
};
