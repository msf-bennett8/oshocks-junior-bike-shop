<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PaymentRecorder;
use Illuminate\Support\Facades\Hash;

class TestPaymentRecorderSeeder extends Seeder
{
    public function run()
    {
        // Create test user
        $user = User::firstOrCreate(
            ['email' => 'delivery@test.com'],
            [
                'name' => 'Test Delivery Agent',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // Create payment recorder record
        PaymentRecorder::firstOrCreate(
            ['user_id' => $user->id],
            [
                'recorder_type' => 'delivery_agent',
                'location' => 'NAIROBI',
                'recorder_code' => 'DA001',
                'is_active' => true,
            ]
        );

        $this->command->info('✅ Test payment recorder created:');
        $this->command->info('   Email: delivery@test.com');
        $this->command->info('   Password: password123');
        $this->command->info('   Recorder Code: DA001');
        $this->command->info('   User ID: ' . $user->id);
    }
}