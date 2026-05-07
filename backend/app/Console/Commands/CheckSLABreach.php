<?php

namespace App\Console\Commands;

use App\Models\SupportCase;
use Illuminate\Console\Command;

class CheckSLABreach extends Command
{
    protected $signature = 'support:check-sla';
    protected $description = 'Check for SLA breaches in support cases';

    public function handle(): void
    {
        $breached = SupportCase::whereNotNull('sla_deadline')
            ->where('sla_deadline', '<', now())
            ->whereNotIn('status', ['resolved', 'closed'])
            ->where('sla_breached', false)
            ->get();

        foreach ($breached as $case) {
            $case->update([
                'sla_breached' => true,
                'breach_reason' => 'SLA deadline exceeded',
                'priority' => $case->priority === 'low' ? 'medium' : 
                             ($case->priority === 'medium' ? 'high' : 'urgent'),
            ]);

            // Auto-escalate if high priority
            if (in_array($case->priority, ['high', 'urgent'])) {
                $case->update([
                    'status' => 'escalated',
                    'escalated_at' => now(),
                    'escalation_reason' => 'Auto-escalated: SLA breach',
                ]);
            }
        }

        $this->info("Checked SLA: {$breached->count()} cases breached");
    }
}
