<?php

namespace App\Console\Commands;

use App\Services\ResourceRecirculationService;
use App\Services\ResourcePricingService;
use Illuminate\Console\Command;

class AutoRecirculateResources extends Command
{
    protected $signature = 'resources:auto-recirculate';
    protected $description = 'Auto-recirculate expired resource bookings and update prices';

    public function handle()
    {
        $this->info('Starting auto-recirculation...');

        // Auto-recirculate expired bookings
        $result = ResourceRecirculationService::autoRecirculateExpired();
        $this->info("Recirculated {$result['recirculated_count']} expired bookings");

        // Update all dynamic prices
        $priceResult = ResourcePricingService::updateAllPrices();
        $this->info("Updated prices for {$priceResult['updated_count']} resources");

        $this->info('Auto-recirculation complete!');
        return 0;
    }
}
