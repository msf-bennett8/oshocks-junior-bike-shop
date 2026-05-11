<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_notes', function (Blueprint $table) {
            $table->id();

            // Link to service booking via case_id (same as support_case_notes pattern)
            $table->string('case_id', 13);
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');

            // Who created the note
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            // Note content
            $table->text('content');

            // Visibility: 
            // 'private' = only staff (admin, super_admin, support_agent, service_agent) can see
            // 'staff_public' = all staff can see, but NOT users
            // 'public' = both staff AND users can see
            $table->enum('visibility', ['private', 'staff_public', 'public'])->default('public');

            // Optional link to a message if note was created from a message context
            $table->foreignId('message_id')->nullable();

            $table->timestamps();

            $table->index(['case_id', 'created_at']);
            $table->index(['case_id', 'visibility']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_notes');
    }
};
