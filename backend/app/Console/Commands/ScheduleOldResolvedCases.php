<?php

namespace App\Console\Commands;

use App\Models\SupportCase;
use Illuminate\Console\Command;

class ScheduleOldResolvedCases extends Command
{
    protected $signature = 'cases:schedule-old-resolved';
    protected $description = 'Auto-schedule resolved cases older than 90 days for deletion';

    public function handle(): int
    {
        $cutoffDate = now()->subDays(90);

        $cases = SupportCase::whereIn('status', ['resolved', 'closed'])
            ->whereNull('scheduled_for_deletion_at')
            ->where(function ($q) use ($cutoffDate) {
                $q->where('resolved_at', '<', $cutoffDate)
                  ->orWhere('closed_at', '<', $cutoffDate);
            })
            ->get();

        $count = 0;
        foreach ($cases as $case) {
            $case->update([
                'scheduled_for_deletion_at' => now()->addDays(30),
                'deletion_reason' => 'Auto-scheduled: resolved/closed for 90+ days',
            ]);
            $count++;
        }

        $this->info("Scheduled {$count} cases for deletion (30-day grace period).");
        \Log::info('Auto-scheduled old resolved cases', ['count' => $count]);

        return self::SUCCESS;
    }
}
