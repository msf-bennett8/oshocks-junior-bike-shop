<?php

namespace App\Services;

use App\Models\BikeRentalBooking;
use App\Models\BikeRentalPayout;
use App\Models\SellerProfile;
use App\Models\PlatformFineSetting;
use Carbon\Carbon;

class ListerPayoutService
{
    /**
     * Calculate payout for a booking
     */
    public static function calculateBookingPayout(BikeRentalBooking $booking): array
    {
        $gross = $booking->owner_payout;
        $commission = $booking->platform_fee;
        $net = $gross - $commission;

        // Deduct late fines if applicable
        $lateFine = 0;
        if ($booking->late_return_fine) {
            $lateFine = $booking->late_return_fine;
            $net -= $lateFine;
        }

        return [
            'gross_amount' => $gross,
            'platform_commission' => $commission,
            'late_fine' => $lateFine,
            'net_payout' => max(0, $net),
            'booking_id' => $booking->id,
            'seller_id' => $booking->bike->seller_id,
        ];
    }

    /**
     * Create payout record for a booking
     */
    public static function createPayout(BikeRentalBooking $booking, string $period = 'weekly'): BikeRentalPayout
    {
        $calculation = self::calculateBookingPayout($booking);

        $periodStart = now()->startOfWeek();
        $periodEnd = now()->endOfWeek();

        if ($period === 'monthly') {
            $periodStart = now()->startOfMonth();
            $periodEnd = now()->endOfMonth();
        }

        return BikeRentalPayout::create([
            'seller_id' => $calculation['seller_id'],
            'booking_id' => $booking->id,
            'gross_amount' => $calculation['gross_amount'],
            'platform_commission' => $calculation['platform_commission'],
            'net_payout' => $calculation['net_payout'],
            'status' => 'pending',
            'payout_period' => $period,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
        ]);
    }

    /**
     * Request payout by lister
     */
    public static function requestPayout(int $payoutId): BikeRentalPayout
    {
        $payout = BikeRentalPayout::findOrFail($payoutId);
        
        if (!$payout->isPending()) {
            throw new \Exception('Payout is not in pending status');
        }

        $payout->update([
            'status' => 'requested',
            'requested_at' => now(),
        ]);

        return $payout->fresh();
    }

    /**
     * Process payout by admin
     */
    public static function processPayout(int $payoutId, int $adminId, string $method, string $reference): BikeRentalPayout
    {
        $payout = BikeRentalPayout::findOrFail($payoutId);

        if (!in_array($payout->status, ['pending', 'requested'])) {
            throw new \Exception('Payout cannot be processed. Status: ' . $payout->status);
        }

        $payout->update([
            'status' => 'paid',
            'paid_at' => now(),
            'paid_by' => $adminId,
            'payout_method' => $method,
            'payout_reference' => $reference,
        ]);

        return $payout->fresh();
    }

    /**
     * Delay payout by admin
     */
    public static function delayPayout(int $payoutId, int $adminId, string $notes): BikeRentalPayout
    {
        $payout = BikeRentalPayout::findOrFail($payoutId);

        $payout->update([
            'status' => 'delayed',
            'delayed_at' => now(),
            'delayed_by' => $adminId,
            'delay_notes' => $notes,
            'delay_watermark' => true,
        ]);

        return $payout->fresh();
    }

    /**
     * Get lister payout dashboard data
     */
    public static function getListerDashboard(int $sellerId): array
    {
        $payouts = BikeRentalPayout::where('seller_id', $sellerId)
            ->with('booking.bike')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalEarned = $payouts->where('status', 'paid')->sum('net_payout');
        $totalPending = $payouts->whereIn('status', ['pending', 'requested'])->sum('net_payout');
        $totalDelayed = $payouts->where('status', 'delayed')->sum('net_payout');

        // Best rented bikes
        $bestBikes = BikeRentalBooking::whereHas('bike', function ($q) use ($sellerId) {
            $q->where('seller_id', $sellerId);
        })
        ->selectRaw('bike_rental_id, COUNT(*) as rental_count, SUM(owner_payout) as total_earnings')
        ->groupBy('bike_rental_id')
        ->with('bike:id,name,listing_code')
        ->orderBy('rental_count', 'desc')
        ->limit(5)
        ->get();

        return [
            'total_earned' => $totalEarned,
            'total_pending' => $totalPending,
            'total_delayed' => $totalDelayed,
            'payouts' => $payouts,
            'best_bikes' => $bestBikes,
            'payout_history' => $payouts->where('status', 'paid')->values(),
            'pending_payouts' => $payouts->whereIn('status', ['pending', 'requested'])->values(),
        ];
    }

    /**
     * Get admin payout analytics
     */
    public static function getAdminAnalytics(): array
    {
        $now = now();
        $thisMonth = $now->copy()->startOfMonth();

        $monthlyPayouts = BikeRentalPayout::where('paid_at', '>=', $thisMonth)
            ->where('status', 'paid')
            ->sum('net_payout');

        $totalCommission = BikeRentalPayout::where('status', 'paid')->sum('platform_commission');
        $pendingRequests = BikeRentalPayout::where('status', 'requested')->count();
        $delayedPayouts = BikeRentalPayout::where('status', 'delayed')->count();

        return [
            'monthly_payouts' => $monthlyPayouts,
            'total_commission_earned' => $totalCommission,
            'pending_requests' => $pendingRequests,
            'delayed_payouts' => $delayedPayouts,
            'recent_payouts' => BikeRentalPayout::with('seller', 'paidBy')
                ->where('status', 'paid')
                ->orderBy('paid_at', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
}
