<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cycling_event_registrations', function (Blueprint $table) {
            // Waitlist support
            $table->integer('waitlist_position')->nullable()->after('status');
            $table->timestamp('promoted_from_waitlist_at')->nullable()->after('waitlist_position');

            // Enhanced refund tracking
            $table->string('refund_status', 20)->nullable()->after('cancellation_reason')
                ->comment('pending, approved, rejected, processed');
            $table->timestamp('refund_processed_at')->nullable()->after('refund_status');
            $table->text('refund_reason')->nullable()->after('refund_processed_at');

            // Check-in & transfers
            $table->string('check_in_code', 16)->nullable()->unique()->after('checked_in_at');
            $table->foreignId('transferred_from')->nullable()->after('check_in_code')
                ->constrained('cycling_event_registrations')->nullOnDelete();
            $table->timestamp('transferred_at')->nullable()->after('transferred_from');
            $table->string('transfer_reason', 255)->nullable()->after('transferred_at');
        });
    }

    public function down(): void
    {
        Schema::table('cycling_event_registrations', function (Blueprint $table) {
            $table->dropColumn([
                'waitlist_position',
                'promoted_from_waitlist_at',
                'refund_status',
                'refund_processed_at',
                'refund_reason',
                'check_in_code',
                'transferred_from',
                'transferred_at',
                'transfer_reason',
            ]);
        });
    }
};
