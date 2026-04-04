<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PrivilegedQueryMonitoringMiddleware
{
    /**
     * Sensitive tables requiring approval
     */
    protected array $sensitiveTables = [
        'users',
        'payments',
        'orders',
        'audit_logs',
        'seller_payouts',
    ];

    /**
     * Blocked query patterns
     */
    protected array $blockedPatterns = [
        'DROP TABLE',
        'TRUNCATE TABLE',
        'DELETE FROM.*WHERE.*=.*;', // Delete without proper WHERE
        'UPDATE.*SET.*=.*;', // Update without WHERE
    ];

    /**
     * Handle query monitoring
     */
    public function handle(Request $request, Closure $next)
    {
        // Only monitor admin/super admin requests
        $user = $request->user();
        if (!$user || !$user->hasAdminAccess()) {
            return $next($request);
        }

        // Check if this is a query execution endpoint
        if (!$this->isQueryEndpoint($request)) {
            return $next($request);
        }

        $query = $this->extractQuery($request);
        if (!$query) {
            return $next($request);
        }

        // Check for blocked patterns
        if ($this->isBlocked($query)) {
            AuditService::logPrivilegedQueryBlocked(null, [
                'query_hash' => hash('sha256', $query),
                'query_type' => $this->getQueryType($query),
                'block_reason' => 'sensitive_table/no_approval',
                'timestamp' => now(),
                'attempted_by' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Query blocked: Sensitive operation requires approval',
            ], 403);
        }

        // Log privileged query
        $startTime = microtime(true);
        
        DB::listen(function ($queryLog) use ($user, $startTime) {
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            $targetTables = $this->extractTables($queryLog->sql);
            
            AuditService::logPrivilegedQueryExecuted($user, [
                'query_hash' => hash('sha256', $queryLog->sql),
                'query_type' => $this->getQueryType($queryLog->sql),
                'target_tables' => $targetTables,
                'rows_affected' => $queryLog->rowsAffected ?? 0,
                'execution_time_ms' => $duration,
                'justification' => request()->input('justification', 'No justification provided'),
                'session_id' => request()->bearerToken() ? hash('sha256', substr(request()->bearerToken(), 0, 20)) : null,
                'approval_ticket_id' => request()->input('approval_ticket_id'),
            ]);
        });

        return $next($request);
    }

    /**
     * Check if request is to query endpoint
     */
    private function isQueryEndpoint(Request $request): bool
    {
        return $request->is('api/v1/admin/query') || 
               $request->is('api/v1/super-admin/query');
    }

    /**
     * Extract query from request
     */
    private function extractQuery(Request $request): ?string
    {
        return $request->input('query') ?? $request->input('sql');
    }

    /**
     * Check if query is blocked
     */
    private function isBlocked(string $query): bool
    {
        $upperQuery = strtoupper($query);

        foreach ($this->blockedPatterns as $pattern) {
            if (preg_match('/' . str_replace('/', '\/', $pattern) . '/i', $upperQuery)) {
                return true;
            }
        }

        // Check for sensitive table access without approval
        if (!$this->hasApprovalTicket() && $this->accessesSensitiveTable($query)) {
            return true;
        }

        return false;
    }

    /**
     * Check if query accesses sensitive tables
     */
    private function accessesSensitiveTable(string $query): bool
    {
        $upperQuery = strtoupper($query);

        foreach ($this->sensitiveTables as $table) {
            if (str_contains($upperQuery, strtoupper($table))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if request has approval ticket
     */
    private function hasApprovalTicket(): bool
    {
        return !empty(request()->input('approval_ticket_id'));
    }

    /**
     * Get query type
     */
    private function getQueryType(string $query): string
    {
        $upper = strtoupper(trim($query));
        
        if (str_starts_with($upper, 'SELECT')) return 'select';
        if (str_starts_with($upper, 'INSERT')) return 'insert';
        if (str_starts_with($upper, 'UPDATE')) return 'update';
        if (str_starts_with($upper, 'DELETE')) return 'delete';
        if (str_starts_with($upper, 'DROP')) return 'drop';
        if (str_starts_with($upper, 'TRUNCATE')) return 'truncate';
        
        return 'other';
    }

    /**
     * Extract table names from query
     */
    private function extractTables(string $query): array
    {
        $tables = [];
        
        // Simple extraction - would use SQL parser in production
        preg_match_all('/FROM\s+`?(\w+)`?/i', $query, $matches);
        $tables = array_merge($tables, $matches[1]);
        
        preg_match_all('/INTO\s+`?(\w+)`?/i', $query, $matches);
        $tables = array_merge($tables, $matches[1]);
        
        preg_match_all('/UPDATE\s+`?(\w+)`?/i', $query, $matches);
        $tables = array_merge($tables, $matches[1]);
        
        return array_unique($tables);
    }
}
