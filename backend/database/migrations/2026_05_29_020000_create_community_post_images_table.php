<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_post_images', function (Blueprint $table) {
            $table->id();

            // Link to community post
            $table->string('post_code', 12);
            $table->foreign('post_code')->references('post_code')->on('community_posts')->onDelete('cascade');

            // Cloudinary metadata
            $table->string('cloudinary_public_id')->unique();
            $table->string('cloudinary_secure_url');
            $table->string('cloudinary_thumbnail_url')->nullable();
            $table->string('cloudinary_medium_url')->nullable();
            $table->string('original_name')->nullable();
            $table->string('folder_path')->default('oshocks/community/community_events');
            $table->string('format', 10)->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('file_size')->nullable(); // bytes

            // User-facing data
            $table->string('caption', 255)->nullable();
            $table->integer('display_order')->default(0);

            // System
            $table->timestamps();

            // Indexes
            $table->index(['post_code', 'display_order']);
            $table->index('cloudinary_public_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_post_images');
    }
};
