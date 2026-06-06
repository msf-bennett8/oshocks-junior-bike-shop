<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->text('base_rental_adjustment_note')->nullable()->after('base_rental_price');
            $table->text('add_ons_adjustment_note')->nullable()->after('add_ons_price');
            $table->text('insurance_adjustment_note')->nullable()->after('insurance_price');
            $table->text('transport_adjustment_note')->nullable()->after('transport_price');
            $table->text('security_deposit_adjustment_note')->nullable()->after('security_deposit');
            $table->text('total_price_adjustment_note')->nullable()->after('total_price');
            $table->text('general_adjustment_notes')->nullable()->after('staff_notes');
        });
    }

    public function down(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->dropColumn([
                'base_rental_adjustment_note',
                'add_ons_adjustment_note',
                'insurance_adjustment_note',
                'transport_adjustment_note',
                'security_deposit_adjustment_note',
                'total_price_adjustment_note',
                'general_adjustment_notes',
            ]);
        });
    }
};
