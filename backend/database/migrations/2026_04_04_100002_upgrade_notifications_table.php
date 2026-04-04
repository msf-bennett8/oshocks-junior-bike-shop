<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Only add columns that don't exist
            if (!Schema::hasColumn('notifications', 'notification_id')) {
                $table->string('notification_id', 32)->unique()->after('id');
            }
            if (!Schema::hasColumn('notifications', 'channel')) {
                $table->enum('channel', ['in-app', 'email', 'sms', 'push'])->default('in-app')->after('type');
            }
            if (!Schema::hasColumn('notifications', 'priority')) {
                $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('channel');
            }
            if (!Schema::hasColumn('notifications', 'template_id')) {
                $table->string('template_id')->nullable()->after('priority');
            }
            if (!Schema::hasColumn('notifications', 'scheduled_for')) {
                $table->timestamp('scheduled_for')->nullable()->after('template_id');
            }
            if (!Schema::hasColumn('notifications', 'sent_at')) {
                $table->timestamp('sent_at')->nullable()->after('scheduled_for');
            }
            if (!Schema::hasColumn('notifications', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('sent_at');
            }
            if (!Schema::hasColumn('notifications', 'opened_at')) {
                $table->timestamp('opened_at')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('notifications', 'clicked_at')) {
                $table->timestamp('clicked_at')->nullable()->after('opened_at');
            }
            if (!Schema::hasColumn('notifications', 'is_read')) {
                $table->boolean('is_read')->default(false)->after('clicked_at');
            }
            if (!Schema::hasColumn('notifications', 'read_at')) {
                $table->timestamp('read_at')->nullable()->after('is_read');
            }
            if (!Schema::hasColumn('notifications', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('read_at');
            }
            if (!Schema::hasColumn('notifications', 'provider_message_id')) {
                $table->string('provider_message_id')->nullable()->after('is_archived');
            }
            if (!Schema::hasColumn('notifications', 'delivery_status')) {
                $table->enum('delivery_status', ['pending', 'sent', 'delivered', 'failed', 'bounced'])->default('pending')->after('provider_message_id');
            }
            if (!Schema::hasColumn('notifications', 'open_count')) {
                $table->integer('open_count')->default(0)->after('delivery_status');
            }
            if (!Schema::hasColumn('notifications', 'click_count')) {
                $table->integer('click_count')->default(0)->after('open_count');
            }
            if (!Schema::hasColumn('notifications', 'clicked_url')) {
                $table->string('clicked_url')->nullable()->after('click_count');
            }
            if (!Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->nullable()->after('message');
            }
        });

        // Add indexes for performance
        Schema::table('notifications', function (Blueprint $table) {
            if (!Schema::hasIndex('notifications', 'idx_user_notifications')) {
                $table->index(['user_id', 'is_archived', 'created_at'], 'idx_user_notifications');
            }
            if (!Schema::hasIndex('notifications', 'idx_notification_id')) {
                $table->index(['notification_id']);
            }
            if (!Schema::hasIndex('notifications', 'idx_delivery_status')) {
                $table->index(['delivery_status', 'channel']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $columns = [
                'notification_id', 'channel', 'priority', 'template_id', 'scheduled_for',
                'sent_at', 'delivered_at', 'opened_at', 'clicked_at', 'is_read', 'read_at',
                'is_archived', 'provider_message_id', 'delivery_status', 'open_count',
                'click_count', 'clicked_url', 'data'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('notifications', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
