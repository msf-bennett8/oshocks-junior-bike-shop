<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AuditRetentionService;

class CleanupAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'audit:cleanup 
                            {--dry-run : Show what would be cleaned up without actually deleting}
                            {--force : Skip confirmation prompt}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up old audit logs based on retention policies';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🗄️  Audit Log Cleanup Tool');
        $this->info('═══════════════════════════════════════════════');

        // Show current statistics
        $stats = AuditRetentionService::getStats();
        
        $this->newLine();
        $this->info('📊 Current Status:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Active Logs', number_format($stats['total_active_logs'])],
                ['Total Archived Logs', number_format($stats['total_archived_logs'])],
                ['Standard Logs Eligible', number_format($stats['logs_eligible_for_cleanup']['standard'])],
                ['High Severity Eligible', number_format($stats['logs_eligible_for_cleanup']['high_severity'])],
                ['Suspicious Eligible', number_format($stats['logs_eligible_for_cleanup']['suspicious'])],
            ]
        );

        $this->newLine();
        $this->info('⚙️  Retention Policies:');
        $this->table(
            ['Policy', 'Value'],
            [
                ['Standard Retention', $stats['retention_policies']['standard_retention_days'] . ' days'],
                ['High Severity Retention', $stats['retention_policies']['high_severity_retention_days'] . ' days'],
                ['Suspicious Retention', $stats['retention_policies']['suspicious_retention_days'] . ' days'],
                ['Cleanup Enabled', $stats['retention_policies']['cleanup_enabled'] ? '✅ Yes' : '❌ No'],
                ['Archive Before Delete', $stats['retention_policies']['archive_enabled'] ? '✅ Yes' : '❌ No'],
            ]
        );

        $totalEligible = $stats['logs_eligible_for_cleanup']['standard'] +
                        $stats['logs_eligible_for_cleanup']['high_severity'] +
                        $stats['logs_eligible_for_cleanup']['suspicious'];

        if ($totalEligible === 0) {
            $this->newLine();
            $this->info('✨ No logs eligible for cleanup at this time.');
            return Command::SUCCESS;
        }

        // Dry run mode
        if ($this->option('dry-run')) {
            $this->newLine();
            $this->warn('🔍 DRY RUN MODE: No logs will be deleted');
            $this->info("Would archive and delete {$totalEligible} logs");
            return Command::SUCCESS;
        }

        // Confirmation
        if (!$this->option('force')) {
            $this->newLine();
            if (!$this->confirm("⚠️  This will archive and delete {$totalEligible} logs. Continue?", false)) {
                $this->info('Cleanup cancelled.');
                return Command::SUCCESS;
            }
        }

        // Perform cleanup
        $this->newLine();
        $this->info('🔄 Starting cleanup...');
        
        $progressBar = $this->output->createProgressBar($totalEligible);
        $progressBar->start();

        $result = AuditRetentionService::cleanup();

        $progressBar->finish();
        $this->newLine(2);

        if ($result['success']) {
            $this->info('✅ Cleanup completed successfully!');
            $this->newLine();
            $this->table(
                ['Result', 'Count'],
                [
                    ['Archived', number_format($result['results']['archived'])],
                    ['Failed', number_format($result['results']['failed'])],
                ]
            );
        } else {
            $this->error('❌ Cleanup failed: ' . $result['message']);
        }

        return $result['success'] ? Command::SUCCESS : Command::FAILURE;
    }
}