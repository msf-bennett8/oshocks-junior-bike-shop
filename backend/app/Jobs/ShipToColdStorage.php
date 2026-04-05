<?php

namespace App\Jobs;

use App\Models\AuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ShipToColdStorage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 5;
    public $backoff = [30, 60, 120, 300, 600];
    public $timeout = 300;

    protected AuditLog $auditLog;

    public function __construct(AuditLog $auditLog)
    {
        $this->auditLog = $auditLog;
    }

    public function handle(): void
    {
        $config = config('audit.cold_storage');
        
        if (!$config['enabled']) {
            return;
        }

        try {
            $payload = $this->auditLog->toArray();
            $payload['shipped_at'] = now()->toIso8601String();
            
            $path = sprintf(
                '%s/%s/%s.json',
                $config['path_prefix'],
                now()->format('Y/m/d'),
                $this->auditLog->event_uuid
            );

            // Compress and encrypt if needed
            $content = json_encode($payload);
            
            if ($config['encryption']['enabled']) {
                $content = $this->encrypt($content, $config['encryption']['key']);
            }

            Storage::disk($config['disk'])->put($path, $content);

            // Mark as archived in database
            $this->auditLog->updateQuietly(['cold_storage_path' => $path]);

            Log::info('Audit log shipped to cold storage', [
                'event_uuid' => $this->auditLog->event_uuid,
                'path' => $path,
            ]);

        } catch (\Exception $e) {
            Log::error('Cold storage shipping failed', [
                'event_uuid' => $this->auditLog->event_uuid,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function encrypt(string $content, string $key): string
    {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($content, 'AES-256-GCM', $key, 0, $iv, $tag);
        return base64_encode($iv . $tag . $encrypted);
    }
}
