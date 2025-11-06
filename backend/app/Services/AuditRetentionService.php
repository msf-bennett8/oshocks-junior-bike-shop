<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\AuditArchive;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AuditRetentionService
{
    /**
     * Clean up old audit logs based on retention policies
     */
    public static function cleanup(): array
    {
        if (!config('app.audit.cleanup_enabled', true)) {
            return [
                'success' => false,
                'message' => 'Audit cleanup is disabled',
            ];
        }

        $results = [
            'archived' => 0,
            'deleted' => 0,
            'failed' => 0,
            'errors' => [],
        ];

        try {
            DB::beginTransaction();

            // Get retention dates
            $standardRetentionDate = Carbon::now()->subDays(config('app.audit.retention_days', 365));
            $highSeverityRetentionDate = Carbon::now()->subDays(config('app.audit.high_severity_retention_days', 730));
            $suspiciousRetentionDate = Carbon::now()->subDays(config('app.audit.suspicious_retention_days', 730));

            Log::info('🗄️ Starting audit log cleanup', [
                'standard_retention_date' => $standardRetentionDate->toDateString(),
                'high_severity_retention_date' => $highSeverityRetentionDate->toDateString(),
                'suspicious_retention_date' => $suspiciousRetentionDate->toDateString(),
            ]);

            // Handle standard logs (low/medium severity, not suspicious)
            $standardLogs = AuditLog::where('occurred_at', '<', $standardRetentionDate)
                ->whereIn('severity', ['low', 'medium'])
                ->where('is_suspicious', false)
                ->get();

            foreach ($standardLogs as $log) {
                if (self::archiveAndDelete($log, 'standard_retention')) {
                    $results['archived']++;
                } else {
                    $results['failed']++;
                }
            }

            // Handle high severity logs (older than high severity retention)
            $highSeverityLogs = AuditLog::where('occurred_at', '<', $highSeverityRetentionDate)
                ->where('severity', 'high')
                ->where('is_suspicious', false)
                ->get();

            foreach ($highSeverityLogs as $log) {
                if (self::archiveAndDelete($log, 'high_severity_retention')) {
                    $results['archived']++;
                } else {
                    $results['failed']++;
                }
            }

            // Handle suspicious logs (older than suspicious retention)
            $suspiciousLogs = AuditLog::where('occurred_at', '<', $suspiciousRetentionDate)
                ->where('is_suspicious', true)
                ->get();

            foreach ($suspiciousLogs as $log) {
                if (self::archiveAndDelete($log, 'suspicious_retention')) {
                    $results['archived']++;
                } else {
                    $results['failed']++;
                }
            }

            DB::commit();

            Log::info('✅ Audit log cleanup completed', $results);

            return [
                'success' => true,
                'message' => 'Cleanup completed successfully',
                'results' => $results,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Audit log cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Cleanup failed: ' . $e->getMessage(),
                'results' => $results,
            ];
        }
    }

    /**
     * Archive a log entry before deletion
     */
    private static function archiveAndDelete(AuditLog $log, string $reason): bool
    {
        try {
            // Archive if enabled
            if (config('app.audit.archive_before_delete', true)) {
                AuditArchive::create([
                    'event_type' => $log->event_type,
                    'event_category' => $log->event_category,
                    'user_id' => $log->user_id,
                    'user_role' => $log->user_role,
                    'action' => $log->action,
                    'model_type' => $log->model_type,
                    'model_id' => $log->model_id,
                    'description' => $log->description,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'metadata' => $log->metadata,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'request_method' => $log->request_method,
                    'request_url' => $log->request_url,
                    'severity' => $log->severity,
                    'is_suspicious' => $log->is_suspicious,
                    'occurred_at' => $log->occurred_at,
                    'archived_at' => now(),
                    'archive_reason' => $reason,
                ]);
            }

            // Delete the original log
            $log->delete();

            return true;

        } catch (\Exception $e) {
            Log::error('Failed to archive/delete audit log', [
                'log_id' => $log->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get retention statistics
     */
    public static function getStats(): array
    {
        $standardRetentionDate = Carbon::now()->subDays(config('app.audit.retention_days', 365));
        $highSeverityRetentionDate = Carbon::now()->subDays(config('app.audit.high_severity_retention_days', 730));
        $suspiciousRetentionDate = Carbon::now()->subDays(config('app.audit.suspicious_retention_days', 730));

        return [
            'total_active_logs' => AuditLog::count(),
            'total_archived_logs' => AuditArchive::count(),
            'logs_eligible_for_cleanup' => [
                'standard' => AuditLog::where('occurred_at', '<', $standardRetentionDate)
                    ->whereIn('severity', ['low', 'medium'])
                    ->where('is_suspicious', false)
                    ->count(),
                'high_severity' => AuditLog::where('occurred_at', '<', $highSeverityRetentionDate)
                    ->where('severity', 'high')
                    ->where('is_suspicious', false)
                    ->count(),
                'suspicious' => AuditLog::where('occurred_at', '<', $suspiciousRetentionDate)
                    ->where('is_suspicious', true)
                    ->count(),
            ],
            'retention_policies' => [
                'standard_retention_days' => config('app.audit.retention_days', 365),
                'high_severity_retention_days' => config('app.audit.high_severity_retention_days', 730),
                'suspicious_retention_days' => config('app.audit.suspicious_retention_days', 730),
                'cleanup_enabled' => config('app.audit.cleanup_enabled', true),
                'archive_enabled' => config('app.audit.archive_before_delete', true),
            ],
            'oldest_log' => AuditLog::orderBy('occurred_at', 'asc')->first()?->occurred_at,
            'newest_log' => AuditLog::orderBy('occurred_at', 'desc')->first()?->occurred_at,
        ];
    }

    /**
     * Manually archive specific logs
     */
    public static function archiveLogs(array $logIds): array
    {
        $results = [
            'archived' => 0,
            'failed' => 0,
        ];

        foreach ($logIds as $logId) {
            $log = AuditLog::find($logId);
            
            if ($log && self::archiveAndDelete($log, 'manual_archive')) {
                $results['archived']++;
            } else {
                $results['failed']++;
            }
        }

        return $results;
    }
}
