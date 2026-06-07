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
use App\Http\Controllers\CardPaymentController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\SupportInboxController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ServiceBookingController;
use App\Http\Controllers\Api\ContactInquiryController;

// ============================================================================
// OAUTH ROUTES - STATELESS (No CSRF, No Session)
// ============================================================================
Route::prefix('v1/auth')->group(function () {
    Route::post('/google', [SocialAuthController::class, 'handleGoogleCallback']);
    Route::post('/strava', [SocialAuthController::class, 'handleStravaCallback']);
});

// Public routes
Route::middleware(['api', 'audit'])->prefix('v1')->group(function () {

    // Public authentication routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Public product browsing
    Route::get('/products/search', [ProductController::class, 'search']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/sections', [ProductController::class, 'getSections']);
    Route::get('/products/brands', [ProductController::class, 'getBrands']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/slug/{slug}', [ProductController::class, 'showBySlug']);
    Route::get('/products/{id}/variants', [ProductVariantController::class, 'getByProduct']);
    Route::get('/products/{id}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'getByProduct']);

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

    // Guest cart/wishlist merge endpoints (public but auth-aware)
    Route::post('/cart/merge', [CartController::class, 'mergeGuestCart']);
    Route::post('/wishlist/merge', [WishlistController::class, 'mergeGuestWishlist']);

    // search
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
    Route::get('/search/trending', [SearchController::class, 'trending']);

    // Seller profiles (public view)
    Route::get('/sellers', [SellerProfileController::class, 'index']);
    Route::get('/sellers/{id}', [SellerProfileController::class, 'show']);
    Route::get('/sellers/{id}/products', [SellerProfileController::class, 'getProducts']);
    Route::get('/sellers/{id}/reviews', [SellerReviewController::class, 'getBySeller']);
    Route::get('/sellers/{id}/availability', [SellerProfileController::class, 'getAvailability']);

    // Payment Recorders (public view)
    Route::get('/payment-recorders', [\App\Http\Controllers\PaymentRecorderController::class, 'index']);
    Route::get('/payment-recorders/{id}', [\App\Http\Controllers\PaymentRecorderController::class, 'show']);

    // Frontend audit logging (guest + auth - no sanctum required)
    Route::post('/audit-logs/frontend', [\App\Http\Controllers\Api\AuditLogController::class, 'storeFrontend']);

    // Public support user endpoint (for guest chat - returns generic support info)
    Route::get('/support-user', function () {
        $supportUser = \App\Models\User::whereIn('role', ['super_admin', 'owner', 'admin'])
            ->orderByRaw("FIELD(role, 'super_admin', 'owner', 'admin')")
            ->first();

        if (!$supportUser) {
            return response()->json(['data' => null, 'message' => 'No support agent available'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $supportUser->id,
                'name' => $supportUser->name,
                'email' => $supportUser->email,
                'role' => $supportUser->role,
                'avatar' => $supportUser->avatar,
                'phone' => $supportUser->phone,
            ]
        ]);
    });

    // ============================================================================
    // ORDER ROUTES - PUBLIC (Guest checkout allowed)
    // ============================================================================
    // Create order (no auth required for guest checkout)
    Route::post('/orders/create', [OrderController::class, 'store']);

    // Public order tracking (no auth required)
    Route::get('/orders/search', [OrderController::class, 'searchByOrderNumber']);

    // ⚠️ NOTE: Dynamic route /orders/{orderNumber} moved to END of file
    // to prevent it from catching specific routes like /orders/pending-payments
});

// Protected routes (require authentication + effective role checking)
Route::prefix('v1')->middleware(['auth:sanctum', 'audit', 'security.monitor', \App\Http\Middleware\CheckEffectiveRole::class])->group(function () {

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

    // Archive routes - SPECIFIC ROUTES MUST COME FIRST!
    Route::get('/audit-logs/archives/stats', [App\Http\Controllers\Api\AuditLogController::class, 'archiveStats']);
    Route::get('/audit-logs/archives/export', [App\Http\Controllers\Api\AuditLogController::class, 'exportArchives']);
    Route::post('/audit-logs/archives/bulk-restore', [App\Http\Controllers\Api\AuditLogController::class, 'bulkRestoreArchives']);
    Route::post('/audit-logs/archives/bulk-delete', [App\Http\Controllers\Api\AuditLogController::class, 'bulkDeleteArchives']);

    // Dynamic ID routes MUST come after all specific routes
    Route::get('/audit-logs/archives/{id}', [App\Http\Controllers\Api\AuditLogController::class, 'showArchive']);
    Route::post('/audit-logs/archives/{id}/restore', [App\Http\Controllers\Api\AuditLogController::class, 'restoreArchive']);
    Route::delete('/audit-logs/archives/{id}', [App\Http\Controllers\Api\AuditLogController::class, 'permanentlyDeleteArchive']);

    // General list route comes last
    Route::get('/audit-logs/archives', [App\Http\Controllers\Api\AuditLogController::class, 'archives']);

    // Batch audit logging for frontend
    Route::post('/audit-logs/batch', [App\Http\Controllers\Api\AuditLogController::class, 'batchStore']);

        // General audit logs routes
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
    Route::post('/orders/{orderNumber}/record-payment', [OrderController::class, 'recordPayment']);

    // Orders (Protected - User's own orders)
    Route::get('/orders', [OrderController::class, 'index']);

    // Auth user
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User Profile Routes - ADD THESE NEW ROUTES
    Route::get('/user/stats', [\App\Http\Controllers\Api\UserController::class, 'stats']);
    Route::get('/user/dashboard-stats', [\App\Http\Controllers\Api\UserController::class, 'dashboardStats']);
    Route::get('/user/spending-analytics', [\App\Http\Controllers\Api\UserController::class, 'spendingAnalytics']);
    Route::get('/user/rewards', [\App\Http\Controllers\Api\UserController::class, 'rewards']);
    Route::get('/user/referral-code', [\App\Http\Controllers\Api\UserController::class, 'getReferralCode']);
    Route::post('/user/referral-code/regenerate', [\App\Http\Controllers\Api\UserController::class, 'regenerateReferralCode']);
    Route::get('/user/payment-methods', [\App\Http\Controllers\Api\UserController::class, 'paymentMethods']);
    Route::get('/user/login-activity', [\App\Http\Controllers\Api\UserController::class, 'loginActivity']);
    Route::get('/user/preferences', [\App\Http\Controllers\Api\UserPreferenceController::class, 'show']);
    Route::put('/user/preferences', [\App\Http\Controllers\Api\UserPreferenceController::class, 'update']);

    // Phase 4: User Data & Compliance Routes
    // Data Export (GDPR Article 15/20)
    Route::post('/user/data-export', [\App\Http\Controllers\Api\DataExportController::class, 'requestExport']);
    Route::get('/user/data-export/{requestId}/download', [\App\Http\Controllers\Api\DataExportController::class, 'downloadExport']);

    // Account Management
    Route::post('/user/account/deactivate', [\App\Http\Controllers\Api\DataExportController::class, 'deactivateAccount']);
    Route::post('/user/account/reactivate', [\App\Http\Controllers\Api\DataExportController::class, 'reactivateAccount']);
    Route::delete('/user/account', [\App\Http\Controllers\Api\DataExportController::class, 'deleteAccount']);

    // Consent Management
    Route::post('/user/consent', [\App\Http\Controllers\Api\ConsentController::class, 'recordConsent']);
    Route::get('/user/consent/export', [\App\Http\Controllers\Api\ConsentController::class, 'exportConsent']);

    // Privacy Requests (GDPR Articles 15-22)
    Route::post('/user/privacy-request', [\App\Http\Controllers\Api\ConsentController::class, 'submitPrivacyRequest']);

    // Phase 7: Security Monitoring Routes
    Route::post('/security/trust-device', [\App\Http\Controllers\Api\SecurityController::class, 'trustDevice']);
    Route::get('/security/activity', [\App\Http\Controllers\Api\SecurityController::class, 'getActivity']);
    Route::get('/security/sessions', [\App\Http\Controllers\Api\SecurityController::class, 'getSessions']);
    Route::delete('/security/sessions/{tokenId}', [\App\Http\Controllers\Api\SecurityController::class, 'revokeSession']);
    Route::post('/security/report', [\App\Http\Controllers\Api\SecurityController::class, 'reportSuspicious']);

    // Phase 5: API & Integration Routes
    // API Key Management
    Route::get('/api-keys', [\App\Http\Controllers\Api\ApiKeyController::class, 'index']);
    Route::post('/api-keys', [\App\Http\Controllers\Api\ApiKeyController::class, 'store']);
    Route::post('/api-keys/{keyId}/rotate', [\App\Http\Controllers\Api\ApiKeyController::class, 'rotate']);
    Route::delete('/api-keys/{keyId}', [\App\Http\Controllers\Api\ApiKeyController::class, 'revoke']);

    // Webhook Management
    Route::get('/webhooks', [\App\Http\Controllers\Api\WebhookController::class, 'index']);
    Route::post('/webhooks', [\App\Http\Controllers\Api\WebhookController::class, 'store']);
    Route::delete('/webhooks/{subscriptionId}', [\App\Http\Controllers\Api\WebhookController::class, 'destroy']);

    // Get user's last delivery location for checkout auto-fill
    Route::get('/user/last-delivery-location', [OrderController::class, 'getLastDeliveryLocation']);

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


    // Payment Methods
    Route::get('/payment-methods', [\App\Http\Controllers\Api\PaymentMethodController::class, 'index']);
    Route::post('/payment-methods', [\App\Http\Controllers\Api\PaymentMethodController::class, 'store']);
    Route::put('/payment-methods/{id}', [\App\Http\Controllers\Api\PaymentMethodController::class, 'update']);
    Route::delete('/payment-methods/{id}', [\App\Http\Controllers\Api\PaymentMethodController::class, 'destroy']);
    Route::put('/payment-methods/{id}/set-default', [\App\Http\Controllers\Api\PaymentMethodController::class, 'setDefault']);

    // Payments
    Route::post('/payments/mpesa/initiate', [PaymentController::class, 'initiateMpesa']);
    //Route::post('/payments/card/initiate', [PaymentController::class, 'initiateCard']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments/record', [PaymentController::class, 'recordPayment']);

    // Card Payments (Paystack) - Protected
    Route::post('/payments/card/initialize', [CardPaymentController::class, 'initialize']);
    Route::get('/payments/card/verify/{reference}', [CardPaymentController::class, 'verify']);
    Route::get('/payments/card/saved-cards', [CardPaymentController::class, 'getSavedCards']);
    Route::post('/payments/card/charge-saved', [CardPaymentController::class, 'chargeSavedCard']);

    // Reviews (Protected user actions)
    Route::post('/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [\App\Http\Controllers\Api\ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\ReviewController::class, 'destroy']);

    // Seller reviews
    Route::post('/seller-reviews', [SellerReviewController::class, 'store']);

    // Coupons
    Route::post('/coupons/validate', [CouponController::class, 'validate']);
    Route::post('/coupons/apply', [CouponUsageController::class, 'apply']);

    // Phase 9: Notifications with Rate Limiting
    Route::prefix('notifications')->middleware(['notification.rate'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'getUnreadCount']);
        Route::get('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'show']);
        Route::put('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
        Route::post('/{id}/archive', [\App\Http\Controllers\Api\NotificationController::class, 'archive']);
        Route::post('/{id}/unarchive', [\App\Http\Controllers\Api\NotificationController::class, 'unarchive']);
        Route::post('/{id}/pin', [\App\Http\Controllers\Api\NotificationController::class, 'pin']);
        Route::post('/{id}/unpin', [\App\Http\Controllers\Api\NotificationController::class, 'unpin']);
        Route::post('/bulk-delete', [\App\Http\Controllers\Api\NotificationController::class, 'bulkDelete']);
        Route::post('/bulk-archive', [\App\Http\Controllers\Api\NotificationController::class, 'bulkArchive']);
        Route::post('/bulk-mark-read', [\App\Http\Controllers\Api\NotificationController::class, 'bulkMarkRead']);
    });

    // Phase 9: Notification Analytics (Admin only)
    Route::prefix('admin/notifications')->middleware(['auth:sanctum', 'role:super_admin,owner,admin'])->group(function () {
        Route::get('/analytics/dashboard', [\App\Http\Controllers\Api\NotificationAnalyticsController::class, 'dashboard']);
        Route::get('/analytics/realtime', [\App\Http\Controllers\Api\NotificationAnalyticsController::class, 'realtime']);
        Route::get('/analytics/export', [\App\Http\Controllers\Api\NotificationAnalyticsController::class, 'export']);
    });

    // Phase 9:(Templates) Notification Template Management (Super Admin only)
    Route::prefix('admin/notification-templates')->middleware(['auth:sanctum', 'role:super_admin,owner'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'index']);
        Route::get('/categories', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'categories']);
        Route::post('/sync-from-config', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'syncFromConfig']);
        Route::post('/', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'store']);
        Route::get('/{id}', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'destroy']);
        Route::post('/{id}/duplicate', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'duplicate']);
        Route::post('/{id}/preview', [\App\Http\Controllers\Admin\NotificationTemplateController::class, 'preview']);
    });

    // Notification preferences
    Route::get('/user/notification-preferences', [\App\Http\Controllers\Api\NotificationPreferenceController::class, 'show']);
    Route::put('/user/notification-preferences', [\App\Http\Controllers\Api\NotificationPreferenceController::class, 'update']);

    // Push Subscriptions (Phase 4)
    Route::prefix('push-subscriptions')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'store']);
        Route::delete('/{id}', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'destroy']);
        Route::post('/test', [\App\Http\Controllers\Api\PushSubscriptionController::class, 'test']);
    });

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

        // Product duplication
        Route::post('/products/{id}/duplicate', [SellerProductController::class, 'duplicate']);

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
        Route::get('/recent-orders', [OwnerDashboardController::class, 'recentOrders']);
        Route::get('/order-status-distribution', [OwnerDashboardController::class, 'orderStatusDistribution']);
    });

    // ============================================================================
    // PAYOUT MANAGEMENT (Super Admin Only)
    // ============================================================================
    Route::prefix('payouts')->middleware('role:super_admin')->group(function () {
        Route::get('/pending', [PayoutController::class, 'pending']);
        Route::get('/seller/{seller_id}/pending-payments', [PayoutController::class, 'sellerPendingPayments']);
        Route::post('/process', [PayoutController::class, 'process']);
        Route::get('/history', [PayoutController::class, 'history']);
        Route::get('/{id}/details', [PayoutController::class, 'details']);
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

        // ⭐ NEW: Advanced User Management
        Route::prefix('users')->group(function () {
            Route::get('/{id}', [\App\Http\Controllers\Admin\UserManagementController::class, 'show']);
            Route::post('/{id}/elevate', [\App\Http\Controllers\Admin\UserManagementController::class, 'elevateUser']);
            Route::post('/{id}/remove-role', [\App\Http\Controllers\Admin\UserManagementController::class, 'removeRole']);
            Route::post('/{id}/toggle-status', [\App\Http\Controllers\Admin\UserManagementController::class, 'toggleStatus']);
            Route::post('/{id}/payment-recorder', [\App\Http\Controllers\Admin\UserManagementController::class, 'managePaymentRecorder']);
            Route::post('/{id}/seller-profile', [\App\Http\Controllers\Admin\UserManagementController::class, 'manageSellerProfile']);
        });

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

        // Phase 9: Marketing Campaigns (Admin/Super Admin)
        Route::prefix('marketing')->middleware(['role:super_admin'])->group(function () {
            Route::get('/campaigns', [\App\Http\Controllers\Api\MarketingController::class, 'listCampaigns']);
            Route::post('/campaigns', [\App\Http\Controllers\Api\MarketingController::class, 'createCampaign']);
            Route::get('/campaigns/{id}', [\App\Http\Controllers\Api\MarketingController::class, 'showCampaign']);
            Route::post('/campaigns/{id}/launch', [\App\Http\Controllers\Api\MarketingController::class, 'launchCampaign']);
            Route::get('/campaigns/{id}/analytics', [\App\Http\Controllers\Api\MarketingController::class, 'campaignAnalytics']);
        });

        // Admin review moderation (Phase 10)
        Route::post('/reviews/{id}/moderate', [\App\Http\Controllers\Api\ReviewController::class, 'moderate']);

    }); // End of admin group

    // ============================================================================
    // SUPER ADMIN ROUTES (With Phase 3 Audit Logging)
    // ============================================================================
    Route::prefix('super-admin')->middleware(['role:super_admin'])->group(function () {

        // Pending seller management
        Route::get('/pending-sellers', [AuthController::class, 'getPendingSellers']);
        Route::put('/sellers/{id}/approve', [AuthController::class, 'approveSeller']);
        Route::put('/sellers/{id}/reject', [AuthController::class, 'rejectSeller']);

        // User role management with audit
        Route::put('/users/{id}/role', [\App\Http\Controllers\Api\SuperAdminController::class, 'changeUserRole']);
        Route::post('/users/{id}/permissions', [\App\Http\Controllers\Api\SuperAdminController::class, 'updatePermissions']);
        Route::get('/users', [\App\Http\Controllers\Api\SuperAdminController::class, 'listUsers']);
        Route::post('/users/{id}/toggle-status', [\App\Http\Controllers\Api\SuperAdminController::class, 'toggleUserStatus']);

        // Impersonation for support
        Route::post('/impersonate/{userId}', [\App\Http\Controllers\Api\SuperAdminController::class, 'startImpersonation']);
        Route::post('/impersonate/stop', [\App\Http\Controllers\Api\SuperAdminController::class, 'stopImpersonation']);
    });

        // ============================================================================
        // PHASE 10: BUSINESS OPERATIONS (Main Protected Group)
        // ============================================================================

        // Service Bookings (Phase 10 - Hybrid Conversational)
        Route::prefix('service-bookings')->group(function () {
            Route::post('/', [ServiceBookingController::class, 'store']); // Guest + auth (handled in controller)
            Route::get('/', [ServiceBookingController::class, 'index']);
            Route::get('/stats', [ServiceBookingController::class, 'stats']);
            Route::get('/my-bookings', [ServiceBookingController::class, 'myBookings']);
            Route::get('/sellers', [ServiceBookingController::class, 'availableSellers']);
            Route::get('/mechanics', [ServiceBookingController::class, 'getMechanics']);

            // ─── Scheduled Deletion (super admin only) ───
            // MUST come before /{caseId} catch-all!
            Route::get('/scheduled', [\App\Http\Controllers\Api\ServiceBookingController::class, 'scheduled'])->middleware('role:super_admin');
            Route::post('/{id}/schedule', [\App\Http\Controllers\Api\ServiceBookingController::class, 'scheduleForDeletion'])->middleware('role:super_admin');
            Route::post('/{id}/restore', [\App\Http\Controllers\Api\ServiceBookingController::class, 'restoreFromScheduled'])->middleware('role:super_admin');
            Route::delete('/{id}/permanent', [\App\Http\Controllers\Api\ServiceBookingController::class, 'permanentDelete'])->middleware('role:super_admin');

            Route::get('/{caseId}', [ServiceBookingController::class, 'show']);
            Route::post('/{caseId}/confirm', [ServiceBookingController::class, 'confirm']);
            Route::post('/{caseId}/reschedule', [ServiceBookingController::class, 'reschedule']);
            Route::post('/{caseId}/complete', [ServiceBookingController::class, 'complete']);
            Route::post('/{caseId}/cancel', [ServiceBookingController::class, 'cancel']);
            Route::post('/{id}/no-show', [\App\Http\Controllers\Api\ServiceBookingController::class, 'markNoShow']);

            // ─── Appointment Notes & History (New) ───
            Route::get('/{caseId}/notes', [ServiceBookingController::class, 'getNotes']);
            Route::post('/{caseId}/notes', [ServiceBookingController::class, 'addNote']);
            Route::get('/{caseId}/history', [ServiceBookingController::class, 'getHistory']);
            Route::get('/user/{userId}/all', [ServiceBookingController::class, 'getUserAppointments']);
        });

        // Contact Inquiries (Phase 10 - Hybrid Conversational)
        Route::prefix('contact-inquiries')->group(function () {
            Route::post('/', [ContactInquiryController::class, 'store']); // Guest + auth (handled in controller)
            Route::get('/my-inquiries', [ContactInquiryController::class, 'myInquiries']);
            Route::get('/queue', [ContactInquiryController::class, 'queue']);
        });

        // Reviews (User actions - already defined above, but helpful votes here)
    Route::post('/reviews/{id}/helpful', [\App\Http\Controllers\Api\ReviewController::class, 'markHelpful']);

    // Referrals
    Route::prefix('referrals')->group(function () {
        Route::get('/code', [\App\Http\Controllers\Api\ReferralController::class, 'getCode']);
        Route::post('/apply', [\App\Http\Controllers\Api\ReferralController::class, 'apply']);
        Route::get('/history', [\App\Http\Controllers\Api\ReferralController::class, 'history']);
    });

    // ============================================================================
    // LEGAL ACCEPTANCE ROUTES
    // ============================================================================
    Route::post('/legal/accept', [\App\Http\Controllers\Api\LegalController::class, 'recordAcceptance']);
    Route::get('/legal/status', [\App\Http\Controllers\Api\LegalController::class, 'getStatus']);

    // ============================================================================
    // MESSAGING & CALLS ROUTES (Protected - for authenticated users)
    // ============================================================================
    // Link guest sessions on login
    Route::post('/conversations/link-guest', [\App\Http\Controllers\Api\ConversationController::class, 'linkGuestSessions']);

    // ============================================================================
    // ENHANCED MESSAGING ROUTES (Auth Required)
    // ============================================================================
    Route::get('/conversations/search-users', [ConversationController::class, 'searchUsers']);
    Route::get('/orders/{order}/support', [ConversationController::class, 'getOrderSupport']);

    // Conversation show — moved from optional group to prevent route collision
    Route::get('/conversations/{conversation}', [\App\Http\Controllers\Api\ConversationController::class, 'show']);

    // Support Inbox (Admin/SuperAdmin only)
    Route::prefix('support-inbox')->middleware(['role:admin,super_admin'])->group(function () {
        Route::get('/', [SupportInboxController::class, 'index']);
        Route::get('/stats', [SupportInboxController::class, 'stats']);
        Route::post('/{conversation}/assign', [SupportInboxController::class, 'assign']);
        Route::post('/{conversation}/escalate', [SupportInboxController::class, 'escalate']);
        Route::post('/{conversation}/resolve', [SupportInboxController::class, 'resolve']);
        Route::get('/monitor', [SupportInboxController::class, 'monitor']);
        Route::post('/{conversation}/join', [SupportInboxController::class, 'join']);
    });

    // Call Signaling (WebRTC) - requires auth
    Route::post('/calls/initiate', [\App\Http\Controllers\Api\CallSignalingController::class, 'initiate']);
    Route::post('/calls/signal', [\App\Http\Controllers\Api\CallSignalingController::class, 'signal']);
    Route::get('/calls/history', [\App\Http\Controllers\Api\CallSignalingController::class, 'history']);

    // Broadcasting auth for Reverb private channels
    Route::post('/broadcasting/auth', function (Request $request) {
        return Broadcast::auth($request);
    });

    // ============================================================================
    // DYNAMIC PUBLIC ROUTES - MUST COME LAST (Inside protected group but public access)
    // ============================================================================
    // These routes use dynamic parameters and MUST be defined after all specific routes
    // to prevent them from catching specific route patterns

    // Get order by order number or order_display (public for tracking)
    // This MUST come after /orders/pending-payments and other specific routes
    Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);

    // ============================================================================
    // CUSTOM RIDE REQUESTS (Phase 11)
    // ============================================================================
    Route::prefix('custom-ride-requests')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'stats']);
        Route::get('/my-requests', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'myRequests']);
        Route::post('/{requestId}/status', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'updateStatus']);
        Route::get('/{requestId}/conversion-preview', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'conversionPreview']);
        Route::post('/{requestId}/convert-to-event', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'convertToEvent']);
        Route::post('/{requestId}/quote', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'quote']);
        Route::post('/{requestId}/accept', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'acceptQuote']);
    });
    Route::apiResource('custom-ride-requests', \App\Http\Controllers\Api\CustomRideRequestController::class)->only(['index', 'store', 'show']);

}); // End of protected routes group

