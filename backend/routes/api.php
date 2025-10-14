<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductVariantController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\SellerProfileController;
use App\Http\Controllers\SellerReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\CouponUsageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\Api\SearchController;

// Public authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
});

// Search Routes
Route::prefix('search')->group(function () {
    Route::get('/', [SearchController::class, 'search']);
    Route::get('/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/trending', [SearchController::class, 'trending']);
});

// Public routes
Route::prefix('v1')->group(function () {
    
    // Public product browsing
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
    Route::get('/products/{id}/variants', [ProductVariantController::class, 'getByProduct']);
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getByProduct']);
    
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/categories/{id}/products', [CategoryController::class, 'getProducts']);
    
    // Seller profiles (public view)
    Route::get('/sellers', [SellerProfileController::class, 'index']);
    Route::get('/sellers/{id}', [SellerProfileController::class, 'show']);
    Route::get('/sellers/{id}/products', [SellerProfileController::class, 'getProducts']);
    Route::get('/sellers/{id}/reviews', [SellerReviewController::class, 'getBySeller']);
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Auth user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Cart
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/items', [CartItemController::class, 'store']);
    Route::put('/cart/items/{id}', [CartItemController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartItemController::class, 'destroy']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    
    // Wishlist
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'destroy']);
    
    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    
    // Addresses
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/set-default', [AddressController::class, 'setDefault']);
    
    // Payments
    Route::post('/payments/mpesa/initiate', [PaymentController::class, 'initiateMpesa']);
    Route::post('/payments/card/initiate', [PaymentController::class, 'initiateCard']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    
    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    
    // Seller reviews
    Route::post('/seller-reviews', [SellerReviewController::class, 'store']);
    
    // Coupons
    Route::post('/coupons/validate', [CouponController::class, 'validate']);
    Route::post('/coupons/apply', [CouponUsageController::class, 'apply']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Seller routes
    Route::prefix('seller')->middleware('role:seller')->group(function () {
        
        // Seller profile
        Route::get('/profile', [SellerProfileController::class, 'myProfile']);
        Route::post('/profile', [SellerProfileController::class, 'createProfile']);
        Route::put('/profile', [SellerProfileController::class, 'updateProfile']);
        
        // Seller products
        Route::get('/products', [ProductController::class, 'myProducts']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        
        // Product variants
        Route::post('/products/{id}/variants', [ProductVariantController::class, 'store']);
        Route::put('/variants/{id}', [ProductVariantController::class, 'update']);
        Route::delete('/variants/{id}', [ProductVariantController::class, 'destroy']);
        
        // Product images
        Route::post('/products/{id}/images', [ProductImageController::class, 'store']);
        Route::delete('/images/{id}', [ProductImageController::class, 'destroy']);
        Route::put('/images/{id}/set-primary', [ProductImageController::class, 'setPrimary']);
        
        // Seller orders
        Route::get('/orders', [OrderController::class, 'sellerOrders']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        
        // Analytics
        Route::get('/analytics/sales', [OrderController::class, 'salesAnalytics']);
        Route::get('/analytics/products', [ProductController::class, 'productAnalytics']);
    });
    
    // Admin routes
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        
        // User management
        Route::get('/users', [AuthController::class, 'getAllUsers']);
        Route::put('/users/{id}/status', [AuthController::class, 'updateUserStatus']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
        
        // Seller management
        Route::get('/sellers/pending', [SellerProfileController::class, 'pendingSellers']);
        Route::put('/sellers/{id}/approve', [SellerProfileController::class, 'approve']);
        Route::put('/sellers/{id}/reject', [SellerProfileController::class, 'reject']);
        Route::put('/sellers/{id}/suspend', [SellerProfileController::class, 'suspend']);
        
        // Category management
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
        
        // Product management
        Route::get('/products/all', [ProductController::class, 'allProducts']);
        Route::put('/products/{id}/feature', [ProductController::class, 'toggleFeatured']);
        Route::delete('/products/{id}/force', [ProductController::class, 'forceDelete']);
        
        // Order management
        Route::get('/orders/all', [OrderController::class, 'allOrders']);
        Route::get('/orders/stats', [OrderController::class, 'orderStats']);
        
        // Coupon management
        Route::get('/coupons', [CouponController::class, 'index']);
        Route::post('/coupons', [CouponController::class, 'store']);
        Route::put('/coupons/{id}', [CouponController::class, 'update']);
        Route::delete('/coupons/{id}', [CouponController::class, 'destroy']);
        
        // Settings
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
        
        // Activity logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);
    });
});

// M-Pesa callback (public - called by Safaricom)
Route::post('/v1/payments/mpesa/callback', [PaymentController::class, 'mpesaCallback']);

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});
