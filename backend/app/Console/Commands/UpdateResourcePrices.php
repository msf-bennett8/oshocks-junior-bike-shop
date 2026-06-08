<?php

namespace App\Console\Commands;

use App\Services\ResourcePricingService;
use Illuminate\Console\Command;

class UpdateResourcePrices extends Command
{
    protected $signature = 'resources:update-prices';
    protected $description = 'Update dynamic prices for all resources';

    public function handle()
    {
        $this->info('Updating resource prices...');

        $result = ResourcePricingService::updateAllPrices();

        $this->info("Updated {$result['updated_count']} resources at {$result['timestamp']}");
        return 0;
    }
}
