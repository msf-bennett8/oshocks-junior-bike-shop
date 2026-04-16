<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $shouldClear = filter_var(env('CLEAR_AUDIT_LOGS', false), FILTER_VALIDATE_BOOLEAN);
        
        if (!$shouldClear) {
            echo "\n>>> SKIPPING: Set CLEAR_AUDIT_LOGS=true to clear audit logs <<<\n\n";
            return;
        }

        echo "\n>>> FAST CLEAR: Deleting all audit logs <<<\n";
        
        // Get count before
        $count = DB::table('audit_logs')->count();
        echo "Found {$count} records to delete...\n";
        
        if ($count === 0) {
            echo "Table already empty.\n\n";
            return;
        }

        // Fast TRUNCATE - no backup, no loops, just delete
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        DB::statement('TRUNCATE TABLE audit_logs');
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        
        echo ">>> ✓ CLEARED {$count} AUDIT LOGS <<<\n\n";
    }

    public function down(): void
    {
        // Cannot restore
    }
};
