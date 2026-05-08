<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            if (!Schema::hasColumn('conversations', 'guest_session_id')) {
                $table->string('guest_session_id', 64)->nullable();
                $table->index('guest_session_id');
            }
        });
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'sender_name')) {
                $table->string('sender_name', 100)->nullable();
            }
        });
    }
    public function down(): void {}
};
