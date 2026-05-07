//frontend/src/components/layout/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import authService from '../../services/authService';
import NotificationCenter from '../notifications/NotificationCenter';
import SuperAdminNotificationCenter from '../notifications/SuperAdminNotificationCenter';
import ChatDrawer from '../messaging/ChatDrawer';
import CallOverlay from '../messaging/CallOverlay';
import CreateChatModal from '../messaging/CreateChatModal';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useMessaging } from '../../hooks/useMessaging';
import { Search, User, ShoppingCart, Menu, X, ChevronRight, ChevronDown, Plus, Home, Package, Info, Mail, LayoutDashboard, LogOut, Sparkles, Wrench, HelpCircle, BookOpen, Settings, ArrowRight, Mountain, Bike, Zap, Baby, Backpack, Settings as SettingsIcon, Flame, DollarSign, Tag, MapPin, Ruler, Shield, AlertTriangle, Store, Briefcase, Handshake, Gift, Users, Package2, BarChart3, FolderTree, Heart, Bell, MessageCircle } from 'lucide-react';
import SearchBar from '../common/SearchBar';
import Avatar from '../common/Avatar';

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
  
  // Role switcher state
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  
  // Notifications are now handled by NotificationCenter component
  const [elevationPassword, setElevationPassword] = useState('');
  const [isElevating, setIsElevating] = useState(false);
  const [elevationError, setElevationError] = useState('');
  
  const { isAuthenticated, user, logout, isSuperAdmin, switchRole, resetRole, getEffectiveRole, getUserWithEffectiveRole, switchedRole, availableRoles } = useAuth();
  const { cartItems } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);


  const cartItemCount = cartItems?.length || 0;

  // Messaging & Calls state
  const [chatOpen, setChatOpen] = useState(false);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { incomingCall, dismissIncomingCall, echo, connectionStatus, unreadTotal, setActiveConversation } = useMessaging(user?.id);

    // Listen for open-create-chat-modal event from ChatDrawer
  useEffect(() => {
    const handleOpenCreateChat = () => {
      setShowCreateChat(true);
    };
    window.addEventListener('open-create-chat-modal', handleOpenCreateChat);
    return () => window.removeEventListener('open-create-chat-modal', handleOpenCreateChat);
  }, []);

  // Body class is managed by ChatDrawer.jsx — Navbar just reads it
  const {
    localStream,
    remoteStream,
    callState,
    callType,
    currentCall,
    callDuration,
    callError,
    formattedDuration,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
  } = useWebRTC(user?.id, echo);
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
        setShowRoleSwitcher(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Close quick actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.quick-actions-dropdown');
      const button = document.querySelector('.quick-actions-button');
      if (dropdown && !dropdown.contains(event.target) && button && !button.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showQuickActions]);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't hide navbar when chat is open (split-pane mode)
      if (chatOpen) {
        setIsVisible(true);
        return;
      }
      
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
  }, [lastScrollY, chatOpen]);

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

  const handleRoleSwitch = (newRole) => {
    if (switchRole(newRole)) {
      setShowRoleSwitcher(false);
      setShowProfileMenu(false);
      // Navigate to appropriate dashboard based on role
      if (newRole === 'seller') {
        navigate('/seller/dashboard');
      } else if (newRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (newRole === 'super_admin') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      window.location.reload(); // Reload to refresh permissions
    }
  };

  const handleResetRole = () => {
    resetRole();
    setShowRoleSwitcher(false);
    setShowProfileMenu(false);
    window.location.reload();
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

  // Get effective role for sidebar
  const effectiveRole = getEffectiveRole();

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

    if (effectiveRole === 'seller') {
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
      effectiveRole === 'delivery_agent' || 
      effectiveRole === 'shop_attendant' || 
      effectiveRole === 'seller' || 
      effectiveRole === 'admin' || 
      effectiveRole === 'super_admin'
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

    if (effectiveRole === 'super_admin') {
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
          { name: 'Notification Templates', link: '/super-admin/notification-templates', icon: Bell },
          { name: 'Settings', link: '/super-admin/settings', icon: Settings },
        ]
      });
    } else if (effectiveRole === 'admin') {
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
  }, [effectiveRole, user]);

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

      {/* Modern Glassmorphism Navbar — sticky when split-pane, fixed otherwise */}
      <nav className={`transition-all duration-500 ${
        chatOpen ? 'sticky top-0 z-40' : 'fixed top-0 left-0 right-0 z-50'
      } ${
        lastScrollY > 50 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-orange-100/50' 
          : 'bg-white'
      } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto px-4">
          {/* Top Row: Logo + Actions */}
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
                className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent whitespace-nowrap"
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
              className="hidden lg:flex flex-1 max-w-md xl:max-w-xl mx-2 xl:mx-4 cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
            >
              <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
                <Search className={`absolute left-3 xl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 xl:w-5 xl:h-5 transition-colors ${searchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
                <div
                  className="w-full pl-9 xl:pl-12 pr-3 xl:pr-4 py-2 xl:py-2.5 bg-gray-100/80 rounded-full border-2 border-transparent hover:border-orange-300 hover:bg-white transition-all text-xs xl:text-sm text-gray-500 flex items-center truncate"
                >
                  Search bikes, parts, accessories...
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3 flex-1 lg:flex-none">
              
              {/* Wishlist - All screens */}
              <Link to="/wishlist" className="relative p-1.5 sm:p-2 rounded-full hover:bg-orange-50 transition-colors group flex-shrink-0">
                <Heart className={`w-[18px] h-[18px] sm:w-5 sm:h-5 transition-colors ${wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-700 group-hover:text-orange-500'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-1.5 sm:p-2 rounded-full hover:bg-orange-50 transition-colors group flex-shrink-0">
                <ShoppingCart className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold animate-bounce-in">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Notification Icon - Mobile Only - Using NotificationCenter moved to quick actions
              {isAuthenticated && (
                <div className="md:hidden">
                  <NotificationCenter />
                </div>
              )}

              */}

              {/* Account - Desktop */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={profileMenuRef}>
                  <div
                    onClick={handleUserIconClick}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size={32} />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-500">
                        Hello, {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      {switchedRole && (
                        <span className="text-[10px] text-orange-500 font-medium uppercase tracking-wide">
                          Viewing as: {switchedRole.replace(/_/g, ' ')}
                        </span>
                      )}
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
                      
                      {/* Switch Role - Super Admin Only */}
                      {isSuperAdmin() && (
                        <div className="relative">
                          <button
                            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                            className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Settings size={18} className="text-gray-600" />
                              <span className="text-gray-900">Switch Role</span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showRoleSwitcher ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {/* Role Switcher Submenu */}
                          {showRoleSwitcher && (
                            <div className="bg-gray-50 border-t border-b border-gray-100 py-1">
                              {Object.entries(availableRoles).map(([key, role]) => (
                                <button
                                  key={role}
                                  onClick={() => handleRoleSwitch(role)}
                                  className={`flex items-center justify-between w-full px-4 py-2 hover:bg-white transition-colors ${
                                    (switchedRole || user?.role) === role ? 'bg-white' : ''
                                  }`}
                                >
                                  <span className={`text-sm capitalize ${
                                    (switchedRole || user?.role) === role ? 'text-orange-600 font-medium' : 'text-gray-700'
                                  }`}>
                                    {role.replace(/_/g, ' ')}
                                  </span>
                                  {(switchedRole || user?.role) === role && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                  )}
                                </button>
                              ))}
                              {switchedRole && (
                                <button
                                  onClick={handleResetRole}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-white transition-colors border-t border-gray-200 mt-1"
                                >
                                  Reset to Original Role
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
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
                  <Avatar src={null} name="Guest" size={32} />
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

              {/* Notification Center - mounted with hidden trigger, modal still works */}
              {isAuthenticated && (
                <NotificationCenter hideTrigger />
              )}

              {/* SuperAdmin Notification Center - mounted with hidden trigger, modal still works */}
              {isAuthenticated && (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'owner') && (
                <SuperAdminNotificationCenter hideTrigger />
              )}

              {/* Quick Actions Dropdown */}
              <div className="relative flex-shrink-0">
                {/* Desktop: Quick Actions button - Image 6 style */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="quick-actions-button hidden md:flex items-center gap-1.5 px-3 py-2 text-white font-medium text-sm shadow-md transition-all hover:shadow-lg rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden lg:inline">Quick Actions</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile: Compact Quick Actions button - Image 6 orange pill */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="quick-actions-button md:hidden flex items-center gap-1 px-2.5 py-1.5 text-white text-xs font-medium shadow-md transition-all hover:shadow-lg active:scale-95 rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)',
                  }}
                  title="Quick Actions"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <ChevronDown className={`w-3 h-3 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showQuickActions && (
                  <div className={`quick-actions-dropdown absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in`}>
                    {/* Messages */}
                    <button
                      onClick={() => { setChatOpen(true); setShowQuickActions(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors w-full text-left"
                    >
                      <div className="relative">
                        <MessageCircle className="w-5 h-5 text-gray-600" />
                        {unreadTotal > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                            {unreadTotal > 9 ? '9+' : unreadTotal}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">Messages</span>
                        <p className="text-xs text-gray-500">View conversations</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-400' :
                        connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                    </button>

                    {/* New Chat */}
                    {isAuthenticated && (
                      <button
                        onClick={() => { setShowCreateChat(true); setShowQuickActions(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors w-full text-left"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">New Chat</span>
                          <p className="text-xs text-gray-500">Start a conversation</p>
                        </div>
                      </button>
                    )}

                    <hr className="my-1 border-gray-100" />

                    {/* Notifications */}
                    {isAuthenticated && (
                      <button
                        onClick={() => { 
                          setShowQuickActions(false);
                          window.dispatchEvent(new CustomEvent('open-notification-center'));
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors w-full text-left"
                      >
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">Notifications</span>
                          <p className="text-xs text-gray-500">View alerts & updates</p>
                        </div>
                      </button>
                    )}

                    {/* Admin Alerts */}
                    {isAuthenticated && (user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'owner') && (
                      <button
                        onClick={() => {
                          setShowQuickActions(false);
                          window.dispatchEvent(new CustomEvent('open-admin-alerts'));
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <Shield className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                          <span className="text-gray-900 font-medium">Admin Alerts</span>
                          <p className="text-xs text-gray-500">System notifications</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Shop Now Button - Desktop only */}
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Account - Mobile/Tablet — positioned between Quick Actions and Hamburger */}
              {isAuthenticated ? (
                <div className="md:hidden relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="rounded-full hover:bg-orange-50 transition-colors relative flex items-center justify-center"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size={32} />
                  </button>

                  {/* Mobile Profile Dropdown - Fixed positioning to avoid click outside issues */}
                  {showProfileMenu && (
                    <div className={`fixed right-4 top-16 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-fade-in ${chatOpen ? 'z-[70]' : 'z-[60]'}`}>
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
                      
                      {/* Switch Role - Mobile - Super Admin Only */}
                      {isSuperAdmin() && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowRoleSwitcher(!showRoleSwitcher); }}
                            className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Settings size={18} className="text-gray-600" />
                              <span className="text-gray-900">Switch Role</span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showRoleSwitcher ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showRoleSwitcher && (
                            <div className="bg-gray-50 border-t border-b border-gray-100 py-1">
                              {Object.entries(availableRoles).map(([key, role]) => (
                                <button
                                  key={role}
                                  onClick={(e) => { e.stopPropagation(); handleRoleSwitch(role); }}
                                  className={`flex items-center justify-between w-full px-4 py-2 hover:bg-white transition-colors ${
                                    (switchedRole || user?.role) === role ? 'bg-white' : ''
                                  }`}
                                >
                                  <span className={`text-sm capitalize ${
                                    (switchedRole || user?.role) === role ? 'text-orange-600 font-medium' : 'text-gray-700'
                                  }`}>
                                    {role.replace(/_/g, ' ')}
                                  </span>
                                  {(switchedRole || user?.role) === role && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                  )}
                                </button>
                              ))}
                              {switchedRole && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleResetRole(); }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-white transition-colors border-t border-gray-200 mt-1"
                                >
                                  Reset to Original Role
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      
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
                      
                      {/* Admin Alerts - Mobile Only */}
                      {(user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'owner') && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setShowProfileMenu(false);
                            // Open admin alerts modal via global event or navigate to admin alerts page
                            window.dispatchEvent(new CustomEvent('open-admin-alerts'));
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                        >
                          <Shield size={18} className="text-gray-600" />
                          <span className="text-gray-900">Admin Alerts</span>
                        </button>
                      )}
                      
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
                  className="md:hidden flex items-center justify-center rounded-full hover:bg-orange-50 transition-colors"
                >
                  <Avatar src={null} name="Guest" size={32} />
                </Link>
              )}

              {/* Hamburger - Opens Right Sidebar - Moved after Shop Now */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Second row inside navbar (AccellaX style) */}
          <div 
            className="lg:hidden pb-3 pt-1"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <div
                tabIndex={0}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 rounded-lg border-2 border-gray-700 hover:border-orange-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 active:border-orange-500 transition-all text-sm text-gray-400 flex items-center cursor-pointer outline-none"
              >
                <span className="truncate">Search...</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar - taller on mobile for search row */}
      <div className="h-[110px] md:h-20" />

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
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${chatOpen ? 'z-[70]' : 'z-50'}`}>
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
        <div className={chatOpen ? 'relative z-[70]' : ''}>
          <SearchBar onClose={() => setIsSearchOpen(false)} variant="overlay" />
        </div>
      )}

      {/* Right Sidebar - Desktop & Mobile */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isSidebarOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        } ${chatOpen ? 'z-[60]' : 'z-50'}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } ${chatOpen ? 'z-[60]' : 'z-50'}`}
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

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={showCreateChat}
        onClose={() => setShowCreateChat(false)}
        onConversationCreated={(conversation, isExisting = false) => {
          // Set active conversation in messaging hook
          setActiveConversation(conversation);
          
          // Open chat drawer
          setChatOpen(true);
          
          // If it's an existing conversation, we should refresh messages
          // The ChatDrawer will handle fetching via its own useEffect
          console.log('[Navbar] Conversation created/resumed:', conversation.id, isExisting ? '(existing)' : '(new)');
        }}
      />

      {/* Chat Drawer — Enhanced with split-pane/desktop support */}
      <ChatDrawer 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        onStartCall={(convId, calleeId, type) => {
          // On desktop split-pane, don't close chat when starting call
          const isMobile = window.innerWidth < 1024;
          if (isMobile) setChatOpen(false);
          initiateCall(convId, calleeId, type);
        }}
        entryPoint="navbar"
      />

      {/* Call Overlay */}
      <CallOverlay
        callState={callState}
        callType={callType}
        incomingCall={incomingCall}
        currentCall={currentCall}
        localStream={localStream}
        remoteStream={remoteStream}
        callDuration={formattedDuration}
        callError={callError}
        onAnswer={(call) => {
          dismissIncomingCall();
          answerCall(call);
        }}
        onDecline={() => {
          declineCall(incomingCall?.sessionId);
          dismissIncomingCall();
        }}
        onEndCall={endCall}
        onDismissError={() => {}}
      />
    </>
  );
};

export default Navbar;