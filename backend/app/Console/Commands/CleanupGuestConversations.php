<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupGuestConversations extends Command
{
    protected $signature = 'guest:cleanup {--days=30 : Days to retain guest conversations}';
    protected $description = 'Delete orphaned guest conversations older than specified days';

    public function handle(): int
    {
        $days = $this->option('days');
        $cutoff = now()->subDays($days);

        $query = Conversation::whereNull('user_id')
            ->whereNotNull('guest_session_id')
            ->where('updated_at', '<', $cutoff);

        $count = $query->count();
        
        if ($count === 0) {
            $this->info('No orphaned guest conversations to delete.');
            return self::SUCCESS;
        }

        // Delete messages first (foreign key constraint)
        DB::transaction(function () use ($query) {
            $conversationIds = $query->pluck('id');
            
            \App\Models\Message::whereIn('conversation_id', $conversationIds)->delete();
            
            // Delete pivot table entries
            DB::table('conversation_participants')
                ->whereIn('conversation_id', $conversationIds)
                ->delete();
            
            $query->delete();
        });

        $this->info("Deleted {$count} orphaned guest conversations older than {$days} days.");
        return self::SUCCESS;
    }
}
