<?php

namespace App\Jobs;

use App\Models\AuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessAuditLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [10, 30, 60];
    public $timeout = 120;

    protected array $auditData;

    /**
     * Create a new job instance.
     */
    public function __construct(array $auditData)
    {
        $this->auditData = $auditData;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Create the audit log entry
            $log = AuditLog::create($this->auditData);

            // Update cache with latest hash for TIER_1 chaining
            if ($this->auditData['tier'] === 'TIER_1_IMMUTABLE' && !empty($this->auditData['integrity_hash'])) {
                Cache::put('audit:last_hash', $this->auditData['integrity_hash'], 3600);
            }

            // Dispatch to cold storage if TIER_1
            if ($this->auditData['tier'] === 'TIER_1_IMMUTABLE') {
                dispatch(new ShipToColdStorage($log))->onQueue('cold-storage');
            }

        } catch (\Exception $e) {
            Log::error('Audit log processing failed in queue', [
                'error' => $e->getMessage(),
                'audit_data' => $this->auditData,
            ]);
            
            // Write to fallback log
            $this->fallbackLog($this->auditData);
            
            throw $e;
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical('Audit log job failed permanently', [
            'error' => $exception->getMessage(),
            'audit_data' => $this->auditData,
        ]);
        
        $this->fallbackLog($this->auditData);
    }

    /**
     * Fallback logging when database fails
     */
    private function fallbackLog(array $data): void
    {
        $logEntry = [
            'timestamp' => now()->toIso8601String(),
            'level' => 'AUDIT_FALLBACK',
            'data' => $data,
        ];
        
        Log::channel('daily')->error('AUDIT_FALLBACK', $logEntry);
    }
}
