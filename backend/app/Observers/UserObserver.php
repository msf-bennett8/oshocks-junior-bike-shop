<?php

namespace App\Observers;

use App\Models\User;
use App\Models\SellerProfile;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     * Auto-create SellerProfile when user role changes to 'seller'
     */
    public function updated(User $user)
    {
        // Check if role was changed to 'seller'
        if ($user->isDirty('role') && $user->role === 'seller') {
            // Check if seller profile doesn't already exist
            if (!$user->sellerProfile) {
                try {
                    SellerProfile::create([
                        'user_id' => $user->id,
                        'business_name' => $user->name . "'s Shop",
                        'business_description' => 'New seller account - please update your business details',
                        'phone' => $user->phone ?? '',
                        'county' => '',
                        'sub_county' => '',
                        'ward' => '',
                        'street_address' => '',
                        'commission_rate' => 10.00,
                        'status' => 'pending', // Requires admin approval
                    ]);
                    
                    Log::info("✅ Auto-created SellerProfile for user: {$user->id}");
                } catch (\Exception $e) {
                    Log::error("❌ Failed to auto-create SellerProfile for user {$user->id}: " . $e->getMessage());
                }
            }
        }
    }
}