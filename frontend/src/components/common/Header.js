import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(3); // TODO: Get from Redux/Context
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Get from auth state
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.category-menu') && !e.target.closest('.category-button')) {
        setShowCategoryMenu(false);
      }
      if (!e.target.closest('.account-menu') && !e.target.closest('.account-button')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Mountain Bikes', icon: '🏔️', path: '/shop/mountain-bikes' },
    { name: 'Road Bikes', icon: '🛣️', path: '/shop/road-bikes' },
    { name: 'Electric Bikes', icon: '⚡', path: '/shop/electric-bikes' },
    { name: 'Kids Bikes', icon: '👶', path: '/shop/kids-bikes' },
    { name: 'Accessories', icon: '🎽', path: '/shop/accessories' },
    { name: 'Spare Parts', icon: '⚙️', path: '/shop/spare-parts' },
    { name: 'Helmets', icon: '🪖', path: '/shop/helmets' },
    { name: 'Sale Items', icon: '🏷️', path: '/shop/sale', badge: 'Hot' }
  ];

  const accountLinks = [
    { name: 'My Account', icon: '👤', path: '/account' },
    { name: 'Orders', icon: '📦', path: '/account/orders' },
    { name: 'Wishlist', icon: '❤️', path: '/account/wishlist' },
    { name: 'Messages', icon: '💬', path: '/account/messages' },
    { name: 'Settings', icon: '⚙️', path: '/account/settings' }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white'
    }`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="hidden md:inline">📍 Free delivery in Nairobi • KSh 5,000+</span>
              <span className="md:hidden">📍 Free delivery KSh 5,000+</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/track-order" className="hover:text-purple-200 transition-colors">
                Track Order
              </Link>
              <span className="hidden md:inline">•</span>
              <Link to="/seller/register" className="hover:text-purple-200 transition-colors hidden md:inline">
                Sell on Oshocks
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                🚴‍♂️
              </span>
              <div className="hidden sm:block">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Oshocks
                </div>
                <div className="text-xs text-gray-500 -mt-1">Junior Bike Shop</div>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for bikes, accessories, parts..."
                    className="w-full px-6 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    🔍
                  </button>
                </div>
              </form>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden text-gray-700 hover:text-purple-600 transition-colors text-2xl"
                aria-label="Search"
              >
                🔍
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="account-button flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="Account"
                >
                  <span className="text-2xl">👤</span>
                  <div className="hidden md:block text-left">
                    <div className="text-xs text-gray-500">Hello, {isLoggedIn ? 'User' : 'Sign In'}</div>
                    <div className="text-sm font-semibold">Account</div>
                  </div>
                </button>

                {/* Account Dropdown Menu */}
                {showAccountMenu && (
                  <div className="account-menu absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                    {isLoggedIn ? (
                      <>
                        {accountLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setShowAccountMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                          >
                            <span className="text-xl">{link.icon}</span>
                            <span className="text-gray-700 hover:text-purple-600">{link.name}</span>
                          </Link>
                        ))}
                        <hr className="my-2" />
                        <button
                          onClick={() => {
                            setIsLoggedIn(false);
                            setShowAccountMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">🚪</span>
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-4 py-3 hover:bg-purple-50"
                        >
                          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                            Sign In
                          </button>
                        </Link>
                        <p className="px-4 py-2 text-sm text-gray-600">
                          New customer?{' '}
                          <Link
                            to="/register"
                            onClick={() => setShowAccountMenu(false)}
                            className="text-purple-600 font-semibold hover:text-purple-700"
                          >
                            Start here
                          </Link>
                        </p>
                        <hr className="my-2" />
                        <Link
                          to="/account/orders"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        >
                          Track Orders
                        </Link>
                        <Link
                          to="/seller/register"
                          onClick={() => setShowAccountMenu(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        >
                          Sell on Oshocks
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/account/wishlist"
                className="relative text-gray-700 hover:text-purple-600 transition-colors hidden sm:block"
                aria-label="Wishlist"
              >
                <span className="text-2xl">❤️</span>
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-purple-600 transition-colors"
                aria-label="Shopping cart"
              >
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
                <div className="hidden md:block text-xs font-semibold mt-1">Cart</div>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-700 hover:text-purple-600 transition-colors text-2xl"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? '✖️' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden pb-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    🔍
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-gray-50 border-b border-gray-200 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="category-button flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <span>☰</span>
                <span>All Categories</span>
                <span className="text-xs">{showCategoryMenu ? '▲' : '▼'}</span>
              </button>

              {/* Categories Mega Menu */}
              {showCategoryMenu && (
                <div className="category-menu absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {categories.map((category) => (
                      <Link
                        key={category.path}
                        to={category.path}
                        onClick={() => setShowCategoryMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors group relative"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                          {category.icon}
                        </span>
                        <span className="text-sm text-gray-700 group-hover:text-purple-600 font-medium">
                          {category.name}
                        </span>
                        {category.badge && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {category.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/shop/new-arrivals" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>✨</span> New Arrivals
              </Link>
              <Link to="/shop/best-sellers" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>🔥</span> Best Sellers
              </Link>
              <Link to="/shop/sale" className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 font-bold">
                <span>🏷️</span> Sale
              </Link>
              <Link to="/deals" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>💰</span> Today's Deals
              </Link>
              <Link to="/brands" className="text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>🏆</span> Top Brands
              </Link>
            </div>

            {/* Right Side Links */}
            <div className="ml-auto flex items-center gap-4 text-sm">
              <Link to="/help" className="text-gray-600 hover:text-purple-600 transition-colors">
                Help
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/track-order" className="text-gray-600 hover:text-purple-600 transition-colors">
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            
            {/* Mobile Categories */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>📁</span> Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.path}
                    to={category.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Quick Links */}
            <div className="space-y-2">
              <Link
                to="/shop/new-arrivals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-gray-700">✨ New Arrivals</span>
              </Link>
              <Link
                to="/shop/best-sellers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-gray-700">🔥 Best Sellers</span>
              </Link>
              <Link
                to="/shop/sale"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-red-600 font-bold">🏷️ Sale</span>
              </Link>
              <Link
                to="/deals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-gray-700">💰 Today's Deals</span>
              </Link>
              <Link
                to="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-3 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <span className="text-gray-700">❓ Help Center</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;