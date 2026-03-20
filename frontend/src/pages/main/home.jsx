import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  Menu,
  X,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  ArrowUpRight,
  Sparkles,
  Bike
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productAPI } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

// Animation hook for scroll reveals
const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Glassmorphism Navbar
const ModernNavbar = ({ cartCount = 0 }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-orange-100/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div 
                className="w-10 h-10 rounded-xl flex items-end justify-start p-1.5 transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                }}
              >
                <span 
                  className="text-lg font-bold text-white leading-none"
                  style={{ fontFamily: '"Lobster Two", cursive' }}
                >
                  OS
                </span>
              </div>
              <span 
                className="text-2xl font-bold bg-clip-text text-transparent hidden sm:block"
                style={{
                  fontFamily: '"Pacifico", cursive',
                  backgroundImage: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                }}
              >
                Oshocks
              </span>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search bikes, parts, accessories..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-100/80 rounded-full border-2 border-transparent focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-orange-50 transition-colors relative group">
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
              </Link>
              <Link to="/cart" className="p-2.5 rounded-full hover:bg-orange-50 transition-colors relative group">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/shop" 
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
              >
                Shop Now
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              {['Shop', 'Repairs', 'Sell', 'Support'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-orange-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="font-semibold text-gray-800">{item}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
};

// Animated Counter
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal();

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

// Modern Hero Section
const ModernHero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgb(255, 69, 0) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgb(255, 165, 0) 0%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485965120184-e224f7a1d7f0?w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <div 
        className="absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ 
          background: 'linear-gradient(135deg, rgb(255, 69, 0), rgb(255, 165, 0))',
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
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
              {[
                { value: 2500, suffix: '+', label: 'Bikes Sold' },
                { value: 15000, suffix: '+', label: 'Happy Riders' },
                { value: 50, suffix: '+', label: 'Expert Mechanics' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-white">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Featured Product Card */}
          <div className="hidden lg:block relative">
            <div 
              className="relative aspect-square max-w-md mx-auto"
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&q=80" 
                  alt="Featured Bike" 
                  className="w-full h-64 object-contain mb-4 drop-shadow-2xl"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">NEW ARRIVAL</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Trek Domane AL 2</h3>
                  <p className="text-gray-400">Road Bike • Carbon Fork • Shimano Groupset</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-orange-400">KSh 45,000</span>
                    <button className="p-3 bg-orange-500 rounded-full hover:bg-orange-600 transition-colors">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

// Bento Grid Features
const BentoFeatures = () => {
  const [ref, isVisible] = useScrollReveal();

  const features = [
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "Same-day delivery in Nairobi Metro. Real-time tracking from our stores to your door.",
      color: "from-blue-500 to-cyan-400",
      size: "col-span-1",
    },
    {
      icon: CreditCard,
      title: "M-Pesa & Cards",
      description: "Pay your way. Secure M-Pesa integration and bank card support.",
      color: "from-orange-500 to-red-500",
      size: "col-span-1",
    },
    {
      icon: Wrench,
      title: "Pro Repairs",
      description: "Expert mechanics for every bike type. Book online, track progress.",
      color: "from-emerald-500 to-teal-400",
      size: "col-span-1 md:col-span-2 lg:col-span-1",
    },
    {
      icon: Store,
      title: "Multi-Vendor",
      description: "Access 50+ verified sellers. Competitive prices, quality assured.",
      color: "from-purple-500 to-pink-500",
      size: "col-span-1",
    },
    {
      icon: Shield,
      title: "Buyer Protection",
      description: "7-day returns, verified sellers, secure escrow payments.",
      color: "from-indigo-500 to-purple-500",
      size: "col-span-1 md:col-span-2",
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            More than just a marketplace — your complete cycling ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`${feature.size} group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              
              <div className="mt-4 flex items-center text-sm font-semibold text-gray-400 group-hover:text-orange-500 transition-colors">
                Learn more <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Editorial Product Grid
const EditorialProducts = ({ products, loading, onAddToCart, onToggleWishlist, isInWishlist, addingToCart, togglingWishlist }) => {
  const [ref, isVisible] = useScrollReveal();
  const [hoveredProduct, setHoveredProduct] = useState(null);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded-2xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const featured = products.slice(0, 2);
  const standard = products.slice(2, 6);

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div>
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              Curated Selection
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Featured Collection</h2>
          </div>
          <Link 
            to="/shop" 
            className="group flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all"
          >
            View all products <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large Featured Items */}
          {featured.map((product, idx) => (
            <div 
              key={product.id}
              className={`lg:col-span-6 group relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/3] cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <img 
                src={product.images?.[0]?.image_url || product.image_url || 'https://via.placeholder.com/800x600'} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    {product.brand && (
                      <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">{product.brand}</span>
                    )}
                    <h3 className="text-2xl md:text-3xl font-bold text-white">{product.name}</h3>
                    <p className="text-gray-300 line-clamp-1 max-w-md hidden md:block">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">KSh {Number(product.price).toLocaleString()}</div>
                    {product.compare_price && (
                      <div className="text-lg text-gray-400 line-through">KSh {Number(product.compare_price).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className={`flex gap-3 mt-6 transition-all duration-300 ${hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    disabled={addingToCart === product.id}
                    className="flex-1 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {addingToCart === product.id ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className={`p-3 rounded-full transition-colors ${
                      isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              {product.is_featured && (
                <span className="absolute top-6 left-6 px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  FEATURED
                </span>
              )}
              {product.compare_price && (
                <span className="absolute top-6 right-6 px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
                </span>
              )}
            </div>
          ))}

          {/* Standard Grid Items */}
          {standard.map((product, idx) => (
            <div 
              key={product.id}
              className={`lg:col-span-3 group relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${(idx + 2) * 100}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <img 
                src={product.images?.[0]?.image_url || product.image_url || 'https://via.placeholder.com/400x500'} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Quick Add - Appears on Hover */}
              <div className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${hoveredProduct === product.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    disabled={addingToCart === product.id}
                    className="flex-1 py-2.5 bg-white text-gray-900 rounded-full text-sm font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                  >
                    {addingToCart === product.id ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><ShoppingCart className="w-4 h-4" /> Add</>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className={`p-2.5 rounded-full ${isInWishlist(product.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Always Visible Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold text-orange-600">KSh {Number(product.price).toLocaleString()}</span>
                  {product.condition && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{product.condition}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Services Marquee
const ServicesMarquee = () => {
  const services = [
    { icon: Bike, text: "Premium Bikes" },
    { icon: Wrench, text: "Expert Repairs" },
    { icon: Truck, text: "Fast Delivery" },
    { icon: Shield, text: "Verified Sellers" },
    { icon: CreditCard, text: "Secure Payments" },
    { icon: Headphones, text: "24/7 Support" },
  ];

  return (
    <div className="py-8 bg-gray-900 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...services, ...services, ...services].map((service, idx) => (
          <div key={idx} className="flex items-center gap-3 mx-8 text-white/60">
            <service.icon className="w-5 h-5 text-orange-500" />
            <span className="font-semibold uppercase tracking-wider text-sm">{service.text}</span>
            <span className="text-orange-500">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modern CTA Section
const ModernCTA = () => {
  const [ref, isVisible] = useScrollReveal();

  return (
    <section ref={ref} className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">Ride?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of cyclists who trust Oshocks for their biking journey. From first bikes to pro upgrades.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/seller/register"
              className="px-10 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-full font-bold text-lg hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Become a Seller
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 pt-12 border-t border-gray-200">
            {[
              { icon: Shield, text: "Secure Payments" },
              { icon: TrendingUp, text: "Best Prices" },
              { icon: Clock, text: "Fast Delivery" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-gray-600">
                <item.icon className="w-5 h-5 text-orange-500" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Modern Footer
const ModernFooter = () => {
  const footerLinks = {
    Shop: ['Bikes', 'Parts', 'Accessories', 'New Arrivals', 'Deals'],
    Services: ['Repairs', 'Custom Builds', 'Trade-In', 'Bike Fitting'],
    Company: ['About Us', 'Careers', 'Press', 'Sustainability'],
    Support: ['Contact', 'FAQ', 'Shipping', 'Returns', 'Warranty'],
  };

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-end justify-start p-2"
                style={{
                  background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                }}
              >
                <span className="text-xl font-bold text-white" style={{ fontFamily: '"Lobster Two", cursive' }}>OS</span>
              </div>
              <span 
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{
                  fontFamily: '"Pacifico", cursive',
                  backgroundImage: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                }}
              >
                Oshocks
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Kenya's premier cycling marketplace. Quality bikes, expert service, and a community that rides together.
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full font-semibold hover:shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-lg mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link to={`/${link.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-orange-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <span>© 2025 Oshocks. All rights reserved.</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {[Instagram, Twitter, Facebook].map((Icon, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors group"
              >
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Homepage Component
const HomePage = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ limit: 12 });
      setProducts(response.data?.data || response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    try {
      const variant = product.variants?.[0] || product.colors?.[0] || null;
      const result = await addToCart(product, 1, variant);
      if (result.success) {
        setCartCount(prev => prev + 1);
        // Could add toast notification here
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleToggleWishlist = async (product) => {
    setTogglingWishlist(product.id);
    try {
      await toggleWishlist(product, null);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setTogglingWishlist(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Oshocks - Kenya's Premier Cycling Marketplace</title>
        <meta name="description" content="Premium bikes, expert repairs, and fast delivery. Shop the best cycling products in Kenya." />
      </Helmet>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        <ModernNavbar cartCount={cartCount} />
        <ModernHero />
        <ServicesMarquee />
        <BentoFeatures />
        <EditorialProducts 
          products={products}
          loading={loading}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={isInWishlist}
          addingToCart={addingToCart}
          togglingWishlist={togglingWishlist}
        />
        <ModernCTA />
        <ModernFooter />
      </div>
    </>
  );
};

export default HomePage;