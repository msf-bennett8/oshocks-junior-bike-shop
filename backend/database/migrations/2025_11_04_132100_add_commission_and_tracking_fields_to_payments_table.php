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
        Schema::table('payments', function (Blueprint $table) {
            // Seller and sale channel tracking
            $table->foreignId('seller_id')->nullable()->after('order_id')->constrained('seller_profiles')->onDelete('cascade');
            $table->enum('sale_channel', ['online_delivery', 'physical_shop', 'direct_seller'])->nullable()->after('seller_id');
            
            // Enhanced payment method (keeping existing field, just documenting supported values)
            // payment_method already exists: 'cash', 'mpesa_manual', 'bank_transfer', 'mpesa_stk', 'flutterwave'
            
            // Transaction references
            $table->string('transaction_reference')->unique()->nullable()->after('transaction_id'); // Our generated ID
            $table->string('external_reference')->nullable()->after('transaction_reference'); // Customer's mpesa/bank ref
            $table->string('external_transaction_id')->nullable()->after('external_reference'); // Mpesa/bank transaction ID
            
            // Currency
            $table->string('currency', 3)->default('KES')->after('amount');
            
            // Commission tracking
            $table->decimal('platform_commission_rate', 5, 2)->nullable()->after('currency'); // % at time of sale
            $table->decimal('platform_commission_amount', 10, 2)->default(0)->after('platform_commission_rate');
            $table->decimal('seller_payout_amount', 10, 2)->default(0)->after('platform_commission_amount');
            
            // Payout tracking
            $table->enum('payout_status', ['pending', 'processing', 'completed', 'on_hold'])->default('pending')->after('status');
            $table->timestamp('payout_date')->nullable()->after('payout_status');
            
            // Recorder tracking (who physically received payment)
            $table->foreignId('recorded_by_user_id')->nullable()->after('payout_date')->constrained('users')->onDelete('set null');
            $table->enum('recorder_type', ['delivery_agent', 'shop_attendant', 'seller', 'system'])->nullable()->after('recorded_by_user_id');
            $table->string('recorder_location')->nullable()->after('recorder_type');
            
            // Payment collection details
            $table->timestamp('payment_collected_at')->nullable()->after('completed_at');
            $table->timestamp('verified_at')->nullable()->after('payment_collected_at');
            
            // Security and audit
            $table->string('recorded_from_ip', 45)->nullable()->after('verified_at');
            $table->text('recorded_device_info')->nullable()->after('recorded_from_ip');
            
            // Flexible metadata
            $table->json('metadata')->nullable()->after('payment_details');
            
            // Notes (payment_details can be repurposed or we add notes)
            $table->text('notes')->nullable()->after('metadata');
            
            // Indexes for performance
            $table->index('seller_id');
            $table->index('transaction_reference');
            $table->index('payout_status');
            $table->index('recorded_by_user_id');
            $table->index(['seller_id', 'status', 'created_at']);
            $table->index('recorded_from_ip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['seller_id']);
            $table->dropIndex(['transaction_reference']);
            $table->dropIndex(['payout_status']);
            $table->dropIndex(['recorded_by_user_id']);
            $table->dropIndex(['seller_id', 'status', 'created_at']);
            $table->dropIndex(['recorded_from_ip']);
            
            // Drop columns
            $table->dropForeign(['seller_id']);
            $table->dropForeign(['recorded_by_user_id']);
            
            $table->dropColumn([
                'seller_id',
                'sale_channel',
                'transaction_reference',
                'external_reference',
                'external_transaction_id',
                'currency',
                'platform_commission_rate',
                'platform_commission_amount',
                'seller_payout_amount',
                'payout_status',
                'payout_date',
                'recorded_by_user_id',
                'recorder_type',
                'recorder_location',
                'payment_collected_at',
                'verified_at',
                'recorded_from_ip',
                'recorded_device_info',
                'metadata',
                'notes'
            ]);
        });
    }
};
