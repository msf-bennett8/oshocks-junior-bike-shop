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
        Schema::create('audit_archives', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 100)->index();
            $table->string('event_category', 50)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('user_role', 50)->nullable();
            $table->string('action', 50);
            $table->string('model_type', 100)->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->text('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('request_method', 10)->nullable();
            $table->string('request_url', 500)->nullable();
            $table->string('severity', 20)->default('low')->index();
            $table->boolean('is_suspicious')->default(false)->index();
            $table->timestamp('occurred_at')->index();
            $table->timestamp('archived_at')->index();
            $table->string('archive_reason', 100)->nullable();
            $table->timestamps();

            // Indexes for efficient querying
            $table->index(['event_type', 'occurred_at']);
            $table->index(['severity', 'occurred_at']);
            $table->index(['user_id', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('audit_archives');
    }
};
