<?php

namespace App\Console\Commands;

use App\Models\ServiceBooking;
use Illuminate\Console\Command;

class PurgeScheduledBookings extends Command
{
    protected $signature = 'bookings:purge-scheduled';
    protected $description = 'Permanently delete bookings that have exceeded 30-day grace period';

    public function handle(): int
    {
        $cutoffDate = now();

        $bookings = ServiceBooking::withTrashed()
            ->whereNotNull('scheduled_for_deletion_at')
            ->where('scheduled_for_deletion_at', '<=', $cutoffDate)
            ->get();

        $count = 0;
        foreach ($bookings as $booking) {
            \DB::transaction(function () use ($booking) {
                $booking->appointmentNotes()->delete();
                $booking->appointmentHistory()->delete();
                $booking->forceDelete();
            });
            $count++;
        }

        $this->info("Permanently deleted {$count} bookings.");
        \Log::info('Auto-purged scheduled bookings', ['count' => $count]);

        return self::SUCCESS;
    }
}
