<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Skip partitioning - Railway MySQL doesn't support it in strict mode
        // Instead, just ensure indexes exist for performance
        try {
            DB::statement("
                CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at)
            ");
        } catch (\Exception $e) {
            // Index may already exist
        }
        
        // Add partition maintenance event (optional, won't work without partitioning)
        try {
            DB::statement("
                CREATE EVENT IF NOT EXISTS audit_log_partition_maintenance
                ON SCHEDULE EVERY 1 MONTH
                DO BEGIN
                    -- No-op since we can't partition
                    SELECT 1;
                END
            ");
        } catch (\Exception $e) {
            // Events may not be enabled
        }
    }

    public function down(): void
    {
        try {
            DB::statement("DROP INDEX idx_audit_logs_occurred_at ON audit_logs");
        } catch (\Exception $e) {
            // Index may not exist
        }
        
        try {
            DB::statement("DROP EVENT IF EXISTS audit_log_partition_maintenance");
        } catch (\Exception $e) {
            // Event may not exist
        }
    }
};
