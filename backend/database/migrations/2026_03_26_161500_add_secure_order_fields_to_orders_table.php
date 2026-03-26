<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // New secure order fields
            $table->string('order_code', 10)->nullable()->after('order_number')->index();
            $table->string('order_display', 10)->nullable()->after('order_code')->index();
            $table->string('purchase_id', 50)->nullable()->after('order_display');
            $table->string('routing_id', 10)->nullable()->after('purchase_id');
            $table->string('location_code', 8)->nullable()->after('routing_id');
            
            // Email tracking fields
            $table->timestamp('email_sent_order_placed')->nullable();
            $table->timestamp('email_sent_processing')->nullable();
            $table->timestamp('email_sent_shipped')->nullable();
            $table->timestamp('email_sent_out_for_delivery')->nullable();
            $table->timestamp('email_sent_delivered')->nullable();
            $table->timestamp('email_sent_payment_received')->nullable();
            $table->timestamp('email_sent_cancelled')->nullable();
            $table->timestamp('email_sent_refunded')->nullable();
            
            // Additional tracking fields
            $table->string('transaction_id_display', 5)->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('tracking_number')->nullable();
            $table->string('carrier')->nullable();
            $table->json('delivery_agent_details')->nullable();
            $table->string('delivery_proof_url')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->string('refund_reference')->nullable();
            $table->timestamp('refund_initiated_at')->nullable();
            $table->date('estimated_delivery_date')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'order_code',
                'order_display',
                'purchase_id',
                'routing_id',
                'location_code',
                'email_sent_order_placed',
                'email_sent_processing',
                'email_sent_shipped',
                'email_sent_out_for_delivery',
                'email_sent_delivered',
                'email_sent_payment_received',
                'email_sent_cancelled',
                'email_sent_refunded',
                'transaction_id_display',
                'cancellation_reason',
                'cancelled_by',
                'tracking_number',
                'carrier',
                'delivery_agent_details',
                'delivery_proof_url',
                'refund_amount',
                'refund_reference',
                'refund_initiated_at',
                'estimated_delivery_date',
            ]);
        });
    }
};