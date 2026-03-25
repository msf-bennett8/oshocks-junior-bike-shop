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
  ChevronRight,
  Calendar,
  Mountain,
  Timer,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ActionModal from '../../components/common/ActionModal';
import productService from '../../services/productService';
import { ProductRow } from '../../components/shop';

const HomePage = () => {
  const { toggleWishlist, isInWishlist, addToWishlistWithGuest, mergeGuestWishlist } = useWishlist();
  const { addToCart, toggleCart, loading: cartLoading, isInCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSlowLoad, setIsSlowLoad] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(null); 
  const [addingToCart, setAddingToCart] = useState(null); 
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [checkingOut, setCheckingOut] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  
  // Sections state for collections
  const [sections, setSections] = useState({
    featured: [],
    new_arrivals: [],
    best_sellers: [],
    deals: []
  });
  const [sectionsLoading, setSectionsLoading] = useState(true);
  
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

  // Handle View All click for collections
  const handleViewAll = (section, params = {}) => {
    // Build query params for URL
    const queryParams = new URLSearchParams();
    queryParams.set('view', 'all');
    
    // Apply section-specific filters
    switch(section) {
      case 'featured':
        queryParams.set('is_featured', 'true');
        break;
      case 'new_arrivals':
        queryParams.set('is_new_arrival', 'true');
        queryParams.set('sort', 'latest');
        break;
      case 'best_sellers':
        queryParams.set('sort', 'popular');
        break;
      case 'deals':
        queryParams.set('on_sale', 'true');
        break;
      default:
        break;
    }
    
    // Navigate to shop with query params
    navigate(`/shop?${queryParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    loadSections();
  }, []);

  // Fetch product sections for collections
  const loadSections = async () => {
    try {
      setSectionsLoading(true);
      const response = await productService.getProductSections(6);
      if (response.success) {
        setSections(response.data);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchProducts = async (retryAttempt = 0) => {
    setRetryCount(retryAttempt);
    try {
      setLoading(true);
      setError(null);
      setIsSlowLoad(false);
      
      // Show loader after 3 seconds on slow connections
      const slowLoadTimer = setTimeout(() => {
        setIsSlowLoad(true);
      }, 3000);
      
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
        // Auto-retry once before showing error
        if (retryAttempt < 1) {
          setTimeout(() => fetchProducts(retryAttempt + 1), 2000);
          return;
        }
        setError('Connection timeout. Please check your internet and try again.');
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
        <title>Oshocks Bike Shop - A Premier Cycling Marketplace</title>
        <meta
          name="description"
          content="Buy bicycles, book repairs, and discover cycling products in the country. Multi-vendor marketplace with M-Pesa payments, fast delivery, and professional bike services."
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

          <div className="container mx-auto px-4 relative z-10 py-12 lg:pt-8 lg:pb-0">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-medium text-white/90">A Premier Cycling Marketplace</span>
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

                <div className="flex flex-row gap-3">
                  <Link
                    to="/shop"
                    className="group px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-[5px] font-bold text-base hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    Shop Bikes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/book-service"
                    className="px-6 py-3 bg-white text-gray-900 rounded-[5px] font-bold text-base hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
                  >
                    Book Service
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <span className="flex items-center gap-1.5 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Truck className="w-4 h-4 text-orange-400" /> Free Delivery Nairobi
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-orange-400" /> Same-Day Service
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/90 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <BadgeCheck className="w-4 h-4 text-orange-400" /> 50+ Expert Mechanics
                  </span>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-6 border-t border-white/10">
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

                {/* Server Wake Up Loader */}
                {isSlowLoad && (
                  <div className="lg:hidden mt-8">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 border border-orange-400 shadow-xl">
                      <div className="flex flex-col items-center gap-4">
                        {/* OS Logo */}
                        <div 
                          className="w-16 h-16 rounded-xl flex items-end justify-start p-2"
                          style={{
                            background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                            boxShadow: '0 8px 30px rgba(255, 69, 0, 0.5)',
                            animation: 'logo-pulse 2s ease-in-out infinite'
                          }}
                        >
                          <span 
                            className="text-white font-bold text-3xl leading-none"
                            style={{ 
                              fontFamily: "'Lobster Two', cursive",
                              transform: 'translateX(-5%) translateY(5%)',
                              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            OS
                          </span>
                        </div>
                        
                        {/* Sequential Fill Spinner */}
                        <div className="relative w-9 h-9">
                          {[...Array(12)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-1.5 h-3 bg-transparent border border-white/85 rounded-sm"
                              style={{
                                top: '50%',
                                left: '50%',
                                transformOrigin: 'center bottom',
                                marginTop: '-12px',
                                marginLeft: '-3px',
                                transform: `rotate(${i * 30}deg) translateY(-12px)`,
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-white rounded-sm"
                                style={{
                                  height: '0%',
                                  animation: `blade-fill 0.6s linear infinite`,
                                  animationDelay: `${i * 0.05}s`
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        
                        {/* Loading Text */}
                        <div 
                          className="text-white text-xl"
                          style={{ fontFamily: "'Pacifico', cursive" }}
                        >
                          Loading please wait
                        </div>
                        
                        <div 
                          className="text-white/90 text-sm"
                          style={{ fontFamily: "'Lobster Two', cursive" }}
                        >
                          Setting up your session...
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-40 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-white via-orange-100 to-white rounded-full"
                            style={{
                              animation: 'progress 2s ease-in-out infinite',
                              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Products Grid - Shows below buttons on small screens */}
                {!isSlowLoad && <div className="lg:hidden mt-8">
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
                </div>}
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
                    
                    {/* Server Wake Up Loader Overlay */}
                    {isSlowLoad && (
                      <div className="absolute inset-0 z-30 bg-gradient-to-br from-orange-500/95 to-orange-600/95 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                        <div className="flex flex-col items-center gap-5">
                          {/* OS Logo */}
                          <div 
                            className="w-20 h-20 rounded-xl flex items-end justify-start p-2"
                            style={{
                              background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                              boxShadow: '0 10px 30px rgba(255, 69, 0, 0.4)',
                              animation: 'logo-pulse 2s ease-in-out infinite'
                            }}
                          >
                            <span 
                              className="text-white font-bold text-4xl leading-none"
                              style={{ 
                                fontFamily: "'Lobster Two', cursive",
                                transform: 'translateX(-5%) translateY(5%)',
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                              }}
                            >
                              OS
                            </span>
                          </div>
                          
                          {/* Sequential Fill Spinner */}
                          <div className="relative w-9 h-9">
                            {[...Array(12)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-1.5 h-3 bg-transparent border border-white/85 rounded-sm"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transformOrigin: 'center bottom',
                                  marginTop: '-12px',
                                  marginLeft: '-3px',
                                  transform: `rotate(${i * 30}deg) translateY(-12px)`,
                                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-white rounded-sm"
                                  style={{
                                    height: '0%',
                                    animation: `blade-fill 0.6s linear infinite`,
                                    animationDelay: `${i * 0.05}s`
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Loading Text */}
                          <div 
                            className="text-white text-2xl"
                            style={{ fontFamily: "'Pacifico', cursive" }}
                          >
                            Loading please wait
                          </div>
                          
                          <div 
                            className="text-white/95 text-base"
                            style={{ fontFamily: "'Lobster Two', cursive" }}
                          >
                            Setting up your session...
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-white via-orange-100 to-white rounded-full"
                              style={{
                                animation: 'progress 2s ease-in-out infinite',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {loading && !isSlowLoad ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[500px]">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-gray-700/50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : !isSlowLoad && products.length > 0 ? (
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
                                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                    {product.is_featured && (
                                      <span className="px-2 py-0.5 bg-orange-500/80 text-white text-[10px] font-bold rounded">FEATURED</span>
                                    )}
                                  </div>
                                  
                                  {/* Discount Badge - Top Right */}
                                  {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                                      <span className="px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded shadow-md animate-pulse flex items-center gap-0.5">
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}%
                                      </span>
                                      <span className="px-1.5 py-0.5 bg-orange-500/80 text-white text-[9px] font-semibold rounded">
                                        Save KSh {(Number(product.compare_price) - Number(product.price)).toLocaleString()}
                                      </span>
                                    </div>
                                  )}

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
                    ) : !isSlowLoad && (
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
          /* Hide scrollbar for variant thumbnails */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Loader Animations from index.html */
          @keyframes logo-pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 10px 30px rgba(255, 69, 0, 0.4);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 15px 40px rgba(255, 69, 0, 0.6);
            }
          }
          
          @keyframes blade-fill {
            0%, 100% { 
              height: 0%;
              background: white;
            }
            8.33% { 
              height: 100%;
              background: white;
              box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2);
            }
            16.66% { 
              height: 100%;
              background: rgba(255, 255, 255, 0.9);
            }
            25% {
              height: 0%;
              background: rgba(255, 255, 255, 0.7);
            }
          }
          
          @keyframes progress {
            0% { width: 0%; transform: translateX(0); }
            50% { width: 100%; transform: translateX(0); }
            100% { width: 100%; transform: translateX(100%); }
          }
        `}</style>

        {/* Promotions Banner - MOVED UP before New Arrivals */}
        <section className="py-6 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
                  SPRING SPECIAL
                </div>
                <div>
                  <h3 className="font-bold text-lg">20% Off All Helmets + Free Fitting</h3>
                  <p className="text-white/90 text-sm">Book any service and get gear discounts automatically applied.</p>
                </div>
              </div>
              <Link 
                to="/shop?category=helmets" 
                className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg whitespace-nowrap"
              >
                Shop Helmets →
              </Link>
            </div>
          </div>
        </section>

                {/* Collections Section - Featured, Deals, New Arrivals, Best Sellers */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            {/* Featured Products */}
            <ProductRow
              title="Featured Products"
              products={sections.featured}
              viewAllLink="/shop"
              viewAllParams={{ is_featured: true }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Sparkles}
              onViewAll={handleViewAll}
              sectionType="featured"
            />

            {/* Hot Deals */}
            <ProductRow
              title="Hot Deals"
              products={sections.deals}
              viewAllLink="/shop"
              viewAllParams={{ on_sale: true }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Percent}
              onViewAll={handleViewAll}
              sectionType="deals"
            />

            {/* New Arrivals */}
            <ProductRow
              title="New Arrivals"
              products={sections.new_arrivals}
              viewAllLink="/shop"
              viewAllParams={{ is_new_arrival: true }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={Zap}
              onViewAll={handleViewAll}
              sectionType="new_arrivals"
            />

            {/* Best Sellers */}
            <ProductRow
              title="Best Sellers"
              products={sections.best_sellers}
              viewAllLink="/shop"
              viewAllParams={{ sort: 'popular' }}
              loading={sectionsLoading}
              showModal={showModal}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              icon={TrendingUp}
              onViewAll={handleViewAll}
              sectionType="best_sellers"
            />
          </div>
        </section>

        {/* Professional Services Booking Section */}
        <section className="py-16 md:py-20 relative overflow-hidden bg-gray-900 text-white">
          {/* Animated Background - Same as Hero */}
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
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-semibold mb-4">
                PROFESSIONAL BIKE CARE
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Expert Service Online</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Drop off your bike. We handle the rest. Real-time booking with instant confirmation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Quick Repairs */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wrench className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Quick Repairs</h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Flat tires, brake adjustments, chain fixes. In-and-out service while you wait.
                </p>
                <ul className="text-sm text-blue-200 mb-6 space-y-2">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-400" /> 2-4 hour turnaround</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-orange-400" /> 30-day warranty</li>
                </ul>
                <div className="text-3xl font-bold text-orange-400 mb-6">From KSh 500</div>
                <Link 
                  to="/book-service?type=repair" 
                  className="block w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-center rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Book Repair <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Full Tune-Up - Featured */}
              <div className="bg-gradient-to-b from-orange-500 to-red-600 p-8 rounded-2xl shadow-2xl transform md:-translate-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white text-orange-600 text-xs font-bold px-4 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Full Tune-Up</h3>
                <p className="text-orange-100 mb-4 leading-relaxed">
                  Complete overhaul. Deep clean, adjustment, lubrication. Like new performance.
                </p>
                <ul className="text-sm text-orange-100 mb-6 space-y-2">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4" /> 24-hour turnaround</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> 90-day warranty</li>
                  <li className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" /> Free pick-up & delivery</li>
                </ul>
                <div className="text-3xl font-bold text-white mb-6">KSh 2,500</div>
                <Link 
                  to="/book-service?type=tuneup" 
                  className="block w-full py-4 bg-white text-orange-600 hover:bg-gray-100 text-center rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Book Tune-Up <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Custom Build */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-orange-500/50 transition-all hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Custom Build</h3>
                <p className="text-blue-100 mb-4 leading-relaxed">
                  Dream bike assembly. Parts sourcing, professional fitting, full testing.
                </p>
                <ul className="text-sm text-blue-200 mb-6 space-y-2">
                  <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" /> Free consultation</li>
                  <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /> 1-year build warranty</li>
                </ul>
                <div className="text-3xl font-bold text-purple-400 mb-6">Quote Based</div>
                <Link 
                  to="/book-service?type=custom" 
                  className="block w-full py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-center rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Start Consult <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-blue-200 text-sm">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-orange-400" /> Same-day slots available</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-400" /> Real-time booking</span>
              <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-orange-400" /> Certified mechanics</span>
            </div>
          </div>
        </section>

        {/* Why Choose Oshocks - Merged with Why Shop With Us */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">Why Choose Oshocks?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Everything you need for a seamless cycling experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Card 1 - Fast Delivery */}
              <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInLeft" style={{ animationDelay: '0ms' }}>
                <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Fast and reliable delivery in Nairobi Metropolitan. Track your order in real-time from our stores to your doorstep.
                </p>
              </div>
              
              {/* Card 2 - Flexible Payments */}
              <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInRight" style={{ animationDelay: '100ms' }}>
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Flexible Payments</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Pay conveniently with M-Pesa, Airtel Money, bank cards, or cash on delivery. Secure transactions guaranteed.
                </p>
              </div>
              
              {/* Card 3 - Professional Repairs */}
              <div className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInLeft" style={{ animationDelay: '200ms' }}>
                <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Wrench className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Professional Repairs</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Expert bike mechanics available for repairs, maintenance, and custom builds. Book appointments online easily.
                </p>
              </div>
              
              {/* Card 4 - Quality Verified */}
              <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInRight" style={{ animationDelay: '300ms' }}>
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Quality Verified</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  All our products are tested and undergo strict verification for authenticity and quality standards.
                </p>
              </div>
              
              {/* Card 5 - Multi-Vendor */}
              <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInLeft" style={{ animationDelay: '400ms' }}>
                <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">Multi-Vendor Platform</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Access products from multiple verified sellers. More choices, competitive prices, quality assured.
                </p>
              </div>
              
              {/* Card 6 - 24/7 Support */}
              <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-slideInRight" style={{ animationDelay: '500ms' }}>
                <div className="w-16 h-16 bg-indigo-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">24/7 Support</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Our customer support team is always available to help with your inquiries and concerns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Animation Styles */}
        <style>{`
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.6s ease-out forwards;
            opacity: 0;
          }
          .animate-slideInRight {
            animation: slideInRight 0.6s ease-out forwards;
            opacity: 0;
          }
        `}</style>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">What Riders Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Join other satisfied cyclists across the region</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition relative">
                <div className="flex text-yellow-400 text-lg mb-4">★★★★★</div>
                <p className="text-gray-600 mb-6 leading-relaxed">"Got my mountain bike serviced here. They replaced the brakes and tuned the gears in 3 hours. Professional team and fair pricing!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">JK</div>
                  <div>
                    <div className="font-bold text-gray-800">John Kamau</div>
                    <div className="text-sm text-gray-500">Trek Mountain Bike • Nairobi</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition relative border-2 border-orange-200">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  VERIFIED BUYER
                </div>
                <div className="flex text-yellow-400 text-lg mb-4">★★★★★</div>
                <p className="text-gray-600 mb-6 leading-relaxed">"Best bike shop in Nairobi. I bought a city commuter and the free delivery was a bonus. The mechanic even gave me maintenance tips!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">SM</div>
                  <div>
                    <div className="font-bold text-gray-800">Sarah Mwangi</div>
                    <div className="text-sm text-gray-500">City Commuter • Kiambu</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition relative">
                <div className="flex text-yellow-400 text-lg mb-4">★★★★★</div>
                <p className="text-gray-600 mb-6 leading-relaxed">"They built my custom road bike from parts I sourced. Excellent communication throughout and the final setup was perfect. Highly recommend!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">MO</div>
                  <div>
                    <div className="font-bold text-gray-800">Mike Ochieng</div>
                    <div className="text-sm text-gray-500">Custom Build • Mombasa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600">4.9/5</div>
                <div className="text-gray-600 text-sm">Average Rating</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600">2,500+</div>
                <div className="text-gray-600 text-sm">Bikes Serviced</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600">15,000+</div>
                <div className="text-gray-600 text-sm">Happy Customers</div>
              </div>
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600">98%</div>
                <div className="text-gray-600 text-sm">Would Recommend</div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" /> Same-day slots available this week
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-800">Need a Tune-Up? Book Today.</h2>
            <p className="text-lg md:text-xl lg:text-2xl mb-4 md:mb-6 max-w-3xl mx-auto leading-relaxed text-gray-700">
              Don't let a squeaky chain or flat tire ruin your weekend ride.
            </p>
            <p className="text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto">
              Join 15,000+ riders who trust Oshocks. 50+ certified mechanics. 24-hour turnaround. Guaranteed satisfaction.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/book-service"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition transform duration-200 text-lg flex items-center justify-center gap-2 group"
              >
                Book Service Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-white text-orange-600 border-2 border-transparent font-bold rounded-lg hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/20 transform hover:-translate-y-1 transition-all duration-200 text-lg flex items-center justify-center gap-2"
              >
                Browse Products <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-green-500" /> 30-90 Day Warranty</span>
              <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-green-500" /> Free Pick-up & Delivery</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Certified Mechanics</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

// Server Wake Up Loader Component - Exact match to index.html loader
const ServerWakeUpLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
      <div className="flex flex-col items-center gap-6">
        {/* OS Logo - Exact Match to index.html */}
        <div 
          className="w-20 h-20 rounded-xl flex items-end justify-start p-2"
          style={{
            background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
            boxShadow: '0 10px 30px rgba(255, 69, 0, 0.4)',
            animation: 'logo-pulse 2s ease-in-out infinite'
          }}
        >
          <span 
            className="text-white font-bold text-4xl leading-none"
            style={{ 
              fontFamily: "'Lobster Two', cursive",
              transform: 'translateX(-5%) translateY(5%)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            OS
          </span>
        </div>
        
        {/* Sequential Fill Spinner - 12 Outlined Blades */}
        <div className="relative w-9 h-9">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-3 bg-transparent border border-white/85 rounded-sm"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: 'center bottom',
                marginTop: '-12px',
                marginLeft: '-3px',
                transform: `rotate(${i * 30}deg) translateY(-12px)`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div 
                className="absolute bottom-0 left-0 right-0 bg-white rounded-sm"
                style={{
                  height: '0%',
                  animation: `blade-fill 0.6s linear infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Loading Text */}
        <div 
          className="text-white text-2xl font-normal"
          style={{ 
            fontFamily: "'Pacifico', cursive",
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          Loading please wait
        </div>
        
        <div 
          className="text-white/95 text-base"
          style={{ 
            fontFamily: "'Lobster Two', cursive",
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.15)'
          }}
        >
          Setting up your session...
        </div>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-white via-orange-100 to-white rounded-full"
            style={{
              animation: 'progress 2s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
          />
        </div>
      </div>
    </div>
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