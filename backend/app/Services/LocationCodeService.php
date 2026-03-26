<?php

namespace App\Services;

/**
 * Maps counties, zones, and areas to 3-2-3 character codes
 */
class LocationCodeService
{
    // County mappings (3 chars)
    private static array $counties = [
        'Nairobi County' => 'NRB',
        'Machakos County' => 'MCH',
        'Kiambu County' => 'KMB',
        'Kajiado County' => 'KJD',
        'Other (Arrange own courier)' => 'OTH',
    ];
    
    // Zone mappings (2 chars) - will be built from checkout page data
    private static array $zones = [
        // Direct area mappings (when area name is passed as zone)
        'Kangundo' => 'Z2',
        'Machakos Town' => 'Z2',
        'Tala' => 'Z2',
        'Athi River' => 'Z1',
        'Katani' => 'Z1',
        'Mlolongo' => 'Z1',
        'Kitengela' => 'K1',
        'Ongata Rongai' => 'K1',
        'Kiserian' => 'K2',
        'Kajiado Town' => 'K2',
        'Kahawa West' => 'KA',
        'Kahawa Sukari' => 'KA',
        'Kahawa Wendani' => 'KA',
        'Mwiki' => 'KA',
        'Kasarani' => 'KA',
        'Roysambu' => 'RB',
        'Garden Estate' => 'RB',
        'Thome' => 'RB',
        'Ruaraka' => 'RB',
        'Pangani' => 'PK',
        'Muthaiga' => 'PK',
        'Parklands' => 'PK',
        'CBD' => 'CW',
        'Westlands' => 'CW',
        'Karen' => 'KS',
        'Langata' => 'KS',
        'Ngong' => 'OL',
        
        // Nairobi zones
        'Kasarani Area (0-5km)' => 'KA',
        'Roysambu Area (5-10km)' => 'RB',
        'Parklands Area (10-15km)' => 'PK',
        'CBD & Westlands (15-25km)' => 'CW',
        'Karen & Suburbs (25-40km)' => 'KS',
        'Outer Limits (40-50km)' => 'OL',
        
        // Machakos zones
        'Zone 1 (40-60km)' => 'Z1',
        'Zone 2 (60-80km)' => 'Z2',
        
        // Kiambu zones
        'Githurai Area (0-10km)' => 'GT',
        'Ruiru Area (10-20km)' => 'RU',
        'Ruaka & Kikuyu (20-30km)' => 'RK',
        'Thika Town (30-45km)' => 'TK',
        'Far Kiambu (45km+)' => 'FK',
        
        // Kajiado zones
        'Zone 1 (35-50km)' => 'K1',
        'Zone 2 (50-70km)' => 'K2',
        
        // Other
        'Self-arranged courier service' => 'SC',
    ];
    
    // Area mappings (3 chars) - extracted from locations in checkout page
    private static array $areas = [
        // Nairobi areas
        'Kahawa West' => 'KHW',
        'Kahawa Sukari' => 'KSU',
        'Kahawa Wendani' => 'KWN',
        'Mwiki' => 'MWK',
        'Kasarani (parts near Mwiki)' => 'KPM',
        'Kasarani' => 'KAS',
        'Roysambu' => 'RYB',
        'Garden Estate' => 'GES',
        'Thome' => 'THO',
        'Ruaraka' => 'RUA',
        'Lucky Summer' => 'LSU',
        'Clay City' => 'CCY',
        'Pangani' => 'PAN',
        'Muthaiga' => 'MUT',
        'Parklands' => 'PKL',
        'Highridge' => 'HGR',
        'Ngara' => 'NGA',
        'Eastleigh' => 'EST',
        'Huruma' => 'HUR',
        'Mathare' => 'MAT',
        'Kariobangi' => 'KBG',
        'CBD' => 'CBD',
        'Westlands' => 'WST',
        'Kilimani' => 'KLM',
        'Kileleshwa' => 'KLE',
        'Lavington' => 'LAV',
        'Upper Hill' => 'UHL',
        'South B' => 'SOB',
        'South C' => 'SOC',
        'Buru Buru' => 'BBU',
        'Donholm' => 'DON',
        'Umoja' => 'UMO',
        'Embakasi' => 'EMB',
        'Starehe' => 'STA',
        'Hurlingham' => 'HUR',
        'Spring Valley' => 'SPV',
        'Madaraka' => 'MAD',
        'Industrial Area' => 'IND',
        'Dagoretti' => 'DAG',
        'Kariokor' => 'KOK',
        'Loresho' => 'LOR',
        'Karen' => 'KAR',
        'Langata' => 'LAN',
        'Runda' => 'RUN',
        'Gigiri' => 'GIG',
        'Kitisuru' => 'KIT',
        'Nairobi West' => 'NWB',
        'Ruai' => 'RUI',
        'Utawala' => 'UTA',
        'Syokimau' => 'SYK',
        'Ngong' => 'NGO',
        'Mlolongo' => 'MLO',
        
        // Machakos areas
        'Athi River' => 'ATH',
        'Katani' => 'KAT',
        'Machakos Town' => 'MCT',
        'Tala' => 'TAL',
        'Kangundo' => 'KAN',
        
        // Kiambu areas
        'Githurai 44' => 'G44',
        'Githurai 45' => 'G45',
        'Zimmerman' => 'ZIM',
        'Kiambu Town' => 'KTN',
        'Thindigua' => 'THI',
        'Ridgeways' => 'RDG',
        'Ruiru Town' => 'RUT',
        'Juja Road' => 'JRD',
        'Bypass (Kiambu Road)' => 'BYP',
        'Cianda' => 'CIA',
        'Village Market area' => 'VMA',
        'Ndumberi' => 'NDU',
        'Membley' => 'MEM',
        'Ruaka' => 'RUA',
        'Rosslyn' => 'ROS',
        'Limuru' => 'LIM',
        'Kikuyu' => 'KIK',
        'Kabete' => 'KAB',
        'Banana Hill' => 'BNH',
        'Wangige' => 'WAN',
        'Thika Town' => 'TTN',
        'Juja Town' => 'JTN',
        'Kalimoni' => 'KAL',
        'Gatuanyaga' => 'GAT',
        'Makongeni (Thika)' => 'MKT',
        'Gatundu' => 'GTD',
        'Gatanga' => 'GTG',
        'Githunguri' => 'GTH',
        'Lari' => 'LAR',
        'Karuri' => 'KRR',
        
        // Kajiado areas
        'Kitengela' => 'KTL',
        'Ongata Rongai' => 'ORG',
        'Kiserian' => 'KIS',
        'Kajiado Town' => 'KJT',
        
        // Other
        'Contact us' => 'CUS',
    ];
    
