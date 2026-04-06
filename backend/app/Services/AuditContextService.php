<?php

namespace App\Services;

use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AuditContextService
{
    private static array $context = [];

    /**
     * Initialize audit context from request
     */
    public static function initialize(): void
    {
        $request = Request::instance();
        
        // Get the real client IP from forwarded headers (Railway/Vercel setup)
        $realIp = self::getRealClientIp($request);
        
        self::$context = [
            'correlation_id' => $request->attributes->get('correlation_id') ?? (string) Str::uuid(),
            'request_id' => $request->attributes->get('request_id') ?? (string) Str::uuid(),
            'session_id' => self::getSessionId(),
            'ip_address' => self::hashIp($realIp),
            'user_agent' => self::truncateUserAgent($request->userAgent()),
            'referrer' => $request->header('Referer'),
            'geolocation' => self::getGeolocation($realIp),
            'timestamp' => now()->toIso8601String(),
            'request_duration_ms' => null, // Set by middleware after response
        ];
    }

    /**
     * Get current context
     */
    public static function getContext(): array
    {
        if (empty(self::$context)) {
            self::initialize();
        }
        
        return self::$context;
    }

    /**
     * Get specific context value
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return self::getContext()[$key] ?? $default;
    }

    /**
     * Set context value
     */
    public static function set(string $key, mixed $value): void
    {
        self::$context[$key] = $value;
    }

    /**
     * Get session ID
     */
    private static function getSessionId(): ?string
    {
        $request = Request::instance();
        
        // Try to get from auth token
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            return hash('sha256', substr($token, 0, 20));
        }
        
        // Try Laravel session
        if ($request->hasSession()) {
            return $request->session()->getId();
        }
        
        return null;
    }

    /**
     * Get the real client IP from forwarded headers
     * Handles Railway, Vercel, Cloudflare, and other proxy setups
     */
    private static function getRealClientIp($request): ?string
    {
        // Check for forwarded IP headers (in order of priority)
        $headers = [
            'X-Forwarded-For',  // Standard proxy header (contains client IP + proxy IPs)
            'X-Real-IP',        // Nginx/Railway real IP
            'CF-Connecting-IP', // Cloudflare
            'True-Client-IP',   // Akamai/Enterprise
        ];

        foreach ($headers as $header) {
            $value = $request->header($header);
            if ($value) {
                // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
                // We want the first (client) IP
                if ($header === 'X-Forwarded-For') {
                    $ips = explode(',', $value);
                    $clientIp = trim($ips[0]); // First IP is the real client
                    if (filter_var($clientIp, FILTER_VALIDATE_IP)) {
                        Log::debug('Using IP from X-Forwarded-For', ['ip' => $clientIp, 'full_header' => $value]);
                        return $clientIp;
                    }
                } else {
                    if (filter_var($value, FILTER_VALIDATE_IP)) {
                        Log::debug('Using IP from header', ['header' => $header, 'ip' => $value]);
                        return $value;
                    }
                }
            }
        }

        // Fallback to Laravel's detected IP
        $fallbackIp = $request->ip();
        Log::debug('Using fallback request IP', ['ip' => $fallbackIp]);
        return $fallbackIp;
    }

    /**
     * Hash IP address for privacy
     */
    private static function hashIp(?string $ip): ?string
    {
        if (!$ip) return null;
        
        if (!config('audit.pii.hash_ips', true)) {
            return $ip;
        }

        // Anonymize: keep first 2 octets only
        $parts = explode('.', $ip);
        if (count($parts) === 4) {
            return $parts[0] . '.' . $parts[1] . '.x.x';
        }

        return hash('sha256', $ip . config('app.key'));
    }

    /**
     * Truncate user agent
     */
    private static function truncateUserAgent(?string $userAgent): ?string
    {
        if (!$userAgent) return null;
        
        $limit = config('audit.pii.truncate_user_agent', 500);
        return substr($userAgent, 0, $limit);
    }

    /**
     * Get geolocation from IP
     */
    private static function getGeolocation(?string $ip): ?array
    {
        if (!$ip || !config('audit.geolocation.enabled')) {
            Log::debug('Geolocation skipped', ['reason' => 'disabled_or_no_ip', 'ip' => $ip]);
            return null;
        }

        // Get full geolocation data from detection service
        $geoData = self::detectCountry($ip);
        
        if (!$geoData) {
            Log::warning('Geolocation lookup returned null', ['ip' => $ip]);
        } else {
            Log::debug('Geolocation lookup successful', [
                'ip' => $ip, 
                'country' => $geoData['country'] ?? 'unknown',
                'city' => $geoData['city'] ?? 'unknown'
            ]);
        }
        
        return $geoData;
    }

    /**
     * Get geolocation data from IP using configured service
     */
    private static function detectCountry(string $ip): ?array
    {
        if (!config('audit.geolocation.enabled')) {
            Log::debug('Geolocation disabled in config');
            return null;
        }

        // Skip private IPs
        if (self::isPrivateIp($ip)) {
            Log::debug('Private IP detected, returning local', ['ip' => $ip]);
            return ['country' => 'Local', 'region' => 'Private', 'city' => 'Private', 'country_code' => 'LOCAL'];
        }

        $cacheKey = "geo:{$ip}";
        $circuitBreakerKey = "geo_circuit_breaker";
        $rateLimitKey = "geo_rate_limit";

        // Check if circuit breaker is open (too many failures)
        if (Cache::has($circuitBreakerKey)) {
            Log::warning('Geolocation circuit breaker is open, skipping lookup');
            // Try to return cached value even if expired
            $cached = Cache::get($cacheKey);
            if ($cached) return $cached;
            return null;
        }

        // Check if we're rate limited
        if (Cache::has($rateLimitKey)) {
            Log::warning('Geolocation rate limited, using cache or null');
            $cached = Cache::get($cacheKey);
            if ($cached) return $cached;
            return null;
        }

        // Check cache first
        $cached = Cache::get($cacheKey);
        if ($cached) {
            Log::debug('Geolocation cache hit', ['ip' => $ip, 'country' => $cached['country'] ?? 'unknown']);
            return $cached;
        }

        try {
            $service = config('audit.geolocation.service', 'maxmind');
            Log::debug('Starting geolocation lookup', ['ip' => $ip, 'service' => $service]);

            $result = match($service) {
                'ipapi' => self::lookupIpApi($ip, $cacheKey),
                'ipinfo' => self::lookupIpInfo($ip, $cacheKey),
                'maxmind' => self::lookupMaxMind($ip, $cacheKey),
                default => null,
            };

            if (!$result) {
                Log::warning('Geolocation service returned null', ['ip' => $ip, 'service' => $service]);
            }

            return $result;

        } catch (\Exception $e) {
            Log::error('Geolocation lookup failed with exception', [
                'ip' => $ip,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check if IP is private/local
     */
    private static function isPrivateIp(string $ip): bool
    {
        return !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
    }

    /**
     * Lookup via local MaxMind GeoLite2 database
     */
    private static function lookupMaxMind(string $ip, string $cacheKey): ?array
    {
        $dbPath = config('services.maxmind.database_path');

        // Auto-download if missing (for Railway ephemeral containers)
        if (!file_exists($dbPath)) {
            Log::info('MaxMind DB not found, attempting download...');
            $downloaded = self::downloadMaxMindDatabase($dbPath);
            if (!$downloaded) {
                return null;
            }
        }

        try {
            $reader = new \GeoIp2\Database\Reader($dbPath);
            $record = $reader->city($ip);

            $result = [
                'country' => $record->country->name,
                'country_code' => $record->country->isoCode,
                'region' => $record->mostSpecificSubdivision->name,
                'city' => $record->city->name,
                'latitude' => $record->location->latitude,
                'longitude' => $record->location->longitude,
                'postal' => $record->postal->code,
                'timezone' => $record->location->timeZone,
                'isp' => null, // GeoLite2-City doesn't include ISP (need GeoLite2-ASN)
            ];

            // Cache for 30 days (local DB lookups are free!)
            Cache::put($cacheKey, $result, now()->addDays(30));

            Log::debug('MaxMind lookup successful', [
                'ip' => $ip,
                'city' => $result['city'],
                'country' => $result['country']
            ]);

            return $result;

        } catch (\GeoIp2\Exception\AddressNotFoundException $e) {
            Log::debug('MaxMind: IP not found in database', ['ip' => $ip]);
            return null;
        } catch (\Exception $e) {
            Log::error('MaxMind lookup failed', ['ip' => $ip, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Download MaxMind database on-demand (for Railway/serverless)
     */
    private static function downloadMaxMindDatabase(string $destPath): bool
    {
        $licenseKey = config('services.maxmind.license_key');
        
        if (!$licenseKey) {
            Log::error('Cannot download MaxMind: no license key configured');
            return false;
        }

        try {
            $url = "https://download.maxmind.com/app/geoip_download?" . http_build_query([
                'edition_id' => 'GeoLite2-City',
                'license_key' => $licenseKey,
                'suffix' => 'tar.gz',
            ]);

            Log::info('Downloading MaxMind database...');

            // Download to temp
            $tempTar = sys_get_temp_dir() . '/maxmind.tar.gz';
            $response = Http::timeout(120)->get($url);
            
            if (!$response->successful()) {
                Log::error('MaxMind download failed', ['status' => $response->status()]);
                return false;
            }
            
            file_put_contents($tempTar, $response->body());

            // Extract
            $tempExtract = sys_get_temp_dir() . '/maxmind_extract';
            if (!is_dir($tempExtract)) mkdir($tempExtract, 0755, true);
            
            $phar = new \PharData($tempTar);
            $phar->extractTo($tempExtract);

            // Find and move .mmdb file
            $files = glob($tempExtract . '/**/*.mmdb');
            if (empty($files)) {
                Log::error('MaxMind .mmdb not found in archive');
                return false;
            }

            // Ensure destination directory exists
            $destDir = dirname($destPath);
            if (!is_dir($destDir)) mkdir($destDir, 0755, true);

            rename($files[0], $destPath);
            
            // Cleanup
            unlink($tempTar);
            self::deleteDirectory($tempExtract);

            Log::info('MaxMind database downloaded successfully', [
                'path' => $destPath,
                'size_mb' => round(filesize($destPath) / 1024 / 1024, 2)
            ]);
            
            return true;

        } catch (\Exception $e) {
            Log::error('Failed to download MaxMind database', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Delete directory recursively
     */
    private static function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) return;
        
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            is_dir($path) ? self::deleteDirectory($path) : unlink($path);
        }
        rmdir($dir);
    }

    /**
     * Lookup via ipapi.co (free tier: 1000 requests/day)
     */
    private static function lookupIpApi(string $ip, string $cacheKey): ?array
    {
        $apiKey = config('services.ipapi.key');
        $url = $apiKey 
            ? "https://ipapi.co/{$ip}/json/?key={$apiKey}"
            : "https://ipapi.co/{$ip}/json/";

        $circuitBreakerKey = "geo_circuit_breaker";
        $rateLimitKey = "geo_rate_limit";

        try {
            $response = Http::timeout(5)->get($url);
            
            // Handle rate limiting (429)
            if ($response->status() === 429) {
                Log::error('ipapi.co rate limit hit (429)', ['ip' => $ip]);
                Cache::put($circuitBreakerKey, true, now()->addHours(1));
                Cache::put($rateLimitKey, true, now()->addHours(1));
                return null;
            }

            if (!$response->successful()) {
                Log::warning('ipapi.co request failed', [
                    'ip' => $ip,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $data = $response->json();
            
            if (isset($data['error']) || isset($data['reserved'])) {
                Log::debug('ipapi.co returned error/reserved', ['ip' => $ip, 'response' => $data]);
                return null;
            }

            $result = [
                'country' => $data['country_name'] ?? $data['country'] ?? null,
                'country_code' => $data['country_code'] ?? null,
                'region' => $data['region'] ?? null,
                'city' => $data['city'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'isp' => $data['org'] ?? $data['asn'] ?? null,
            ];

            // Cache for 48 hours (longer cache to reduce API calls)
            Cache::put($cacheKey, $result, now()->addHours(48));
            
            Log::debug('ipapi.co lookup successful', ['ip' => $ip, 'country' => $result['country']]);
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error('ipapi.co lookup exception', [
                'ip' => $ip, 
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Lookup via ipinfo.io
     */
    private static function lookupIpInfo(string $ip, string $cacheKey): ?array
    {
        $token = config('services.ipinfo.token');
        
        if (!$token) {
            Log::error('ipinfo.io token not configured');
            return null;
        }

        $url = "https://ipinfo.io/{$ip}/json?token={$token}";

        try {
            $response = Http::timeout(5)->get($url);
            
            if ($response->status() === 429) {
                Log::error('ipinfo.io rate limit hit');
                Cache::put('geo_circuit_breaker', true, now()->addHours(6));
                return null;
            }

            if (!$response->successful()) {
                Log::warning('ipinfo.io request failed', ['status' => $response->status()]);
                return null;
            }

            $data = $response->json();
            
            // Parse loc "latitude,longitude" into separate fields
            $loc = $data['loc'] ?? null;
            $latitude = null;
            $longitude = null;
            
            if ($loc && str_contains($loc, ',')) {
                [$latitude, $longitude] = explode(',', $loc);
            }

            $result = [
                'country' => $data['country_name'] ?? $data['country'] ?? null,
                'country_code' => $data['country'] ?? null,
                'region' => $data['region'] ?? null,
                'city' => $data['city'] ?? null,
                'latitude' => $latitude ? (float) $latitude : null,
                'longitude' => $longitude ? (float) $longitude : null,
                'isp' => $data['org'] ?? null,
            ];

            // Cache for 7 days (ipinfo allows 50k/month, so we can be generous)
            Cache::put($cacheKey, $result, now()->addDays(7));

            Log::debug('ipinfo.io lookup successful', ['ip' => $ip, 'city' => $result['city']]);
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error('ipinfo.io lookup exception', ['ip' => $ip, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Clear context
     */
    public static function clear(): void
    {
        self::$context = [];
    }
}