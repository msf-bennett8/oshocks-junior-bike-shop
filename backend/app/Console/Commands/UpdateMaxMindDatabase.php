<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class UpdateMaxMindDatabase extends Command
{
    protected $signature = 'maxmind:update';
    protected $description = 'Download latest MaxMind GeoLite2 database';

    public function handle(): int
    {
        $licenseKey = config('services.maxmind.license_key');
        
        if (!$licenseKey) {
            $this->error('MaxMind license key not configured');
            return 1;
        }

        $this->info('Downloading MaxMind GeoLite2-City database...');

        // Download URL with license key
        $url = "https://download.maxmind.com/app/geoip_download?" . http_build_query([
            'edition_id' => 'GeoLite2-City',
            'license_key' => $licenseKey,
            'suffix' => 'tar.gz',
        ]);

        try {
            $response = Http::withOptions(['timeout' => 300])->get($url);
            
            if (!$response->successful()) {
                $this->error('Download failed: ' . $response->status());
                return 1;
            }

            // Save tar.gz file
            $tarPath = storage_path('app/maxmind.tar.gz');
            file_put_contents($tarPath, $response->body());

            // Extract
            $this->info('Extracting database...');
            $extractPath = storage_path('app/maxmind_extract');
            
            // Create directory
            if (!is_dir($extractPath)) {
                mkdir($extractPath, 0755, true);
            }

            // Extract tar.gz
            $phar = new \PharData($tarPath);
            $phar->extractTo($extractPath);

            // Find the .mmdb file
            $files = glob($extractPath . '/**/*.mmdb');
            if (empty($files)) {
                $this->error('Could not find .mmdb file in archive');
                return 1;
            }

            // Move to final location
            $mmdbSource = $files[0];
            $mmdbDest = storage_path('app/GeoLite2-City.mmdb');
            
            rename($mmdbSource, $mmdbDest);

            // Cleanup
            unlink($tarPath);
            $this->deleteDirectory($extractPath);

            $this->info('MaxMind database updated successfully!');
            $this->info('Location: ' . $mmdbDest);
            $this->info('File size: ' . round(filesize($mmdbDest) / 1024 / 1024, 2) . ' MB');

            return 0;

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }
    }

    private function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) return;
        
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }
}