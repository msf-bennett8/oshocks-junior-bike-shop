<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('campaign_id', 32)->unique();
            $table->string('name');
            $table->enum('type', ['email', 'sms', 'push', 'mixed']);
            $table->enum('status', ['draft', 'scheduled', 'sending', 'completed', 'cancelled'])->default('draft');
            $table->string('template_id')->nullable();
            $table->string('subject')->nullable();
            $table->longText('content')->nullable();
            $table->json('audience_segment');
            $table->integer('audience_count')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('opened_count')->default(0);
            $table->integer('clicked_count')->default(0);
            $table->integer('bounced_count')->default(0);
            $table->integer('complained_count')->default(0);
            $table->integer('unsubscribed_count')->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->boolean('ip_warmup')->default(false);
            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
            $table->index(['created_by', 'created_at']);
        });

        Schema::create('marketing_campaign_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained('marketing_campaigns')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->enum('event_type', ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed']);
            $table->enum('channel', ['email', 'sms', 'push']);
            $table->string('message_id');
            $table->string('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->text('link_url')->nullable();
            $table->string('bounce_reason')->nullable();
            $table->string('complaint_type')->nullable();
            $table->string('unsubscribe_method')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['campaign_id', 'event_type', 'occurred_at']);
            $table->index(['user_id', 'event_type']);
            $table->index(['message_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_campaign_logs');
        Schema::dropIfExists('marketing_campaigns');
    }
};
