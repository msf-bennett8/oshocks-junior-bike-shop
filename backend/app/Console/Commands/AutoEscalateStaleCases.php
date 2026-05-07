<?php

namespace App\Console\Commands;

use App\Models\SupportCase;
use Illuminate\Console\Command;

class AutoEscalateStaleCases extends Command
{
    protected $signature = 'support:escalate-stale';
    protected $description = 'Auto-escalate unclaimed or unresolved cases';

    public function handle(): void
    {
        // Unclaimed for > 2 hours
        $unclaimed = SupportCase::unclaimed()
            ->where('created_at', '<', now()->subHours(2))
            ->get();

        foreach ($unclaimed as $case) {
            $case->update([
                'status' => 'escalated',
                'escalated_at' => now(),
                'escalation_reason' => 'Auto-escalated: Unclaimed for 2+ hours',
            ]);
        }

        // Unresolved for > 24 hours (standard) or 4 hours (urgent)
        $unresolved = SupportCase::whereIn('status', ['open', 'in_progress', 'pending_user'])
            ->where(function ($q) {
                $q->where(function ($sq) {
                    $sq->where('priority', 'urgent')->where('created_at', '<', now()->subHours(4));
                })->orWhere(function ($sq) {
                    $sq->whereIn('priority', ['low', 'medium', 'high'])->where('created_at', '<', now()->subHours(24));
                });
            })
            ->get();

        foreach ($unresolved as $case) {
            $case->update([
                'status' => 'escalated',
                'escalated_at' => now(),
                'escalation_reason' => 'Auto-escalated: Unresolved beyond SLA',
            ]);
        }

        $this->info("Escalated: {$unclaimed->count()} unclaimed, {$unresolved->count()} unresolved");
    }
}
