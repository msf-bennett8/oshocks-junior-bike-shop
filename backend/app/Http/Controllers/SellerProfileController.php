<?php

namespace App\Http\Controllers;

use App\Models\SellerProfile;
use Illuminate\Http\Request;

class SellerProfileController extends Controller
{
    /**
     * Display a listing of sellers
     */
    public function index(Request $request)
    {
        $query = SellerProfile::with('user');
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Search by business name
        if ($request->has('search')) {
            $query->where('business_name', 'like', '%' . $request->search . '%');
        }
        
        $sellers = $query->paginate(15);
        
        return response()->json($sellers);
    }

    /**
     * Display the specified seller
     */
    public function show($id)
    {
        $seller = SellerProfile::with('user')->findOrFail($id);
        
        return response()->json($seller);
    }

    /**
     * Get seller's products
     */
    public function products($id)
    {
        $seller = SellerProfile::findOrFail($id);
        $products = $seller->products()->paginate(20);
        
        return response()->json($products);
    }
}