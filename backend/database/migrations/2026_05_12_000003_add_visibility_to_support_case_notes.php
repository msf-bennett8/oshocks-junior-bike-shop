<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_case_notes', function (Blueprint $table) {
            $table->string('visibility', 20)->default('private')->after('is_private');
            $table->index(['case_id', 'visibility']);
        });
    }

    public function down(): void
    {
        Schema::table('support_case_notes', function (Blueprint $table) {
            $table->dropColumn('visibility');
        });
    }
};
