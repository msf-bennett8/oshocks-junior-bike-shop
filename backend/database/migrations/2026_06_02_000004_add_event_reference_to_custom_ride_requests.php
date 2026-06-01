<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_ride_requests', 'converted_event_code')) {
                $table->string('converted_event_code', 12)->nullable()->after('status');
            }
            if (!Schema::hasColumn('custom_ride_requests', 'converted_at')) {
                $table->timestamp('converted_at')->nullable()->after('converted_event_code');
            }
            if (!Schema::hasColumn('custom_ride_requests', 'converted_by')) {
                $table->foreignId('converted_by')->nullable()->after('converted_at')->constrained('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('custom_ride_requests', function (Blueprint $table) {
            $table->dropColumn(['converted_event_code', 'converted_at', 'converted_by']);
        });
    }
};
