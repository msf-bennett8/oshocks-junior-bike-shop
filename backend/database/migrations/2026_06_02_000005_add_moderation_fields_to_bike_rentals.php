<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            if (!Schema::hasColumn('bike_rentals', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('owner_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('bike_rentals', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('bike_rentals', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('bike_rentals', 'submitted_by')) {
                $table->string('submitted_by', 20)->default('user')->after('rejection_reason')->comment('admin, user, platform');
            }
            if (!Schema::hasColumn('bike_rentals', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('is_active');
            }
            if (!Schema::hasColumn('bike_rentals', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('is_archived');
            }
            if (!Schema::hasColumn('bike_rentals', 'archived_by')) {
                $table->foreignId('archived_by')->nullable()->after('archived_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('bike_rentals', 'scheduled_for_deletion_at')) {
                $table->timestamp('scheduled_for_deletion_at')->nullable()->after('archived_by');
            }
            if (!Schema::hasColumn('bike_rentals', 'deletion_scheduled_by')) {
                $table->foreignId('deletion_scheduled_by')->nullable()->after('scheduled_for_deletion_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('bike_rentals', 'deletion_approved_by')) {
                $table->foreignId('deletion_approved_by')->nullable()->after('deletion_scheduled_by')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('bike_rentals', 'deletion_reason')) {
                $table->text('deletion_reason')->nullable()->after('deletion_approved_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            $table->dropColumn([
                'approved_by', 'approved_at', 'rejection_reason', 'submitted_by',
                'is_archived', 'archived_at', 'archived_by',
                'scheduled_for_deletion_at', 'deletion_scheduled_by',
                'deletion_approved_by', 'deletion_reason',
            ]);
        });
    }
};
