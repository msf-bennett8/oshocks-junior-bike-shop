<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array<int, class-string|string>
     */
    protected $commands = [
        \App\Console\Commands\NotificationCleanupCommand::class,
        \App\Console\Commands\CleanupGuestConversations::class,
        \App\Console\Commands\CheckSLABreach::class,
        \App\Console\Commands\AutoEscalateStaleCases::class,
        \App\Console\Commands\ScheduleOldResolvedCases::class,
        \App\Console\Commands\PurgeScheduledCases::class,
        \App\Console\Commands\ScheduleOldBookings::class,
        \App\Console\Commands\PurgeScheduledBookings::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Phase 9: Notification cleanup - daily at 2 AM (low traffic)
        $schedule->command('notifications:cleanup --force')
            ->dailyAt('02:00')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/notification-cleanup.log'));

        // Phase 11: SLA & Escalation Jobs
        $schedule->command('support:check-sla')->everyFifteenMinutes();
        $schedule->command('support:escalate-stale')->hourly();

        // Phase 12: Scheduled Deletion Lifecycle — Support Cases
        // Auto-schedule resolved cases that are 90+ days old (daily at 3 AM)
        $schedule->command('cases:schedule-old-resolved')->dailyAt('03:00');
        // Auto-purge scheduled cases after 30-day grace period (daily at 4 AM)
        $schedule->command('cases:purge-scheduled')->dailyAt('04:00');

        // Phase 13: Scheduled Deletion Lifecycle — Service Bookings
        // Auto-schedule completed/cancelled bookings that are 90+ days old (daily at 3:30 AM)
        $schedule->command('bookings:schedule-old-completed')->dailyAt('03:30');
        // Auto-purge scheduled bookings after 30-day grace period (daily at 4:30 AM)
        $schedule->command('bookings:purge-scheduled')->dailyAt('04:30');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
