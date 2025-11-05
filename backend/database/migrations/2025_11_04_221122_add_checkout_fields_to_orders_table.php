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
        Schema::table('orders', function (Blueprint $table) {
            // Delivery information
            $table->string('delivery_zone')->nullable()->after('address_id');
            $table->string('postal_code')->nullable()->after('delivery_zone');
            $table->text('delivery_instructions')->nullable()->after('postal_code');
            
            // Payment method (mpesa, card, cod)
            $table->enum('payment_method', ['mpesa', 'card', 'cod', 'bank_transfer'])->nullable()->after('payment_status');
            
            // Guest checkout support (nullable for logged-in users)
            $table->string('customer_phone')->nullable()->after('user_id');
            $table->string('customer_email')->nullable()->after('customer_phone');
            $table->string('customer_name')->nullable()->after('customer_email');
            
            // Transaction reference for tracking
            $table->string('transaction_reference')->nullable()->unique()->after('payment_method');
            
            // Make user_id nullable for guest checkout
            $table->foreignId('user_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_zone',
                'postal_code',
                'delivery_instructions',
                'payment_method',
                'customer_phone',
                'customer_email',
                'customer_name',
                'transaction_reference'
            ]);
            
            // Restore user_id to non-nullable
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};