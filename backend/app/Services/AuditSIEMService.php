<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuditSIEMService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('audit.siem');
    }

    /**
     * Forward critical event to SIEM
     */
    public function forward(array $auditData): bool
    {
        if (!$this->config['enabled']) {
            return false;
        }

        try {
            $payload = $this->formatForSIEM($auditData);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->config['api_key'],
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($this->config['endpoint'], $payload);

            if ($response->successful()) {
                Log::debug('SIEM forward successful', ['event_uuid' => $auditData['event_uuid']]);
                return true;
            }

            Log::warning('SIEM forward failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('SIEM forward exception', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Format audit data for SIEM consumption
     */
    protected function formatForSIEM(array $data): array
    {
        return [
            'timestamp' => $data['occurred_at'] ?? now()->toIso8601String(),
            'severity' => $this->mapSeverity($data['severity'] ?? 'low'),
            'event_type' => $data['event_type'],
            'event_category' => $data['event_category'],
            'actor' => [
                'type' => $data['actor_type'],
                'user_id' => $data['user_id'],
                'role' => $data['user_role'],
            ],
            'source' => [
                'ip' => $data['ip_address'],
                'user_agent' => $data['user_agent'],
                'session_id' => $data['session_id'],
            ],
            'target' => [
                'type' => $data['model_type'],
                'id' => $data['model_id'],
            ],
            'action' => $data['action'],
            'description' => $data['description'],
            'metadata' => $data['metadata'] ?? [],
            'integrity' => [
                'hash' => $data['integrity_hash'],
                'tier' => $data['tier'],
            ],
            'correlation_id' => $data['correlation_id'],
        ];
    }

    protected function mapSeverity(string $severity): string
    {
        return match(strtolower($severity)) {
            'critical' => 'CRITICAL',
            'high' => 'HIGH',
            'medium' => 'MEDIUM',
            'low' => 'LOW',
            default => 'INFO',
        };
    }
}
