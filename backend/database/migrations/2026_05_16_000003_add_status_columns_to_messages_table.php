<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('status', 20)->default('sent')->after('type'); // sending | sent | delivered | read | failed
            $table->timestamp('delivered_at')->nullable()->after('status');
            $table->timestamp('read_at')->nullable()->after('delivered_at');
            $table->timestamp('edited_at')->nullable()->after('read_at');
            $table->boolean('is_deleted')->default(false)->after('edited_at');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete()->after('is_deleted');
            $table->timestamp('deleted_at')->nullable()->after('deleted_by');

            $table->index(['conversation_id', 'status']);
            $table->index(['sender_id', 'status']);
            $table->index(['read_at']);
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'delivered_at', 'read_at', 'edited_at',
                'is_deleted', 'deleted_by', 'deleted_at'
            ]);
        });
    }
};
