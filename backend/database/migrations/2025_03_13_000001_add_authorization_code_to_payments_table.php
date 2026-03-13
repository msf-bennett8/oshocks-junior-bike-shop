<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Store Paystack authorization_code for saved cards
            $table->string('authorization_code')->nullable()->after('external_transaction_id');
            $table->string('card_last4', 4)->nullable()->after('authorization_code');
            $table->string('card_brand', 20)->nullable()->after('card_last4');
            $table->string('card_expiry_month', 2)->nullable()->after('card_brand');
            $table->string('card_expiry_year', 4)->nullable()->after('card_expiry_month');
            $table->boolean('is_reusable')->default(false)->after('card_expiry_year');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'authorization_code',
                'card_last4',
                'card_brand',
                'card_expiry_month',
                'card_expiry_year',
                'is_reusable'
            ]);
        });
    }
};