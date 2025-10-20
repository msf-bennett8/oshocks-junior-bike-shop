import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign, 
  Eye, AlertCircle, CheckCircle, Clock, XCircle, Star, MapPin, 
  ArrowUpRight, ArrowDownRight, MoreVertical,
  Download, RefreshCw, Bell, ChevronRight, Activity,
  CreditCard, Truck, ShoppingBag, UserCheck, Percent, Tag, Plus 
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SuperAdminDashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { user } = useAuth();

  // Mock data for dashboard
  const [dashboardData ] = useState({
    revenue: {
      total: 2847650,
      change: 12.5,
      trend: 'up',
      comparison: 'vs last period'
    },
    orders: {
      total: 342,
      change: -3.2,
      trend: 'down',
      comparison: 'vs last period'
    },
    customers: {
      total: 1247,
      change: 8.7,
      trend: 'up',
      comparison: 'vs last period'
    },
    avgOrderValue: {
      total: 8325,
      change: 15.3,
      trend: 'up',
      comparison: 'vs last period'
    },
    conversionRate: {
      total: 3.2,
      change: 0.5,
      trend: 'up',
      comparison: 'vs last period'
    },
    totalProducts: {
      total: 1456,
      active: 1398,
      outOfStock: 58
    }
  });

  // Sales chart data
  const salesChartData = [
    { date: 'Mon', sales: 145000, orders: 24, customers: 18 },
    { date: 'Tue', sales: 198000, orders: 31, customers: 25 },
    { date: 'Wed', sales: 176000, orders: 28, customers: 22 },
    { date: 'Thu', sales: 234000, orders: 38, customers: 29 },
    { date: 'Fri', sales: 312000, orders: 47, customers: 36 },
    { date: 'Sat', sales: 425000, orders: 65, customers: 48 },
    { date: 'Sun', sales: 389000, orders: 58, customers: 42 }
  ];

  // Category performance data
  const categoryData = [
    { name: 'Bicycles', value: 1245000, count: 145, color: '#3B82F6' },
    { name: 'Accessories', value: 678000, count: 234, color: '#10B981' },
    { name: 'Spare Parts', value: 456000, count: 187, color: '#F59E0B' },
    { name: 'Clothing', value: 234000, count: 78, color: '#EF4444' },
    { name: 'Others', value: 234650, count: 98, color: '#8B5CF6' }
  ];

  // Top products
  const topProducts = [
    {
      id: 1,
      name: 'Mountain Bike Pro X5',
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100',
      sales: 145,
      revenue: 725000,
      stock: 12,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Road Racer Elite',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100',
      sales: 132,
      revenue: 660000,
      stock: 8,
      rating: 4.9
    },
    {
      id: 3,
      name: 'Kids Explorer Bike',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      sales: 98,
      revenue: 294000,
      stock: 23,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Safety Helmet Pro',
      image: 'https://images.unsplash.com/photo-1562955779-e6be6c4a7c4e?w=100',
      sales: 234,
      revenue: 351000,
      stock: 56,
      rating: 4.6
    },
    {
      id: 5,
      name: 'LED Bike Light Set',
      image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=100',
      sales: 187,
      revenue: 140250,
      stock: 89,
      rating: 4.5
    }
  ];

  // Recent orders
  const recentOrders = [
    {
      id: 'ORD-10234',
      customer: 'John Kamau',
      items: 3,
      total: 45000,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      date: '2025-10-10 14:30'
    },
    {
      id: 'ORD-10235',
      customer: 'Sarah Wanjiku',
      items: 1,
      total: 125000,
      status: 'processing',
      paymentMethod: 'Card',
      date: '2025-10-10 13:15'
    },
    {
      id: 'ORD-10236',
      customer: 'David Ochieng',
      items: 5,
      total: 28500,
      status: 'shipped',
      paymentMethod: 'M-Pesa',
      date: '2025-10-10 11:45'
    },
    {
      id: 'ORD-10237',
      customer: 'Mary Akinyi',
      items: 2,
      total: 67000,
      status: 'pending',
      paymentMethod: 'M-Pesa',
      date: '2025-10-10 10:20'
    },
    {
      id: 'ORD-10238',
      customer: 'Peter Mwangi',
      items: 1,
      total: 15000,
      status: 'cancelled',
      paymentMethod: 'Card',
      date: '2025-10-10 09:05'
    }
  ];

  // Traffic sources
  const trafficData = [
    { source: 'Direct', visitors: 4532, percentage: 35, color: '#3B82F6' },
    { source: 'Google Search', visitors: 3894, percentage: 30, color: '#10B981' },
    { source: 'Social Media', visitors: 2596, percentage: 20, color: '#F59E0B' },
    { source: 'Referral', visitors: 1298, percentage: 10, color: '#EF4444' },
    { source: 'Email', visitors: 649, percentage: 5, color: '#8B5CF6' }
  ];

  // Low stock alerts
  const lowStockProducts = [
    { id: 1, name: 'Road Racer Elite', stock: 8, threshold: 10, category: 'Bicycles' },
    { id: 2, name: 'Mountain Bike Tires', stock: 5, threshold: 15, category: 'Spare Parts' },
    { id: 3, name: 'Bike Lock Pro', stock: 3, threshold: 20, category: 'Accessories' },
    { id: 4, name: 'Cycling Gloves M', stock: 6, threshold: 12, category: 'Accessories' }
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'order',
      message: 'New order #ORD-10234 placed',
      time: '2 minutes ago',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      id: 2,
      type: 'customer',
      message: 'New customer registration: Sarah Wanjiku',
      time: '15 minutes ago',
      icon: UserCheck,
      color: 'green'
    },
    {
      id: 3,
      type: 'stock',
      message: 'Low stock alert: Mountain Bike Tires',
      time: '1 hour ago',
      icon: AlertCircle,
      color: 'orange'
    },
    {
      id: 4,
      type: 'review',
      message: 'New 5-star review on Road Racer Elite',
      time: '2 hours ago',
      icon: Star,
      color: 'yellow'
    },
    {
      id: 5,
      type: 'payment',
      message: 'Payment received: KES 125,000',
      time: '3 hours ago',
      icon: DollarSign,
      color: 'green'
    }
  ];

  // Order status distribution
  const orderStatusData = [
    { status: 'Completed', count: 245, color: '#10B981' },
    { status: 'Processing', count: 67, color: '#3B82F6' },
    { status: 'Shipped', count: 89, color: '#8B5CF6' },
    { status: 'Pending', count: 34, color: '#F59E0B' },
    { status: 'Cancelled', count: 23, color: '#EF4444' }
  ];

  // Refresh data
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  // Format number
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      completed: CheckCircle,
      processing: Clock,
      shipped: Truck,
      pending: AlertCircle,
      cancelled: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your Oshocks dashboard today.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              4
            </span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className={`flex items-center gap-1 text-sm ${
              dashboardData.revenue.trend === 'up' ? 'text-green-200' : 'text-red-200'
            }`}>
              {dashboardData.revenue.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(dashboardData.revenue.change)}%
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold mb-1">{formatCurrency(dashboardData.revenue.total)}</p>
          <p className="text-xs opacity-75">{dashboardData.revenue.comparison}</p>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ShoppingCart size={24} />
            </div>
            <span className={`flex items-center gap-1 text-sm ${
              dashboardData.orders.trend === 'up' ? 'text-green-200' : 'text-red-200'
            }`}>
              {dashboardData.orders.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(dashboardData.orders.change)}%
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold mb-1">{formatNumber(dashboardData.orders.total)}</p>
          <p className="text-xs opacity-75">{dashboardData.orders.comparison}</p>
        </div>

        {/* Customers Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <Users size={24} />
            </div>
            <span className={`flex items-center gap-1 text-sm ${
              dashboardData.customers.trend === 'up' ? 'text-green-200' : 'text-red-200'
            }`}>
              {dashboardData.customers.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(dashboardData.customers.change)}%
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Total Customers</h3>
          <p className="text-3xl font-bold mb-1">{formatNumber(dashboardData.customers.total)}</p>
          <p className="text-xs opacity-75">{dashboardData.customers.comparison}</p>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className={`flex items-center gap-1 text-sm ${
              dashboardData.avgOrderValue.trend === 'up' ? 'text-green-200' : 'text-red-200'
            }`}>
              {dashboardData.avgOrderValue.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(dashboardData.avgOrderValue.change)}%
            </span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Avg Order Value</h3>
          <p className="text-3xl font-bold mb-1">{formatCurrency(dashboardData.avgOrderValue.total)}</p>
          <p className="text-xs opacity-75">{dashboardData.avgOrderValue.comparison}</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Percent size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold">{dashboardData.conversionRate.total}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 ${
              dashboardData.conversionRate.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {dashboardData.conversionRate.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(dashboardData.conversionRate.change)}%
            </span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Products</p>
              <p className="text-2xl font-bold">{formatNumber(dashboardData.totalProducts.active)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {dashboardData.totalProducts.outOfStock} out of stock
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Site Visitors</p>
              <p className="text-2xl font-bold">12,969</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <ArrowUpRight size={16} />
              8.2%
            </span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sales Overview</h2>
              <p className="text-sm text-gray-600">Revenue and orders trend</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical size={20} className="text-gray-500" />
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesChartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
              <p className="text-sm text-gray-600">Current distribution</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
              <p className="text-sm text-gray-600">Sales by product category</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              View All
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <p className="text-sm text-gray-600">Best selling items</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                  {index + 1}
                </div>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                    <span>{product.sales} sales</span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      {product.rating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-gray-600">{product.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-600">Latest customer orders</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Order ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Customer</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Items</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Total</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-gray-900">{order.customer}</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-sm text-gray-900">{order.items}</span>
                    </td>
                    <td className="py-4 text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                        {order.paymentMethod === 'M-Pesa' ? (
                          <CreditCard size={14} className="text-green-600" />
                        ) : (
                          <CreditCard size={14} className="text-blue-600" />
                        )}
                        {order.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600">Latest updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                red: 'bg-red-100 text-red-600'
              };
              
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[activity.color]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>

      {/* Traffic Sources & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Traffic Sources</h2>
              <p className="text-sm text-gray-600">Where visitors come from</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">
              Analytics
            </button>
          </div>

          <div className="space-y-4">
            {trafficData.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(source.visitors)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{source.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${source.percentage}%`,
                      backgroundColor: source.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Visitors</span>
              <span className="text-lg font-bold text-gray-900">
                {formatNumber(trafficData.reduce((sum, item) => sum + item.visitors, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
              <p className="text-sm text-gray-600">Products need restocking</p>
            </div>
            <span className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-xs font-bold">
              {lowStockProducts.length}
            </span>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{product.stock} left</p>
                    <p className="text-xs text-gray-500">Min: {product.threshold}</p>
                  </div>
                </div>
              ))}

              <button className="w-full py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                Restock All Products
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">All Products In Stock</p>
              <p className="text-xs text-gray-600 mt-1">No low stock alerts at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Plus size={24} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Product</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">New Order</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Users size={24} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Customer</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Tag size={24} className="text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Category</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Percent size={24} className="text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Discount</span>
          </button>

          <button className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Download size={24} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Export Report</span>
          </button>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Page Views</p>
              <p className="text-lg font-bold text-gray-900">45,234</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Cart Abandonment</p>
              <p className="text-lg font-bold text-gray-900">18.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Avg. Session</p>
              <p className="text-lg font-bold text-gray-900">4m 32s</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-gray-600" />
            <div>
              <p className="text-xs text-gray-600">Top Location</p>
              <p className="text-lg font-bold text-gray-900">Nairobi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;