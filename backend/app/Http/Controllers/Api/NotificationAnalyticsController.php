<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationAnalyticsController extends Controller
{
    /**
     * Get notification analytics dashboard data
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        
        // Only admins can view analytics
        if (!in_array($user->role, ['super_admin', 'owner', 'admin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Overall stats
        $overallStats = [
            'total_sent' => Notification::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_delivered' => Notification::whereNotNull('delivered_at')
                ->whereBetween('delivered_at', [$startDate, $endDate])
                ->count(),
            'total_opened' => Notification::whereNotNull('opened_at')
                ->whereBetween('opened_at', [$startDate, $endDate])
                ->count(),
            'total_clicked' => Notification::whereNotNull('clicked_at')
                ->whereBetween('clicked_at', [$startDate, $endDate])
                ->count(),
        ];

        // Calculate rates
        $overallStats['delivery_rate'] = $overallStats['total_sent'] > 0 
            ? round(($overallStats['total_delivered'] / $overallStats['total_sent']) * 100, 2) 
            : 0;
        $overallStats['open_rate'] = $overallStats['total_delivered'] > 0 
            ? round(($overallStats['total_opened'] / $overallStats['total_delivered']) * 100, 2) 
            : 0;
        $overallStats['click_rate'] = $overallStats['total_opened'] > 0 
            ? round(($overallStats['total_clicked'] / $overallStats['total_opened']) * 100, 2) 
            : 0;

        // Stats by channel
        $channelStats = Notification::whereBetween('created_at', [$startDate, $endDate])
            ->select('channel', DB::raw('count(*) as total'))
            ->groupBy('channel')
            ->get();

        // Stats by type
        $typeStats = Notification::whereBetween('created_at', [$startDate, $endDate])
            ->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // Daily trend
        $dailyTrend = Notification::whereBetween('created_at', [$startDate, $endDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as sent'),
                DB::raw('sum(case when delivered_at is not null then 1 else 0 end) as delivered'),
                DB::raw('sum(case when opened_at is not null then 1 else 0 end) as opened'),
                DB::raw('sum(case when clicked_at is not null then 1 else 0 end) as clicked')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top performing notifications
        $topNotifications = Notification::whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('clicked_at')
            ->orderByDesc('click_count')
            ->limit(5)
            ->get(['id', 'notification_id', 'type', 'title', 'click_count', 'open_count', 'created_at']);

        // User engagement stats
        $userEngagement = [
            'total_users_with_notifications' => Notification::whereBetween('created_at', [$startDate, $endDate])
                ->distinct('user_id')
                ->count('user_id'),
            'avg_notifications_per_user' => round(Notification::whereBetween('created_at', [$startDate, $endDate])
                ->count() / max(Notification::whereBetween('created_at', [$startDate, $endDate])
                ->distinct('user_id')
                ->count('user_id'), 1), 2),
        ];

        return response()->json([
            'period' => [
                'days' => $days,
                'start' => $startDate->toIso8601String(),
                'end' => $endDate->toIso8601String(),
            ],
            'overall' => $overallStats,
            'by_channel' => $channelStats,
            'by_type' => $typeStats,
            'daily_trend' => $dailyTrend,
            'top_performing' => $topNotifications,
            'user_engagement' => $userEngagement,
        ]);
    }

    /**
     * Get real-time metrics (for dashboard widgets)
     */
    public function realtime()
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['super_admin', 'owner', 'admin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $last24h = Carbon::now()->subHours(24);
        $last1h = Carbon::now()->subHour();

        return response()->json([
            'last_24h' => [
                'sent' => Notification::where('created_at', '>=', $last24h)->count(),
                'delivered' => Notification::where('delivered_at', '>=', $last24h)->count(),
                'opened' => Notification::where('opened_at', '>=', $last24h)->count(),
                'clicked' => Notification::where('clicked_at', '>=', $last24h)->count(),
            ],
            'last_1h' => [
                'sent' => Notification::where('created_at', '>=', $last1h)->count(),
                'delivered' => Notification::where('delivered_at', '>=', $last1h)->count(),
                'opened' => Notification::where('opened_at', '>=', $last1h)->count(),
            ],
            'pending_delivery' => Notification::whereNull('delivered_at')
                ->where('created_at', '>=', $last24h)
                ->count(),
            'failed_recent' => Notification::where('delivery_status', 'failed')
                ->where('updated_at', '>=', $last24h)
                ->count(),
        ]);
    }

    /**
     * Export analytics data
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['super_admin', 'owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $format = $request->get('format', 'json');
        $days = $request->get('days', 30);
        $startDate = Carbon::now()->subDays($days);

        $data = Notification::where('created_at', '>=', $startDate)
            ->with('user:id,name,email')
            ->get([
                'notification_id',
                'user_id',
                'type',
                'channel',
                'title',
                'priority',
                'created_at',
                'sent_at',
                'delivered_at',
                'opened_at',
                'clicked_at',
                'open_count',
                'click_count',
                'delivery_status',
            ]);

        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="notification-analytics.csv"',
            ];

            $callback = function () use ($data) {
                $file = fopen('php://output', 'w');
                fputcsv($file, [
                    'Notification ID', 'User', 'Type', 'Channel', 'Title', 'Priority',
                    'Created', 'Sent', 'Delivered', 'Opened', 'Clicked',
                    'Open Count', 'Click Count', 'Status'
                ]);

                foreach ($data as $row) {
                    fputcsv($file, [
                        $row->notification_id,
                        $row->user?->email ?? 'N/A',
                        $row->type,
                        $row->channel,
                        $row->title,
                        $row->priority,
                        $row->created_at,
                        $row->sent_at,
                        $row->delivered_at,
                        $row->opened_at,
                        $row->clicked_at,
                        $row->open_count,
                        $row->click_count,
                        $row->delivery_status,
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        return response()->json([
            'data' => $data,
            'exported_at' => now()->toIso8601String(),
        ]);
    }
}