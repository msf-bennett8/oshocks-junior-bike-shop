<?php

namespace App\Console\Commands;

use App\Models\CommunityPost;
use Illuminate\Console\Command;

class ScheduleOldCommunityPosts extends Command
{
    protected $signature = 'community-posts:schedule-old';
    protected $description = 'Auto-schedule community posts older than 6 months for deletion';

    public function handle(): int
    {
        $cutoffDate = now()->subMonths(6);

        $posts = CommunityPost::whereNull('scheduled_for_deletion_at')
            ->whereNull('deleted_at')
            ->where('created_at', '<', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($posts as $post) {
            $post->update([
                'scheduled_for_deletion_at' => now()->addDays(30),
                'deletion_reason' => 'Auto-scheduled: post is 6+ months old',
            ]);
            $count++;
        }

        $this->info("Scheduled {$count} community posts for deletion (30-day grace period).");
        \Log::info('Auto-scheduled old community posts', ['count' => $count]);

        return self::SUCCESS;
    }
}