// ============================================================================
// CUSTOM RIDE REQUESTS — PUBLIC (Guest creation allowed)
// ============================================================================
Route::prefix('v1/custom-ride-requests')->middleware(['api', 'audit'])->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'store']);
    Route::get('/{requestId}', [\App\Http\Controllers\Api\CustomRideRequestController::class, 'show']);
});

// ============================================================================
// CYCLING EVENTS ROUTES — PUBLIC (no auth required)
// ============================================================================
Route::prefix('v1/events')->middleware(['api', 'audit'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\CyclingEventController::class, 'index']);
    Route::get('/{eventCode}', [\App\Http\Controllers\Api\CyclingEventController::class, 'show']);
    Route::get('/{eventCode}/related', [\App\Http\Controllers\Api\CyclingEventController::class, 'getRelated']);
});

// ============================================================================
// CYCLING EVENTS ROUTES — PROTECTED (auth required)
// ============================================================================
Route::prefix('v1/events')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\CyclingEventController::class, 'store']);
    Route::get('/my/events', [\App\Http\Controllers\Api\CyclingEventController::class, 'myEvents']);
    Route::get('/my/registrations', [\App\Http\Controllers\Api\CyclingEventController::class, 'myRegistrations']);
    Route::post('/registrations/{registrationCode}/refund-request', [\App\Http\Controllers\Api\CyclingEventController::class, 'requestRefund']);
    Route::get('/registrations/{registrationCode}/ticket', [\App\Http\Controllers\Api\CyclingEventController::class, 'downloadTicket']);
    Route::post('/registrations/{registrationCode}/transfer-request', [\App\Http\Controllers\Api\CyclingEventController::class, 'requestTransfer']);

    // ─── SPECIFIC routes MUST come BEFORE dynamic /{eventCode} routes ───
    Route::post('/{eventCode}/register', [\App\Http\Controllers\Api\CyclingEventController::class, 'register']);
    Route::post('/{eventCode}/unregister', [\App\Http\Controllers\Api\CyclingEventController::class, 'unregister']);
    Route::get('/{eventCode}/participants', [\App\Http\Controllers\Api\CyclingEventController::class, 'participants']);
    Route::get('/{eventCode}/stats', [\App\Http\Controllers\Api\CyclingEventController::class, 'stats']);

    // ─── Dynamic /{eventCode} routes come LAST ───
    Route::post('/{eventCode}', [\App\Http\Controllers\Api\CyclingEventController::class, 'update']); // POST for FormData with _method=PUT
    Route::put('/{eventCode}', [\App\Http\Controllers\Api\CyclingEventController::class, 'update']);
    Route::delete('/{eventCode}', [\App\Http\Controllers\Api\CyclingEventController::class, 'destroy']);
});

