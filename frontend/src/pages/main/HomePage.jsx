import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  Zap, 
  ThumbsUp, 
  Shield, 
  Headphones, 
  BadgeCheck, 
  Wrench, 
  Store, 
  Truck, 
  CreditCard,
  ArrowRight,
  UserPlus,
  Heart,
  Star,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ActionModal from '../../components/common/ActionModal';

const HomePage = () => {
  const { toggleWishlist, isInWishlist, addToWishlistWithGuest, mergeGuestWishlist } = useWishlist();
  const { addToCart, toggleCart, loading: cartLoading, isInCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(null); 
  const [addingToCart, setAddingToCart] = useState(null); 
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  
  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'wishlist',
    action: 'add',
    productName: '',
    section: 'hero'
  });

  const showModal = (type, action, productName, section = 'hero') => {
    setModal({ isOpen: true, type, action, productName, section });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => new Set([...prev, productId]));
  };

  // Carousel configuration - responsive items per slide
  const [itemsPerSlide, setItemsPerSlide] = useState(6);
  
  // Update items per slide based on screen size
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerSlide(1); // Small screens - 1 card
      } else if (width < 1024) {
        setItemsPerSlide(4); // Medium screens - 2x2 grid = 4 cards
      } else {
        setItemsPerSlide(6); // Large screens - 3x2 grid = 6 cards
      }
    };
    
    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);
  
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // Get visible products for current slide
  const getVisibleProducts = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return products.slice(startIndex, startIndex + itemsPerSlide);
  };

  // Carousel navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    if (products.length === 0 || totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length, totalSlides, nextSlide, itemsPerSlide]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsSlowLoad(false);
      
      // Show "slow load" message after 5 seconds
      const slowLoadTimer = setTimeout(() => {
        setIsSlowLoad(true);
      }, 5000);
      
      const response = await productAPI.getProducts({ limit: 12 });
      
      clearTimeout(slowLoadTimer);
      
      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
      
      setLoading(false);
      setIsSlowLoad(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Server is taking too long to respond. This might be due to server cold start on free hosting. Please try again.');
      } else if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection or try again later.');
      } else {
        setError(`Request error: ${err.message}`);
      }
      
      setLoading(false);
      setIsSlowLoad(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e, product, section = 'hero') => {
    e.preventDefault();
    e.stopPropagation();
    
    setTogglingWishlist(product.id);
    
    try {
      const wasInWishlist = isInWishlist(product.id, null);
      
      // Use toggleWishlist which now handles guests internally
      const result = await toggleWishlist(product, null);
      
      if (result.success) {
        showModal('wishlist', wasInWishlist ? 'remove' : 'add', product.name, section);
      } else {
        showModal('cart', 'error', result.error, section);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showModal('cart', 'error', 'Failed to update wishlist', section);
    } finally {
      setTogglingWishlist(null);
    }
  };

  // Handle cart toggle (add/remove)
  const handleAddToCart = async (e, product, section = 'hero') => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(product.id);
    
    try {
      const variant = product?.variants?.[0] || product?.colors?.[0] || null;
      const wasInCart = isInCart(product.id, variant);
      const result = await toggleCart(product, variant);
      
      if (result.success) {
        // Show appropriate modal based on action
        showModal('cart', wasInCart ? 'remove' : 'add', product.name, section);
      } else {
        showModal('cart', 'error', result.error, section);
      }
    } catch (error) {
      console.error('Error toggling cart:', error);
      showModal('cart', 'error', 'Failed to update cart', section);
    } finally {
      setAddingToCart(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Backend server: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{process.env.REACT_APP_API_URL || 'Not configured'}</code>
          </p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            Try Again <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Oshocks Bike Shop - Kenya's Premier Cycling Marketplace</title>
        <meta
          name="description"
          content="Buy bicycles, book repairs, and discover cycling products in Kenya. Multi-vendor marketplace with M-Pesa payments, fast delivery, and professional bike services."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Modern Hero Section with Featured Products Grid Carousel */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-900">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
              }}
            />
            <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1485965120184-e224f7a1d7f0?w=1920&q=80)] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          </div>

          {/* Floating Gradient Orb */}
          <div 
            className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ 
              background: 'linear-gradient(135deg, rgb(255, 69, 0), rgb(255, 165, 0))',
            }}
          />

          <div className="container mx-auto px-4 relative z-10 py-12 lg:py-0">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Content - Reduced width (5/12 instead of 6/12) */}
              <div className="lg:col-span-5 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-white/90">Kenya's Premier Cycling Marketplace</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  Ride Into{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Tomorrow
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  Discover premium bicycles, expert repairs, and a community of cycling enthusiasts. From city streets to mountain trails.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/shop"
                    className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                  >
                    Explore Collection
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/book-service"
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Wrench className="w-5 h-5" />
                    Book Service
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-8 border-t border-white/10">
                  <div>
                    <div className="text-3xl font-bold text-white">2,500+</div>
                    <div className="text-sm text-gray-400">Bikes Sold</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">15,000+</div>
                    <div className="text-sm text-gray-400">Happy Riders</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">50+</div>
                    <div className="text-sm text-gray-400">Expert Mechanics</div>
                  </div>
                </div>

                {/* Mobile Products Grid - Shows below buttons on small screens */}
                <div className="lg:hidden mt-8">
                <MobileProductsGrid 
                  products={products}
                  loading={loading}
                  currentSlide={currentSlide}
                  toggleCart={toggleCart}
                  cartLoading={cartLoading}
                  toggleWishlist={toggleWishlist}
                  togglingWishlist={togglingWishlist}
                  isInWishlist={isInWishlist}
                  isInCart={isInCart}
                  nextSlide={nextSlide}
                  prevSlide={prevSlide}
                  showModal={showModal}
                />
                </div>
              </div>

              {/* Right - Desktop Products Grid Carousel (3x2) - Increased width (7/12 instead of 6/12) */}
              <div className="hidden lg:block lg:col-span-7 relative">
                <div className="relative">
                  {/* Navigation Arrow - Left - Aligned to center of top row */}
                  <button
                    onClick={prevSlide}
                    className="absolute -left-12 top-[25%] -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm border border-white/20"
                    aria-label="Previous products"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  {/* Products Grid Container */}
                  <div className="relative bg-gray-800/30 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden">
                    
                    {/* Loading State */}
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[500px]">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-gray-700/50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : products.length > 0 ? (
                      <>
                        {/* Responsive Products Grid - 1/2/3 columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getVisibleProducts().map((product, index) => (
                            <div 
                              key={`${product.id}-${currentSlide}-${index}`}
                              className="bg-gray-800/60 rounded-xl p-4 border border-white/5 hover:border-orange-500/30 transition-all hover:transform hover:-translate-y-1 group relative"
                            >
                              <Link to={`/product/${product.id}`} className="block">
                                {/* Product Image */}
                                <div className="relative h-32 mb-3 flex items-center justify-center bg-gray-700/30 rounded-lg overflow-hidden">
                                  {product.images?.[0]?.image_url || product.image_url ? (
                                    <img 
                                      src={product.images?.[0]?.image_url || product.image_url}
                                      alt={product.name}
                                      className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
                                    />
                                  ) : (
                                    <Package className="w-12 h-12 text-gray-500" />
                                  )}
                                  
                                  {/* Badges */}
                                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {product.is_featured && (
                                      <span className="px-2 py-0.5 bg-orange-500/80 text-white text-[10px] font-bold rounded">FEATURED</span>
                                    )}
                                    {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                                      <span className="px-2 py-0.5 bg-red-500/80 text-white text-[10px] font-bold rounded">
                                        {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                                      </span>
                                    )}
                                  </div>

                                  {/* Action Icons - Outside Image (Mobile Style) */}
                                  <div className="absolute -bottom-3 -right-3 flex flex-col gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1.5 border border-white/10 shadow-lg z-20">
                                    {/* Wishlist Icon */}
                                    <button
                                      onClick={(e) => handleWishlistToggle(e, product, 'hero')}
                                      disabled={togglingWishlist === product.id}
                                      className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-white/10 disabled:opacity-50"
                                    >
                                      <Heart 
                                        className={`w-4 h-4 ${isInWishlist(product.id, null) ? 'text-orange-500 fill-orange-500' : 'text-orange-400'}`} 
                                        strokeWidth={2}
                                      />
                                    </button>

                                    {/* Cart Icon */}
                                    <button
                                      onClick={(e) => handleAddToCart(e, product, 'hero')}
                                      disabled={!product.quantity || cartLoading}
                                      className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-white/10 disabled:opacity-50"
                                    >
                                      <ShoppingCart 
                                        className={`w-4 h-4 ${isInCart(product.id, product?.variants?.[0] || product?.colors?.[0]) ? 'text-orange-500 fill-orange-500' : !product.quantity ? 'text-gray-500' : 'text-orange-400'}`} 
                                      />
                                    </button>

                                    {/* Checkout Arrow */}
                                    <button
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const variant = product?.variants?.[0] || product?.colors?.[0] || null;
                                        const result = await toggleCart(product, variant);
                                        if (result.success) {
                                          window.location.href = '/checkout';
                                        } else {
                                          showModal('cart', 'error', result.error, 'hero');
                                        }
                                      }}
                                      disabled={!product.quantity}
                                      className="p-1.5 rounded-md transition-all hover:scale-110 hover:bg-white/10 disabled:opacity-50"
                                      title="Buy Now"
                                    >
                                      <ArrowRight 
                                        className={`w-4 h-4 ${!product.quantity ? 'text-gray-500' : 'text-orange-400'}`} 
                                      />
                                    </button>
                                  </div>
                                </div>

                                {/* Product Info */}
                                <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
                                  {product.name}
                                </h4>
                                
                                <p className="text-gray-400 text-xs mb-2">
                                  {product.brand && `${product.brand} • `}
                                  {product.category?.name || 'Bike'}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-orange-400">
                                    KSh {Number(product.price).toLocaleString()}
                                  </span>
                                  {product.compare_price && (
                                    <span className="text-xs text-gray-500 line-through">
                                      KSh {Number(product.compare_price).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Slide Counter */}
                        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white/80">
                          {currentSlide + 1} / {totalSlides || 1}
                        </div>
                      </>
                    ) : (
                      /* Empty State */
                      <div className="flex flex-col items-center justify-center h-[500px] text-center">
                        <Package className="w-16 h-16 text-gray-500 mb-4" />
                        <p className="text-gray-400 text-lg">No products available</p>
                        <Link to="/shop" className="mt-4 text-orange-400 hover:text-orange-300 font-semibold">
                          Browse Shop →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Navigation Arrow - Right - Aligned to center of top row */}
                  <button
                    onClick={nextSlide}
                    className="absolute -right-12 top-[25%] -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 z-20 backdrop-blur-sm border border-white/20"
                    aria-label="Next products"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-white/60 rounded-full" />
            </div>
          </div>
        </section>

        {/* Services Marquee */}
        <div className="py-6 bg-gray-900 border-t border-white/10 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[
              { icon: 'Bike', text: 'Premium Bikes' },
              { icon: 'Wrench', text: 'Expert Repairs' },
              { icon: 'Truck', text: 'Fast Delivery' },
              { icon: 'Shield', text: 'Verified Sellers' },
              { icon: 'CreditCard', text: 'Secure Payments' },
              { icon: 'Headphones', text: '24/7 Support' },
              { icon: 'Zap', text: 'Quick Turnaround' },
              { icon: 'BadgeCheck', text: 'Quality Assured' },
            ].map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 mx-8 text-white/60">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="font-semibold uppercase tracking-wider text-sm">{service.text}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              { icon: 'Bike', text: 'Premium Bikes' },
              { icon: 'Wrench', text: 'Expert Repairs' },
              { icon: 'Truck', text: 'Fast Delivery' },
              { icon: 'Shield', text: 'Verified Sellers' },
              { icon: 'CreditCard', text: 'Secure Payments' },
              { icon: 'Headphones', text: '24/7 Support' },
              { icon: 'Zap', text: 'Quick Turnaround' },
              { icon: 'BadgeCheck', text: 'Quality Assured' },
            ].map((service, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-3 mx-8 text-white/60">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="font-semibold uppercase tracking-wider text-sm">{service.text}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}</style>

        {/* Key Features */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Fast and reliable delivery in Nairobi Metropolitan. Track your order in real-time from our stores to your doorstep.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Flexible Payments</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Pay conveniently with M-Pesa, Airtel Money, bank cards, or cash on delivery. Secure transactions guaranteed.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-4">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Professional Repairs</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Expert bike mechanics available for repairs, maintenance, and custom builds. Book appointments online easily.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Multi-Vendor Platform</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Access products from multiple verified sellers. More choices, competitive prices, quality assured.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Our Services</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                More than just a marketplace - we're your complete cycling solution
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Buy & Sell</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Browse bikes, parts, and accessories. Ask for delivery and it will be delivered to your doorstep.
                    </p>
                    <Link to="/shop" className="text-green-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Repair Services</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Professional bike repairs and maintenance by experienced mechanics. Quick turnaround, quality guaranteed.
                    </p>
                    <Link to="/book-service" className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Book Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Custom Orders</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Can't find what you need? Request custom bike builds or special parts. We'll source it for you.
                    </p>
                    <Link to="/contact" className="text-orange-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Inquire <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Become a Seller</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Join our marketplace and reach other cycling enthusiasts. Easy setup, powerful tools.
                    </p>
                    <Link to="/seller/register" className="text-purple-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Register <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Trade-In Program</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Upgrade your bike with our trade-in program. Get fair value for your old bike towards a new purchase.
                    </p>
                    <Link to="/trade-in" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Expert Support</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Get cycling advice, product recommendations, and technical support from our team.
                    </p>
                    <Link to="/contact" className="text-pink-600 font-semibold text-sm hover:underline flex items-center gap-1">
                      Contact Us <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">New Arrivals</h2>
                <p className="text-gray-600">Fresh inventory just added to our collection</p>
              </div>
              <Link
                to="/shop"
                className="text-green-600 hover:text-green-700 font-semibold flex items-center text-lg group"
              >
                View All 
                <ArrowRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-6">
                {/* Loading message with animation */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-gray-700 mt-4 font-semibold text-lg">Loading products...</p>
                  
                  {isSlowLoad && (
                    <div className="mt-4 max-w-md mx-auto">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-blue-800 text-sm">
                          ⏱️ <strong>Server is waking up...</strong> This may take up to 2 minutes on free hosting. 
                          Thanks for your patience!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Loading Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <ProductCardSkeleton key={i} delay={i} />
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 md:py-20 bg-gray-50 rounded-xl shadow-inner">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg md:text-xl mb-2 font-semibold">No products available yet</p>
                <p className="text-gray-500 text-sm md:text-base">Check back soon for exciting new arrivals!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {products.slice(0, 12).map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative"
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="relative pb-[75%] bg-gray-100">
                          {product.image_url || product.images?.[0]?.image_url ? (
                            <>
                              {/* Thumbnail - loads first, blurred */}
                              {!loadedImages.has(product.id) && (product.images?.[0]?.thumbnail_url || product.image_url) && (
                                <img
                                  src={product.images?.[0]?.thumbnail_url || product.image_url}
                                  alt={product.name}
                                  className="absolute inset-0 w-full h-full object-cover blur-sm"
                                />
                              )}
                              {/* Full resolution - loads after, crisp */}
                              <img
                                src={product.images?.[0]?.image_url || product.image_url}
                                alt={product.name}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                                  loadedImages.has(product.id) ? 'opacity-100' : 'opacity-0'
                                }`}
                                onLoad={() => handleImageLoad(product.id)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-50"><svg class="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>';
                                }}
                              />
                            </>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                          )}
                          
                          {product.is_featured && (
                            <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Featured
                            </span>
                          )}
                          
                          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                              {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                            </span>
                          )}

                          {/* Action Buttons - Wishlist & Cart */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                            {/* Add to Cart Button */}
                              <button
                                onClick={(e) => handleAddToCart(e, product, 'newArrivals')}
                                disabled={!product.quantity || product.quantity === 0 || addingToCart === product.id}
                                className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
                                  product.quantity > 0 && addingToCart !== product.id
                                    ? 'bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:scale-110'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                                title={product.quantity > 0 ? 'Add to cart' : 'Out of stock'}
                              >
                                {addingToCart === product.id ? (
                                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <ShoppingCart 
                                    className={`w-5 h-5 ${isInCart(product.id, product?.variants?.[0] || product?.colors?.[0]) ? 'text-orange-600 fill-orange-100' : ''}`}
                                  />
                                )}
                              </button>

                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => handleWishlistToggle(e, product, 'newArrivals')}
                              disabled={togglingWishlist === product.id}
                              className={`p-2.5 rounded-full transition-all duration-200 shadow-lg ${
                                isInWishlist(product.id, null)
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-red-500'
                              } ${togglingWishlist === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                              title={isInWishlist(product.id, null) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              {togglingWishlist === product.id ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Heart
                                  className={`w-5 h-5 ${isInWishlist(product.id, null) ? 'fill-current' : ''}`}
                                  strokeWidth={2}
                                />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12 text-sm hover:text-green-600 transition">
                            {product.name}
                          </h3>
                          
                          {product.brand && (
                            <p className="text-xs text-gray-500 mb-2">
                              Brand: <span className="font-medium text-gray-700">{product.brand}</span>
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3">
                            <div>
                              <span className="text-xl font-bold text-green-600">
                                KSh {Number(product.price).toLocaleString()}
                              </span>
                              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                                <span className="text-sm text-gray-400 line-through ml-2">
                                  KSh {Number(product.compare_price).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 mt-3">
                            {/* Left side - Condition (if exists) */}
                            {product.condition && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium whitespace-nowrap">
                                {product.condition}
                              </span>
                            )}
                            
                            {/* Right side - Stock Status + Checkout - Always aligned right */}
                            <div className="flex items-center gap-2 ml-auto">
                              {/* Stock Status - comes FIRST */}
                              {product.quantity && product.quantity > 0 ? (
                                <span className="text-xs text-green-600 font-semibold flex items-center whitespace-nowrap">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                  In Stock
                                </span>
                              ) : (
                                <span className="text-xs text-red-600 font-semibold flex items-center whitespace-nowrap">
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                  Out of Stock
                                </span>
                              )}
                              
                              {/* Checkout Chip - comes AFTER */}
                              {product.quantity > 0 && (
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    setCheckingOut(product.id);
                                    
                                    try {
                                      const variant = product.variants?.[0] || product.colors?.[0] || null;
                                      const result = await toggleCart(product, variant);
                                      
                                      if (result.success) {
                                        window.location.href = '/checkout';
                                      } else {
                                        showModal('cart', 'error', result.error, 'newArrivals');
                                        setCheckingOut(null);
                                      }
                                    } catch (error) {
                                      console.error('Error:', error);
                                      showModal('cart', 'error', 'Failed to proceed to checkout', 'newArrivals');
                                      setCheckingOut(null);
                                    }
                                  }}
                                  disabled={checkingOut === product.id}
                                  className={`text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded font-semibold hover:from-orange-600 hover:to-red-600 transition-colors whitespace-nowrap flex items-center gap-1 ${
                                    checkingOut === product.id ? 'opacity-75 cursor-not-allowed' : ''
                                  }`}
                                >
                                  {checkingOut === product.id ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>Adding...</span>
                                    </>
                                  ) : (
                                    'Checkout'
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {products.length > 0 && (
                  <div className="text-center mt-10 md:mt-12">
                  <Link
                  to="/shop"
                    className="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    View All New Arrivals <ArrowRight className="w-5 h-5" />
                  </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Why Choose Oshocks */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Why Choose Oshocks?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Your trusted partner for all things cycling
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mx-auto mb-3">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Quality Verified</h3>
                <p className="text-gray-600 text-sm">All our products are tested and undergo strict verification for authenticity and quality standards.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-3">
                  <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">Competitive pricing from multiple sellers ensures you get the best deals on cycling products.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Shopping</h3>
                <p className="text-gray-600 text-sm">Your transactions are protected with encrypted payments and buyer protection policies.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mx-auto mb-3">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Fast Processing</h3>
                <p className="text-gray-600 text-sm">Your orders are processed within 24 hours and shipped quickly to your preferred location.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mx-auto mb-3">
                  <ThumbsUp className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Satisfaction Guarantee</h3>
                <p className="text-gray-600 text-sm">Not happy with your purchase? Easy returns and refunds within 7 days of delivery.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mx-auto mb-3">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Our customer support team is always available to help with your inquiries and concerns.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Links */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">Explore More</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Link to="/shop" className="p-6 bg-green-50 rounded-xl hover:bg-green-100 transition text-center group border-2 border-transparent hover:border-green-300">
                <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">Shop</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Browse products</p>
              </Link>
              <Link to="/about" className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center group border-2 border-transparent hover:border-blue-300">
                <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <BadgeCheck className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">About Us</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Our story</p>
              </Link>
              <Link to="/contact" className="p-6 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition text-center group border-2 border-transparent hover:border-emerald-300">
                <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Headphones className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">Contact</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Get in touch</p>
              </Link>
              <Link to="/faq" className="p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition text-center group border-2 border-transparent hover:border-orange-300">
                <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base md:text-lg text-gray-800">FAQ</h3>
                <p className="text-xs md:text-sm text-gray-600 mt-2">Find answers</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Action Modal */}
        <ActionModal 
          isOpen={modal.isOpen}
          onClose={closeModal}
          type={modal.type}
          action={modal.action}
          productName={modal.productName}
          section={modal.section}
        />

        {/* Call to Action */}
        <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-800">Ready to Start Your Cycling Journey?</h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed text-gray-700">
              Join other satisfied customers who trust Oshocks for quality bikes, 
              professional repairs, and exceptional service. Your perfect ride awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Browse Products - White bg, no border, orange text, border appears on hover */}
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-white text-orange-600 border-2 border-transparent font-bold rounded-lg hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-200 text-lg flex items-center justify-center gap-2 group"
              >
                Browse Products <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {/* Become a Seller - Orange gradient background, white text */}
              <Link
                to="/seller/register"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition transform duration-200 text-lg flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" /> Become a Seller
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Mobile Products Carousel Component (1 product at a time, full width, icon buttons only)
const MobileProductsGrid = ({ 
  products, 
  loading, 
  currentSlide, 
  toggleCart, 
  cartLoading, 
  toggleWishlist, 
  togglingWishlist, 
  isInWishlist,
  isInCart,
  nextSlide,
  prevSlide,
  showModal
}) => {
  const totalSlides = products.length;
  const product = products[currentSlide];

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-4 animate-pulse">
        <div className="h-64 bg-gray-700 rounded-xl mb-4" />
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No products available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Featured Products</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 bg-white/10 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/60 text-sm min-w-[3rem] text-center font-medium">
            {currentSlide + 1} / {totalSlides}
          </span>
          <button
            onClick={nextSlide}
            className="w-10 h-10 bg-white/10 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Single Product Card - Full Width, Fills Section */}
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block">
          {/* Product Image - Larger to fill space */}
          <div className="relative h-64 mb-4 flex items-center justify-center bg-gray-700/30 rounded-xl overflow-hidden">
            {product.images?.[0]?.image_url || product.image_url ? (
              <img 
                src={product.images?.[0]?.image_url || product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <Package className="w-24 h-24 text-gray-500" />
            )}
            
            {/* Badges - Top Left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {product.is_featured && (
                <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded shadow-lg">FEATURED</span>
              )}
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-lg">
                  {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Action Icons - Outside Image with Background Container */}
            <div className="absolute -bottom-4 -right-4 flex flex-col gap-1 bg-gray-800/90 backdrop-blur-sm rounded-xl p-2 border border-white/10 shadow-xl z-20">
              {/* Wishlist Icon */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const wasInWishlist = isInWishlist(product.id, null);
                  const result = await toggleWishlist(product, null);
                  if (!result.success) {
                    alert('❌ ' + result.error);
                  }
                }}
                disabled={togglingWishlist === product.id}
                className="p-2 rounded-lg transition-all hover:scale-110 hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <Heart 
                  className={`w-6 h-6 ${isInWishlist(product.id, null) ? 'text-orange-500 fill-orange-500' : 'text-orange-400'}`} 
                  strokeWidth={2}
                />
              </button>

              {/* Cart Icon */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const variant = product?.variants?.[0] || product?.colors?.[0] || null;
                  const result = await toggleCart(product, variant);
                  if (result.success) {
                    // Success - icon will show filled on re-render
                  } else {
                    alert('❌ ' + result.error);
                  }
                }}
                disabled={!product.quantity || cartLoading}
                className="p-2 rounded-lg transition-all hover:scale-110 hover:bg-white/10 active:scale-95 disabled:opacity-50"
              >
                <ShoppingCart 
                  className={`w-6 h-6 ${isInCart(product.id, product?.variants?.[0] || product?.colors?.[0]) ? 'text-orange-500 fill-orange-500' : !product.quantity ? 'text-gray-500' : 'text-orange-400'}`} 
                />
              </button>

              {/* Checkout Arrow */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const variant = product?.variants?.[0] || product?.colors?.[0] || null;
                  const result = await toggleCart(product, variant);
                  if (result.success) {
                    window.location.href = '/checkout';
                  } else {
                    alert('❌ ' + result.error);
                  }
                }}
                disabled={!product.quantity}
                className="p-2 rounded-lg transition-all hover:scale-110 hover:bg-white/10 active:scale-95 disabled:opacity-50"
                title="Buy Now"
              >
                <ArrowRight 
                  className={`w-6 h-6 ${!product.quantity ? 'text-gray-500' : 'text-orange-400'}`} 
                />
              </button>
            </div>
          </div>

          {/* Product Info - Compact but clear */}
          <div className="space-y-1">
            <h4 className="text-white font-bold text-xl line-clamp-1">
              {product.name}
            </h4>
            
            <p className="text-gray-400 text-sm">
              {product.brand && `${product.brand} • `}
              {product.category?.name || 'Bike'}
              {product.condition && ` • ${product.condition}`}
            </p>
            
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-400">
                  KSh {Number(product.price).toLocaleString()}
                </span>
                {product.compare_price && (
                  <span className="text-base text-gray-500 line-through">
                    KSh {Number(product.compare_price).toLocaleString()}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              {product.quantity > 0 ? (
                <span className="text-sm text-green-400 font-medium flex items-center bg-green-400/10 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-sm text-red-400 font-medium flex items-center bg-red-400/10 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-1.5"></span>
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

// Product Card Skeleton Component
const ProductCardSkeleton = ({ delay = 0 }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Image skeleton */}
      <div className="relative pb-[75%] bg-gray-200 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton - 2 lines */}
        <div className="space-y-2 h-12">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Brand skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        
        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;