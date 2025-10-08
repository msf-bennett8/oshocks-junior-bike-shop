// ============================================================================
// OSHOCKS JUNIOR BIKE SHOP - MAIN APPLICATION COMPONENT
// Version: 2.0
// Description: Comprehensive React application with routing, lazy loading,
//              error boundaries, and performance optimizations
// ============================================================================

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';

// ============================================================================
// CONTEXT IMPORTS
// ============================================================================
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

// ============================================================================
// EAGERLY LOADED COMPONENTS (Critical for initial render)
// ============================================================================
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import FloatingSupportWidget from './components/navigation/FloatingSupportWidget';
// REMOVED: ToastContainer import - it's now handled by ToastProvider in index.js

// ============================================================================
// LAZY LOADED PAGES (Code Splitting for Performance)
// ============================================================================

// Public Pages
const HomePage = lazy(() => import('./pages/main/HomePage'));
const ShopPage = lazy(() => import('./pages/main/ShopPage'));
const ProductDetailsPage = lazy(() => import('./pages/product/ProductDetailsPage'));
const CategoryPage = lazy(() => import('./pages/main/CategoryPage'));
const AboutPage = lazy(() => import('./pages/main/AboutPage'));
const ServicesPage = lazy(() => import('./pages/main/ServicesPage'));
const ContactPage = lazy(() => import('./pages/main/ContactPage'));
const ContactSupportPage = lazy(() => import('./pages/main/ContactSupportPage'));
const BlogPage = lazy(() => import('./pages/main/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/main/BlogPostPage'));
const FAQPage = lazy(() => import('./pages/main/FAQPage'));

// Cart & Checkout
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/checkout/OrderSuccessPage'));
// Authentication
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// User Dashboard
const DashboardPage = lazy(() => import('./pages/user/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/user/OrderDetailsPage'));
const WishlistPage = lazy(() => import('./pages/user/WishlistPage'));
const AddressesPage = lazy(() => import('./pages/user/AddressesPage'));
const ReviewsPage = lazy(() => import('./pages/user/ReviewsPage'));
const SettingsPage = lazy(() => import('./pages/user/SettingsPage'));

// Seller Dashboard
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage'));
const SellerProductsPage = lazy(() => import('./pages/seller/SellerProductsPage'));
const AddProductPage = lazy(() => import('./pages/seller/AddProductPage'));
const EditProductPage = lazy(() => import('./pages/seller/EditProductPage'));
const SellerOrdersPage = lazy(() => import('./pages/seller/SellerOrdersPage'));
const SellerAnalyticsPage = lazy(() => import('./pages/seller/SellerAnalyticsPage'));
const SellerSettingsPage = lazy(() => import('./pages/seller/SellerSettingsPage'));

// Admin Dashboard
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

// Legal & Policy Pages
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/legal/ShippingPolicyPage'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/errors/UnauthorizedPage'));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage'));

// ============================================================================
// ROUTE PROTECTION COMPONENTS
// ============================================================================

/**
 * Protected Route - Requires Authentication
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Seller Route - Requires Seller Role
 */
const SellerRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Admin Route - Requires Admin Role
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Guest Route - Only for non-authenticated users
 */
const GuestRoute = ({ children, redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// ============================================================================
// PAGE TRANSITION WRAPPER
// ============================================================================

const PageTransition = ({ children }) => {
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
};

// ============================================================================
// SUSPENSE FALLBACK
// ============================================================================

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  //const { isAuthenticated, user } = useAuth();
  //const { cartItems } = useCart();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ============================================================================
  // LIFECYCLE EFFECTS
  // ============================================================================

  /**
   * Scroll to top on route change
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  /**
   * Track page views (Google Analytics, etc.)
   */
  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname + location.search,
      });
    }

    // Track with custom analytics
    trackPageView(location.pathname);
  }, [location]);

  /**
   * Monitor network status
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch({ type: 'NETWORK_STATUS_CHANGED', payload: { online: true } });
      console.log('✅ Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      dispatch({ type: 'NETWORK_STATUS_CHANGED', payload: { online: false } });
      console.log('⚠️ Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  /**
   * Load user preferences
   */