// ============================================================================
// EVENT PAYMENT ROUTES (M-Pesa, Card, COD for event registrations)
// ============================================================================
Route::prefix('v1/event-payments')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
    Route::post('/mpesa/initiate', [\App\Http\Controllers\Api\EventPaymentController::class, 'initiateMpesa']);
    Route::post('/card/initialize', [\App\Http\Controllers\Api\EventPaymentController::class, 'initializeCard']);
    Route::post('/cod', [\App\Http\Controllers\Api\EventPaymentController::class, 'cashOnDelivery']);
    Route::get('/{paymentId}/status', [\App\Http\Controllers\Api\EventPaymentController::class, 'status']);
    Route::get('/card/verify/{reference}', [\App\Http\Controllers\Api\EventPaymentController::class, 'verifyCard']);
});

// Public callback for event card payments
Route::get('/v1/event-payments/card/callback', [\App\Http\Controllers\Api\EventPaymentController::class, 'cardCallback']);

// ============================================================================
// BIKE RENTAL PAYMENT ROUTES (M-Pesa, Card, COD for bike rental bookings)
// ============================================================================
Route::prefix('v1/bike-rental-payments')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
    Route::post('/mpesa/initiate', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'initiateMpesa']);
    Route::post('/card/initialize', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'initiateCard']);
    Route::post('/cod', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'cod']);
    Route::get('/{paymentId}/status', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'checkStatus']);
    Route::get('/card/verify/{reference}', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'verifyCard']);
});

