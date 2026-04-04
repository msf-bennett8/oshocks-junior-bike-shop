<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add new columns to audit_logs table
        Schema::table('audit_logs', function (Blueprint $table) {
            // UUID and identification
            $table->uuid('event_uuid')->nullable()->after('id')->index();
            $table->string('correlation_id', 36)->nullable()->after('event_uuid')->index();
            $table->string('session_id', 64)->nullable()->after('correlation_id')->index();
            
            // Actor standardization
            $table->enum('actor_type', ['USER', 'SYSTEM', 'API_KEY', 'WEBHOOK', 'SCHEDULED_JOB', 'ANONYMOUS'])
                ->default('USER')
                ->after('user_id');
            $table->unsignedBigInteger('on_behalf_of')->nullable()->after('actor_type');
            
            // Classification
            $table->enum('tier', ['TIER_1_IMMUTABLE', 'TIER_2_OPERATIONAL', 'TIER_3_ANALYTICS'])
                ->default('TIER_2_OPERATIONAL')
                ->after('severity');
            
            // Integrity
            $table->string('integrity_hash', 64)->nullable()->after('tier');
            $table->string('previous_hash', 64)->nullable()->after('integrity_hash');
            $table->string('schema_version', 20)->default('2024.04.04-v1')->after('previous_hash');
            
            // Enhanced context
            $table->string('device_fingerprint', 64)->nullable()->after('user_agent');
            $table->json('geolocation')->nullable()->after('device_fingerprint');
            $table->json('payload')->nullable()->after('metadata');
            
            // Environment
            $table->string('environment', 20)->default('production')->after('payload');
            $table->string('service_version', 20)->nullable()->after('environment');
            
            // Timing
            $table->timestamp('processed_at')->nullable()->after('occurred_at');
        });

        // Add new columns to audit_archives table
        Schema::table('audit_archives', function (Blueprint $table) {
            $table->uuid('event_uuid')->nullable()->after('id')->index();
            $table->string('correlation_id', 36)->nullable()->after('event_uuid')->index();
            $table->string('session_id', 64)->nullable()->after('correlation_id');
            $table->enum('actor_type', ['USER', 'SYSTEM', 'API_KEY', 'WEBHOOK', 'SCHEDULED_JOB', 'ANONYMOUS'])
                ->default('USER')
                ->after('user_id');
            $table->unsignedBigInteger('on_behalf_of')->nullable()->after('actor_type');
            $table->enum('tier', ['TIER_1_IMMUTABLE', 'TIER_2_OPERATIONAL', 'TIER_3_ANALYTICS'])
                ->default('TIER_2_OPERATIONAL')
                ->after('severity');
            $table->string('integrity_hash', 64)->nullable()->after('tier');
            $table->string('previous_hash', 64)->nullable()->after('integrity_hash');
            $table->string('schema_version', 20)->default('2024.04.04-v1')->after('previous_hash');
            $table->string('device_fingerprint', 64)->nullable()->after('user_agent');
            $table->json('geolocation')->nullable()->after('device_fingerprint');
            $table->json('payload')->nullable()->after('metadata');
            $table->string('environment', 20)->default('production')->after('payload');
            $table->string('service_version', 20)->nullable()->after('environment');
            $table->timestamp('processed_at')->nullable()->after('occurred_at');
        });

        // Add composite indexes for common query patterns
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['event_type', 'tier', 'occurred_at'], 'idx_audit_event_tier_time');
            $table->index(['actor_type', 'user_id', 'occurred_at'], 'idx_audit_actor_time');
            $table->index(['correlation_id', 'occurred_at'], 'idx_audit_correlation_time');
        });

        // Migrate existing data - set all existing auth events to TIER_1
        DB::table('audit_logs')
            ->where('event_category', 'security')
            ->update(['tier' => 'TIER_1_IMMUTABLE']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropColumn([
                'event_uuid', 'correlation_id', 'session_id', 'actor_type', 'on_behalf_of',
                'tier', 'integrity_hash', 'previous_hash', 'schema_version',
                'device_fingerprint', 'geolocation', 'payload',
                'environment', 'service_version', 'processed_at'
            ]);
        });

        Schema::table('audit_archives', function (Blueprint $table) {
            $table->dropColumn([
                'event_uuid', 'correlation_id', 'session_id', 'actor_type', 'on_behalf_of',
                'tier', 'integrity_hash', 'previous_hash', 'schema_version',
                'device_fingerprint', 'geolocation', 'payload',
                'environment', 'service_version', 'processed_at'
            ]);
        });
    }
};
