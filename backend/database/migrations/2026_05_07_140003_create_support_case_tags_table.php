<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_case_tags', function (Blueprint $table) {
            $table->id();
            
            $table->string('case_id', 13);
            $table->foreign('case_id')
                  ->references('case_id')
                  ->on('support_cases')
                  ->onDelete('cascade');
            
            $table->string('tag', 50); // e.g., 'refund', 'defective', 'urgent'
            
            $table->timestamps();
            
            $table->unique(['case_id', 'tag']);
            $table->index('tag');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_case_tags');
    }
};
