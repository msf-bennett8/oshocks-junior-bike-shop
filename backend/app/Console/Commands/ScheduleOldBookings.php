<?php

namespace App\Console\Commands;

use App\Models\ServiceBooking;
use Illuminate\Console\Command;

class ScheduleOldBookings extends Command
{
    protected $signature = 'bookings:schedule-old-completed';
    protected $description = 'Auto-schedule completed/cancelled bookings older than 90 days for deletion';

    public function handle(): int
    {
        $cutoffDate = now()->subDays(90);

        $bookings = ServiceBooking::whereIn('status', ['completed', 'cancelled', 'no_show'])
            ->whereNull('scheduled_for_deletion_at')
            ->where(function ($q) use ($cutoffDate) {
                $q->where('completed_date', '<', $cutoffDate)
                  ->orWhere('cancelled_date', '<', $cutoffDate)
                  ->orWhere('updated_at', '<', $cutoffDate);
            })
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            $booking->update([
                'scheduled_for_deletion_at' => now()->addDays(30),
                'deletion_reason' => 'Auto-scheduled: completed/cancelled for 90+ days',
            ]);
            $count++;
        }

        $this->info("Scheduled {$count} bookings for deletion (30-day grace period).");
        \Log::info('Auto-scheduled old bookings', ['count' => $count]);

        return self::SUCCESS;
    }
}
