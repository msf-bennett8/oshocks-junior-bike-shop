<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('community_posts', function (Blueprint $table) {
            if (!Schema::hasColumn('community_posts', 'scheduled_for_deletion_at')) {
                $table->timestamp('scheduled_for_deletion_at')->nullable()->after('deleted_at');
            }
            if (!Schema::hasColumn('community_posts', 'deletion_scheduled_by')) {
                $table->foreignId('deletion_scheduled_by')->nullable()->after('scheduled_for_deletion_at')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('community_posts', 'deletion_approved_by')) {
                $table->foreignId('deletion_approved_by')->nullable()->after('deletion_scheduled_by')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('community_posts', 'deletion_reason')) {
                $table->text('deletion_reason')->nullable()->after('deletion_approved_by');
            }
            if (!Schema::hasColumn('community_posts', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('comments_count');
            }
        });
    }

    public function down(): void
    {
        Schema::table('community_posts', function (Blueprint $table) {
            $table->dropColumn(['scheduled_for_deletion_at', 'deletion_scheduled_by', 'deletion_approved_by', 'deletion_reason']);
        });
    }
};
