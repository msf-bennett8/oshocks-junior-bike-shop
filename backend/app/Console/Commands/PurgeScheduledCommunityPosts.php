<?php

namespace App\Console\Commands;

use App\Models\CommunityPost;
use Illuminate\Console\Command;

class PurgeScheduledCommunityPosts extends Command
{
    protected $signature = 'community-posts:purge-scheduled';
    protected $description = 'Permanently delete community posts that have exceeded 30-day grace period';

    public function handle(): int
    {
        $cutoffDate = now();

        $posts = CommunityPost::withTrashed()
            ->whereNotNull('scheduled_for_deletion_at')
            ->where('scheduled_for_deletion_at', '<=', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($posts as $post) {
            \DB::transaction(function () use ($post) {
                // Delete related images from Cloudinary
                $cloudinary = app(\App\Services\CommunityPostCloudinaryService::class);
                $cloudinary->deleteAllPostImages($post->post_code);

                // Delete related image records
                $post->postImages()->forceDelete();

                // Force delete the post
                $post->forceDelete();
            });
            $count++;
        }

        $this->info("Permanently deleted {$count} community posts.");
        \Log::info('Auto-purged scheduled community posts', ['count' => $count]);

        return self::SUCCESS;
    }
}
