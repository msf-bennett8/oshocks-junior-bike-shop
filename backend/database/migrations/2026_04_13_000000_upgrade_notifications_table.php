<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop existing table and recreate with enhanced schema
        Schema::dropIfExists('notifications');

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('notification_id', 32)->unique(); // ntf_ + 16 chars
            $table->string('type', 50); // order, payment, shipping, etc.
            $table->string('channel', 20)->default('in-app'); // in-app, email, sms, push
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Legacy data field
            $table->json('metadata')->nullable(); // Extended context data
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->string('action_url', 500)->nullable();
            $table->string('action_text', 100)->nullable();
            $table->string('icon_type', 50)->nullable(); // For frontend rendering
            $table->string('icon_color', 20)->nullable(); // Tailwind color class
            $table->string('icon_gradient', 100)->nullable(); // Tailwind gradient classes
            $table->boolean('is_pinned')->default(false); // User pinning
            $table->json('actions')->nullable(); // Action buttons array
            $table->json('audit_log')->nullable(); // Audit metadata for admin notifications
            $table->string('template_id', 50)->nullable();
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->string('clicked_url', 500)->nullable();
            $table->unsignedInteger('open_count')->default(0);
            $table->unsignedInteger('click_count')->default(0);
            $table->string('provider_message_id', 100)->nullable();
            $table->enum('delivery_status', ['pending', 'sent', 'delivered', 'failed', 'bounced'])->default('pending');
            $table->timestamp('expires_at')->nullable(); // Auto-cleanup
            $table->boolean('is_archived')->default(false);
            $table->softDeletes(); // User "delete" action
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'is_archived', 'created_at']);
            $table->index(['user_id', 'read_at', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['priority', 'created_at']);
            $table->index(['expires_at']);
            $table->index(['notification_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
