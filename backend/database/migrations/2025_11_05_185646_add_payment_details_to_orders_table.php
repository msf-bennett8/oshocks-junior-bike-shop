<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Only add columns that don't exist
            if (!Schema::hasColumn('orders', 'external_reference')) {
                $table->string('external_reference')->nullable()->after('transaction_reference');
            }
            
            if (!Schema::hasColumn('orders', 'external_transaction_id')) {
                $table->string('external_transaction_id')->nullable()->after('external_reference');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'external_reference')) {
                $table->dropColumn('external_reference');
            }
            
            if (Schema::hasColumn('orders', 'external_transaction_id')) {
                $table->dropColumn('external_transaction_id');
            }
        });
    }
};
