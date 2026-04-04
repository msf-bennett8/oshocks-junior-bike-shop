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
  AlertCircle
} from 'lucide-react';

// Import your existing components
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import ActionModal from '../../components/common/ActionModal';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import orderService from '../../services/orderService';

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
    clearCart,
    addToCart  
  } = useCart();

  const { toggleWishlist, isInWishlist } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState(null);
  const [addingRecommendedToCart, setAddingRecommendedToCart] = useState(null);
  const [togglingRecommendedWishlist, setTogglingRecommendedWishlist] = useState(null);
  const [checkingOutRecommended, setCheckingOutRecommended] = useState(null);
  const [lastDeliveryLocation, setLastDeliveryLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'cart',
    action: 'add',
    productName: '',
    section: 'recommended'
  });

  const showModal = (type, action, productName, section = 'recommended') => {
    setModal({ isOpen: true, type, action, productName, section });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

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
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  const handleClearCartClick = () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = async () => {
    setShowClearCartModal(false);
    const result = await clearCart();
    if (result.success) {
      showNotification('Cart cleared', 'info');
    } else {
      showNotification(result.error, 'error');
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
    loadLastDeliveryLocation();
  }, []);

  // Load user's last delivery location
  const loadLastDeliveryLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const response = await orderService.getLastDeliveryLocation();
      if (response.success && response.data) {
        setLastDeliveryLocation(response.data);
      }
    } catch (error) {
      console.error('Error loading last delivery location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  // Generate safe page title
  const pageTitle = `Shopping Cart (${totalItems}) - Oshocks Junior Bike Shop`;

  // Cart abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (cartItems.length > 0) {
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = require('../../utils/auditUtils');
          logFrontendAuditEvent(AUDIT_EVENTS.CART_ABANDONED, {
            category: 'cart',
            severity: 'medium',
            metadata: {
              item_count: cartItems.length,
              total_value: subtotal,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cartItems, subtotal]);

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

        {/* Action Modal */}
        <ActionModal 
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          action={modal.action}
          productName={modal.productName}
          section={modal.section}
        />

        {/* Clear Cart Confirmation Modal */}
        {showClearCartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearCartModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform animate-fadeIn">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearCartModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmClearCart}
                    className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-2 rounded-lg">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  Shopping Cart
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} • {formatPrice(subtotal)}
                </p>
              </div>
              <button
                onClick={handleContinueShopping}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg font-medium text-sm sm:text-base hover:from-orange-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
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
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-4">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    <input type="checkbox" className="rounded w-3.5 h-3.5 sm:w-4 sm:h-4 border-gray-300 text-orange-600 focus:ring-orange-500" />
                    <span className="whitespace-nowrap">Select All</span>
                  </label>
                </div>
                <button
                  onClick={handleClearCartClick}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium whitespace-nowrap"
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
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
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
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 relative"
                      >
                        <Link to={`/product/${product.id}`}>
                          <div className="relative pb-[75%] bg-gray-100">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            
                            {product.originalPrice && (
                              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                -{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                              </span>
                            )}
                          </div>
                          
                          <div className="p-2 sm:p-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-xs sm:text-sm text-gray-900 mb-1 line-clamp-2 h-8 hover:text-orange-600 transition">
                                {product.name}
                              </h3>
                              
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <span className="text-sm sm:text-base font-bold text-green-600">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through ml-1">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Removed - now handled in the actions row below */}
                            </div>
                            
                            {/* Stock Status and Actions Row */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-green-600 font-semibold flex items-center whitespace-nowrap">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                In Stock
                              </span>
                              
                              {/* Compact Action Icons - Same as Shop Page */}
                              <div className="flex items-center gap-1">
                                {/* Add to Cart Icon */}
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    setAddingRecommendedToCart(product.id);
                                    
                                    try {
                                      const cartProduct = {
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image
                                      };
                                      
                                      const result = await addToCart(cartProduct, 1, null);
                                      
                                      if (result.success) {
                                        showModal('cart', 'add', product.name, 'recommended');
                                      } else {
                                        showModal('cart', 'error', result.error, 'recommended');
                                      }
                                    } catch (error) {
                                      console.error('Error adding to cart:', error);
                                      showModal('cart', 'error', 'Failed to add to cart', 'recommended');
                                    } finally {
                                      setAddingRecommendedToCart(null);
                                    }
                                  }}
                                  disabled={addingRecommendedToCart === product.id}
                                  className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${
                                    addingRecommendedToCart === product.id
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : cartItems.some(item => item.id === product.id || item.product_id === product.id)
                                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                                  }`}
                                  title={cartItems.some(item => item.id === product.id || item.product_id === product.id) ? 'In cart' : 'Add to cart'}
                                >
                                  {addingRecommendedToCart === product.id ? (
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  )}
                                </button>

                                {/* Wishlist Icon */}
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    setTogglingRecommendedWishlist(product.id);
                                    
                                    try {
                                      const wishlistProduct = {
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image
                                      };
                                      
                                      const wasInWishlist = isInWishlist(product.id, null);
                                      const result = await toggleWishlist(wishlistProduct, null);

                                      if (result.success) {
                                        showModal('wishlist', wasInWishlist ? 'remove' : 'add', product.name, 'recommended');
                                      } else {
                                        showModal('cart', 'error', result.error, 'recommended');
                                      }
                                    } catch (error) {
                                      console.error('Error toggling wishlist:', error);
                                      showModal('cart', 'error', 'Failed to update wishlist', 'recommended');
                                    } finally {
                                      setTogglingRecommendedWishlist(null);
                                    }
                                  }}
                                  disabled={togglingRecommendedWishlist === product.id}
                                  className={`p-1.5 rounded-md transition-all duration-200 flex items-center justify-center ${
                                    togglingRecommendedWishlist === product.id
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                      : isInWishlist(product.id, null)
                                      ? 'bg-red-500 text-white hover:bg-red-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-600'
                                  }`}
                                  title={isInWishlist(product.id, null) ? 'In wishlist - Click to remove' : 'Add to wishlist'}
                                >
                                  {togglingRecommendedWishlist === product.id ? (
                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <svg className="w-3.5 h-3.5" fill={isInWishlist(product.id, null) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                            
                            {/* Buy Now Button - Styled like Shop Page */}
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                setCheckingOutRecommended(product.id);
                                
                                try {
                                  const cartProduct = {
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: product.image
                                  };
                                  
                                  const result = await addToCart(cartProduct, 1, null);
                                  
                                  if (result.success) {
                                    navigate('/checkout');
                                  } else {
                                    showNotification(result.error, 'error');
                                    setCheckingOutRecommended(null);
                                  }
                                } catch (error) {
                                  console.error('Error:', error);
                                  showNotification('❌ Failed to proceed to checkout', 'error');
                                  setCheckingOutRecommended(null);
                                }
                              }}
                              disabled={checkingOutRecommended === product.id}
                              className={`w-full mt-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
                                checkingOutRecommended === product.id ? 'opacity-75 cursor-not-allowed' : ''
                              }`}
                            >
                              {checkingOutRecommended === product.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Adding...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                  Buy Now
                                </>
                              )}
                            </button>
                          </div>
                        </Link>
                      </div>
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
                  showPaymentMethods={false}
                  deliveryLocation={lastDeliveryLocation ? `${lastDeliveryLocation.zone}, ${lastDeliveryLocation.county}` : null}
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
            className="sm:hidden fixed bottom-4 left-4 right-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg flex items-center justify-center gap-2 z-40 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
};

export default CartPage;