// Public callback for bike rental card payments
Route::get('/v1/bike-rental-payments/card/callback', [\App\Http\Controllers\Api\BikeRentalPaymentController::class, 'cardCallback']);

// ============================================================================
// BIKE RENTAL ROUTES — PUBLIC
// ============================================================================
Route::prefix('v1/bike-rentals')->middleware(['api', 'audit'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BikeRentalController::class, 'index']);
    Route::get('/available', [\App\Http\Controllers\Api\BikeRentalController::class, 'availableWithConflictResolution']);
    Route::get('/{listingCode}/current-availability', [\App\Http\Controllers\Api\BikeRentalController::class, 'currentAvailability']);
    Route::get('/{listingCode}/availability', [\App\Http\Controllers\Api\BikeRentalController::class, 'checkAvailability']);
    Route::get('/{listingCode}/calendar', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'availabilityCalendar']);
    Route::get('/{listingCode}', [\App\Http\Controllers\Api\BikeRentalController::class, 'show']);
});

// ============================================================================
// BIKE RENTAL ROUTES — PROTECTED
// ============================================================================
Route::prefix('v1/bike-rentals')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\BikeRentalController::class, 'store']);
    Route::post('/{listingCode}', [\App\Http\Controllers\Api\BikeRentalController::class, 'update']); // POST for FormData with _method=PUT
    Route::put('/{listingCode}', [\App\Http\Controllers\Api\BikeRentalController::class, 'update']);
    Route::delete('/{listingCode}', [\App\Http\Controllers\Api\BikeRentalController::class, 'destroy']);
    Route::get('/my/listings', [\App\Http\Controllers\Api\BikeRentalController::class, 'myListings']);
    Route::get('/{listingCode}/stats', [\App\Http\Controllers\Api\BikeRentalController::class, 'stats']);
});

