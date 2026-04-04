<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Services\AuditService;
use App\Models\Product;
use App\Models\Category;

class CacheWarmupCommand extends Command
{
    protected $signature = 'cache:warmup 
                            {--keys=* : Specific keys to warm}
                            {--tier=all : Cache tier (cdn/application/database)}';
    
    protected $description = 'Warm up application caches with audit logging';

    public function handle(): int
    {
        $warmupId = 'warm_' . uniqid();
        $startTime = now();
        $keysWarmed = 0;

        $this->info("Starting cache warmup...");
        $this->info("Warmup ID: {$warmupId}");

        $keysToWarm = $this->option('keys') ?: $this->getDefaultKeys();

        foreach ($keysToWarm as $keyPattern) {
            $count = $this->warmKeyPattern($keyPattern);
            $keysWarmed += $count;
            $this->info("Warmed {$count} keys for pattern: {$keyPattern}");
        }

        $duration = now()->diffInSeconds($startTime);

        // Log warmup completion
        AuditService::logCacheWarmupCompleted(null, [
            'warmup_id' => $warmupId,
            'keys_warmed' => $keysWarmed,
            'duration_seconds' => $duration,
            'tier' => $this->option('tier'),
        ]);

        $this->info("✅ Cache warmup completed!");
        $this->info("Keys warmed: {$keysWarmed}");
        $this->info("Duration: {$duration}s");

        return self::SUCCESS;
    }

    private function getDefaultKeys(): array
    {
        return [
            'products:featured',
            'products:new_arrivals',
            'categories:all',
            'categories:tree',
            'settings:platform',
        ];
    }

    private function warmKeyPattern(string $pattern): int
    {
        $count = 0;

        switch ($pattern) {
            case 'products:featured':
                $products = Product::where('is_featured', true)
                    ->with(['images', 'variants', 'seller'])
                    ->limit(20)
                    ->get();
                Cache::put('products:featured', $products, now()->addHours(6));
                $count = $products->count();
                break;

            case 'products:new_arrivals':
                $products = Product::latest()
                    ->with(['images', 'variants'])
                    ->limit(20)
                    ->get();
                Cache::put('products:new_arrivals', $products, now()->addHours(6));
                $count = $products->count();
                break;

            case 'categories:all':
                $categories = Category::all();
                Cache::put('categories:all', $categories, now()->addDay());
                $count = $categories->count();
                break;

            case 'categories:tree':
                $tree = Category::whereNull('parent_id')
                    ->with('children')
                    ->get();
                Cache::put('categories:tree', $tree, now()->addDay());
                $count = $tree->count();
                break;

            case 'settings:platform':
                $settings = DB::table('settings')->pluck('value', 'key');
                Cache::put('settings:platform', $settings, now()->addDay());
                $count = $settings->count();
                break;

            default:
                // Generic cache warming for unknown patterns
                if (Cache::has($pattern)) {
                    Cache::touch($pattern);
                    $count = 1;
                }
        }

        return $count;
    }
}
