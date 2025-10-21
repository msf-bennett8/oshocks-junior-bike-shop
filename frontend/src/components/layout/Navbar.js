//frontend/src/components/layout/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import authService from '../../services/authService';
import { Search, User, ShoppingCart, Menu, X, ChevronRight, ChevronDown, Home, Package, Info, Mail, LayoutDashboard, LogOut, Sparkles, Wrench, HelpCircle, BookOpen, Settings, ArrowUp, Mountain, Bike, Zap, Baby, Backpack, Settings as SettingsIcon, Star, Flame, DollarSign, Tag, MapPin, Ruler, Shield, AlertTriangle, Store, Briefcase, Handshake, Gift, UserCog, Users, Package2, BarChart3, FolderTree } from 'lucide-react';
import SearchBar from '../common/SearchBar'; // ← IMPORT THE NEW SEARCHBAR

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // ← FOR OVERLAY SEARCH
  const [isVisible, setIsVisible] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showElevationModal, setShowElevationModal] = useState(false);
  const [elevationMessage, setElevationMessage] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [elevationPassword, setElevationPassword] = useState('');
  const [isElevating, setIsElevating] = useState(false);
  const [elevationError, setElevationError] = useState('');

  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const desktopMenuRef = useRef(null);

  const cartItemCount = cartItems?.length || 0;

  // Close profile menu when clicking outside
useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
      setShowProfileMenu(false);
    }
  };

  if (showProfileMenu) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showProfileMenu]);

  // Handle scroll to show/hide navbar and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsSearchOpen(false); // ← CLOSE SEARCH ON SCROLL DOWN
        setIsDesktopMenuOpen(false);
      }
      
      setShowScrollTop(currentScrollY > 400);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close desktop menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(event.target)) {
        setIsDesktopMenuOpen(false);
      }
    };

    if (isDesktopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDesktopMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

const handleUserIconClick = (e) => {
  e.preventDefault();
  const now = Date.now();
  
  // Reset if more than 3 seconds since last click
  if (now - lastClickTime > 3000) {
    setClickCount(1);
    setLastClickTime(now);
    setShowProfileMenu(!showProfileMenu); // Toggle on first click
    return;
  }
  
  const newCount = clickCount + 1;
  setClickCount(newCount);
  setLastClickTime(now);
  
  // If rapid clicking detected (5+ clicks in 3 seconds), don't toggle menu
  if (newCount >= 5) {
    setShowProfileMenu(false); // Close menu when admin mode starts
  }
  
  // Show countdown messages
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
    // Less than 5 clicks - toggle profile menu normally
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
    
    // Success! Get fresh user data
    await authService.getCurrentUser();
    
    // Close modal
    setShowElevationModal(false);
    setElevationPassword('');
    
    const newRole = response.data.role;
    
    // Redirect based on role BEFORE reload
    if (newRole === 'super_admin') {
      window.location.href = '/super-admin/dashboard';
    } else if (newRole === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  } catch (error) {
    setElevationError(
      error.response?.data?.message || 'Invalid password. Access denied.'
    );
  } finally {
    setIsElevating(false);
  }
};

// Role-based menu categories
  const menuCategories = React.useMemo(() => {
    const categories = [
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
          { name: 'Careers', link: '/careers', icon: Briefcase },
          { name: 'Become a Seller', link: '/become-a-seller', icon: Store },
          { name: 'Partner With Us', link: '/partner-with-us', icon: Handshake },
        ]
      }
    ];

    // ADD SELLER SECTION HERE (BEFORE SUPER ADMIN)
    // Add Seller section if user is seller (but not admin or super_admin)
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

    // Add Super Admin section if user is super admin
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
    }
    
    // Add Admin section if user is admin (but not super admin)
    else if (user?.role === 'admin') {
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <nav className={`bg-white shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
           {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  Oshocks
                </span>
                <span className="text-xs text-gray-600 hidden sm:block">Bike Shop</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1 mx-8">
              <Link 
                to="/" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/') ? 'text-blue-600' : ''
                }`}
              >
                Home
                {isActiveRoute('/') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/services" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/services') ? 'text-blue-600' : ''
                }`}
              >
                Services
                {isActiveRoute('/services') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/shop" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/shop') ? 'text-blue-600' : ''
                }`}
              >
                Shop
                {isActiveRoute('/shop') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/about" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/about') ? 'text-blue-600' : ''
                }`}
              >
                About
                {isActiveRoute('/about') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/contact" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/contact') ? 'text-blue-600' : ''
                }`}
              >
                Contact
                {isActiveRoute('/contact') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/faq" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/faq') ? 'text-blue-600' : ''
                }`}
              >
                FAQ
                {isActiveRoute('/faq') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              <Link 
                to="/blog" 
                className={`relative text-gray-700 hover:text-blue-600 font-medium transition-colors pb-1 ${
                  isActiveRoute('/blog') ? 'text-blue-600' : ''
                }`}
              >
                Blog
                {isActiveRoute('/blog') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </Link>
              
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-3">

              {/* Search Button - CHANGED TO OPEN OVERLAY */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search"
                title="Search"
              >
                <Search size={20} className="text-gray-700" />
              </button>

            {/* User Account */}
{isAuthenticated ? (
  <div className="relative" ref={profileMenuRef}>
    <div
      onClick={handleUserIconClick}
      className="flex items-center gap-1 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
    >
      <User size={20} className="text-gray-700" />
      <div className="hidden md:flex flex-col items-start">
        <span className="text-xs text-gray-600">Hello, {user?.name?.split(' ')[0] || 'User'}</span>
        <span className="text-sm font-semibold text-gray-900">Account</span>
      </div>
    </div>
    
                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                    <Link
                      to="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={18} className="text-gray-600" />
                      <span className="text-gray-900">Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} className="text-gray-600" />
                      <span className="text-gray-900">Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
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
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
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
                className="flex items-center gap-1 px-2 sm:px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} className="text-gray-700" />
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs text-gray-600">Hello, Sign in</span>
                  <span className="text-sm font-semibold text-gray-900">Account</span>
                </div>
              </Link>
            )}

              {/* Sign Up Button */}
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm shadow-md"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
              )}
              
              {/* Desktop Menu Button */}
              <div className="hidden lg:block relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu size={20} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">All</span>
                </button>
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <ShoppingCart size={22} className="text-gray-700" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 animate-bounce-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </nav>

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
              <button
                onClick={() => setShowElevationModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleElevation();
                }
              }}
            />
            
            {elevationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {elevationError}
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowElevationModal(false);
                  setElevationPassword('');
                  setElevationError('');
                }}
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
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Search Overlay - NEW! */}
      {isSearchOpen && (
        <SearchBar 
          onClose={() => setIsSearchOpen(false)}
          variant="overlay"
        />
      )}

      {/* Desktop Side Menu Panel */}
      {isDesktopMenuOpen && (
        <div
          className="hidden lg:block fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsDesktopMenuOpen(false)}
        >
          <div
            className="fixed top-0 left-0 h-full w-1/4 min-w-[300px] max-w-[400px] bg-white shadow-2xl overflow-y-auto animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Menu size={24} className="text-white" />
                <div className="text-white">
                  <div className="font-semibold">Menu</div>
                  <div className="text-xs opacity-90">Browse all categories</div>
                </div>
              </div>
              <button
                onClick={() => setIsDesktopMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="py-2">
            {/*  {menuCategories  //after auth to show on admins only
                .filter(category => {
                  // Hide admin section if not admin
                  if (category.requiresRole === 'admin' && user?.role !== 'admin') {
                    return false;
                  }
                  return true;
                })
                .map((category, idx) => ( */}
                {menuCategories.map((category, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-2 mb-2">
                  <h3 className="px-4 py-2 text-sm font-bold text-gray-900">{category.title}</h3>
                  <div className="py-1">
                    {category.items.map((item, itemIdx) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={itemIdx}
                          to={item.link}
                          onClick={() => setIsDesktopMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent size={20} className="text-gray-600 group-hover:text-blue-600" />
                            <span className="text-sm text-gray-700 group-hover:text-blue-600">
                              {item.name}
                            </span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Side Menu Panel */}
      <div
        className={`fixed inset-0 bg-black z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={24} className="text-white" />
              <div className="text-white">
                <div className="font-semibold">
                  {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0] || 'User'}` : 'Hello, Sign in'}
                </div>
                <div className="text-xs opacity-90">Welcome to Oshocks</div>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          <div className="py-2">
            <div className="border-b border-gray-200 pb-2 mb-2">
              <h3 className="px-4 py-2 text-sm font-bold text-gray-900">Navigate</h3>
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Home size={20} className="text-gray-600" />
                <span className="text-gray-900">Home</span>
              </Link>
              <Link
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Wrench size={20} className="text-gray-600" />
                <span className="text-gray-900">Services</span>
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Package size={20} className="text-gray-600" />
                <span className="text-gray-900">Shop</span>
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Info size={20} className="text-gray-600" />
                <span className="text-gray-900">About</span>
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <Mail size={20} className="text-gray-600" />
                <span className="text-gray-900">Contact</span>
              </Link>
              <Link
                to="/faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle size={20} className="text-gray-600" />
                <span className="text-gray-900">FAQ</span>
              </Link>
              <Link
                to="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <BookOpen size={20} className="text-gray-600" />
                <span className="text-gray-900">Blog</span>
              </Link>
              {/* Admin Dashboard Link - Only visible to admins */}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard size={20} className="text-gray-600" />
                    <span className="text-gray-900">Admin Dashboard</span>
                  </Link>
                )}
              {/* ADD THESE RESOURCE LINKS HERE */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <h4 className="px-4 py-2 text-sm font-bold text-gray-900">Resources</h4>
                  <Link
                    to="/size-guide"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Ruler size={20} className="text-gray-600" />
                    <span className="text-gray-900">Size Guide</span>
                  </Link>
                  <Link
                    to="/warranty-information"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Shield size={20} className="text-gray-600" />
                    <span className="text-gray-900">Warranty Info</span>
                  </Link>
                  <Link
                    to="/safety"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <AlertTriangle size={20} className="text-gray-600" />
                    <span className="text-gray-900">Safety Tips</span>
                  </Link>
                  <Link
                    to="/bike-maintenance"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Wrench size={20} className="text-gray-600" />
                    <span className="text-gray-900">Bike Maintenance</span>
                  </Link>
                </div>
            </div>

           {/* {menuCategories   //after auth, to show on admimins only
              .filter(category => {
                // Hide admin section if not admin
                if (category.requiresRole === 'admin' && user?.role !== 'admin') {
                  return false;
                }
                return true;
              })
              .map((category, idx) => ( */}
              {menuCategories.map((category, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-2 mb-2">
                <h3 className="px-4 py-2 text-sm font-bold text-gray-900">{category.title}</h3>
                {category.items.map((item, itemIdx) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent size={20} className="text-gray-600 group-hover:text-blue-600" />
                        <span className="text-gray-700 group-hover:text-blue-600">{item.name}</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600" />
                    </Link>
                  );
                })}
              </div>
            ))}

            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-2">
                <h3 className="px-4 py-2 text-sm font-bold text-gray-900">Your Account</h3>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <LayoutDashboard size={20} className="text-gray-600" />
                  <span className="text-gray-900">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <LogOut size={20} className="text-gray-600" />
                  <span className="text-gray-900">Logout</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-2 px-4 py-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-center border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <Sparkles size={18} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-16"></div>
    </>
  );
};

export default Navbar;