// ============================================================================
// BIKE RENTAL BOOKINGS — PROTECTED
// ============================================================================
Route::prefix('v1/bike-rental-bookings')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
    Route::post('/', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'store']);
    Route::get('/my-bookings', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'myBookings']);
    Route::get('/owner-bookings', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'ownerBookings']);
    Route::get('/{bookingCode}', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'show']);
    Route::post('/{bookingCode}/status', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'updateStatus']);
    Route::post('/{bookingCode}/cancel', [\App\Http\Controllers\Api\BikeRentalBookingController::class, 'cancel']);
});

    // ============================================================================
    // BIKE LISTING MODERATION — ADMIN/SUPER ADMIN ONLY
    // ============================================================================
    Route::prefix('v1/admin/bike-listings')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'stats']);
        Route::post('/{listingCode}/approve', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'approve']);
        Route::post('/{listingCode}/reject', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'reject']);
        Route::put('/{listingCode}/edit', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'updateListing']);
        Route::post('/{listingCode}/pause', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'pause']);
        Route::post('/{listingCode}/resume', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'resume']);
        Route::post('/{listingCode}/archive', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'archive']);
        Route::post('/{listingCode}/restore-archive', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'restoreArchive']);
        Route::post('/{listingCode}/out-of-service', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'markOutOfService']);
        Route::post('/{listingCode}/schedule-deletion', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'scheduleForDeletion']);
        Route::post('/{listingCode}/approve-deletion', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'approveDeletion']);
        Route::post('/{listingCode}/restore', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'restore']);
        Route::delete('/{listingCode}/permanent', [\App\Http\Controllers\Api\BikeListingModerationController::class, 'permanentDelete']);
    });

    // ============================================================================
    // BIKE BOOKING MODERATION — ADMIN/SUPER ADMIN ONLY
    // ============================================================================
    Route::prefix('v1/admin/bike-bookings')->middleware(['auth:sanctum', 'audit', 'security.monitor', 'role:admin,super_admin'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'stats']);
        Route::get('/pending-recirculation', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'pendingRecirculation']);
        Route::post('/{bookingCode}/recirculate', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'recirculate']);
        Route::post('/{bookingCode}/return-to-fleet', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'returnToFleet']);
        Route::post('/{bookingCode}/apply-fine', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'applyFine']);
        Route::post('/{bookingCode}/remove-fine', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'removeFine']);
        Route::post('/{bookingCode}/refund-deposit', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'refundDeposit']);
        Route::get('/payouts', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'getPayouts']);
        Route::post('/{bookingCode}/create-payout', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'createPayout']);
        Route::post('/payouts/{payoutId}/process', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'processPayout']);
        Route::post('/payouts/{payoutId}/delay', [\App\Http\Controllers\Api\Admin\BikeBookingModerationController::class, 'delayPayout']);
    });

    // ============================================================================
    // LISTER PAYOUT MANAGEMENT
    // ============================================================================
    Route::prefix('v1/bike-lister')->middleware(['auth:sanctum', 'audit', 'security.monitor', 'role:seller'])->group(function () {
        Route::get('/payout-dashboard', [\App\Http\Controllers\Api\BikeListerPayoutController::class, 'dashboard']);
        Route::get('/payout-history', [\App\Http\Controllers\Api\BikeListerPayoutController::class, 'history']);
        Route::post('/payouts/{payoutId}/request', [\App\Http\Controllers\Api\BikeListerPayoutController::class, 'requestPayout']);
        Route::put('/payout-preference', [\App\Http\Controllers\Api\BikeListerPayoutController::class, 'updatePreference']);
    });

    // ============================================================================
    // TERMS OF SERVICE
    // ============================================================================
    Route::prefix('v1/terms')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
        Route::get('/status', [\App\Http\Controllers\Api\TermsController::class, 'status']);
        Route::post('/accept', [\App\Http\Controllers\Api\TermsController::class, 'accept']);
        Route::get('/check', [\App\Http\Controllers\Api\TermsController::class, 'check']);
    });

    // ============================================================================
    // BIKE AVAILABILITY WITH CONFLICT RESOLUTION
    // ============================================================================
    Route::get('/v1/bike-rentals/available', [\App\Http\Controllers\Api\BikeRentalController::class, 'availableWithConflictResolution']);

    // ============================================================================
    // PLATFORM FINE SETTINGS — ADMIN ONLY
    // ============================================================================
    Route::prefix('v1/admin/fine-settings')->middleware(['auth:sanctum', 'audit', 'security.monitor', 'role:super_admin,admin'])->group(function () {
        Route::get('/', function () {
            return response()->json([
                'success' => true,
                'data' => \App\Models\PlatformFineSetting::getLateReturnFine(),
            ]);
        });
        Route::put('/', function (\Illuminate\Http\Request $request) {
            $validated = $request->validate(['amount' => 'nullable|numeric|min:0']);
            $user = \Illuminate\Support\Facades\Auth::user();
            \App\Models\PlatformFineSetting::setLateReturnFine($validated['amount'] ?? null, $user->id);
            return response()->json([
                'success' => true,
                'message' => 'Fine settings updated',
            ]);
        });
    });

    // ============================================================================
    // COMMUNITY POSTS ROUTES
    // ============================================================================
    Route::prefix('v1/community')->group(function () {
        // Public routes (no auth required)
        Route::get('/posts', [\App\Http\Controllers\Api\CommunityPostController::class, 'index']);
        Route::get('/posts/{postCode}', [\App\Http\Controllers\Api\CommunityPostController::class, 'show']);
    });

    Route::prefix('v1/community')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
        // Protected routes (auth required)
        Route::post('/posts', [\App\Http\Controllers\Api\CommunityPostController::class, 'store']);
        Route::post('/posts/{postCode}', [\App\Http\Controllers\Api\CommunityPostController::class, 'update']); // POST for FormData with _method=PUT
        Route::put('/posts/{postCode}', [\App\Http\Controllers\Api\CommunityPostController::class, 'update']);
        Route::delete('/posts/{postCode}', [\App\Http\Controllers\Api\CommunityPostController::class, 'destroy']);
        Route::get('/my/posts', [\App\Http\Controllers\Api\CommunityPostController::class, 'myPosts']);
        Route::post('/posts/{postCode}/like', [\App\Http\Controllers\Api\CommunityPostController::class, 'toggleLike']);
    });

    // ============================================================================
    // COMMUNITY POSTS MODERATION ROUTES (Admin/Super Admin only)
    // ============================================================================
    Route::prefix('v1/admin/community-posts')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'stats']);
        Route::post('/{postCode}/feature', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'toggleFeatured']);
        Route::post('/{postCode}/schedule-deletion', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'scheduleForDeletion']);
        Route::post('/{postCode}/approve-deletion', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'approveDeletion']);
        Route::post('/{postCode}/restore', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'restore']);
        Route::delete('/{postCode}/permanent', [\App\Http\Controllers\Api\CommunityPostModerationController::class, 'permanentDelete']);
    });

    // ============================================================================
    // CYCLING EVENTS MODERATION ROUTES (Admin/Super Admin only)
    // ============================================================================
    Route::prefix('v1/admin/cycling-events')->middleware(['auth:sanctum', 'audit', 'security.monitor'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'index']);
        Route::get('/stats', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'stats']);
        Route::post('/{eventCode}/approve', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'approve']);
        Route::post('/{eventCode}/reject', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'reject']);
        Route::put('/{eventCode}/edit', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'updateEvent']);
        Route::post('/{eventCode}/archive', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'archive']);
        Route::post('/{eventCode}/restore-archive', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'restoreArchive']);
        Route::post('/{eventCode}/schedule-deletion', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'scheduleForDeletion']);
        Route::post('/{eventCode}/approve-deletion', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'approveDeletion']);
        Route::post('/{eventCode}/restore', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'restore']);
        Route::delete('/{eventCode}/permanent', [\App\Http\Controllers\Api\CyclingEventModerationController::class, 'permanentDelete']);

        // ─── EVENT BOOKING MANAGEMENT ───
        Route::get('/bookings', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'index']);
        Route::get('/bookings/stats', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'stats']);
        Route::get('/{eventCode}/bookings', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'eventBookings']);
        Route::post('/bookings/{registrationCode}/check-in', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'checkIn']);
        Route::post('/bookings/{registrationCode}/cancel', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'adminCancel']);
        Route::post('/bookings/{registrationCode}/refund', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'processRefund']);
        Route::post('/bookings/{registrationCode}/transfer', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'transferBooking']);
        Route::post('/bookings/bulk-check-in', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'bulkCheckIn']);
        Route::post('/bookings/bulk-cancel', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'bulkCancel']);
        Route::get('/{eventCode}/export-bookings', [\App\Http\Controllers\Api\EventBookingManagementController::class, 'exportBookings']);

        // QR Check-in validation
        Route::post('/check-in/validate', [\App\Http\Controllers\Api\EventCheckInController::class, 'validateQr']);
        Route::post('/check-in/manual', [\App\Http\Controllers\Api\EventCheckInController::class, 'manualCheckIn']);
    });

