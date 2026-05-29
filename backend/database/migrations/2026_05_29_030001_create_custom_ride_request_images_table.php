<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_ride_request_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_ride_request_id')->constrained('custom_ride_requests')->onDelete('cascade');
            $table->string('public_id', 255); // Cloudinary public_id
            $table->string('secure_url', 500); // Cloudinary secure_url
            $table->string('url', 500)->nullable(); // Fallback URL
            $table->string('original_name', 255)->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->unsignedInteger('file_size')->nullable(); // bytes
            $table->unsignedSmallInteger('width')->nullable();
            $table->unsignedSmallInteger('height')->nullable();
            $table->string('format', 20)->nullable(); // jpg, png, webp
            $table->string('folder_path', 100)->default('oshocks/rides/custom_ride_requests');
            $table->unsignedSmallInteger('display_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            
            $table->index(['custom_ride_request_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_ride_request_images');
    }
};
