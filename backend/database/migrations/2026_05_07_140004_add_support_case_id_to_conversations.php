<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('conversations', 'support_case_id')) {
                $table->string('support_case_id', 13)
                      ->nullable()
                      ->after('type')
                      ->index();
                
                $table->foreign('support_case_id')
                      ->references('case_id')
                      ->on('support_cases')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (Schema::hasColumn('conversations', 'support_case_id')) {
                $table->dropForeign(['support_case_id']);
                $table->dropColumn('support_case_id');
            }
        });
    }
};
