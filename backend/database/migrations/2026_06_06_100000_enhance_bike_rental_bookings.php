<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bike_rental_bookings', function (Blueprint $table) {
            // Booking duration type
            $table->enum('duration_type', ['hourly', 'daily', 'weekly', 'monthly'])->default('daily')->after('duration_hours');
            
            // Security deposit refund tracking
            $table->boolean('deposit_refunded')->default(false)->after('security_deposit');
            $table->timestamp('deposit_refunded_at')->nullable()->after('deposit_refunded');
            $table->foreignId('deposit_refunded_by')->nullable()->constrained('users')->onDelete('set null')->after('deposit_refunded_at');
            
            // Late return fine
            $table->decimal('late_return_fine', 10, 2)->nullable()->after('late_fee');
            $table->timestamp('fine_applied_at')->nullable()->after('late_return_fine');
            
            // Terms acceptance tracking
            $table->boolean('renter_terms_accepted')->default(false)->after('payment_method');
            $table->timestamp('renter_terms_accepted_at')->nullable()->after('renter_terms_accepted');
            $table->boolean('lister_terms_accepted')->default(false)->after('renter_terms_accepted_at');
            $table->timestamp('lister_terms_accepted_at')->nullable()->after('lister_terms_accepted');
            
            // Recirculation tracking
            $table->boolean('recirculated')->default(false)->after('status');
            $table->timestamp('recirculated_at')->nullable()->after('recirculated');
            $table->foreignId('recirculated_by')->nullable()->constrained('users')->onDelete('set null')->after('recirculated_at');
        });
    }

    public function down(): void
    {
        Schema::table('bike_rental_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'duration_type',
                'deposit_refunded',
                'deposit_refunded_at',
                'deposit_refunded_by',
                'late_return_fine',
                'fine_applied_at',
                'renter_terms_accepted',
                'renter_terms_accepted_at',
                'lister_terms_accepted',
                'lister_terms_accepted_at',
                'recirculated',
                'recirculated_at',
                'recirculated_by',
            ]);
        });
    }
};
