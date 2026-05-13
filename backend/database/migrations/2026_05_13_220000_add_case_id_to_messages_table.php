<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'case_id')) {
                $table->string('case_id', 13)->nullable()->after('conversation_id')->index();
                $table->foreign('case_id')->references('case_id')->on('support_cases')->onDelete('set null');
            }
        });
    }
    public function down(): void {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'case_id')) {
                $table->dropForeign(['case_id']);
                $table->dropColumn('case_id');
            }
        });
    }
};
