<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Payment;
use App\Models\SellerProfile;
use App\Models\User;
use App\Models\PaymentRecorder;

class SellerTestDataSeeder extends Seeder
{
    public function run()
    {
        $seller = SellerProfile::find(12);
        $user = User::find(28);
        
        $recorder = PaymentRecorder::first();
        if (!$recorder) {
            $recorder = PaymentRecorder::create([
                'user_id' => 1,
                'recorder_code' => 'REC001',
                'recorder_type' => 'shop_attendant',
                'recorder_location' => 'Main Shop',
                'status' => 'active'
            ]);
        }

        for ($i = 1; $i <= 10; $i++) {
            $orderTotal = rand(1000, 5000);
            
            $order = Order::create([
                'order_number' => 'ORD-' . date('Ymd') . '-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'user_id' => $user->id,
                'seller_id' => 12,
                'customer_phone' => '0723503743',
                'customer_email' => '5318.2021@students.ku.ac.ke',
                'customer_name' => 'NJENGA MAINA',
                'subtotal' => $orderTotal,
                'shipping_fee' => 200,
                'tax' => 0,
                'discount' => 0,
                'total' => $orderTotal + 200,
                'amount_received' => $orderTotal + 200,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'payment_method' => 'mpesa',
                'created_at' => now()->subDays(rand(0, 7))
            ]);

            $methods = ['cash', 'mpesa', 'bank_transfer'];
            $method = $methods[array_rand($methods)];
            $commission = $order->total * 0.15;
            
            Payment::create([
                'order_id' => $order->id,
                'seller_id' => 12,
                'sale_channel' => 'physical_shop',
                'payment_method' => $method,
                'transaction_id' => strtoupper($method) . '-REC001-MAIN-' . date('Ymd') . '-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'amount' => $order->total,
                'currency' => 'KES',
                'platform_commission_rate' => 15.00,
                'platform_commission_amount' => $commission,
                'seller_payout_amount' => $order->total - $commission,
                'status' => 'completed',
                'payout_status' => 'pending',
                'recorded_by_user_id' => $recorder->user_id,
                'recorder_type' => 'shop_attendant',
                'recorder_location' => 'Main Shop',
                'completed_at' => now()->subDays(rand(0, 7)),
                'recorded_from_ip' => '127.0.0.1'
            ]);
        }

        $this->command->info('Created ' . Order::where('seller_id', 12)->count() . ' orders');
        $this->command->info('Created ' . Payment::where('seller_id', 12)->count() . ' payments');
    }
}
