<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            // Change total_sales from integer to decimal
            $table->decimal('total_sales', 12, 2)->default(0)->change();
            
            // Add new payment and earnings tracking fields
            $table->string('payment_account')->nullable()->after('commission_rate'); // Mpesa number or bank account
            $table->string('payment_method')->nullable()->after('payment_account'); // 'mpesa' or 'bank'
            $table->decimal('total_commission_paid', 12, 2)->default(0)->after('payment_method');
            $table->decimal('total_earnings', 12, 2)->default(0)->after('total_commission_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seller_profiles', function (Blueprint $table) {
            // Revert total_sales back to integer
            $table->integer('total_sales')->default(0)->change();
            
            // Drop added columns
            $table->dropColumn(['payment_account', 'payment_method', 'total_commission_paid', 'total_earnings']);
        });
    }
};
