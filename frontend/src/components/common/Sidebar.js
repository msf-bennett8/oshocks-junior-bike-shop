import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ 
  variant = 'shop', 
  isOpen = true, 
  onClose,
  className = '' 
}) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(['categories']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path) => location.pathname === path;

  // Shop Sidebar (Filters)
  const ShopSidebar = () => {
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedConditions, setSelectedConditions] = useState([]);

    const categories = [
      { id: 'mountain', name: 'Mountain Bikes', icon: '🏔️', count: 234 },
      { id: 'road', name: 'Road Bikes', icon: '🛣️', count: 189 },
      { id: 'electric', name: 'Electric Bikes', icon: '⚡', count: 156 },
      { id: 'kids', name: 'Kids Bikes', icon: '👶', count: 98 },
      { id: 'bmx', name: 'BMX Bikes', icon: '🚵', count: 76 },
      { id: 'accessories', name: 'Accessories', icon: '🎽', count: 567 },
      { id: 'parts', name: 'Spare Parts', icon: '⚙️', count: 432 },
      { id: 'helmets', name: 'Helmets', icon: '🪖', count: 145 }
    ];

    const brands = [
      { id: 'trek', name: 'Trek', count: 87 },
      { id: 'giant', name: 'Giant', count: 76 },
      { id: 'specialized', name: 'Specialized', count: 65 },
      { id: 'cannondale', name: 'Cannondale', count: 54 },
      { id: 'scott', name: 'Scott', count: 43 },
      { id: 'other', name: 'Other Brands', count: 234 }
    ];

    const conditions = [
      { id: 'new', name: 'Brand New', icon: '✨' },
      { id: 'like-new', name: 'Like New', icon: '🌟' },
      { id: 'used', name: 'Used', icon: '🔄' },
      { id: 'refurbished', name: 'Refurbished', icon: '🔧' }
    ];

    const toggleBrand = (brandId) => {
      setSelectedBrands(prev =>
        prev.includes(brandId)
          ? prev.filter(b => b !== brandId)
          : [...prev, brandId]
      );
    };

    const toggleCondition = (conditionId) => {
      setSelectedConditions(prev =>
        prev.includes(conditionId)
          ? prev.filter(c => c !== conditionId)
          : [...prev, conditionId]
      );
    };

    return (
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between py-2 font-semibold text-gray-900"
          >
            <span className="flex items-center gap-2">
              <span>📁</span>
              <span>Categories</span>
            </span>
            <span className="text-sm">{expandedSections.includes('categories') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.includes('categories') && (
            <div className="mt-3 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop/${cat.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  <span className="flex items-center gap-2 text-gray-700 group-hover:text-purple-600">
                    <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-sm">{cat.name}</span>
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-purple-600">{cat.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2 font-semibold text-gray-900"
          >
            <span className="flex items-center gap-2">
              <span>💰</span>
              <span>Price Range</span>
            </span>
            <span className="text-sm">{expandedSections.includes('price') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.includes('price') && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="text-xs text-gray-500 text-center">
                KSh {priceRange[0].toLocaleString()} - KSh {priceRange[1].toLocaleString()}
              </div>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between py-2 font-semibold text-gray-900"
          >
            <span className="flex items-center gap-2">
              <span>🏷️</span>
              <span>Brands</span>
            </span>
            <span className="text-sm">{expandedSections.includes('brands') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.includes('brands') && (
            <div className="mt-3 space-y-2">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-purple-600">{brand.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{brand.count}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Condition */}
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => toggleSection('condition')}
            className="w-full flex items-center justify-between py-2 font-semibold text-gray-900"
          >
            <span className="flex items-center gap-2">
              <span>✅</span>
              <span>Condition</span>
            </span>
            <span className="text-sm">{expandedSections.includes('condition') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.includes('condition') && (
            <div className="mt-3 space-y-2">
              {conditions.map((condition) => (
                <label
                  key={condition.id}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(condition.id)}
                    onChange={() => toggleCondition(condition.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-lg">{condition.icon}</span>
                  <span className="text-sm text-gray-700 group-hover:text-purple-600">{condition.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          🔄 Clear All Filters
        </button>
      </div>
    );
  };

  // Dashboard Sidebar (Navigation)
  const DashboardSidebar = () => {
    const menuItems = [
      {
        section: 'Overview',
        items: [
          { path: '/dashboard', name: 'Dashboard', icon: '📊' },
          { path: '/dashboard/analytics', name: 'Analytics', icon: '📈' },
          { path: '/dashboard/reports', name: 'Reports', icon: '📋' }
        ]
      },
      {
        section: 'Products',
        items: [
          { path: '/dashboard/products', name: 'All Products', icon: '📦' },
          { path: '/dashboard/products/add', name: 'Add Product', icon: '➕' },
          { path: '/dashboard/inventory', name: 'Inventory', icon: '📊' },
          { path: '/dashboard/categories', name: 'Categories', icon: '📁' }
        ]
      },
      {
        section: 'Orders',
        items: [
          { path: '/dashboard/orders', name: 'All Orders', icon: '🛒', badge: '12' },
          { path: '/dashboard/orders/pending', name: 'Pending', icon: '⏳', badge: '5' },
          { path: '/dashboard/orders/completed', name: 'Completed', icon: '✅' },
          { path: '/dashboard/orders/cancelled', name: 'Cancelled', icon: '❌' }
        ]
      },
      {
        section: 'Customers',
        items: [
          { path: '/dashboard/customers', name: 'All Customers', icon: '👥' },
          { path: '/dashboard/reviews', name: 'Reviews', icon: '⭐', badge: '3' },
          { path: '/dashboard/messages', name: 'Messages', icon: '💬', badge: '8' }
        ]
      },
      {
        section: 'Settings',
        items: [
          { path: '/dashboard/settings', name: 'Settings', icon: '⚙️' },
          { path: '/dashboard/profile', name: 'Profile', icon: '👤' },
          { path: '/dashboard/billing', name: 'Billing', icon: '💳' }
        ]
      }
    ];

    return (
      <div className="space-y-6">
        {/* User Profile */}
        <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <div className="font-semibold">John Seller</div>
              <div className="text-xs text-purple-200">Vendor Account</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white bg-opacity-20 rounded p-2">
              <div className="font-semibold">234</div>
              <div className="text-purple-200">Products</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded p-2">
              <div className="font-semibold">1.2k</div>
              <div className="text-purple-200">Orders</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between py-2.5 px-4 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium text-sm">{item.name}</span>
                  </span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive(item.path)
                        ? 'bg-white text-purple-600'
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <span>➕</span>
              <span>Add Product</span>
            </button>
            <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <span>📊</span>
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Account Sidebar (User Profile)
  const AccountSidebar = () => {
    const accountMenu = [
      { path: '/account', name: 'My Profile', icon: '👤', description: 'Edit your info' },
      { path: '/account/orders', name: 'My Orders', icon: '📦', description: 'Track & manage' },
      { path: '/account/wishlist', name: 'Wishlist', icon: '❤️', description: 'Saved items' },
      { path: '/account/addresses', name: 'Addresses', icon: '📍', description: 'Manage locations' },
      { path: '/account/payment', name: 'Payment Methods', icon: '💳', description: 'Saved cards' },
      { path: '/account/messages', name: 'Messages', icon: '💬', description: 'Chat history', badge: '3' },
      { path: '/account/reviews', name: 'Reviews', icon: '⭐', description: 'Your reviews' },
      { path: '/account/settings', name: 'Settings', icon: '⚙️', description: 'Preferences' }
    ];

    return (
      <div className="space-y-2">
        {accountMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block p-4 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white hover:bg-purple-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-semibold">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive(item.path)
                    ? 'bg-white text-purple-600'
                    : 'bg-red-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </div>
            <p className={`text-sm ml-11 ${
              isActive(item.path) ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {item.description}
            </p>
          </Link>
        ))}

        {/* Logout Button */}
        <button className="w-full mt-4 p-4 rounded-lg border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    );
  };

  // Mobile Sidebar (Full Menu)
  const MobileSidebar = () => {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Sidebar Panel */}
        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚴‍♂️</span>
              <div>
                <div className="font-bold text-lg">Oshocks</div>
                <div className="text-xs text-purple-200">Junior Bike Shop</div>
              </div>
            </div>
            <button onClick={onClose} className="text-2xl hover:scale-110 transition-transform">
              ✖️
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <DashboardSidebar />
          </div>
        </div>
      </div>
    );
  };

  // Render based on variant
  const renderSidebar = () => {
    switch (variant) {
      case 'shop':
        return <ShopSidebar />;
      case 'dashboard':
        return <DashboardSidebar />;
      case 'account':
        return <AccountSidebar />;
      case 'mobile':
        return isOpen ? <MobileSidebar /> : null;
      default:
        return <ShopSidebar />;
    }
  };

  if (variant === 'mobile') {
    return renderSidebar();
  }

  return (
    <aside className={`bg-white rounded-lg shadow-md p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto ${className}`}>
      {renderSidebar()}
    </aside>
  );
};

export default Sidebar;
