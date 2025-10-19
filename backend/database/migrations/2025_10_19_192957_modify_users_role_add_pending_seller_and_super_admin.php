<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
            // Change the role enum to include new values
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin', 'pending_seller', 'super_admin') DEFAULT 'buyer'");
        }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        // First, update any users with new roles to 'buyer'
        DB::table('users')->whereIn('role', ['pending_seller', 'super_admin'])->update(['role' => 'buyer']);
        
        // Then change enum back
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer'");
    }
};
