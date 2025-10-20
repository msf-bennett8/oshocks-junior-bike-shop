import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, 
  Tag, FileText, Truck, MessageSquare, BarChart3, Bell,
  Search, Menu, X, ChevronDown, LogOut, User, Shield,
  HelpCircle, Moon, Sun, Briefcase, DollarSign, Heart,
  Star, TrendingUp, Activity, Calendar, Mail, Phone,
  Home, ChevronRight, Percent, Gift, Image, Folder
} from 'lucide-react';

const SuperAdminPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock admin user data
  const adminUser = {
    name: 'Oshocks Admin',
    email: 'admin@oshocks.co.ke',
    role: 'Super Admin',
    avatar: 'https://ui-avatars.com/api/?name=Oshocks+Admin&background=3B82F6&color=fff&size=40'
  };

  // Navigation menu items
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      count: null,
      badge: null
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      count: 342,
      badge: 'primary'
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      count: 1456,
      badge: null
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      count: 24,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      count: 1247,
      badge: null
    },
    {
      id: 'vendors',
      label: 'Vendors',
      icon: Briefcase,
      count: 12,
      badge: 'success'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      count: 234,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      count: null,
      badge: null
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      count: null,
      badge: null
    },
    {
      id: 'shipping',
      label: 'Shipping',
      icon: Truck,
      count: 89,
      badge: null
    },
    {
      id: 'discounts',
      label: 'Discounts',
      icon: Percent,
      count: 15,
      badge: 'warning'
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: Gift,
      count: 8,
      badge: null
    },
    {
      id: 'media',
      label: 'Media Library',
      icon: Image,
      count: null,
      badge: null
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      count: 23,
      badge: 'danger'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      count: null,
      badge: null
    }
  ];

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New Order #ORD-10234',
      message: 'John Kamau placed an order',
      time: '2 minutes ago',
      read: false,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      id: 2,
      type: 'customer',
      title: 'New Customer',
      message: 'Sarah Wanjiku registered',
      time: '15 minutes ago',
      read: false,
      icon: Users,
      color: 'green'
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review',
      message: '5-star review on Road Racer Elite',
      time: '1 hour ago',
      read: true,
      icon: Star,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Mountain Bike Tires running low',
      time: '2 hours ago',
      read: true,
      icon: Package,
      color: 'orange'
    }
  ];

  // Quick stats for dashboard
  const quickStats = [
    {
      label: 'Today\'s Sales',
      value: 'KES 425,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'New Orders',
      value: '65',
      change: '+8.3%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'green'
    },
    {
      label: 'Active Users',
      value: '342',
      change: '+5.7%',
      trend: 'up',
      icon: Activity,
      color: 'purple'
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      change: '+0.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      action: 'Order placed',
      user: 'John Kamau',
      details: 'Order #ORD-10234',
      time: '2 minutes ago',
      icon: ShoppingCart
    },
    {
      id: 2,
      action: 'Product updated',
      user: 'Admin',
      details: 'Mountain Bike Pro X5',
      time: '15 minutes ago',
      icon: Package
    },
    {
      id: 3,
      action: 'Customer registered',
      user: 'Sarah Wanjiku',
      details: 'New account created',
      time: '1 hour ago',
      icon: Users
    },
    {
      id: 4,
      action: 'Review posted',
      user: 'David Ochieng',
      details: '5-star rating',
      time: '2 hours ago',
      icon: Star
    }
  ];

  // Get badge color
  const getBadgeColor = (badge) => {
    const colors = {
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };
    return colors[badge] || 'bg-gray-500';
  };

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {adminUser.name}!</h1>
                  <p className="text-blue-100">Here's what's happening with Oshocks Junior Bike Shop today.</p>
                </div>
                <div className="hidden md:block">
                  <Calendar size={64} className="opacity-50" />
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  View Reports
                </button>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-400 transition-colors">
                  Add Product
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'from-blue-500 to-blue-600',
                  green: 'from-green-500 to-green-600',
                  purple: 'from-purple-500 to-purple-600',
                  orange: 'from-orange-500 to-orange-600'
                };
                
                return (
                  <div key={index} className={`bg-gradient-to-br ${colorClasses[stat.color]} rounded-lg shadow-lg p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <Icon size={24} />
                      </div>
                      <span className="flex items-center gap-1 text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                        {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium opacity-90 mb-1">{stat.label}</h3>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Add Product', icon: Package, color: 'blue' },
                  { label: 'New Order', icon: ShoppingCart, color: 'green' },
                  { label: 'Add Customer', icon: Users, color: 'purple' },
                  { label: 'Add Category', icon: Tag, color: 'orange' },
                  { label: 'View Reports', icon: FileText, color: 'red' },
                  { label: 'Settings', icon: Settings, color: 'gray' }
                ].map((action, index) => {
                  const ActionIcon = action.icon;
                  const colorClasses = {
                    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
                    green: 'bg-green-100 text-green-600 hover:bg-green-200',
                    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
                    orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
                    red: 'bg-red-100 text-red-600 hover:bg-red-200',
                    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  };
                  
                  return (
                    <button
                      key={index}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${colorClasses[action.color]}`}
                    >
                      <ActionIcon size={24} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ActivityIcon size={18} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600">{activity.user} • {activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {menuItems.find(item => item.id === currentPage)?.icon && 
                  React.createElement(menuItems.find(item => item.id === currentPage).icon, { size: 40, className: 'text-blue-600' })
                }
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === currentPage)?.label}
              </h2>
              <p className="text-gray-600 mb-6">
                This page is under construction. Coming soon!
              </p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home size={18} />
                Back to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-30 shadow-sm`}>
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                O
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Oshocks Junior
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors relative`}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      You have {notifications.filter(n => !n.read).length} unread notifications
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => {
                      const NotifIcon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer transition-colors ${!notification.read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                              <NotifIcon size={16} />
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {notification.message}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={`p-3 text-center border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button className="text-sm text-blue-600 hover:underline">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <img
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden lg:block text-left">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {adminUser.name}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {adminUser.role}
                  </p>
                </div>
                <ChevronDown size={16} />
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{adminUser.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{adminUser.email}</p>
                  </div>
                  <div className="py-2">
                    <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                      <User size={16} />
                      My Profile
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                      <Settings size={16} />
                      Settings
                    </button>
                    <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                  </div>
                  <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} py-2`}>
                    <button className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${darkMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}>
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0 md:w-20'
          } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 overflow-hidden sticky top-16 h-[calc(100vh-4rem)]`}
        >
          <div className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : darkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium truncate">
                        {item.label}
                      </span>
                      {item.count !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white bg-opacity-20'
                            : darkMode
                            ? 'bg-gray-700'
                            : 'bg-gray-200'
                        }`}>
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className={`w-2 h-2 rounded-full ${getBadgeColor(item.badge)}`}></span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {renderPageContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default SuperAdminPage;