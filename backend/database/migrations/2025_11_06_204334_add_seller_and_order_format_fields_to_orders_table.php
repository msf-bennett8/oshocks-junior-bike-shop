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
            // Add seller_id for commission tracking
            $table->foreignId('seller_id')->nullable()->after('user_id')->constrained('seller_profiles')->onDelete('set null');
            
            // Add county field (extracted from address for order ID generation)
            $table->string('county')->nullable()->after('delivery_zone');
            
            // Add zone field (already exists as delivery_zone, but we'll keep both for clarity)
            // delivery_zone already exists, no need to add
            
            // Index for performance
            $table->index('seller_id');
            $table->index(['county', 'delivery_zone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropIndex(['seller_id']);
            $table->dropIndex(['county', 'delivery_zone']);
            $table->dropColumn(['seller_id', 'county']);
        });
    }
};