<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

//Test route to test claudinary upload
use App\Services\CloudinaryService;

Route::get('/test-cloudinary', function (CloudinaryService $cloudinary) {
    return response()->json([
        'status' => 'Cloudinary service is working!',
        'config' => [
            'cloud_name' => config('cloudinary.cloud_name'),
            'connected' => true
        ]
    ]);
});
