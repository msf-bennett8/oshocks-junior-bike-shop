<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('channel_preferences')->default(json_encode([
                'push' => true,
                'email' => true,
                'sms' => false,
                'in_app' => true
            ]));
            $table->json('category_preferences')->default(json_encode([
                'orders' => ['enabled' => true, 'push' => true, 'email' => true],
                'shipping' => ['enabled' => true, 'push' => true, 'email' => true],
                'payments' => ['enabled' => true, 'push' => true, 'email' => true],
                'promotions' => ['enabled' => true, 'push' => false, 'email' => true],
                'wishlist' => ['enabled' => true, 'push' => false, 'email' => false],
                'messages' => ['enabled' => true, 'push' => true, 'email' => false],
                'reviews' => ['enabled' => true, 'push' => false, 'email' => true],
                'system' => ['enabled' => true, 'push' => true, 'email' => true],
                'inventory' => ['enabled' => true, 'push' => true, 'email' => true],
                'audit' => ['enabled' => true, 'push' => false, 'email' => true],
                'admin' => ['enabled' => true, 'push' => true, 'email' => true]
            ]));
            $table->boolean('quiet_hours_enabled')->default(false);
            $table->time('quiet_hours_start')->default('22:00');
            $table->time('quiet_hours_end')->default('07:00');
            $table->string('timezone', 50)->default('Africa/Nairobi');
            $table->boolean('desktop_notifications')->default(false);
            $table->boolean('sound_enabled')->default(false);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
