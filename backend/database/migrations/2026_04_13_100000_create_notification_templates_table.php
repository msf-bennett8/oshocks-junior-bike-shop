<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_key')->unique()->index(); // e.g., 'order_placed', 'payment_successful'
            $table->string('name'); // Human-readable name
            $table->text('description')->nullable(); // Description of when this template is used
            $table->string('title'); // Notification title with {{variables}}
            $table->text('message'); // Notification message with {{variables}}
            $table->json('channels'); // ['in_app', 'email', 'push', 'sms']
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->string('icon_type')->nullable(); // e.g., 'ShoppingBag', 'CreditCard'
            $table->string('icon_color')->nullable(); // e.g., 'text-emerald-600'
            $table->string('icon_bg')->nullable(); // e.g., 'bg-emerald-100'
            $table->string('action_text')->nullable(); // e.g., 'View Order'
            $table->json('variables')->nullable(); // List of available variables with descriptions
            $table->string('category')->default('general'); // order, payment, inventory, security, etc.
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_active']);
            $table->index('template_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};