// ============================================================================
// MESSAGING ROUTES — OPTIONAL AUTH (Guest + Authenticated)
// ============================================================================
// These routes are OUTSIDE auth:sanctum to allow guest access via X-Guest-Session-ID.
// Controllers handle both auth and guest sessions.
Route::prefix('v1')->middleware(['api', 'optional', 'audit'])->group(function () {

    // (link-guest moved to protected routes above — guests don't need to link themselves)

    // Conversations — accessible to guests and authenticated users
    Route::get('/conversations', [\App\Http\Controllers\Api\ConversationController::class, 'index']);
    Route::post('/conversations', [\App\Http\Controllers\Api\ConversationController::class, 'store']);
    Route::post('/conversations/{conversation}/read', [\App\Http\Controllers\Api\ConversationController::class, 'markAsRead']);

    // Show conversation — MUST come AFTER /conversations/search-users to avoid collision
    Route::get('/conversations/{conversation}', [\App\Http\Controllers\Api\ConversationController::class, 'show']);

    // Enhanced messaging features — routed to correct controllers
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::post('/messages/{message}/delivered', [MessageController::class, 'markDelivered']);
    Route::post('/messages/{message}/read', [MessageController::class, 'markRead']);
    Route::post('/conversations/{conversation}/messages/read', [MessageController::class, 'markMultipleRead']);
    Route::post('/conversations/{conversation}/typing', [ConversationController::class, 'typing']);
    Route::post('/conversations/{conversation}/messages/{message}/react', [ConversationController::class, 'react']);

    // Conversation management (pin, archive, delete)
    Route::post('/conversations/{conversation}/pin', [\App\Http\Controllers\Api\ConversationController::class, 'pin']);
    Route::post('/conversations/{conversation}/archive', [\App\Http\Controllers\Api\ConversationController::class, 'archive']);
    Route::delete('/conversations/{conversation}', [\App\Http\Controllers\Api\ConversationController::class, 'destroy']);

    // Message search (auth only)
    Route::get('/conversations/search/messages', [\App\Http\Controllers\Api\ConversationController::class, 'search'])
        ->middleware('auth:sanctum');

    // Attachment upload for cases (guest + auth)
    Route::post('/attachments/case/{caseId}', [\App\Http\Controllers\Api\AttachmentController::class, 'uploadCaseAttachment']);
    Route::get('/attachments/{id}', [\App\Http\Controllers\Api\AttachmentController::class, 'show']);
    Route::delete('/attachments/{id}', [\App\Http\Controllers\Api\AttachmentController::class, 'destroy']);
}); // End of optional auth messaging group

