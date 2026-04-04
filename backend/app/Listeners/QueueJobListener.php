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
        
        AuditService::logScheduledJobStarted(null, [
            'job_name' => get_class($command),
            'job_id' => $jobId,
            'cron_expression' => $payload['cron'] ?? null,
            'scheduled_time' => $payload['scheduled_at'] ?? now(),
            'actual_start_time' => now(),
        ]);
    }

    /**
     * Handle job completion.
     */
    public function handleJobProcessed(JobProcessed $event): void
    {
        $job = $event->job;
        $jobId = $job->uuid() ?? $job->getJobId();
        
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

        unset($this->jobStartTimes[$jobId]);
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

        unset($this->jobStartTimes[$jobId]);
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
