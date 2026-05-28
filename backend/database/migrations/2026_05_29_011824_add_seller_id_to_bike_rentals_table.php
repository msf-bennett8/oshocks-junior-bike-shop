<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            $table->foreignId('seller_id')
                ->nullable()
                ->after('listing_code')
                ->constrained('seller_profiles')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('bike_rentals', function (Blueprint $table) {
            $table->dropForeign(['seller_id']);
            $table->dropColumn('seller_id');
        });
    }
};