// ============================================================================
// SUPPORT CASE ROUTES (Phase 2 + Hybrid Conversational Ticketing)
// ============================================================================
Route::prefix('v1/support-cases')->middleware(['auth:sanctum', 'audit'])->group(function () {
    // User routes
    Route::get('/', [\App\Http\Controllers\Api\SupportCaseController::class, 'index']);
    Route::get('/my-cases', [\App\Http\Controllers\Api\SupportCaseController::class, 'myCases']);
    Route::get('/my-cases/stats', [\App\Http\Controllers\Api\SupportCaseController::class, 'myCaseStats']);
    Route::post('/', [\App\Http\Controllers\Api\SupportCaseController::class, 'store']);
    Route::get('/{caseId}', [\App\Http\Controllers\Api\SupportCaseController::class, 'show']);
    Route::post('/{caseId}/escalate', [\App\Http\Controllers\Api\SupportCaseController::class, 'escalate']);
    Route::post('/{caseId}/satisfaction', [\App\Http\Controllers\Api\SupportCaseController::class, 'rateSatisfaction']);
    Route::post('/validate-order', [\App\Http\Controllers\Api\SupportCaseController::class, 'validateOrder']);
    Route::post('/{caseId}/notes', [\App\Http\Controllers\Api\SupportCaseController::class, 'addNote']);
    Route::get('/{caseId}/history', [\App\Http\Controllers\Api\SupportCaseController::class, 'getHistory']);
    Route::delete('/{caseId}', [\App\Http\Controllers\Api\CaseThreadController::class, 'destroy']);
    Route::post('/{caseId}/restore', [\App\Http\Controllers\Api\CaseThreadController::class, 'restore']);
});

