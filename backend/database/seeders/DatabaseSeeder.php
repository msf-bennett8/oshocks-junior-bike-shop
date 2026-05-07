<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Default test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            CategorySeeder::class,
            SellerProfileSeeder::class,
            ProductSeeder::class,
            PlatformSettingsSeeder::class,
            NotificationTemplateSeeder::class,
            SupportCaseSeeder::class,
        ]);
    }
}
