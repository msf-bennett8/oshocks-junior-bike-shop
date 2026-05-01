<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            // Drop the existing foreign key constraint first
            $table->dropForeign(['created_by']);
            
            // Recreate as nullable with foreign key
            $table->foreignId('created_by')->nullable()->change();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->foreignId('created_by')->change(); // Reverts to NOT NULL
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
