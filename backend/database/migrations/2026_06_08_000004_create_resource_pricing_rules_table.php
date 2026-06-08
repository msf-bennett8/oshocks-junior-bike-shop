<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_pricing_rules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('resource_item_id')->constrained('resource_items')->onDelete('cascade');

            // Rule type
            $table->enum('rule_type', [
                'low_stock_surge',      // Price increase when stock is low
                'rush_hour_surge',      // Price increase during high demand periods
                'deadline_proximity',   // Price increase as event/booking deadline approaches
                'event_premium',        // Special pricing for specific events
                'seasonal_adjustment',  // Seasonal price changes
                'custom',              // Admin-defined custom rule
            ])->default('custom');

            // Rule conditions
            $table->integer('low_stock_threshold')->nullable(); // Trigger when available <= this
            $table->decimal('low_stock_multiplier', 3, 2)->nullable(); // e.g., 1.5 = 50% increase

            $table->integer('deadline_hours')->nullable(); // Trigger when within X hours of deadline
            $table->decimal('deadline_multiplier', 3, 2)->nullable();

            $table->decimal('demand_score_threshold')->nullable(); // Trigger when demand score exceeds this
            $table->decimal('demand_multiplier', 3, 2)->nullable();

            // Time-based rules
            $table->time('rush_start_time')->nullable();
            $table->time('rush_end_time')->nullable();
            $table->decimal('rush_multiplier', 3, 2)->nullable();
            $table->json('rush_days')->nullable(); // ['monday', 'friday', 'saturday']

            // Event-specific
            $table->foreignId('event_id')->nullable()->constrained('cycling_events')->onDelete('cascade');
            $table->decimal('event_multiplier', 3, 2)->nullable();

            // Rule settings
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher = applied first
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();

            $table->timestamps();

            $table->index(['resource_item_id', 'rule_type', 'is_active'], 'res_price_rules_active_idx');
            $table->index(['event_id', 'is_active'], 'res_price_event_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_pricing_rules');
    }
};
