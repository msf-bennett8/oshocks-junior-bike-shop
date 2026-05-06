<?php

namespace App\Services;

class MessageModerationService
{
    /**
     * Keywords that suggest off-platform deals
     */
    protected array $offPlatformKeywords = [
        'whatsapp', 'whats app', 'watsapp', 'watsap',
        'pay directly', 'pay direct', 'direct payment',
        'mpesa direct', 'send money', 'bank transfer',
        'pay me directly', 'bypass platform', 'avoid fees',
        'cash on delivery', 'cod', 'pay cash',
        'outside platform', 'off platform', 'not through here',
        'my number', 'call me', 'text me', 'dm me',
        'personal number', 'private number', 'reach me at',
        'send to', 'transfer to', 'pay to my',
    ];

    /**
     * Phone number patterns
     */
    protected array $phonePatterns = [
        '/\+254\d{9}/',           // Kenya international
        '/07\d{8}/',              // Kenya local
        '/01\d{8}/',              // Kenya new prefix
        '/\+?\d{10,15}/',         // Generic international
    ];

    /**
     * Email pattern
     */
    protected string $emailPattern = '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/';

    /**
     * Analyze message for policy violations
     */
    public function analyze(string $body): array
    {
        $violations = [];
        $detectedKeywords = [];
        $confidence = 'low';

        // Check for off-platform keywords
        $lowerBody = strtolower($body);
        foreach ($this->offPlatformKeywords as $keyword) {
            if (str_contains($lowerBody, $keyword)) {
                $detectedKeywords[] = $keyword;
                $violations[] = 'off_platform_payment';
            }
        }

        // Check for phone numbers
        foreach ($this->phonePatterns as $pattern) {
            if (preg_match($pattern, $body)) {
                $violations[] = 'phone_number_shared';
                $detectedKeywords[] = 'phone_number';
                break;
            }
        }

        // Check for email addresses
        if (preg_match($this->emailPattern, $body)) {
            $violations[] = 'email_shared';
            $detectedKeywords[] = 'email_address';
        }

        // Determine confidence level
        $uniqueViolations = array_unique($violations);
        $violationCount = count($uniqueViolations);
        
        if ($violationCount >= 3) {
            $confidence = 'high';
        } elseif ($violationCount >= 2) {
            $confidence = 'medium';
        } elseif ($violationCount >= 1) {
            $confidence = 'low';
        }

        return [
            'has_violations' => !empty($violations),
            'violations' => array_values($uniqueViolations),
            'detected_keywords' => array_values(array_unique($detectedKeywords)),
            'confidence' => $confidence,
            'requires_review' => $violationCount >= 2 || $confidence === 'high',
            'suggested_action' => $this->getSuggestedAction($confidence, $uniqueViolations),
        ];
    }

    /**
     * Get suggested moderation action
     */
    protected function getSuggestedAction(string $confidence, array $violations): string
    {
        if ($confidence === 'high') {
            return 'flag_and_notify';
        }
        
        if ($confidence === 'medium') {
            return 'flag_for_review';
        }
        
        return 'log_only';
    }

    /**
     * Get warning message for user
     */
    public function getWarningMessage(array $violations): ?string
    {
        if (empty($violations)) {
            return null;
        }

        if (in_array('off_platform_payment', $violations)) {
            return 'Please keep all transactions on the platform to ensure buyer protection and seller security.';
        }

        if (in_array('phone_number_shared', $violations) || in_array('email_shared', $violations)) {
            return 'For your safety, please do not share personal contact information. Use the platform messaging system.';
        }

        return 'Your message may violate our community guidelines.';
    }
}