    /**
     * Get county code
     */
    public static function getCountyCode(string $county): string
    {
        return self::$counties[$county] ?? 'UNK';
    }
    
    /**
     * Get zone code
     */
    public static function getZoneCode(string $zone): string
    {
        // First try exact match
        if (isset(self::$zones[$zone])) {
            return self::$zones[$zone];
        }
        
        // Extract zone name before " - " if present
        $zoneName = explode(' - ', $zone)[0];
        if (isset(self::$zones[$zoneName])) {
            return self::$zones[$zoneName];
        }
        
        // Try fuzzy match - check if input contains zone key or vice versa
        foreach (self::$zones as $zoneKey => $code) {
            // Remove distances and parentheses for comparison
            $cleanZoneKey = preg_replace('/\s*\([^)]*\)/', '', $zoneKey);
            $cleanInput = preg_replace('/\s*\([^)]*\)/', '', $zoneName);
            
            if (stripos($zone, $zoneKey) !== false || 
                stripos($zoneKey, $zone) !== false ||
                stripos($cleanInput, $cleanZoneKey) !== false ||
                stripos($cleanZoneKey, $cleanInput) !== false) {
                return $code;
            }
        }
        
        // Log warning for debugging
        \Log::warning('Zone not found, using ZZ', [
            'zone' => $zone, 
            'zoneName' => $zoneName,
            'available_zones' => array_keys(self::$zones)
        ]);
        
        return 'ZZ';
    }
    
    /**
     * Get area code
     */
    public static function getAreaCode(string $area): string
    {
        // Exact match
        if (isset(self::$areas[$area])) {
            return self::$areas[$area];
        }
        
        // Try fuzzy match
        foreach (self::$areas as $areaKey => $code) {
            if (stripos($area, $areaKey) !== false || 
                stripos($areaKey, $area) !== false) {
                return $code;
            }
        }
        
        // Log warning for debugging
        \Log::warning('Area not found, using UNK', [
            'area' => $area,
            'available_areas' => array_keys(self::$areas)
        ]);
        
        return 'UNK';
    }
    
    /**
     * Generate full location code: COUNTY-ZONE-AREA
     */
    public static function generateLocationCode(string $county, string $zone, string $area): string
    {
        $countyCode = self::getCountyCode($county);
        $zoneCode = self::getZoneCode($zone);
        $areaCode = self::getAreaCode($area);
        
        return "{$countyCode}{$zoneCode}{$areaCode}";
    }
    
    /**
     * Parse location code back to components
     */
    public static function parseLocationCode(string $code): array
    {
        if (strlen($code) !== 8) {
            return ['county' => 'UNK', 'zone' => 'ZZ', 'area' => 'UNK'];
        }
        
        return [
            'county' => substr($code, 0, 3),
            'zone' => substr($code, 3, 2),
            'area' => substr($code, 5, 3),
        ];
    }
}