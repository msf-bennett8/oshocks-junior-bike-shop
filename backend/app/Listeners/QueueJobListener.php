<?php

namespace App\Listeners;

use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Queue\Events\JobFailed;
use App\Services\AuditService;
use Illuminate\Support\Facades\Log;

class QueueJobListener
{
    protected array $jobStartTimes = [];
    protected array $skipLoggingFlags = []; // NEW: Track which jobs to skip

    /**
     * Handle job start.
     */
    public function handle(JobProcessing $event): void
    {
        $job = $event->job;
        $jobId = $job->uuid() ?? $job->getJobId();
        
        $this->jobStartTimes[$jobId] = microtime(true);

        // Extract job details
        $payload = $job->payload();
        $command = unserialize($payload['data']['command'] ?? '');
        $jobName = get_class($command);
        
        // SKIP: Don't log high-frequency internal jobs (audit, notifications, etc.)
        $skipLogging = $this->shouldSkipLogging($jobName);
        
        // Store skip flag for handleJobProcessed to check
        $this->skipLoggingFlags[$jobId] = $skipLogging;
        
        // Early return - don't log job starts at all (too verbose)
        // Only log completions and failures
        return;
    }

    /**
     * Handle job completion.
     */
    public function handleJobProcessed(JobProcessed $event): void
    {
        $job = $event->job;
        $jobId = $job->uuid() ?? $job->getJobId();
        
        // Check if we should skip logging
        if ($this->skipLoggingFlags[$jobId] ?? false) {
            unset($this->jobStartTimes[$jobId], $this->skipLoggingFlags[$jobId]);
            return;
        }
        
        $startTime = $this->jobStartTimes[$jobId] ?? microtime(true);
        $duration = round((microtime(true) - $startTime) * 1000, 2);

        $payload = $job->payload();
        $command = unserialize($payload['data']['command'] ?? '');

        AuditService::logScheduledJobCompleted(null, [
            'job_name' => get_class($command),
            'job_id' => $jobId,
            'execution_time_ms' => $duration,
            'records_processed' => $this->extractRecordCount($command),
        ]);

        unset($this->jobStartTimes[$jobId], $this->skipLoggingFlags[$jobId]);
    }

    /**
     * Handle job failure.
     */
    public function handleJobFailed(JobFailed $event): void
    {
        $job = $event->job;
        $jobId = $job->uuid() ?? $job->getJobId();
        $exception = $event->exception;

        $startTime = $this->jobStartTimes[$jobId] ?? microtime(true);
        $duration = round((microtime(true) - $startTime) * 1000, 2);

        $payload = $job->payload();
        $command = unserialize($payload['data']['command'] ?? '');

        // Determine if it's a timeout
        $isTimeout = $this->isTimeout($exception);
        $retryCount = $job->attempts();

        if ($isTimeout) {
            AuditService::logScheduledJobTimeout(null, [
                'job_name' => get_class($command),
                'job_id' => $jobId,
                'timeout_threshold' => $payload['timeout'] ?? 60,
                'actual_duration' => $duration / 1000, // Convert to seconds
                'termination_method' => 'graceful_shutdown',
            ]);
        } else {
            AuditService::logScheduledJobFailed(null, [
                'job_name' => get_class($command),
                'job_id' => $jobId,
                'execution_time_ms' => $duration,
                'error_message' => $exception->getMessage(),
                'stack_trace_hash' => hash('sha256', $exception->getTraceAsString()),
                'retry_count' => $retryCount,
                'alert_sent' => $retryCount >= 3, // Alert after 3 failures
            ]);
        }

        unset($this->jobStartTimes[$jobId], $this->skipLoggingFlags[$jobId]);
    }

    /**
     * Determine if we should skip logging this job
     */
    private function shouldSkipLogging(string $jobName): bool
    {
        // Skip audit log jobs (they create recursive loops)
        if (str_contains($jobName, 'ProcessAuditLog') || str_contains($jobName, 'ShipToColdStorage')) {
            return true;
        }
        
        // Skip notification jobs (high volume)
        if (str_contains($jobName, 'SendNotification') || str_contains($jobName, 'Notification')) {
            return true;
        }
        
        // Skip anonymous closures (CallQueuedClosure) unless they fail
        if ($jobName === 'Illuminate\Queue\CallQueuedClosure') {
            return true;
        }
        
        return false;
    }

    /**
     * Check if exception is timeout-related
     */
    private function isTimeout(\Throwable $exception): bool
    {
        $message = strtolower($exception->getMessage());
        $timeoutIndicators = [
            'timeout',
            'max execution time',
            'time limit',
            'exceeded',
        ];

        foreach ($timeoutIndicators as $indicator) {
            if (str_contains($message, $indicator)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Extract record count from job if available
     */
    private function extractRecordCount($command): ?int
    {
        // Try to get record count from common job properties
        if (method_exists($command, 'getRecordCount')) {
            return $command->getRecordCount();
        }

        if (property_exists($command, 'recordCount')) {
            return $command->recordCount;
        }

        return null;
    }
}