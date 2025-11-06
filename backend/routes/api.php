<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialAuthController;
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
use App\Http\Controllers\Api\OrderController;
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
use App\Http\Controllers\Api\Seller\ProductController as SellerProductController;
use App\Http\Controllers\Dashboard\OwnerDashboardController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\Dashboard\PayoutController;

// ============================================================================
// OAUTH ROUTES - STATELESS (No CSRF, No Session)
// ============================================================================
Route::prefix('v1/auth')->group(function () {
    Route::post('/google', [SocialAuthController::class, 'handleGoogleCallback']);
    Route::post('/strava', [SocialAuthController::class, 'handleStravaCallback']);
});

// Public routes
Route::prefix('v1')->group(function () {
    
    // Public authentication routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Public product browsing
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
    Route::get('/products/{id}/variants', [ProductVariantController::class, 'getByProduct']);
    Route::get('/products/{id}/reviews', [ReviewController::class, 'getByProduct']);
    
    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/categories/{id}/products', [CategoryController::class, 'getProducts']);
    
   // Cart routes - Public but checks for authentication if token provided
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/items/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clearCart']);
    
    // Wishlist routes - Public but checks for authentication if token provided
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist/add', [WishlistController::class, 'addItem']);
    Route::post('/wishlist/check', [WishlistController::class, 'checkItem']);
    Route::delete('/wishlist/items/{itemId}', [WishlistController::class, 'removeItem']);
    Route::delete('/wishlist/remove-by-product', [WishlistController::class, 'removeByProduct']);
    Route::delete('/wishlist/clear', [WishlistController::class, 'clearWishlist']);

    // search
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/search/trending', [SearchController::class, 'trending']);
    
    // Seller profiles (public view)
    Route::get('/sellers', [SellerProfileController::class, 'index']);
    Route::get('/sellers/{id}', [SellerProfileController::class, 'show']);
    Route::get('/sellers/{id}/products', [SellerProfileController::class, 'getProducts']);
    Route::get('/sellers/{id}/reviews', [SellerReviewController::class, 'getBySeller']);
    
    // Payment Recorders (public view)
    Route::get('/payment-recorders', [\App\Http\Controllers\PaymentRecorderController::class, 'index']);
    Route::get('/payment-recorders/{id}', [\App\Http\Controllers\PaymentRecorderController::class, 'show']);
    
    // ============================================================================
    // ORDER ROUTES - PUBLIC (Guest checkout allowed)
    // ============================================================================
    // Create order (no auth required for guest checkout)
    Route::post('/orders/create', [OrderController::class, 'store']);
    
    // ⚠️ NOTE: Dynamic route /orders/{orderNumber} moved to END of file
    // to prevent it from catching specific routes like /orders/pending-payments
});

