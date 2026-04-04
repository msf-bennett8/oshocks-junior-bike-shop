<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('key_id', 32)->unique(); // Public identifier
            $table->string('key_hash', 64)->unique(); // SHA-256 hash
            $table->string('prefix', 16); // First 10 chars for identification
            $table->string('name');
            $table->json('permissions_scope');
            $table->enum('environment', ['production', 'staging', 'development'])->default('production');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('revoked_at')->nullable();
            $table->string('revocation_reason')->nullable();
            $table->timestamp('scheduled_deactivation')->nullable();
            $table->string('rotation_reason')->nullable();
            $table->string('rotated_from', 32)->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['user_id', 'is_active']);
            $table->index(['key_hash']);
            $table->index(['prefix']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
