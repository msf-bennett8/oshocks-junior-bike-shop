<?php

namespace App\Listeners;

use App\Events\SupportCaseUpdated;
use App\Services\AuditService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SupportCaseAuditListener implements ShouldQueue
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    public function handle(SupportCaseUpdated $event): void
    {
        $case = $event->supportCase;
        $action = $event->action;

        $this->audit->log('support_case_' . $action, [
            'case_id' => $case->case_id,
            'case_type' => $case->case_type,
            'status' => $case->status,
            'assigned_to' => $case->assigned_to,
            'actor_id' => $event->actorId,
            'metadata' => $event->metadata,
        ]);
    }
}
