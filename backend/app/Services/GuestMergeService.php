<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\ServiceBooking;
use App\Models\SupportCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GuestMergeService
{
    /**
     * Merge all guest data to authenticated user
     *
     * Called after login/register. Transfers:
     * - Conversations
     * - Messages
     * - Support Cases
     * - Service Bookings
     */
    public function merge(string $guestSessionId, int $userId): array
    {
        $stats = [
            'conversations' => 0,
            'messages' => 0,
            'support_cases' => 0,
            'service_bookings' => 0,
        ];

        return DB::transaction(function () use ($guestSessionId, $userId, &$stats) {
            // ─── 1. Merge Conversations ───
            $conversations = Conversation::where('guest_session_id', $guestSessionId)
                ->whereNull('user_id')
                ->get();

            foreach ($conversations as $conversation) {
                $conversation->user_id = $userId;
                $conversation->guest_session_id = null;
                $conversation->guest_name = null;
                $conversation->guest_email = null;
                $conversation->save();
                $stats['conversations']++;
            }

            // ─── 2. Merge Messages ───
            $messages = Message::where('guest_session_id', $guestSessionId)
                ->whereNull('sender_id')
                ->get();

            foreach ($messages as $message) {
                $message->sender_id = $userId;
                $message->guest_session_id = null;
                $message->sender_name = null;
                $message->sender_email = null;
                $message->save();
                $stats['messages']++;
            }

            // ─── 3. Merge Support Cases ───
            $cases = SupportCase::where('guest_session_id', $guestSessionId)
                ->whereNull('user_id')
                ->get();

            foreach ($cases as $case) {
                $case->user_id = $userId;
                $case->guest_session_id = null;
                $case->save();
                $stats['support_cases']++;
            }

            // ─── 4. Merge Service Bookings ───
            $bookings = ServiceBooking::where('guest_session_id', $guestSessionId)
                ->whereNull('merged_to_user_id')
                ->get();

            foreach ($bookings as $booking) {
                $booking->merged_to_user_id = $userId;
                $booking->merged_at = now();
                $booking->guest_session_id = null;
                $booking->save();
                $stats['service_bookings']++;
            }

            Log::info('Guest session merged', [
                'guest_session_id' => $guestSessionId,
                'user_id' => $userId,
                'stats' => $stats,
            ]);

            return $stats;
        });
    }

    /**
     * Check if a guest session has data to merge
     */
    public function hasData(string $guestSessionId): bool
    {
        return Conversation::where('guest_session_id', $guestSessionId)->exists() ||
               SupportCase::where('guest_session_id', $guestSessionId)->exists() ||
               ServiceBooking::where('guest_session_id', $guestSessionId)->exists();
    }
}
