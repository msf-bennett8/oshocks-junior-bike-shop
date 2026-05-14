<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->timestamp('scheduled_for_deletion_at')->nullable()->after('cancelled_date');
            $table->unsignedBigInteger('deleted_by')->nullable()->after('scheduled_for_deletion_at');
            $table->string('deletion_reason', 255)->nullable()->after('deleted_by');

            $table->index('scheduled_for_deletion_at', 'idx_bookings_scheduled_delete');
            $table->foreign('deleted_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_scheduled_delete');
            $table->dropForeign(['deleted_by']);
            $table->dropColumn(['scheduled_for_deletion_at', 'deleted_by', 'deletion_reason']);
        });
    }
};