//  useEffect(() => {
//   if (isAuthenticated && user) {
//      // Load user-specific data
//      loadUserPreferences();
//      loadWishlist();
//     syncCart();
//   }
// }, [isAuthenticated, user]);

  /**
   * Initialize app on mount
   */
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics();

    // Load cached data
    loadCachedData();

    // Check for app updates
    checkForUpdates();

    // Setup error tracking
    setupErrorTracking();

    // Performance monitoring
    if (process.env.NODE_ENV === 'production') {
      monitorPerformance();
    }
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const trackPageView = (path) => {
    // Custom analytics implementation
    console.log('📊 Page View:', path);
  };

  const loadUserPreferences = () => {
    // Load user preferences from API or localStorage
    console.log('👤 Loading user preferences...');
  };

  const loadWishlist = () => {
    // Load user's wishlist
    console.log('❤️ Loading wishlist...');
  };

  const syncCart = () => {
    // Sync cart with server
    console.log('🛒 Syncing cart...');
  };

  const initializeAnalytics = () => {
    // Initialize analytics services
    console.log('📊 Initializing analytics...');
  };

  const loadCachedData = () => {
    // Load cached data for offline support
    console.log('💾 Loading cached data...');
  };

  const checkForUpdates = () => {
    // Check for application updates
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATES' });
    }
  };

  const setupErrorTracking = () => {
    // Setup error tracking (Sentry, LogRocket, etc.)
    console.log('🔍 Setting up error tracking...');
  };

  const monitorPerformance = () => {
    // Monitor performance metrics
    console.log('⚡ Monitoring performance...');
  };

  // ============================================================================
  // CONDITIONAL RENDERING - MAINTENANCE MODE
  // ============================================================================

  const isMaintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-4xl font-bold mb-4">Under Maintenance</h1>
          <p className="text-xl mb-6">
            We're currently performing scheduled maintenance. We'll be back soon!
          </p>
          <p className="text-sm opacity-75">
            Expected completion: {process.env.REACT_APP_MAINTENANCE_END || 'Soon'}
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER APPLICATION
  // ============================================================================

  return (
    <ErrorBoundary>
      <div className="App min-h-screen flex flex-col">
        {/* Global SEO */}
        <Helmet>
          <title>Oshocks Junior Bike Shop - Kenya's Premier Cycling Marketplace</title>
          <meta
            name="description"
            content="Shop thousands of bicycles, cycling accessories & spare parts online in Kenya. Fast delivery, M-Pesa payments, quality guaranteed."
          />
        </Helmet>

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm font-medium fixed top-0 left-0 right-0 z-top">
            ⚠️ You're offline. Some features may be limited.
          </div>
        )}

        {/* Scroll to Top Button */}
        <ScrollToTop />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <Suspense fallback={<SuspenseFallback />}>
            <PageTransition>
              <Routes>
                {/* ============================================
                    PUBLIC ROUTES
                    ============================================ */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact-support" element={<ContactSupportPage />} />
                <Route path="/ContactSupport" element={<ContactSupportPage />} /> 
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/faq" element={<FAQPage />} />

                {/* ============================================
                    CART & CHECKOUT
                    ============================================ */}
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderSuccessPage />
                    </ProtectedRoute>
                  }
                />

                {/* ============================================
                    AUTHENTICATION ROUTES (Guest Only)
                    ============================================ */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute redirectTo="/dashboard">
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute redirectTo="/dashboard">
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <GuestRoute>
                      <ForgotPasswordPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/reset-password/:token"
                  element={
                    <GuestRoute>
                      <ResetPasswordPage />
                    </GuestRoute>
                  }
                />

                {/* ============================================
                    USER DASHBOARD (Protected)
                    ============================================ */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <AddressesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <ProtectedRoute>
                      <ReviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* ============================================
                    SELLER DASHBOARD (Seller Only)
                    ============================================ */}
                <Route
                  path="/seller/dashboard"
                  element={
                    <SellerRoute>
                      <SellerDashboardPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/products"
                  element={
                    <SellerRoute>
                      <SellerProductsPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/products/add"
                  element={
                    <SellerRoute>
                      <AddProductPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/products/edit/:productId"
                  element={
                    <SellerRoute>
                      <EditProductPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/orders"
                  element={
                    <SellerRoute>
                      <SellerOrdersPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/analytics"
                  element={
                    <SellerRoute>
                      <SellerAnalyticsPage />
                    </SellerRoute>
                  }
                />
                <Route
                  path="/seller/settings"
                  element={
                    <SellerRoute>
                      <SellerSettingsPage />
                    </SellerRoute>
                  }
                />

                {/* ============================================
                    ADMIN DASHBOARD (Admin Only)
                    ============================================ */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProductsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrdersPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategoriesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <AdminRoute>
                      <AdminReportsPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <AdminSettingsPage />
                    </AdminRoute>
                  }
                />

                {/* ============================================
                    LEGAL & POLICY PAGES
                    ============================================ */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />

                {/* ============================================
                    ERROR PAGES
                    ============================================ */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />

        {/* ADD THIS: Floating Support Widget - Persists across all pages */}
        <FloatingSupportWidget 
          excludePaths={[
            '/contact-support',
            '/checkout'
          ]} 
        />

        {/* Toast Notifications - REMOVED */}
        {/* ToastContainer is now automatically rendered by ToastProvider in index.js */}
      </div>
    </ErrorBoundary>
  );
}

export default App;