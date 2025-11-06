<?php

namespace App\Http\Controllers;

use App\Models\PaymentRecorder;
use Illuminate\Http\Request;

class PaymentRecorderController extends Controller
{
    /**
     * Display a listing of payment recorders
     */
    public function index(Request $request)
    {
        $query = PaymentRecorder::with('user');
        
        // Filter by recorder type
        if ($request->has('recorder_type')) {
            $query->where('recorder_type', $request->recorder_type);
        }
        
        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Search by location or recorder code
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('recorder_code', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }
        
        $recorders = $query->paginate(15);
        
        return response()->json($recorders);
    }

    /**
     * Display the specified payment recorder
     */
    public function show($id)
    {
        $recorder = PaymentRecorder::with('user')->findOrFail($id);
        
        return response()->json($recorder);
    }
}
