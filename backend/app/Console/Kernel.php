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
        \App\Console\Commands\ScheduleOldCommunityPosts::class,
        \App\Console\Commands\PurgeScheduledCommunityPosts::class,
        \App\Console\Commands\ScheduleOldCyclingEvents::class,
        \App\Console\Commands\PurgeScheduledCyclingEvents::class,
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

        // Phase 14: Scheduled Deletion Lifecycle — Community Posts
        // Auto-schedule posts that are 6+ months old (daily at 5:00 AM)
        $schedule->command('community-posts:schedule-old')->dailyAt('05:00');
        // Auto-purge scheduled posts after 30-day grace period (daily at 5:30 AM)
        $schedule->command('community-posts:purge-scheduled')->dailyAt('05:30');

        // Phase 15: Scheduled Deletion Lifecycle — Cycling Events
        // Auto-schedule past events that are 6+ months old (daily at 6:00 AM)
        $schedule->command('cycling-events:schedule-old')->dailyAt('06:00');
        // Auto-purge scheduled events after 30-day grace period (daily at 6:30 AM)
        $schedule->command('cycling-events:purge-scheduled')->dailyAt('06:30');
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
