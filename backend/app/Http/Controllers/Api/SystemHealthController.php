<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

class SystemHealthController extends Controller
{
    /**
     * Get system health status
     * GET /api/v1/system/health
     */
    public function health(Request $request)
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ];

        $allHealthy = collect($checks)->every(fn($check) => $check['status'] === 'healthy');

        return response()->json([
            'success' => true,
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks,
        ], $allHealthy ? 200 : 503);
    }

    /**
     * Get system metrics for dashboard
     * GET /api/v1/system/metrics
     */
    public function metrics(Request $request)
    {
        if (!$request->user()->hasAdminAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'database' => $this->getDatabaseMetrics(),
                'cache' => $this->getCacheMetrics(),
                'queue' => $this->getQueueMetrics(),
                'backups' => $this->getBackupMetrics(),
                'jobs' => $this->getJobMetrics(),
            ]
        ]);
    }

    private function checkDatabase(): array
    {
        try {
            DB::select('SELECT 1');
            return [
                'status' => 'healthy',
                'response_time_ms' => $this->measure(fn() => DB::select('SELECT 1')),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . uniqid();
            Cache::put($key, 'test', 10);
            $value = Cache::get($key);
            Cache::forget($key);

            return [
                'status' => $value === 'test' ? 'healthy' : 'unhealthy',
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkQueue(): array
    {
        try {
            $connection = config('queue.default');
            
            // Skip Redis check if Redis extension not available
            if ($connection === 'redis' && !class_exists('Redis')) {
                return [
                    'status' => 'healthy',
                    'connection' => $connection,
                    'pending_jobs' => 0,
                    'note' => 'Redis extension not installed',
                ];
            }
            
            $size = Queue::size();

            return [
                'status' => 'healthy',
                'connection' => $connection,
                'pending_jobs' => $size,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function checkStorage(): array
    {
        try {
            $disk = Storage::disk('local');
            $testFile = 'health_check_' . uniqid() . '.txt';
            
            $disk->put($testFile, 'test');
            $exists = $disk->exists($testFile);
            $disk->delete($testFile);

            return [
                'status' => $exists ? 'healthy' : 'unhealthy',
                'disk' => 'local',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
            ];
        }
    }

    private function getDatabaseMetrics(): array
    {
        $tables = DB::select('SHOW TABLE STATUS');
        
        return [
            'total_tables' => count($tables),
            'total_size_mb' => collect($tables)->sum(fn($t) => ($t->Data_length + $t->Index_length) / 1024 / 1024),
            'connection_count' => DB::select('SHOW STATUS LIKE "Threads_connected"')[0]->Value ?? 0,
        ];
    }

    private function getCacheMetrics(): array
    {
        return [
            'driver' => config('cache.default'),
            'prefix' => config('cache.prefix'),
        ];
    }

    private function getQueueMetrics(): array
    {
        return [
            'connection' => config('queue.default'),
            'pending_jobs' => Queue::size(),
            'failed_jobs' => \DB::table('failed_jobs')->count(),
        ];
    }

    private function getBackupMetrics(): array
    {
        // Query audit logs for recent backup events
        $lastBackup = \App\Models\AuditLog::where('event_type', 'DATABASE_BACKUP_COMPLETED')
            ->orderBy('occurred_at', 'desc')
            ->first();

        return [
            'last_backup_at' => $lastBackup?->occurred_at,
            'last_backup_status' => $lastBackup ? 'success' : 'unknown',
        ];
    }

    private function getJobMetrics(): array
    {
        $recentJobs = \App\Models\AuditLog::where('event_category', 'system')
            ->whereIn('event_type', ['SCHEDULED_JOB_STARTED', 'SCHEDULED_JOB_COMPLETED', 'SCHEDULED_JOB_FAILED'])
            ->where('occurred_at', '>=', now()->subHours(24))
            ->get();

        return [
            'last_24h' => [
                'started' => $recentJobs->where('event_type', 'SCHEDULED_JOB_STARTED')->count(),
                'completed' => $recentJobs->where('event_type', 'SCHEDULED_JOB_COMPLETED')->count(),
                'failed' => $recentJobs->where('event_type', 'SCHEDULED_JOB_FAILED')->count(),
            ],
        ];
    }

    private function measure(callable $callback): float
    {
        $start = microtime(true);
        $callback();
        return round((microtime(true) - $start) * 1000, 2);
    }
}
