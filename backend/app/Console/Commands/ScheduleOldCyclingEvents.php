<?php

namespace App\Console\Commands;

use App\Models\CyclingEvent;
use Illuminate\Console\Command;

class ScheduleOldCyclingEvents extends Command
{
    protected $signature = 'cycling-events:schedule-old';
    protected $description = 'Auto-schedule past cycling events older than 6 months for deletion';

    public function handle(): int
    {
        $cutoffDate = now()->subMonths(6);

        $events = CyclingEvent::whereNull('scheduled_for_deletion_at')
            ->whereNull('deleted_at')
            ->where('end_datetime', '<', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($events as $event) {
            $event->update([
                'scheduled_for_deletion_at' => now()->addDays(30),
                'deletion_reason' => 'Auto-scheduled: event ended 6+ months ago',
            ]);
            $count++;
        }

        $this->info("Scheduled {$count} cycling events for deletion (30-day grace period).");
        \Log::info('Auto-scheduled old cycling events', ['count' => $count]);

        return self::SUCCESS;
    }
}
