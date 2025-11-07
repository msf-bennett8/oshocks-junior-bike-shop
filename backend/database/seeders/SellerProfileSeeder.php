<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\SellerProfile;

class SellerProfileSeeder extends Seeder
{
    /**
     * Seed seller profiles for all users with 'seller' role
     * This ensures all sellers have profiles
     */
    public function run(): void
    {
        $sellers = User::where('role', 'seller')->get();
        
        foreach ($sellers as $seller) {
            // Only create if profile doesn't exist
            if (!$seller->sellerProfile) {
                SellerProfile::create([
                    'user_id' => $seller->id,
                    'business_name' => $seller->name . "'s Shop",
                    'business_description' => 'New seller account - please update your business details',
                    'phone' => $seller->phone ?? '',
                    'county' => '',
                    'sub_county' => '',
                    'ward' => '',
                    'street_address' => '',
                    'commission_rate' => 10.00,
                    'status' => 'approved', // Default to approved for seeding
                ]);
                
                $this->command->info("✅ Created SellerProfile for: {$seller->name} (ID: {$seller->id})");
            } else {
                $this->command->info("⏭️  SellerProfile already exists for: {$seller->name} (ID: {$seller->id})");
            }
        }
        
        $this->command->info("✅ SellerProfile seeding complete!");
    }
}