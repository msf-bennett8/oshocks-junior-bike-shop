<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('messages')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path'); // Storage path or Cloudinary URL
            $table->string('file_type'); // image, video, audio, document
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size'); // bytes
            $table->string('thumbnail_path')->nullable(); // For videos/images
            $table->integer('duration_seconds')->nullable(); // For audio/video
            $table->timestamps();

            $table->index(['message_id', 'file_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
    }
};
