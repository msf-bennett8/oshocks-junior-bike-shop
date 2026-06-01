<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cycling_events', function (Blueprint $table) {
            if (!Schema::hasColumn('cycling_events', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->after('organizer_id')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('cycling_events', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('cycling_events', 'submitted_by')) {
                $table->string('submitted_by', 20)->default('admin')->after('approved_at')->comment('admin, user, custom_ride');
            }
            if (!Schema::hasColumn('cycling_events', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('submitted_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cycling_events', function (Blueprint $table) {
            $table->dropColumn(['approved_by', 'approved_at', 'submitted_by', 'rejection_reason']);
        });
    }
};
