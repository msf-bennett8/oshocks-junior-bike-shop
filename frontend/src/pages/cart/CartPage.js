import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  Trash2,
  Heart,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

// Import your existing components
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { useCart } from '../../context/CartContext';

/**
 * CartPage Component
 * Full shopping cart page for Oshocks Junior Bike Shop
 * Integrates CartItem and CartSummary components
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState(null);

  // Calculate totals - with safe defaults
  const totalItems = cartItems?.reduce((sum, item) => sum + (item?.quantity || 0), 0) || 0;
  const subtotal = cartItems?.reduce((sum, item) => sum + (Number(item?.price || 0) * (item?.quantity || 0)), 0) || 0;

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle quantity update
  const handleUpdateQuantity = async (id, newQuantity) => {
    const result = await updateQuantity(id, newQuantity);
    if (result.success) {
      showNotification('Quantity updated');
    } else {
      showNotification(result.error, 'error');
    }
  };

  // Handle remove item
  const handleRemoveItem = async (id) => {
    const item = cartItems.find(i => i.id === id);
    const result = await removeFromCart(id);
    if (result.success && item) {
      showNotification(`${item.name} removed from cart`, 'info');
    } else if (!result.success) {
      showNotification(result.error, 'error');
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = (item) => {
    setWishlist([...wishlist, item]);
    showNotification(`${item.name} moved to wishlist`);
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      const result = await clearCart();
      if (result.success) {
        showNotification('Cart cleared', 'info');
      } else {
        showNotification(result.error, 'error');
      }
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    navigate('/shop');
  };

// Fetch recommended products from API
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoadingRecommended(true);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        
        // Fetch top-selling or featured accessories
        const response = await fetch(`${apiUrl}/products?category=accessories&limit=4&sort=popularity`);
        
        if (response.ok) {
          const data = await response.json();
          const products = (data.data || data).slice(0, 4).map(product => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.compare_price ? Number(product.compare_price) : null,
            image: product.images?.[0]?.thumbnail_url || product.images?.[0]?.image_url || '/api/placeholder/150/150'
          }));
          setRecommendedProducts(products);
        }
      } catch (err) {
        console.error('Error fetching recommended products:', err);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommendedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  // Generate safe page title
  const pageTitle = `Shopping Cart (${totalItems}) - Oshocks Junior Bike Shop`;

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart (0) - Oshocks Junior Bike Shop</title>
          <meta name="description" content="View and manage your shopping cart" />
        </Helmet>

        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center py-8 sm:py-16">
            <ShoppingCart className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
              Looks like you haven't added any bikes yet. Start shopping to fill your cart!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </Link>
              {wishlist.length > 0 && (
                <Link
                  to="/wishlist"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  <Heart className="w-5 h-5" />
                  View Wishlist ({wishlist.length})
                </Link>
              )}
            </div>

            {/* Popular Categories */}
            <div className="mt-12 sm:mt-16 px-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Popular Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {['Mountain Bikes', 'Road Bikes', 'Accessories', 'Safety Gear'].map((category) => (
                  <Link
                    key={category}
                    to={`/category/${category.toLowerCase().replace(' ', '-')}`}
                    className="p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs sm:text-sm font-medium text-gray-800">{category}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main cart view
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Review your shopping cart and proceed to checkout" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 sm:px-6 py-3 rounded-lg shadow-lg animate-fadeIn ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
          } text-white text-sm sm:text-base max-w-xs sm:max-w-sm`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  Shopping Cart
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} • {formatPrice(subtotal)}
                </p>
              </div>
              <button
                onClick={handleContinueShopping}
                className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Actions Bar */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    <input type="checkbox" className="rounded w-4 h-4" />
                    <span className="whitespace-nowrap">Select All</span>
                  </label>
                </div>
                <button
                  onClick={handleClearCart}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onAddToWishlist={handleAddToWishlist}
                    showStock={true}
                    editable={true}
                    compact={false}
                  />
                ))}
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div className="p-2">
                    <Package className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-xs font-medium text-gray-800">Free Shipping</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Orders over KES 5,000</p>
                  </div>
                  <div className="p-2">
                    <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-xs font-medium text-gray-800">30-Day Returns</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Money-back guarantee</p>
                  </div>
                  <div className="p-2">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-xs font-medium text-gray-800">1-Year Warranty</p>
                    <p className="text-xs text-gray-500 hidden sm:block">On all bikes</p>
                  </div>
                  <div className="p-2">
                    <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-xs font-medium text-gray-800">Expert Support</p>
                    <p className="text-xs text-gray-500 hidden sm:block">24/7 assistance</p>
                  </div>
                </div>
              </div>

              {/* Recommended Products */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  You Might Also Like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {loadingRecommended ? (
                    // Loading skeleton
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 sm:p-3 animate-pulse">
                        <div className="w-full h-24 sm:h-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))
                  ) : recommendedProducts.length > 0 ? (
                    recommendedProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                      >
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-24 sm:h-32 object-cover rounded mb-2"
                        />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600">
                          {product.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <p className="text-blue-600 font-bold text-xs sm:text-sm">
                            {formatPrice(product.price)}
                          </p>
                          {product.originalPrice && (
                            <p className="text-gray-400 line-through text-xs">
                              {formatPrice(product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-4 text-gray-500 text-sm">
                      No recommendations available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-4">
                <CartSummary
                  cartItems={cartItems}
                  onCheckout={handleCheckout}
                  showPromoCode={true}
                  showShippingEstimate={true}
                  showPaymentMethods={true}
                  deliveryLocation="Nairobi CBD, Kenya"
                  sticky={false}
                />

                {/* Need Help? */}
                <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2">Need Help?</h3>
                  <p className="text-xs sm:text-sm text-blue-800 mb-3">
                    Our customer support team is here to assist you.
                  </p>
                  <Link
                    to="/contact-support"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    Contact Support
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Continue Shopping Button */}
          <button
            onClick={handleContinueShopping}
            className="sm:hidden fixed bottom-4 left-4 right-4 bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2 z-40"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;