<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Services\AuditService;
use Carbon\Carbon;

class DatabaseBackupCommand extends Command
{
    protected $signature = 'db:backup 
                            {--type=full : Backup type (full/incremental)} 
                            {--storage=local : Storage target (local/s3/r2)}';
    
    protected $description = 'Create database backup with audit logging';

    private string $backupId;
    private string $startTime;

    public function handle(): int
    {
        $this->backupId = 'bak_' . uniqid();
        $this->startTime = now()->toIso8601String();
        $type = $this->option('type');
        $storage = $this->option('storage');

        // Log backup start
        AuditService::logDatabaseBackupStarted(null, [
            'backup_id' => $this->backupId,
            'backup_type' => $type,
            'storage_target' => $storage,
            'started_at' => $this->startTime,
        ]);

        $this->info("Starting {$type} database backup...");
        $this->info("Backup ID: {$this->backupId}");

        try {
            // Get database configuration
            $dbConfig = config('database.connections.mysql');
            $dbName = $dbConfig['database'];
            $dbHost = $dbConfig['host'];
            $dbPort = $dbConfig['port'];
            $dbUser = $dbConfig['username'];
            $dbPass = $dbConfig['password'];

            // Create backup filename
            $filename = "backup_{$dbName}_{$type}_" . now()->format('Y-m-d_H-i-s') . '.sql.gz';
            $tempPath = storage_path("app/temp/{$filename}");

            // Ensure temp directory exists
            if (!is_dir(storage_path('app/temp'))) {
                mkdir(storage_path('app/temp'), 0755, true);
            }

            // Build mysqldump command
            $dumpCmd = sprintf(
                'mysqldump --host=%s --port=%s --user=%s --password=%s --single-transaction --routines --triggers %s 2>/dev/null | gzip > %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbPort),
                escapeshellarg($dbUser),
                escapeshellarg($dbPass),
                escapeshellarg($dbName),
                escapeshellarg($tempPath)
            );

            $this->info("Executing backup command...");
            exec($dumpCmd, $output, $returnCode);

            if ($returnCode !== 0) {
                throw new \Exception("mysqldump failed with code {$returnCode}");
            }

            // Calculate file size and checksum
            $fileSize = filesize($tempPath);
            $checksum = hash_file('sha256', $tempPath);
            $duration = now()->diffInSeconds(Carbon::parse($this->startTime));

            // Move to final storage
            $storagePath = $this->moveToStorage($tempPath, $filename, $storage);

            // Log successful completion
            AuditService::logDatabaseBackupCompleted(null, [
                'backup_id' => $this->backupId,
                'size_gb' => round($fileSize / 1024 / 1024 / 1024, 4),
                'storage_location' => $storagePath,
                'checksum' => $checksum,
                'duration_seconds' => $duration,
            ]);

            $this->info("✅ Backup completed successfully!");
            $this->info("Size: " . $this->formatBytes($fileSize));
            $this->info("Duration: {$duration}s");
            $this->info("Checksum: {$checksum}");
            $this->info("Location: {$storagePath}");

            // Cleanup temp file
            @unlink($tempPath);

            return self::SUCCESS;

        } catch (\Exception $e) {
            // Log failure
            AuditService::logDatabaseBackupFailed(null, [
                'backup_id' => $this->backupId,
                'failure_reason' => $e->getMessage(),
                'error_code' => 'BACKUP_' . strtoupper(class_basename($e)),
                'retry_scheduled' => true,
            ]);

            Log::error('Database backup failed', [
                'backup_id' => $this->backupId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->error("❌ Backup failed: {$e->getMessage()}");
            
            // Schedule retry via queue
            // \App\Jobs\RetryBackupJob::dispatch($this->backupId)->delay(now()->addMinutes(15));

            return self::FAILURE;
        }
    }

    private function moveToStorage(string $tempPath, string $filename, string $storage): string
    {
        $content = file_get_contents($tempPath);

        switch ($storage) {
            case 's3':
                $path = "backups/{$filename}";
                Storage::disk('s3')->put($path, $content);
                return "s3://{$path}";
            
            case 'r2':
                $path = "backups/{$filename}";
                Storage::disk('r2')->put($path, $content);
                return "r2://{$path}";
            
            case 'local':
            default:
                $path = "backups/{$filename}";
                Storage::disk('local')->put($path, $content);
                return storage_path("app/{$path}");
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $unitIndex = 0;
        
        while ($bytes >= 1024 && $unitIndex < count($units) - 1) {
            $bytes /= 1024;
            $unitIndex++;
        }
        
        return round($bytes, 2) . ' ' . $units[$unitIndex];
    }
}
