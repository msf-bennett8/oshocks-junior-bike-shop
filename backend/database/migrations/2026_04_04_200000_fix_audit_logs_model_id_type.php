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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('model_id', 64)->nullable()->change();
        });
        
        Schema::table('audit_archives', function (Blueprint $table) {
            $table->string('model_id', 64)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('model_id')->nullable()->change();
        });
        
        Schema::table('audit_archives', function (Blueprint $table) {
            $table->unsignedBigInteger('model_id')->nullable()->change();
        });
    }
};