// ============================================================================
// CASE THREAD ROUTES (Hybrid Conversational Ticketing — New)
// ============================================================================
// Guest-accessible case creation (uses optional auth + X-Guest-Session-ID header)
Route::prefix('v1/conversations')->middleware(['api', 'optional', 'audit'])->group(function () {
    // Create a new case within an existing conversation (guests + auth)
    Route::post('/{conversation}/cases', [\App\Http\Controllers\Api\CaseThreadController::class, 'createCaseInConversation']);
    // Get all cases in a conversation (guests + auth)
    Route::get('/{conversation}/cases', [\App\Http\Controllers\Api\CaseThreadController::class, 'getConversationCases']);
    // Get messages for a specific case (guests + auth)
    Route::get('/{conversation}/cases/{caseId}/messages', [\App\Http\Controllers\Api\CaseThreadController::class, 'getCaseMessages']);
    // Send message to a specific case (guests + auth)
    Route::post('/{conversation}/cases/{caseId}/messages', [\App\Http\Controllers\Api\CaseThreadController::class, 'sendCaseMessage']);
});

// Get full user case history (all cases ever)
Route::get('/v1/user/case-history', [\App\Http\Controllers\Api\CaseThreadController::class, 'getUserCaseHistory'])
    ->middleware(['auth:sanctum', 'audit']);

// Support Queue (Admin/SuperAdmin/SupportAgent only)
Route::prefix('v1/support-queue')->middleware(['auth:sanctum', 'audit'])->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\SupportQueueController::class, 'index']);
    Route::get('/my-cases', [\App\Http\Controllers\Api\SupportQueueController::class, 'myCases']);
    Route::get('/stats', [\App\Http\Controllers\Api\SupportQueueController::class, 'stats']);
    Route::get('/available-agents', [\App\Http\Controllers\Api\SupportQueueController::class, 'availableAgents']);
    Route::post('/{caseId}/claim', [\App\Http\Controllers\Api\SupportQueueController::class, 'claim']);
    Route::post('/{caseId}/assign', [\App\Http\Controllers\Api\SupportQueueController::class, 'assign']);
    Route::post('/{caseId}/transfer', [\App\Http\Controllers\Api\SupportQueueController::class, 'transfer']);
    Route::post('/{caseId}/resolve', [\App\Http\Controllers\Api\SupportQueueController::class, 'resolve']);
    Route::post('/{caseId}/close', [\App\Http\Controllers\Api\SupportQueueController::class, 'close']);
    Route::post('/{caseId}/reopen', [\App\Http\Controllers\Api\SupportQueueController::class, 'reopen']);
    Route::get('/{caseId}/notes', [\App\Http\Controllers\Api\SupportQueueController::class, 'getNotes']);
    Route::delete('/{caseId}', [\App\Http\Controllers\Api\SupportQueueController::class, 'destroy']);
    Route::post('/{caseId}/restore', [\App\Http\Controllers\Api\SupportQueueController::class, 'restore']);
    Route::get('/my-full-history', [\App\Http\Controllers\Api\SupportQueueController::class, 'getMyFullHistory']);
    Route::get('/history', [\App\Http\Controllers\Api\SupportQueueController::class, 'getHistory']);

    // Scheduled deletion (super admin only)
    Route::get('/scheduled', [\App\Http\Controllers\Api\SupportQueueController::class, 'scheduled']);
    Route::delete('/{caseId}/schedule', [\App\Http\Controllers\Api\SupportQueueController::class, 'scheduleForDeletion']);
    Route::post('/{caseId}/restore', [\App\Http\Controllers\Api\SupportQueueController::class, 'restoreFromScheduled']);
    Route::delete('/{caseId}/permanent', [\App\Http\Controllers\Api\SupportQueueController::class, 'permanentDelete']);
});

// Super Admin escalation review
Route::prefix('v1/super-admin/support')->middleware(['auth:sanctum', 'role:super_admin', 'audit'])->group(function () {
    Route::get('/escalated', [\App\Http\Controllers\Api\SupportQueueController::class, 'escalatedCases']);
    Route::post('/{caseId}/handle-escalation', [\App\Http\Controllers\Api\SupportQueueController::class, 'handleEscalation']);
});

// Public callback routes (outside protected group)
Route::post('/v1/payments/mpesa/callback', [PaymentController::class, 'mpesaCallback']);
Route::get('/v1/payments/card/callback', [CardPaymentController::class, 'callback']);
Route::post('/v1/payments/card/webhook', [CardPaymentController::class, 'webhook']);

// Incoming webhooks from third parties (public but signature verified)
Route::post('/v1/webhooks/incoming/{provider}', [\App\Http\Controllers\Api\WebhookController::class, 'handleIncoming']);

// System health endpoints (Phase 6)
Route::get('/api/health', fn() => response()->json(['status' => 'ok']));
Route::get('/system/metrics', [\App\Http\Controllers\Api\SystemHealthController::class, 'metrics']);

// Phase 8: Notification tracking (public but signed URLs)
Route::get('/v1/notifications/track-click/{notificationId}', [\App\Http\Controllers\Api\NotificationController::class, 'trackClick']);
Route::get('/v1/notifications/pixel/{notificationId}', [\App\Http\Controllers\Api\NotificationController::class, 'trackingPixel']);
Route::post('/v1/notifications/track-delivery/{notificationId}', [\App\Http\Controllers\Api\NotificationController::class, 'trackDelivery']);
// Audit notification acknowledgment
Route::post('/v1/audit/notifications/{notificationId}/acknowledge', [\App\Http\Controllers\Api\AuditLogController::class, 'acknowledgeNotification'])
    ->middleware('auth:sanctum');


// Phase 9: Marketing tracking (public for webhooks and pixels)
Route::get('/v1/marketing/pixel/{campaignId}/{userId}/{messageId}', [\App\Http\Controllers\Api\MarketingController::class, 'trackingPixel']);
Route::get('/v1/marketing/click/{campaignId}/{userId}/{messageId}', [\App\Http\Controllers\Api\MarketingController::class, 'trackClick']);
Route::get('/v1/marketing/unsubscribe', [\App\Http\Controllers\Api\MarketingController::class, 'unsubscribe']);
Route::post('/v1/marketing/webhooks/postmark', [\App\Http\Controllers\Api\MarketingController::class, 'postmarkWebhook']);
