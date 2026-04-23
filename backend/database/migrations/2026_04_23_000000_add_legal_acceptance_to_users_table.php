<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('terms_version')->nullable()->after('role');
            $table->string('privacy_version')->nullable()->after('terms_version');
            $table->string('cookie_version')->nullable()->after('privacy_version');
            $table->timestamp('legal_accepted_at')->nullable()->after('cookie_version');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['terms_version', 'privacy_version', 'cookie_version', 'legal_accepted_at']);
        });
    }
};
