<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class NotificationCleanupCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:cleanup
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old notifications: soft-delete expired, archive old read, hard-delete trashed';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        $this->info('🔔 Notification Cleanup Tool');
        $this->info('============================');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Configuration
        $softDeleteDays = 30;   // Soft delete notifications expired 30 days ago
        $archiveDays = 90;      // Archive read notifications 90 days old
        $hardDeleteDays = 365;  // Permanently delete soft-deleted after 1 year

        $stats = [
            'expired_soft_deleted' => 0,
            'read_archived' => 0,
            'trashed_hard_deleted' => 0,
            'push_subscriptions_cleaned' => 0,
        ];

        // Step 1: Soft delete expired notifications
        $this->info("\n📋 Step 1: Soft deleting expired notifications (older than {$softDeleteDays} days)");
        
        $expiredQuery = Notification::whereNotNull('expires_at')
            ->where('expires_at', '<', Carbon::now()->subDays($softDeleteDays))
            ->whereNull('deleted_at');

        $expiredCount = $expiredQuery->count();
        
        if ($expiredCount > 0) {
            $this->info("   Found {$expiredCount} expired notifications to soft delete");
            
            if (!$dryRun && ($force || $this->confirm('Proceed with soft delete?'))) {
                $expiredIds = $expiredQuery->pluck('notification_id')->toArray();
                $expiredQuery->delete(); // Soft delete
                
                $stats['expired_soft_deleted'] = $expiredCount;
                
                AuditService::log([
                    'event_type' => 'NOTIFICATION_CLEANUP_EXPIRED',
                    'event_category' => 'maintenance',
                    'actor_type' => 'SYSTEM',
                    'action' => 'soft_delete',
                    'description' => "Soft deleted {$expiredCount} expired notifications",
                    'severity' => 'LOW',
                    'tier' => 'TIER_2_OPERATIONAL',
                    'metadata' => [
                        'count' => $expiredCount,
                        'notification_ids' => array_slice($expiredIds, 0, 100), // Limit logged IDs
                        'threshold_days' => $softDeleteDays,
                    ],
                ]);
            }
        } else {
            $this->info('   No expired notifications found');
        }

        // Step 2: Archive old read notifications
        $this->info("\n📁 Step 2: Archiving read notifications (older than {$archiveDays} days)");
        
        $oldReadQuery = Notification::whereNotNull('read_at')
            ->where('read_at', '<', Carbon::now()->subDays($archiveDays))
            ->where('is_archived', false)
            ->whereNull('deleted_at');

        $oldReadCount = $oldReadQuery->count();
        
        if ($oldReadCount > 0) {
            $this->info("   Found {$oldReadCount} old read notifications to archive");
            
            if (!$dryRun && ($force || $this->confirm('Proceed with archive?'))) {
                $oldReadQuery->update(['is_archived' => true]);
                $stats['read_archived'] = $oldReadCount;
                
                AuditService::log([
                    'event_type' => 'NOTIFICATION_CLEANUP_ARCHIVE',
                    'event_category' => 'maintenance',
                    'actor_type' => 'SYSTEM',
                    'action' => 'archive',
                    'description' => "Archived {$oldReadCount} old read notifications",
                    'severity' => 'LOW',
                    'tier' => 'TIER_2_OPERATIONAL',
                    'metadata' => [
                        'count' => $oldReadCount,
                        'threshold_days' => $archiveDays,
                    ],
                ]);
            }
        } else {
            $this->info('   No old read notifications found');
        }

        // Step 3: Hard delete soft-deleted notifications
        $this->info("\n🗑️  Step 3: Hard deleting trashed notifications (older than {$hardDeleteDays} days)");
        
        $trashedQuery = Notification::onlyTrashed()
            ->where('deleted_at', '<', Carbon::now()->subDays($hardDeleteDays));

        $trashedCount = $trashedQuery->count();
        
        if ($trashedCount > 0) {
            $this->warn("   Found {$trashedCount} trashed notifications to permanently delete");
            
            if (!$dryRun && ($force || $this->confirm('⚠️  This is IRREVERSIBLE. Proceed with hard delete?'))) {
                $trashedQuery->forceDelete();
                $stats['trashed_hard_deleted'] = $trashedCount;
                
                AuditService::log([
                    'event_type' => 'NOTIFICATION_CLEANUP_HARD_DELETE',
                    'event_category' => 'maintenance',
                    'actor_type' => 'SYSTEM',
                    'action' => 'hard_delete',
                    'description' => "Permanently deleted {$trashedCount} old notifications",
                    'severity' => 'MEDIUM',
                    'tier' => 'TIER_2_OPERATIONAL',
                    'metadata' => [
                        'count' => $trashedCount,
                        'threshold_days' => $hardDeleteDays,
                    ],
                ]);
            }
        } else {
            $this->info('   No trashed notifications found for hard delete');
        }

        // Step 4: Clean up expired push subscriptions
        $this->info("\n📱 Step 4: Cleaning up expired push subscriptions");
        
        $expiredSubsQuery = \App\Models\PushSubscription::where('updated_at', '<', Carbon::now()->subDays(90))
            ->orWhere(function ($q) {
                // Subscriptions that haven't been used and are older than 30 days
                $q->whereNull('last_used_at')
                  ->where('created_at', '<', Carbon::now()->subDays(30));
            });

        $expiredSubsCount = $expiredSubsQuery->count();
        
        if ($expiredSubsCount > 0) {
            $this->info("   Found {$expiredSubsCount} stale push subscriptions");
            
            if (!$dryRun && ($force || $this->confirm('Proceed with cleanup?'))) {
                $expiredSubsQuery->delete();
                $stats['push_subscriptions_cleaned'] = $expiredSubsCount;
            }
        } else {
            $this->info('   No stale push subscriptions found');
        }

        // Summary
        $this->info("\n✅ Cleanup Summary");
        $this->info('==================');
        $this->table(
            ['Operation', 'Count', 'Status'],
            [
                ['Expired → Soft Delete', $stats['expired_soft_deleted'], $dryRun ? 'SKIPPED (dry-run)' : 'DONE'],
                ['Read → Archive', $stats['read_archived'], $dryRun ? 'SKIPPED (dry-run)' : 'DONE'],
                ['Trashed → Hard Delete', $stats['trashed_hard_deleted'], $dryRun ? 'SKIPPED (dry-run)' : 'DONE'],
                ['Stale Push Subs', $stats['push_subscriptions_cleaned'], $dryRun ? 'SKIPPED (dry-run)' : 'DONE'],
            ]
        );

        if ($dryRun) {
            $this->warn("\nThis was a dry run. No changes were made.");
            $this->info("Run without --dry-run to execute cleanup.");
        }

        return self::SUCCESS;
    }
}