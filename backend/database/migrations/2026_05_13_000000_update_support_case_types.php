<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Map old values first (idempotent - safe to re-run)
        DB::statement("UPDATE support_cases SET case_type = 'account_login' WHERE case_type = 'account_help'");
        DB::statement("UPDATE support_cases SET case_type = 'shipment_delivery' WHERE case_type = 'delivery_question'");
        DB::statement("UPDATE support_cases SET case_type = 'services_booking' WHERE case_type = 'service'");
        DB::statement("UPDATE support_cases SET case_type = 'general_inquiry' WHERE case_type = 'inquiry'");

        DB::statement("ALTER TABLE support_cases MODIFY COLUMN case_type ENUM(
            'order_issue',
            'account_login',
            'report_problem',
            'shipment_delivery',
            'services_booking',
            'general_inquiry',
            'payment_billing',
            'product_info',
            'returns_refund',
            'technical_support',
            'other'
        ) NOT NULL DEFAULT 'other'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE support_cases MODIFY COLUMN case_type ENUM(
            'order_issue',
            'account_help',
            'report_problem',
            'delivery_question',
            'service',
            'inquiry'
        ) NOT NULL");
    }
};
