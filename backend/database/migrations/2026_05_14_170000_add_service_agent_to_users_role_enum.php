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
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin', 'pending_seller', 'super_admin', 'delivery_agent', 'shop_attendant', 'service_agent') DEFAULT 'buyer'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert any service_agent users to buyer first
        DB::table('users')->where('role', 'service_agent')->update(['role' => 'buyer']);

        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer', 'seller', 'admin', 'pending_seller', 'super_admin', 'delivery_agent', 'shop_attendant') DEFAULT 'buyer'");
    }
};