// Protected routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    
    // Protected authentication routes
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    
    // Secret elevation endpoint (works for any authenticated user)
    Route::post('/auth/secret-elevate', [AuthController::class, 'secretElevate']);
    
    // Admin/Super Admin privilege revocation
    Route::post('/auth/revoke-privileges', [AuthController::class, 'revokePrivileges']);
    
    // ============================================================================
    // AUDIT LOG ROUTES (Admin/Super Admin only) - SPECIFIC ROUTES FIRST
    // ============================================================================
    Route::get('/audit-logs/stats', [\App\Http\Controllers\Api\AuditLogController::class, 'stats']);
    Route::get('/audit-logs/suspicious', [\App\Http\Controllers\Api\AuditLogController::class, 'suspicious']);
    Route::get('/audit-logs/export', [\App\Http\Controllers\Api\AuditLogController::class, 'export']);
    Route::get('/audit-logs/category/{category}', [\App\Http\Controllers\Api\AuditLogController::class, 'byCategory']);
    Route::get('/audit-logs/user/{userId}', [\App\Http\Controllers\Api\AuditLogController::class, 'userLogs']);
    Route::get('/audit-logs/retention/stats', [App\Http\Controllers\Api\AuditLogController::class, 'retentionStats']);
    Route::post('/audit-logs/retention/cleanup', [App\Http\Controllers\Api\AuditLogController::class, 'runCleanup']);
    Route::get('/audit-logs/archives', [App\Http\Controllers\Api\AuditLogController::class, 'archives']);
    Route::get('/audit-logs/archives/{id}', [App\Http\Controllers\Api\AuditLogController::class, 'showArchive']);
    Route::get('/audit-logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('/audit-logs/{id}', [\App\Http\Controllers\Api\AuditLogController::class, 'show']);
    
    // ============================================================================
    // ORDER MANAGEMENT ROUTES
    // ============================================================================
    // Order status management
    Route::put('/orders/{orderNumber}/status', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    Route::post('/orders/{orderNumber}/cancel', [App\Http\Controllers\Api\OrderController::class, 'cancelOrder']);
    
    // Payment Recorder Routes - MUST COME BEFORE GENERAL ORDER ROUTES
    Route::get('/orders/pending-payments', [OrderController::class, 'getPendingPayments']);
    Route::get('/orders/search', [OrderController::class, 'searchByOrderNumber']);
    Route::post('/orders/{orderNumber}/record-payment', [OrderController::class, 'recordPayment']);
    
    // Orders (Protected - User's own orders)
    Route::get('/orders', [OrderController::class, 'index']);
    
    // Auth user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Wishlist protected features (move to cart)
    Route::prefix('wishlist')->group(function () {
        Route::post('/move-to-cart/{itemId}', [WishlistController::class, 'moveToCart']);
        Route::post('/move-all-to-cart', [WishlistController::class, 'moveAllToCart']);
    });
    
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
    
    // ============================================================================
    // SELLER ROUTES WITH CLOUDINARY SUPPORT
    // ============================================================================
    Route::prefix('seller')->group(function () {
        
        // Seller profile
        Route::get('/profile', [SellerProfileController::class, 'myProfile']);
        Route::post('/profile', [SellerProfileController::class, 'createProfile']);
        Route::put('/profile', [SellerProfileController::class, 'updateProfile']);
        
        // Seller products (NEW - Cloudinary enabled)
        Route::get('/products', [SellerProductController::class, 'index']);
        Route::post('/products', [SellerProductController::class, 'store']);
        Route::get('/products/{id}', [SellerProductController::class, 'show']);
        Route::put('/products/{id}', [SellerProductController::class, 'update']);
        Route::post('/products/{id}', [SellerProductController::class, 'update']); // For FormData with _method=PUT
        Route::delete('/products/{id}', [SellerProductController::class, 'destroy']);
        
        // Product variants (keep existing)
        Route::post('/products/{id}/variants', [ProductVariantController::class, 'store']);
        Route::put('/variants/{id}', [ProductVariantController::class, 'update']);
        Route::delete('/variants/{id}', [ProductVariantController::class, 'destroy']);
        
        // Product images (keep existing for backward compatibility)
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
    
    // ============================================================================
    // PLATFORM OWNER DASHBOARD (Super Admin Only)
    // ============================================================================
    Route::prefix('dashboard/owner')->middleware('role:super_admin')->group(function () {
        Route::get('/overview', [OwnerDashboardController::class, 'overview']);
        Route::get('/payment-methods-breakdown', [OwnerDashboardController::class, 'paymentMethodsBreakdown']);
        Route::get('/sale-channels-breakdown', [OwnerDashboardController::class, 'saleChannelsBreakdown']);
        Route::get('/top-sellers', [OwnerDashboardController::class, 'topSellers']);
    });

    // ============================================================================
    // PAYOUT MANAGEMENT (Super Admin Only)
    // ============================================================================
    Route::prefix('payouts')->middleware('role:super_admin')->group(function () {
        Route::get('/pending', [PayoutController::class, 'pending']);
        Route::get('/seller/{seller_id}/pending-payments', [PayoutController::class, 'sellerPendingPayments']);
        Route::post('/process', [PayoutController::class, 'process']);
        Route::get('/history', [PayoutController::class, 'history']);
    });

    // ============================================================================
    // SELLER DASHBOARD (Sellers can only see their own data)
    // ============================================================================
    Route::prefix('dashboard/seller')->middleware('role:seller')->group(function () {
        Route::get('/overview', [\App\Http\Controllers\Dashboard\SellerDashboardController::class, 'overview']);
        Route::get('/transactions', [\App\Http\Controllers\Dashboard\SellerDashboardController::class, 'transactions']);
        Route::get('/commission-breakdown', [\App\Http\Controllers\Dashboard\SellerDashboardController::class, 'commissionBreakdown']);
        Route::get('/payouts', [\App\Http\Controllers\Dashboard\SellerDashboardController::class, 'payouts']);
    });
    
    // Transactions (Super Admin Only)
    Route::prefix('transactions')->middleware('role:super_admin')->group(function () {
        Route::get('/', [TransactionController::class, 'index']);
        Route::get('/{id}', [TransactionController::class, 'show']);
    });
    
    // ============================================================================
    // ADMIN ROUTES
    // ============================================================================
    Route::prefix('admin')->group(function () {
        
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

    // ============================================================================
    // SUPER ADMIN ROUTES
    // ============================================================================
    Route::prefix('super-admin')->group(function () {
        
        // Pending seller management
        Route::get('/pending-sellers', [AuthController::class, 'getPendingSellers']);
        Route::put('/sellers/{id}/approve', [AuthController::class, 'approveSeller']);
        Route::put('/sellers/{id}/reject', [AuthController::class, 'rejectSeller']);
        
        // User role management
        Route::put('/users/{id}/role', [AuthController::class, 'changeUserRole']);
    });
});

// ============================================================================
// DYNAMIC PUBLIC ROUTES - MUST COME LAST
// ============================================================================
// These routes use dynamic parameters and MUST be defined after all specific routes
// to prevent them from catching specific route patterns
Route::prefix('v1')->group(function () {
    // Get order by order number (public for tracking)
    // This MUST come after /orders/pending-payments and other specific routes
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
});

// M-Pesa callback (public - called by Safaricom)
Route::post('/v1/payments/mpesa/callback', [PaymentController::class, 'mpesaCallback']);

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});