//frontend/src/components/layout/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import authService from '../../services/authService';
import { Search, User, ShoppingCart, Menu, X, ChevronRight, Home, Package, Info, Mail, LayoutDashboard, LogOut, Sparkles, Wrench, HelpCircle, BookOpen, Settings, ArrowRight, Mountain, Bike, Zap, Baby, Backpack, Settings as SettingsIcon, Flame, DollarSign, Tag, MapPin, Ruler, Shield, AlertTriangle, Store, Briefcase, Handshake, Gift, Users, Package2, BarChart3, FolderTree, Heart } from 'lucide-react';
import SearchBar from '../common/SearchBar';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showElevationModal, setShowElevationModal] = useState(false);
  const [elevationMessage, setElevationMessage] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileMenuRef = useRef(null);
  const [elevationPassword, setElevationPassword] = useState('');
  const [isElevating, setIsElevating] = useState(false);
  const [elevationError, setElevationError] = useState('');

  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const cartItemCount = cartItems?.length || 0;

  // Close profile menu when clicking outside (desktop only - mobile uses fixed positioning)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close desktop menu (inside profileMenuRef), not mobile fixed menu
      if (profileMenuRef.current && profileMenuRef.current.contains(event.target) === false) {
        // Check if click is on mobile menu (fixed positioned) - don't close if so
        const mobileMenu = document.querySelector('.fixed.right-4.top-16');
        if (mobileMenu && mobileMenu.contains(event.target)) {
          return;
        }
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsSearchOpen(false);
        setIsSidebarOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/');
  };

  const handleUserIconClick = (e) => {
    e.preventDefault();
    const now = Date.now();
    
    if (now - lastClickTime > 3000) {
      setClickCount(1);
      setLastClickTime(now);
      setShowProfileMenu(!showProfileMenu);
      return;
    }
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setLastClickTime(now);
    
    if (newCount >= 5) {
      setShowProfileMenu(false);
    }
    
    if (newCount === 7) {
      setElevationMessage('4 more clicks to access admin settings...');
    } else if (newCount === 8) {
      setElevationMessage('3 more clicks...');
    } else if (newCount === 9) {
      setElevationMessage('2 more clicks...');
    } else if (newCount === 10) {
      setElevationMessage('1 more click...');
    } else if (newCount === 11) {
      setShowElevationModal(true);
      setClickCount(0);
      setElevationMessage('');
    } else if (newCount < 5) {
      setShowProfileMenu(!showProfileMenu);
    }
  };

  const handleElevation = async () => {
    if (!elevationPassword.trim()) {
      setElevationError('Please enter a password');
      return;
    }

    setIsElevating(true);
    setElevationError('');

    try {
      const response = await authService.secretElevate(elevationPassword);
      await authService.getCurrentUser();
      setShowElevationModal(false);
      setElevationPassword('');
      
      const newRole = response.data.role;
      if (newRole === 'super_admin') {
        window.location.href = '/super-admin/dashboard';
      } else if (newRole === 'admin') {
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      setElevationError(error.response?.data?.message || 'Invalid password. Access denied.');
    } finally {
      setIsElevating(false);
    }
  };

  // Sidebar menu categories (all nav items moved here)
  const sidebarCategories = React.useMemo(() => {
    const categories = [
      {
        title: 'Navigate',
        items: [
          { name: 'Home', link: '/', icon: Home },
          { name: 'Shop', link: '/shop', icon: Package },
          { name: 'Services', link: '/services', icon: Wrench },
          { name: 'About', link: '/about', icon: Info },
          { name: 'Contact', link: '/contact', icon: Mail },
          { name: 'FAQ', link: '/faq', icon: HelpCircle },
          { name: 'Blog', link: '/blog', icon: BookOpen },
        ]
      },
      {
        title: 'Shop Categories',
        items: [
          { name: 'Mountain Bikes', link: '/shop?category=mountain', icon: Mountain },
          { name: 'Road Bikes', link: '/shop?category=road', icon: Bike },
          { name: 'Electric Bikes', link: '/shop?category=electric', icon: Zap },
          { name: 'Kids Bikes', link: '/shop?category=kids', icon: Baby },
          { name: 'Accessories', link: '/shop?category=accessories', icon: Backpack },
          { name: 'Spare Parts', link: '/spare-parts-accessories', icon: SettingsIcon },
        ]
      },
      {
        title: 'Quick Links',
        items: [
          { name: 'New Arrivals', link: '/new-arrivals', icon: Sparkles },
          { name: 'Best Sellers', link: '/best-sellers', icon: Flame },
          { name: 'Special Offers', link: '/special-offers', icon: DollarSign },
          { name: 'Clearance Sale', link: '/clearance-sale', icon: Tag },
          { name: 'Bike Finder', link: '/bike-finder', icon: Search },
          { name: 'Gift Cards', link: '/gift-cards', icon: Gift },
        ]
      },
      {
        title: 'Resources',
        items: [
          { name: 'Size Guide', link: '/size-guide', icon: Ruler },
          { name: 'Bike Maintenance', link: '/bike-maintenance', icon: Wrench },
          { name: 'Warranty Info', link: '/warranty-information', icon: Shield },
          { name: 'Safety Tips', link: '/safety', icon: AlertTriangle },
          { name: 'Store Locations', link: '/store-locations', icon: MapPin },
        ]
      },
      {
        title: 'Company',
        items: [
          { name: 'About Us', link: '/about', icon: Info },
          { name: 'Become a Seller', link: '/become-a-seller', icon: Store },
          { name: 'Partner With Us', link: '/partner-with-us', icon: Handshake },
          { name: 'Careers', link: '/careers', icon: Briefcase },
        ]
      }
    ];

    if (user?.role === 'seller') {
      categories.push({
        title: 'Seller Dashboard',
        items: [
          { name: 'Dashboard', link: '/seller/dashboard', icon: LayoutDashboard },
          { name: 'My Products', link: '/seller/products', icon: Package2 },
          { name: 'Add Product', link: '/seller/products/add', icon: Package },
          { name: 'Orders', link: '/seller/orders', icon: Package },
          { name: 'Analytics', link: '/seller/analytics', icon: BarChart3 },
          { name: 'Settings', link: '/seller/settings', icon: Settings },
        ]
      });
    }
    
    if (user && (
      user.role === 'delivery_agent' || 
      user.role === 'shop_attendant' || 
      user.role === 'seller' || 
      user.role === 'admin' || 
      user.role === 'super_admin'
    )) {
      categories.push({
        title: 'Payment Recorder',
        items: [
          { name: 'Recorder Dashboard', link: '/recorder', icon: DollarSign },
          { name: 'Pending Payments', link: '/recorder', icon: Package },
          { name: 'Search Orders', link: '/recorder', icon: Search },
        ]
      });
    }

    if (user?.role === 'super_admin') {
      categories.push({
        title: 'Super Admin',
        items: [
          { name: 'Dashboard', link: '/super-admin/dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', link: '/super-admin/users', icon: Users },
          { name: 'Manage Products', link: '/super-admin/products', icon: Package2 },
          { name: 'Orders', link: '/super-admin/orders', icon: Package },
          { name: 'Categories', link: '/super-admin/categories', icon: FolderTree },
          { name: 'Analytics', link: '/super-admin/analytics', icon: BarChart3 },
          { name: 'Reports', link: '/super-admin/reports', icon: BarChart3 },
          { name: 'Settings', link: '/super-admin/settings', icon: Settings },
        ]
      });
    } else if (user?.role === 'admin') {
      categories.push({
        title: 'Admin',
        items: [
          { name: 'Dashboard', link: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', link: '/admin/users', icon: Users },
          { name: 'Manage Products', link: '/admin/products', icon: Package2 },
          { name: 'Orders', link: '/admin/orders', icon: Package },
          { name: 'Categories', link: '/admin/categories', icon: FolderTree },
          { name: 'Analytics', link: '/admin/analytics', icon: BarChart3 },
          { name: 'Reports', link: '/admin/reports', icon: BarChart3 },
          { name: 'Settings', link: '/admin/settings', icon: Settings },
        ]
      });
    }

    return categories;
  }, [user?.role]);

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
        
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in { animation: bounce-in 0.3s ease-out; }
        
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Modern Glassmorphism Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        lastScrollY > 50 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-orange-100/50' 
          : 'bg-white'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            
            {/* Desktop Logo (OS + Oshocks) / Mobile Logo (Oshocks only) */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              {/* OS Square - Hidden on mobile */}
              <div 
                className="hidden md:flex w-10 h-10 rounded-lg items-end justify-start p-1.5 transition-transform group-hover:scale-105"
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
              {/* Oshocks Text - Always visible */}
              <span 
                className="text-2xl font-bold bg-clip-text text-transparent"
                style={{
                  fontFamily: '"Pacifico", cursive',
                  backgroundImage: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                }}
              >
                Oshocks
              </span>
            </Link>

            {/* Desktop Search Bar - Opens Modal on Click */}
            <div 
              className="hidden lg:flex flex-1 max-w-xl mx-4 cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${searchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                <div
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-100/80 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-white transition-all text-sm text-gray-500 flex items-center"
                >
                  Search bikes, parts, accessories...
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              
              {/* Search - Mobile/Tablet only (when search bar hidden), opens modal */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 sm:p-2.5 rounded-full hover:bg-orange-50 transition-colors relative group"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
              </button>

              {/* Wishlist - All screens */}
              <Link to="/wishlist" className="relative p-2 sm:p-2.5 rounded-full hover:bg-orange-50 transition-colors group">
                <Heart className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 sm:p-2.5 rounded-full hover:bg-orange-50 transition-colors group">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Account - Mobile/Tablet */}
              {isAuthenticated ? (
                <div className="md:hidden relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="p-2 sm:p-2.5 rounded-full hover:bg-orange-50 transition-colors relative"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Mobile Profile Dropdown - Fixed positioning to avoid click outside issues */}
                  {showProfileMenu && (
                    <div className="fixed right-4 top-16 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-[60] animate-fade-in">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/dashboard'); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <LayoutDashboard size={18} className="text-gray-600" />
                        <span className="text-gray-900">Dashboard</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/profile'); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <User size={18} className="text-gray-600" />
                        <span className="text-gray-900">Profile</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/orders'); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Package size={18} className="text-gray-600" />
                        <span className="text-gray-900">Orders</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/settings'); setShowProfileMenu(false); }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Settings size={18} className="text-gray-600" />
                        <span className="text-gray-900">Settings</span>
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleLogout(); setShowProfileMenu(false); }} 
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="md:hidden p-2 sm:p-2.5 rounded-full hover:bg-orange-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </Link>
              )}

              {/* Account - Desktop */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={profileMenuRef}>
                  <div
                    onClick={handleUserIconClick}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <User className="w-5 h-5 text-gray-700" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-500">Hello, {user?.name?.split(' ')[0] || 'User'}</span>
                    </div>
                  </div>
        
                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                      <Link to="/dashboard" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                        <LayoutDashboard size={18} className="text-gray-600" />
                        <span className="text-gray-900">Dashboard</span>
                      </Link>
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                        <User size={18} className="text-gray-600" />
                        <span className="text-gray-900">Profile</span>
                      </Link>
                      <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors">
                        <Package size={18} className="text-gray-600" />
                        <span className="text-gray-900">Orders</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={18} className="text-gray-600" />
                        <span className="text-gray-900">Settings</span>
                      </Link>
                      <hr className="my-2" />
                      <button onClick={() => { handleLogout(); setShowProfileMenu(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600">
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-gray-700" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500">Hello, Sign in</span>
                  </div>
                </Link>
              )}

              {/* Sign Up Button - Desktop only */}
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 text-white font-medium text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                    borderRadius: '5px',
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Link>
              )}

              {/* Shop Now Button - Desktop only */}
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Hamburger - Opens Right Sidebar (always last) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Elevation Countdown Message */}
      {elevationMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {elevationMessage}
          </div>
        </div>
      )}

      {/* Elevation Password Modal */}
      {showElevationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Admin Access</h2>
              <button onClick={() => setShowElevationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">Enter admin password to elevate privileges</p>
            <input
              type="password"
              placeholder="Enter password"
              value={elevationPassword}
              onChange={(e) => setElevationPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              autoFocus
              disabled={isElevating}
              onKeyDown={(e) => { if (e.key === 'Enter') handleElevation(); }}
            />
            {elevationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {elevationError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowElevationModal(false); setElevationPassword(''); setElevationError(''); }}
                disabled={isElevating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleElevation}
                disabled={isElevating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isElevating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Verifying...</span></>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <SearchBar onClose={() => setIsSearchOpen(false)} variant="overlay" />
      )}

      {/* Right Sidebar - Desktop & Mobile */}
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar Header */}
          <div 
            className="p-4"
            style={{
              background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Logo - same height as greeting text */}
                <div 
                  className="rounded-lg flex items-end justify-start p-1.5 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                    width: '48px',
                    height: '48px',
                    aspectRatio: '1/1'
                  }}
                >
                  <span 
                    className="text-xl font-bold text-white leading-none"
                    style={{
                      fontFamily: '"Lobster Two", cursive',
                      transform: 'translateX(-5%) translateY(5%)'
                    }}
                  >
                    OS
                  </span>
                </div>
                
                {/* Clickable greeting that opens search */}
                <button 
                  onClick={() => {
                    setIsSidebarOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="text-left hover:opacity-80 transition-opacity"
                >
                  <div className="text-white">
                    <div className="text-xl font-bold leading-tight" style={{ fontFamily: '"Pacifico", cursive' }}>
                      {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0] || 'User'}` : 'Hello, Sign in'}
                    </div>
                    <div className="text-sm opacity-90" style={{ fontFamily: '"Pacifico", cursive' }}>what are you looking for?</div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="py-2">
            {sidebarCategories.map((category, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="px-4 py-2 text-sm font-bold text-gray-900 uppercase tracking-wider">{category.title}</h3>
                {category.items.map((item, itemIdx) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.link}
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors" />
                        <span className="text-gray-700 group-hover:text-orange-600 font-medium">{item.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Mobile-only: Search, Wishlist, Account */}
            <div className="lg:hidden border-t border-gray-200 pt-2 mt-2">
              <h3 className="px-4 py-2 text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Access</h3>
              
              {/* Mobile Search */}
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>

              {/* Mobile Wishlist */}
              <Link to="/wishlist" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-500 group-hover:text-orange-500'}`} />
                  <span className="text-gray-700 group-hover:text-orange-600 font-medium">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              </Link>

              {/* Mobile Account */}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                      <span className="text-gray-700 group-hover:text-orange-600 font-medium">Dashboard</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors w-full text-left text-red-600">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 space-y-2">
                  <Link to="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-orange-500 text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" onClick={() => setIsSidebarOpen(false)} className="flex items-center justify-center gap-2 w-full py-2.5 text-white font-medium rounded-lg transition-colors" style={{ background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)' }}>
                    <Sparkles className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;