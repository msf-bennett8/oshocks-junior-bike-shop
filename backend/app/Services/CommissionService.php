<?php

namespace App\Services;

use App\Models\SellerProfile;
use App\Models\Setting;

class CommissionService
{
    /**
     * Calculate commission for a payment
     * 
     * @param float $amount Total payment amount
     * @param int $sellerId Seller profile ID
     * @return array ['commission_rate', 'commission_amount', 'seller_payout']
     */
    public static function calculate(float $amount, int $sellerId): array
    {
        // Get seller's custom commission rate or use platform default
        $commissionRate = self::getCommissionRate($sellerId);
        
        // Calculate commission amount
        $commissionAmount = round(($amount * $commissionRate) / 100, 2);
        
        // Calculate seller payout (amount minus commission)
        $sellerPayout = round($amount - $commissionAmount, 2);
        
        return [
            'commission_rate' => $commissionRate,
            'commission_amount' => $commissionAmount,
            'seller_payout' => $sellerPayout,
        ];
    }
    
    /**
     * Get commission rate for a seller
     * Returns seller's custom rate if set, otherwise platform default
     * 
     * @param int $sellerId
     * @return float Commission rate as percentage (e.g., 15.00 for 15%)
     */
    public static function getCommissionRate(int $sellerId): float
    {
        $seller = SellerProfile::find($sellerId);
        
        if (!$seller) {
            return self::getPlatformDefaultRate();
        }
        
        // If seller has custom commission rate, use it
        if ($seller->commission_rate && $seller->commission_rate > 0) {
            return (float) $seller->commission_rate;
        }
        
        // Otherwise use platform default
        return self::getPlatformDefaultRate();
    }
    
    /**
     * Get platform default commission rate from settings
     * 
     * @return float Default commission rate (defaults to 15.00 if not found)
     */
    public static function getPlatformDefaultRate(): float
    {
        $setting = Setting::where('key', 'default_commission_rate')->first();
        
        if ($setting && $setting->value) {
            return (float) $setting->value;
        }
        
        // Fallback to 15% if setting not found
        return 15.00;
    }
    
    /**
     * Update seller's running totals after a payment
     * 
     * @param int $sellerId
     * @param float $saleAmount
     * @param float $commissionAmount
     * @param float $payoutAmount
     * @return bool
     */
    public static function updateSellerTotals(
        int $sellerId,
        float $saleAmount,
        float $commissionAmount,
        float $payoutAmount
    ): bool {
        $seller = SellerProfile::find($sellerId);
        
        if (!$seller) {
            return false;
        }
        
        $seller->total_sales += $saleAmount;
        $seller->total_commission_paid += $commissionAmount;
        $seller->total_earnings += $payoutAmount;
        
        return $seller->save();
    }
    
    /**
     * Get commission breakdown for display purposes
     * 
     * @param float $amount
     * @param int $sellerId
     * @return array Formatted breakdown with currency
     */
    public static function getBreakdown(float $amount, int $sellerId): array
    {
        $calculation = self::calculate($amount, $sellerId);
        
        return [
            'total_amount' => number_format($amount, 2),
            'commission_rate' => $calculation['commission_rate'] . '%',
            'commission_amount' => 'KES ' . number_format($calculation['commission_amount'], 2),
            'seller_receives' => 'KES ' . number_format($calculation['seller_payout'], 2),
            'raw' => $calculation // Include raw numbers for calculations
        ];
    }
    
    /**
     * Calculate total platform earnings for a period
     * 
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public static function getPlatformEarnings(string $startDate, string $endDate): array
    {
        $payments = \App\Models\Payment::whereBetween('payment_collected_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->get();
        
        $totalSales = $payments->sum('amount');
        $totalCommission = $payments->sum('platform_commission_amount');
        $totalSellerPayouts = $payments->sum('seller_payout_amount');
        
        return [
            'total_sales' => $totalSales,
            'total_commission' => $totalCommission,
            'total_seller_payouts' => $totalSellerPayouts,
            'transaction_count' => $payments->count(),
            'average_commission_rate' => $totalSales > 0 ? ($totalCommission / $totalSales) * 100 : 0,
        ];
    }
}
