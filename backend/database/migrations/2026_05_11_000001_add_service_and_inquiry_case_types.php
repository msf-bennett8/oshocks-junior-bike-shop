<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'service' and 'inquiry' to case_type enum
        // MySQL/MariaDB: need to alter enum
        // SQLite: alter column type
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite doesn't support ALTER COLUMN for enums
            // We'll handle this via application-level validation
            Schema::table('support_cases', function (Blueprint $table) {
                if (!Schema::hasColumn('support_cases', 'service_details')) {
                    $table->json('service_details')->nullable()->after('metadata');
                }
                if (!Schema::hasColumn('support_cases', 'appointment_at')) {
                    $table->timestamp('appointment_at')->nullable()->after('service_details');
                }
                if (!Schema::hasColumn('support_cases', 'staff_confirmed_at')) {
                    $table->timestamp('staff_confirmed_at')->nullable()->after('appointment_at');
                }
                if (!Schema::hasColumn('support_cases', 'department')) {
                    $table->string('department', 50)->nullable()->after('staff_confirmed_at')->index();
                }
                if (!Schema::hasColumn('support_cases', 'source')) {
                    $table->string('source', 30)->default('web')->change();
                }
            });
        } else {
            // MySQL/MariaDB
            DB::statement("ALTER TABLE support_cases MODIFY COLUMN case_type ENUM('order_issue','account_help','report_problem','delivery_question','service','inquiry') NOT NULL");
            
            Schema::table('support_cases', function (Blueprint $table) {
                if (!Schema::hasColumn('support_cases', 'service_details')) {
                    $table->json('service_details')->nullable()->after('metadata');
                }
                if (!Schema::hasColumn('support_cases', 'appointment_at')) {
                    $table->timestamp('appointment_at')->nullable()->after('service_details');
                }
                if (!Schema::hasColumn('support_cases', 'staff_confirmed_at')) {
                    $table->timestamp('staff_confirmed_at')->nullable()->after('appointment_at');
                }
                if (!Schema::hasColumn('support_cases', 'department')) {
                    $table->string('department', 50)->nullable()->after('staff_confirmed_at')->index();
                }
            });
        }

        // Add appointment_status for service bookings
        Schema::table('support_cases', function (Blueprint $table) {
            if (!Schema::hasColumn('support_cases', 'appointment_status')) {
                $table->enum('appointment_status', ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'])
                      ->nullable()
                      ->after('status');
            }
            if (!Schema::hasColumn('support_cases', 'seller_id')) {
                $table->foreignId('seller_id')
                      ->nullable()
                      ->after('assigned_to')
                      ->constrained('seller_profiles')
                      ->onDelete('set null');
            }
            if (!Schema::hasColumn('support_cases', 'service_agent_id')) {
                $table->foreignId('service_agent_id')
                      ->nullable()
                      ->after('seller_id')
                      ->constrained('users')
                      ->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('support_cases', function (Blueprint $table) {
            $table->dropColumnIfExists('service_details');
            $table->dropColumnIfExists('appointment_at');
            $table->dropColumnIfExists('staff_confirmed_at');
            $table->dropColumnIfExists('department');
            $table->dropColumnIfExists('appointment_status');
            
            if (Schema::hasColumn('support_cases', 'seller_id')) {
                $table->dropForeign(['seller_id']);
                $table->dropColumn('seller_id');
            }
            if (Schema::hasColumn('support_cases', 'service_agent_id')) {
                $table->dropForeign(['service_agent_id']);
                $table->dropColumn('service_agent_id');
            }
        });

        $driver = DB::getDriverName();
        if ($driver !== 'sqlite') {
            DB::statement("ALTER TABLE support_cases MODIFY COLUMN case_type ENUM('order_issue','account_help','report_problem','delivery_question') NOT NULL");
        }
    }
};
