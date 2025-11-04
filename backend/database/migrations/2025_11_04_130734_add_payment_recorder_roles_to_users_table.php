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
        // Add delivery_agent and shop_attendant to the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin', 'pending_seller', 'super_admin', 'delivery_agent', 'shop_attendant') DEFAULT 'buyer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
   {
        // Remove users with new roles first
        DB::table('users')->whereIn('role', ['delivery_agent', 'shop_attendant'])->delete();
        
        // Revert enum back
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin', 'pending_seller', 'super_admin') DEFAULT 'buyer'");
    }
};
