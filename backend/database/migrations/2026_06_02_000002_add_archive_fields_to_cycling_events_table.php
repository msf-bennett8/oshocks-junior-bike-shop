<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cycling_events', function (Blueprint $table) {
            if (!Schema::hasColumn('cycling_events', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('status');
            }
            if (!Schema::hasColumn('cycling_events', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('is_archived');
            }
            if (!Schema::hasColumn('cycling_events', 'archived_by')) {
                $table->foreignId('archived_by')->nullable()->after('archived_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('cycling_events', 'scheduled_for_deletion_at')) {
                $table->timestamp('scheduled_for_deletion_at')->nullable()->after('archived_by');
            }
            if (!Schema::hasColumn('cycling_events', 'deletion_scheduled_by')) {
                $table->foreignId('deletion_scheduled_by')->nullable()->after('scheduled_for_deletion_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('cycling_events', 'deletion_approved_by')) {
                $table->foreignId('deletion_approved_by')->nullable()->after('deletion_scheduled_by')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('cycling_events', 'deletion_reason')) {
                $table->text('deletion_reason')->nullable()->after('deletion_approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cycling_events', function (Blueprint $table) {
            $table->dropColumn([
                'is_archived',
                'archived_at',
                'archived_by',
                'scheduled_for_deletion_at',
                'deletion_scheduled_by',
                'deletion_approved_by',
                'deletion_reason',
            ]);
        });
    }
};
