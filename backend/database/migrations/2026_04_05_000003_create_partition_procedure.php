<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE PROCEDURE IF NOT EXISTS create_audit_log_partition()
            BEGIN
                DECLARE next_month VARCHAR(6);
                DECLARE partition_name VARCHAR(20);
                
                SET next_month = DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y%m');
                SET partition_name = CONCAT('p', next_month);
                
                SET @sql = CONCAT('
                    ALTER TABLE audit_logs 
                    REORGANIZE PARTITION pfuture INTO (
                        PARTITION ', partition_name, ' VALUES LESS THAN (', 
                        DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 2 MONTH), '%Y%m'), '),
                        PARTITION pfuture VALUES LESS THAN MAXVALUE
                    )
                ');
                
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            END
        ");
    }

    public function down(): void
    {
        DB::statement("DROP PROCEDURE IF EXISTS create_audit_log_partition");
    }
};
