<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            // Add Cloudinary-specific fields if they don't exist
            if (!Schema::hasColumn('product_images', 'public_id')) {
                $table->string('public_id')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('product_images', 'thumbnail_url')) {
                $table->string('thumbnail_url')->nullable()->after('public_id');
            }
            if (!Schema::hasColumn('product_images', 'variant_id')) {
                $table->foreignId('variant_id')->nullable()->after('product_id')->constrained('product_variants')->onDelete('cascade');
            }
            if (!Schema::hasColumn('product_images', 'display_order')) {
                $table->integer('display_order')->default(0)->after('thumbnail_url');
            }
            if (!Schema::hasColumn('product_images', 'is_primary')) {
                $table->boolean('is_primary')->default(false)->after('display_order');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['public_id', 'thumbnail_url', 'display_order', 'is_primary']);
            if (Schema::hasColumn('product_images', 'variant_id')) {
                $table->dropForeign(['variant_id']);
                $table->dropColumn('variant_id');
            }
        });
    }
};