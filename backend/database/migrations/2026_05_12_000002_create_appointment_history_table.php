<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_history', function (Blueprint $table) {
            $table->id();

            $table->string('case_id', 13);
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');

            // Who made the change
            $table->foreignId('changed_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // Status change
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20)->nullable();

            // Date/time changes
            $table->timestamp('from_date')->nullable();
            $table->timestamp('to_date')->nullable();
            $table->string('from_time', 50)->nullable();
            $table->string('to_time', 50)->nullable();

            // Assignment change
            $table->foreignId('from_seller_id')->nullable();
            $table->foreignId('to_seller_id')->nullable();
            $table->foreignId('from_mechanic_id')->nullable();
            $table->foreignId('to_mechanic_id')->nullable();

            // Reason for change
            $table->text('reason')->nullable();

            // Additional context
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['case_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_history');
    }
};
