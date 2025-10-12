import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Settings,
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users,
  Eye, Star, Bell, Search, Menu, X, ChevronRight, Plus,
  AlertCircle, Clock, CheckCircle, Truck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SellerPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  const [sellerData] = useState({
    seller: {
      name: 'Oshocks Junior Bike Shop',
      logo: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100',
      rating: 4.8,
      totalReviews: 1247,
      joinDate: '2023-06-15',
      location: 'Nairobi, Kenya',
      verified: true
    },
    overview: {
      totalRevenue: 2847500,
      revenueChange: 12.5,
      totalOrders: 342,
      ordersChange: 8.3,
      totalProducts: 156,
      productsChange: 5.2,
      totalViews: 45680,
      viewsChange: 18.7,
      pendingOrders: 12,
      lowStockItems: 8,
      totalCustomers: 289,
      conversionRate: 3.4
    },
    revenueData: [
      { day: 'Mon', revenue: 125000, orders: 28 },
      { day: 'Tue', revenue: 142000, orders: 34 },
      { day: 'Wed', revenue: 118000, orders: 26 },
      { day: 'Thu', revenue: 165000, orders: 38 },
      { day: 'Fri', revenue: 188000, orders: 45 },
      { day: 'Sat', revenue: 210000, orders: 52 },
      { day: 'Sun', revenue: 195000, orders: 48 }
    ],
    topProducts: [
      { id: 1, name: 'Mountain King Pro 29"', sales: 145, revenue: 18125000, stock: 23, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100' },
      { id: 2, name: 'Road Racer X1', sales: 132, revenue: 24420000, stock: 15, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100' },
      { id: 3, name: 'Electric Commuter Pro', sales: 98, revenue: 28910000, stock: 8, image: 'https://images.unsplash.com/photo-1591993715414-b2f1e8ff4fc6?w=100' },
      { id: 4, name: 'City Cruiser Elite', sales: 167, revenue: 7515000, stock: 34, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100' }
    ],
    recentOrders: [
      { id: 'ORD-001', customer: 'John Kamau', amount: 125000, status: 'completed', date: '2 hours ago' },
      { id: 'ORD-002', customer: 'Mary Wanjiru', amount: 45000, status: 'processing', date: '4 hours ago' },
      { id: 'ORD-003', customer: 'Peter Omondi', amount: 185000, status: 'shipped', date: '6 hours ago' },
      { id: 'ORD-004', customer: 'Grace Akinyi', amount: 295000, status: 'pending', date: '8 hours ago' }
    ],
    recentActivity: [
      { type: 'order', message: 'New order from John Kamau', time: '2 minutes ago', icon: ShoppingCart },
      { type: 'review', message: 'New 5-star review on Mountain King Pro', time: '15 minutes ago', icon: Star },
      { type: 'stock', message: 'Low stock alert: Electric Commuter Pro', time: '1 hour ago', icon: AlertCircle },
      { type: 'product', message: 'Product approved: City Cruiser Elite', time: '3 hours ago', icon: CheckCircle }
    ],
    categoryDistribution: [
      { name: 'Mountain Bikes', value: 32, color: '#ea580c' },
      { name: 'Road Bikes', value: 28, color: '#f59e0b' },
      { name: 'E-Bikes', value: 25, color: '#10b981' },
      { name: 'City Bikes', value: 15, color: '#3b82f6' }
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-KE').format(num);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    return configs[status] || configs.pending;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: sellerData.overview.totalProducts },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: sellerData.overview.pendingOrders, badgeColor: 'bg-orange-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const StatCard = ({ title, value, change, icon: Icon, format = 'number', colorClass = 'text-orange-600' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? formatCurrency(value) : formatNumber(value);

    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colorClass}`} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-xs sm:text-sm mb-1">{title}</h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{formattedValue}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed lg:static inset-y-0 left-0 z-50 ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <img
                  src={sellerData.seller.logo}
                  alt={sellerData.seller.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 text-sm truncate">Oshocks</h2>
                  <p className="text-xs text-gray-500">Seller Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition lg:block"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.badgeColor || 'bg-gray-200 text-gray-700'
                      } text-white`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span className="font-bold text-orange-900">{sellerData.seller.rating}</span>
                <span className="text-xs text-orange-700">({formatNumber(sellerData.seller.totalReviews)} reviews)</span>
              </div>
              <p className="text-xs text-orange-800">Keep up the great work!</p>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition mr-3"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                Welcome back! Here's what's happening with your store.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative hidden xl:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                />
              </div>

              <button className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>

              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                <img
                  src={sellerData.seller.logo}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                <div className="hidden md:block">
                  <p className="font-semibold text-gray-900 text-sm">Seller Admin</p>
                  <p className="text-xs text-gray-500">{sellerData.seller.location}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm sm:text-base">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add New Product</span>
                  <span className="sm:hidden">Add Product</span>
                </button>
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Export Report</span>
                  <span className="sm:hidden">Export</span>
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Total Revenue"
                  value={sellerData.overview.totalRevenue}
                  change={sellerData.overview.revenueChange}
                  icon={DollarSign}
                  format="currency"
                />
                <StatCard
                  title="Total Orders"
                  value={sellerData.overview.totalOrders}
                  change={sellerData.overview.ordersChange}
                  icon={ShoppingCart}
                />
                <StatCard
                  title="Total Products"
                  value={sellerData.overview.totalProducts}
                  change={sellerData.overview.productsChange}
                  icon={Package}
                />
                <StatCard
                  title="Store Views"
                  value={sellerData.overview.totalViews}
                  change={sellerData.overview.viewsChange}
                  icon={Eye}
                />
              </div>

              {(sellerData.overview.pendingOrders > 0 || sellerData.overview.lowStockItems > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {sellerData.overview.pendingOrders > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-orange-900 text-sm sm:text-base">Pending Orders</h3>
                          <p className="text-xs sm:text-sm text-orange-800 mt-1">
                            You have {sellerData.overview.pendingOrders} orders waiting for processing
                          </p>
                          <button className="mt-2 text-xs sm:text-sm font-medium text-orange-700 hover:text-orange-800 flex items-center gap-1">
                            View Orders <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {sellerData.overview.lowStockItems > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <Package className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-red-900 text-sm sm:text-base">Low Stock Alert</h3>
                          <p className="text-xs sm:text-sm text-red-800 mt-1">
                            {sellerData.overview.lowStockItems} products are running low on stock
                          </p>
                          <button className="mt-2 text-xs sm:text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1">
                            Restock Now <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Revenue Overview</h2>
                    <div className="flex gap-2 text-xs sm:text-sm">
                      <span className="flex items-center gap-1 sm:gap-2">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-600 rounded-full"></div>
                        <span className="hidden sm:inline">Revenue</span>
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sellerData.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Bar dataKey="revenue" fill="#ea580c" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Category Distribution</h2>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={sellerData.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sellerData.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 sm:mt-4 space-y-2">
                    {sellerData.categoryDistribution.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                          <span className="text-gray-700 truncate">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900 ml-2">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top Products</h2>
                    <button className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {sellerData.topProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{product.name}</h3>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <span className="text-xs sm:text-sm text-gray-600">{product.sales} sold</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.stock > 20 ? 'bg-green-100 text-green-800' :
                              product.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {product.stock} in stock
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
                    <button className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium">
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {sellerData.recentOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div key={order.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm sm:text-base">{order.id}</span>
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">{order.status}</span>
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">{order.customer}</p>
                            <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="font-bold text-gray-900 text-sm sm:text-base">{formatCurrency(order.amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Activity</h2>
                <div className="space-y-3 sm:space-y-4">
                  {sellerData.recentActivity.map((activity, idx) => {
                    const ActivityIcon = activity.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                          <ActivityIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm sm:text-base">{activity.message}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-lg p-8 sm:p-12 shadow-sm text-center">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label} Section
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                This section is under construction. Navigate using the sidebar menu.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerPage;