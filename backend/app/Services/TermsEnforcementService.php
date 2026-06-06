<?php

namespace App\Services;

use App\Models\TermsAcceptanceLog;
use App\Models\User;

class TermsEnforcementService
{
    /**
     * Check if user has accepted required terms
     */
    public static function checkTermsAcceptance(int $userId, string $termsType): array
    {
        $hasAccepted = TermsAcceptanceLog::hasAccepted($userId, $termsType);

        return [
            'required' => true,
            'accepted' => $hasAccepted,
            'can_proceed' => $hasAccepted,
            'terms_type' => $termsType,
        ];
    }

    /**
     * Enforce terms acceptance before action
     */
    public static function enforceTerms(int $userId, string $termsType): void
    {
        $check = self::checkTermsAcceptance($userId, $termsType);

        if (!$check['accepted']) {
            throw new \Exception(
                "You must accept the " . str_replace('_', ' ', $termsType) . " terms before proceeding. " .
                "Please review and accept the terms to continue."
            );
        }
    }

    /**
     * Record terms acceptance
     */
    public static function acceptTerms(int $userId, string $termsType): array
    {
        $log = TermsAcceptanceLog::recordAcceptance($userId, $termsType);

        return [
            'success' => true,
            'terms_type' => $termsType,
            'accepted_at' => $log->accepted_at,
            'message' => 'Terms accepted successfully',
        ];
    }

    /**
     * Get user's terms status
     */
    public static function getUserTermsStatus(int $userId): array
    {
        $types = ['renting', 'listing', 'seller_payments'];

        $status = [];
        foreach ($types as $type) {
            $status[$type] = [
                'accepted' => TermsAcceptanceLog::hasAccepted($userId, $type),
                'required_for' => self::getRequiredActionsForType($type),
            ];
        }

        return $status;
    }

    /**
     * Get required actions for each terms type
     */
    private static function getRequiredActionsForType(string $type): array
    {
        return match($type) {
            'renting' => ['bike_rental', 'event_registration'],
            'listing' => ['create_bike_listing'],
            'seller_payments' => ['request_payout', 'receive_payments'],
            default => [],
        };
    }
}
