<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->enum('cancellation_request_status', [
                'none',
                'pending_review',
                'approved',
                'denied'
            ])->default('none')->after('status');
            
            $table->text('cancellation_reason')->nullable()->after('cancellation_request_status');
            $table->text('cancellation_denial_reason')->nullable()->after('cancellation_reason');
            $table->foreignId('cancellation_requested_by')->nullable()->constrained('users')->onDelete('set null')->after('cancellation_denial_reason');
            $table->timestamp('cancellation_requested_at')->nullable()->after('cancellation_requested_by');
            $table->foreignId('cancellation_reviewed_by')->nullable()->constrained('users')->onDelete('set null')->after('cancellation_requested_at');
            $table->timestamp('cancellation_reviewed_at')->nullable()->after('cancellation_reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::table('service_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'cancellation_request_status',
                'cancellation_reason',
                'cancellation_denial_reason',
                'cancellation_requested_by',
                'cancellation_requested_at',
                'cancellation_reviewed_by',
                'cancellation_reviewed_at',
            ]);
        });
    }
};
