<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->decimal('original_base_rental_price', 12, 2)->nullable()->after('base_rental_price');
            $table->decimal('original_add_ons_price', 12, 2)->nullable()->after('add_ons_price');
            $table->decimal('original_insurance_price', 12, 2)->nullable()->after('insurance_price');
            $table->decimal('original_transport_price', 12, 2)->nullable()->after('transport_price');
            $table->decimal('original_security_deposit', 12, 2)->nullable()->after('security_deposit');
            $table->decimal('original_total_price', 12, 2)->nullable()->after('total_price');
        });
    }

    public function down(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->dropColumn([
                'original_base_rental_price',
                'original_add_ons_price',
                'original_insurance_price',
                'original_transport_price',
                'original_security_deposit',
                'original_total_price',
            ]);
        });
    }
};
