<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Check current enum values and add support_agent if missing
        // This requires raw SQL for MySQL enum modification
        
        $currentEnum = DB::select("SHOW COLUMNS FROM users WHERE Field = 'role'")[0]->Type ?? '';
        
        if (str_contains($currentEnum, 'enum(') && !str_contains($currentEnum, "'support_agent'")) {
            // Extract existing values
            preg_match("/enum\((.*)\)/", $currentEnum, $matches);
            $values = $matches[1] ?? '';
            
            // Add support_agent before the closing parenthesis
            $newValues = str_replace("')", "','support_agent')", $values);
            
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM({$newValues}) NOT NULL");
        }
    }

    public function down(): void
    {
        // Note: Removing enum values in MySQL is complex and risky
        // We skip down() for safety — support_agent role can remain
    }
};
