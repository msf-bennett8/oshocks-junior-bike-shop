<?php

namespace App\Console\Commands;

use App\Models\SupportCase;
use Illuminate\Console\Command;

class PurgeScheduledCases extends Command
{
    protected $signature = 'cases:purge-scheduled';
    protected $description = 'Permanently delete cases that have exceeded 30-day grace period';

    public function handle(): int
    {
        $cutoffDate = now();

        $cases = SupportCase::withTrashed()
            ->whereNotNull('scheduled_for_deletion_at')
            ->where('scheduled_for_deletion_at', '<=', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($cases as $case) {
            // Cascade delete related data
            \DB::transaction(function () use ($case) {
                $case->caseMessages()->delete();
                $case->notes()->delete();
                $case->history()->delete();
                $case->tags()->delete();
                $case->forceDelete();
            });
            $count++;
        }

        $this->info("Permanently deleted {$count} cases.");
        \Log::info('Auto-purged scheduled cases', ['count' => $count]);

        return self::SUCCESS;
    }
}
