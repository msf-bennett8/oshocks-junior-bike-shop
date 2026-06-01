<?php

namespace App\Console\Commands;

use App\Models\CyclingEvent;
use Illuminate\Console\Command;

class PurgeScheduledCyclingEvents extends Command
{
    protected $signature = 'cycling-events:purge-scheduled';
    protected $description = 'Permanently delete cycling events that have exceeded 30-day grace period';

    public function handle(): int
    {
        $cutoffDate = now();

        $events = CyclingEvent::withTrashed()
            ->whereNotNull('scheduled_for_deletion_at')
            ->where('scheduled_for_deletion_at', '<=', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($events as $event) {
            \DB::transaction(function () use ($event) {
                $event->forceDelete();
            });
            $count++;
        }

        $this->info("Permanently deleted {$count} cycling events.");
        \Log::info('Auto-purged scheduled cycling events', ['count' => $count]);

        return self::SUCCESS;
    }
}
