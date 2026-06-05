<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('event_registration_id')->nullable()->after('order_id')
                ->constrained('cycling_event_registrations')->nullOnDelete();
            $table->enum('payment_for', ['order', 'event_registration', 'bike_rental', 'service'])->default('order')->after('event_registration_id');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['event_registration_id']);
            $table->dropColumn('event_registration_id');
            $table->dropColumn('payment_for');
        });
    }
};
