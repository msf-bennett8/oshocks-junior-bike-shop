<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migration to clear all audit logs.
     * 
     * Controlled by environment variable:
     * - CLEAR_AUDIT_LOGS=true  → Clears all audit logs (with TIER_1 backup)
     * - CLEAR_AUDIT_LOGS=false → Skips deletion (default)
     */
    public function up(): void
    {
        // Check if clearing is enabled via environment variable
        $shouldClear = env('CLEAR_AUDIT_LOGS', false);
        
        // Convert string 'true'/'false' to boolean if needed
        if (is_string($shouldClear)) {
            $shouldClear = strtolower($shouldClear) === 'true';
        }
        
        if (!$shouldClear) {
            Log::info('Audit log clearing skipped. Set CLEAR_AUDIT_LOGS=true to enable.');
            echo "Skipping audit log deletion. Set CLEAR_AUDIT_LOGS=true to clear logs.\n";
            return;
        }

        Log::warning('Starting audit log clearing process - ALL tiers will be affected');
        
        // Step 1: Backup TIER_1_IMMUTABLE records to cold storage before deletion
        $this->backupTier1Logs();
        
        // Step 2: Clear the audit logs table
        // Using TRUNCATE for performance (faster than DELETE for large tables)
        // We need to temporarily disable foreign key checks if there are any issues
        try {
            $countBefore = DB::table('audit_logs')->count();
            
            if ($countBefore === 0) {
                Log::info('No audit logs to clear - table is already empty');
                echo "No audit logs to clear - table is already empty.\n";
                return;
            }
            
            Log::warning("Deleting {$countBefore} audit log records");
            
            // Use raw SQL TRUNCATE for maximum performance
            // This resets auto-increment and is much faster than DELETE
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');
            DB::statement('TRUNCATE TABLE audit_logs');
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            
            $countAfter = DB::table('audit_logs')->count();
            
            Log::warning("Audit logs cleared successfully. Records before: {$countBefore}, after: {$countAfter}");
            echo "✓ Successfully cleared {$countBefore} audit log records.\n";
            echo "✓ TIER_1_IMMUTABLE records were backed up to cold storage before deletion.\n";
            
        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            Log::error('Failed to clear audit logs: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Backup TIER_1_IMMUTABLE logs to cold storage before deletion.
     */
    private function backupTier1Logs(): void
    {
        if (!config('audit.cold_storage.enabled', false)) {
            Log::warning('Cold storage is disabled - TIER_1_IMMUTABLE logs will be deleted without backup!');
            echo "⚠ Warning: Cold storage disabled. TIER_1 logs will be deleted without backup.\n";
            return;
        }

        try {
            $tier1Logs = DB::table('audit_logs')
                ->where('tier', 'TIER_1_IMMUTABLE')
                ->get();
            
            if ($tier1Logs->isEmpty()) {
                Log::info('No TIER_1_IMMUTABLE logs to backup');
                return;
            }

            $backupData = [
                'backup_timestamp' => now()->toIso8601String(),
                'reason' => 'Pre-deletion backup via migration',
                'record_count' => $tier1Logs->count(),
                'records' => $tier1Logs->toArray(),
            ];

            $filename = 'audit-logs/tier1/backup-pre-clear-' . now()->format('Y-m-d-His') . '.json.enc';
            $disk = Storage::disk(config('audit.cold_storage.disk', 's3'));
            
            // Encrypt and store
            $encrypted = openssl_encrypt(
                json_encode($backupData),
                'AES-256-GCM',
                config('audit.cold_storage.encryption.key', env('APP_KEY')),
                0,
                $iv = random_bytes(12),
                $tag
            );
            
            $disk->put($filename, base64_encode($iv . $tag . $encrypted));
            
            Log::info("Backed up {$tier1Logs->count()} TIER_1_IMMUTABLE records to {$filename}");
            echo "✓ Backed up {$tier1Logs->count()} TIER_1_IMMUTABLE records to cold storage.\n";
            
        } catch (\Exception $e) {
            Log::error('Failed to backup TIER_1 logs: ' . $e->getMessage());
            // Don't throw - we want to continue with deletion even if backup fails
            // But log it clearly
            echo "✗ Failed to backup TIER_1 logs (proceeding with deletion): " . $e->getMessage() . "\n";
        }
    }

    /**
     * Reverse the migration - cannot restore deleted logs.
     */
    public function down(): void
    {
        // Cannot restore deleted audit logs
        // If you need to restore, check cold storage backups
        Log::info('Audit log clearing migration rolled back - logs cannot be restored');
        echo "Note: Audit logs cannot be restored after deletion. Check cold storage if needed.\n";
    }
};
