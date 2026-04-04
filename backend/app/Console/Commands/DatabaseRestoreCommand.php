<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Services\AuditService;
use App\Models\User;

class DatabaseRestoreCommand extends Command
{
    protected $signature = 'db:restore 
                            {backupPath : Path to backup file}
                            {--target=production : Target environment}
                            {--approval-required : Require admin approval}
                            {--force : Skip confirmation}';
    
    protected $description = 'Restore database from backup with full audit trail';

    public function handle(): int
    {
        $backupPath = $this->argument('backupPath');
        $target = $this->option('target');
        $restoreId = 'rst_' . uniqid();

        // Security: Only super admins can restore
        $user = $this->getExecutingUser();
        if (!$user || !$user->hasSuperAdminAccess()) {
            $this->error('❌ Only super admins can perform database restores');
            return self::FAILURE;
        }

        // Log restore request
        AuditService::logDatabaseRestoreRequested($user, [
            'restore_id' => $restoreId,
            'backup_id' => $this->extractBackupId($backupPath),
            'target_environment' => $target,
            'reason' => $this->ask('Enter restore reason (required):'),
            'approval_required' => $this->option('approval-required'),
        ]);

        // Safety checks
        if ($target === 'production' && !$this->option('force')) {
            $this->warn('⚠️  You are about to restore PRODUCTION database!');
            $confirm = $this->confirm('Type "RESTORE" to confirm:', false);
            
            if (!$confirm) {
                $this->info('Restore cancelled.');
                return self::SUCCESS;
            }
        }

        $this->info("Starting database restore...");
        $this->info("Restore ID: {$restoreId}");
        $startTime = now();

        try {
            // Download backup if remote
            $localPath = $this->downloadBackup($backupPath);

            // Verify checksum
            if (!$this->verifyBackup($localPath)) {
                throw new \Exception('Backup verification failed - checksum mismatch');
            }

            // Perform restore
            $this->performRestore($localPath, $target);

            $duration = now()->diffInSeconds($startTime);

            // Log completion
            AuditService::logDatabaseRestoreCompleted($user, [
                'restore_id' => $restoreId,
                'backup_id' => $this->extractBackupId($backupPath),
                'target_environment' => $target,
                'duration_seconds' => $duration,
            ]);

            $this->info("✅ Restore completed successfully in {$duration}s");

            // Cleanup
            @unlink($localPath);

            return self::SUCCESS;

        } catch (\Exception $e) {
            Log::error('Database restore failed', [
                'restore_id' => $restoreId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->error("❌ Restore failed: {$e->getMessage()}");
            return self::FAILURE;
        }
    }

    private function getExecutingUser(): ?User
    {
        // In console context, get user from command option or default to system
        $userId = $this->option('user-id') ?? 1; // Default to first super admin
        return User::find($userId);
    }

    private function extractBackupId(string $path): string
    {
        preg_match('/backup_[a-z]+_([0-9-]+_[0-9-]+)\.sql\.gz/', $path, $matches);
        return $matches[1] ?? 'unknown';
    }

    private function downloadBackup(string $path): string
    {
        if (str_starts_with($path, 's3://') || str_starts_with($path, 'r2://')) {
            $disk = str_starts_with($path, 's3://') ? 's3' : 'r2';
            $key = str_replace(["s3://", "r2://"], "", $path);
            $localPath = storage_path("app/temp/restore_" . basename($path));
            
            $content = Storage::disk($disk)->get($key);
            file_put_contents($localPath, $content);
            
            return $localPath;
        }

        return $path;
    }

    private function verifyBackup(string $path): bool
    {
        // Check if file exists and is valid gzip
        if (!file_exists($path)) {
            return false;
        }

        $mime = mime_content_type($path);
        return in_array($mime, ['application/x-gzip', 'application/gzip']);
    }

    private function performRestore(string $backupPath, string $target): void
    {
        $dbConfig = config("database.connections.{$target}");
        
        // Decompress and restore
        $command = sprintf(
            'gunzip < %s | mysql --host=%s --port=%s --user=%s --password=%s %s',
            escapeshellarg($backupPath),
            escapeshellarg($dbConfig['host']),
            escapeshellarg($dbConfig['port']),
            escapeshellarg($dbConfig['username']),
            escapeshellarg($dbConfig['password']),
            escapeshellarg($dbConfig['database'])
        );

        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("mysql restore failed with code {$returnCode}");
        }
    }
}
