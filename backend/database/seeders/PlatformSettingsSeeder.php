<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'default_commission_rate',
                'value' => '15.00',
                'type' => 'decimal',
                'description' => 'Default platform commission rate in percentage (e.g., 15.00 for 15%)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'platform_name',
                'value' => 'Oshocks Marketplace',
                'type' => 'string',
                'description' => 'Platform name displayed in communications',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'currency',
                'value' => 'KES',
                'type' => 'string',
                'description' => 'Default currency code',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Platform settings seeded successfully!');
    }
}
