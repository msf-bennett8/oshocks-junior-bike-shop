<?php

namespace App\Observers;

use App\Models\SupportCase;
use App\Models\SupportCaseHistory;
use App\Services\SupportCaseIdService;
use Illuminate\Support\Facades\Log;

class SupportCaseObserver
{
    protected SupportCaseIdService $idService;

    public function __construct(SupportCaseIdService $idService)
    {
        $this->idService = $idService;
    }

    /**
     * Handle the SupportCase "creating" event.
     */
    public function creating(SupportCase $supportCase): void
    {
        if (empty($supportCase->case_id)) {
            $supportCase->case_id = $this->idService->generate(
                $supportCase->case_type ?? 'report_problem'
            );
        }
    }

    /**
     * Handle the SupportCase "created" event.
     */
    public function created(SupportCase $supportCase): void
    {
        // Log initial creation in history
        $this->logHistory($supportCase, null, 'new', null, null, 'Case created');
    }

    /**
     * Handle the SupportCase "updating" event.
     */
    public function updating(SupportCase $supportCase): void
    {
        // Auto-set timestamps based on status transitions
        if ($supportCase->isDirty('status')) {
            $newStatus = $supportCase->status;
            $oldStatus = $supportCase->getOriginal('status');

            match ($newStatus) {
                'open' => $supportCase->claimed_at ??= now(),
                'resolved' => $supportCase->resolved_at ??= now(),
                'closed' => $supportCase->closed_at ??= now(),
                default => null,
            };

            // Log the transition
            $this->logHistory(
                $supportCase,
                $oldStatus,
                $newStatus,
                $supportCase->getOriginal('assigned_to'),
                $supportCase->assigned_to,
                $supportCase->escalation_reason ?? 'Status changed'
            );
        }

        // Log assignment changes separately
        if ($supportCase->isDirty('assigned_to') && !$supportCase->isDirty('status')) {
            $this->logHistory(
                $supportCase,
                $supportCase->status,
                $supportCase->status,
                $supportCase->getOriginal('assigned_to'),
                $supportCase->assigned_to,
                'Case reassigned'
            );
        }

        // Log priority changes
        if ($supportCase->isDirty('priority')) {
            $this->logHistory(
                $supportCase,
                $supportCase->status,
                $supportCase->status,
                null,
                null,
                'Priority changed',
                $supportCase->getOriginal('priority'),
                $supportCase->priority
            );
        }
    }

    /**
     * Handle the SupportCase "updated" event.
     */
    public function updated(SupportCase $supportCase): void
    {
        // Auto-set first_response_at when agent first replies
        if ($supportCase->isDirty('status') && in_array($supportCase->status, ['open', 'in_progress'])) {
            if (is_null($supportCase->first_response_at)) {
                $supportCase->updateQuietly(['first_response_at' => now()]);
            }
        }
    }

    /**
     * Log history record
     */
    protected function logHistory(
        SupportCase $case,
        ?string $fromStatus,
        ?string $toStatus,
        ?int $fromAssigned,
        ?int $toAssigned,
        string $reason,
        ?string $fromPriority = null,
        ?string $toPriority = null
    ): void {
        try {
            SupportCaseHistory::create([
                'case_id' => $case->case_id,
                'changed_by' => auth()->id(),
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'from_assigned_to' => $fromAssigned,
                'to_assigned_to' => $toAssigned,
                'from_priority' => $fromPriority,
                'to_priority' => $toPriority,
                'reason' => $reason,
                'metadata' => [
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log support case history', [
                'case_id' => $case->case_id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
