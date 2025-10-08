import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState({
    totalRevenue: 2847650,
    totalOrders: 1249,
    totalCustomers: 856,
    totalProducts: 3421,
    pendingOrders: 23,
    lowStockItems: 45,
    activeVendors: 12,
    averageOrderValue: 2280
  });

  // Sales data for line chart
  const salesData = [
    { date: 'Mon', revenue: 45000, orders: 15 },
    { date: 'Tue', revenue: 52000, orders: 18 },
    { date: 'Wed', revenue: 48000, orders: 16 },
    { date: 'Thu', revenue: 61000, orders: 21 },
    { date: 'Fri', revenue: 73000, orders: 25 },
    { date: 'Sat', revenue: 89000, orders: 31 },
    { date: 'Sun', revenue: 67000, orders: 23 }
  ];

  // Top categories data
  const categoryData = [
    { name: 'Complete Bikes', value: 35, color: '#3b82f6' },
    { name: 'Accessories', value: 28, color: '#10b981' },
    { name: 'Spare Parts', value: 22, color: '#f59e0b' },
    { name: 'Cycling Gear', value: 15, color: '#ef4444' }
  ];

  // Recent orders
  const recentOrders = [
    { id: 'ORD-2024-1249', customer: 'James Kamau', amount: 45000, status: 'pending', items: 2 },
    { id: 'ORD-2024-1248', customer: 'Mary Wanjiku', amount: 12500, status: 'processing', items: 3 },
    { id: 'ORD-2024-1247', customer: 'Peter Omondi', amount: 89000, status: 'completed', items: 1 },
    { id: 'ORD-2024-1246', customer: 'Sarah Njeri', amount: 3200, status: 'completed', items: 5 },
    { id: 'ORD-2024-1245', customer: 'David Kipchoge', amount: 156000, status: 'processing', items: 2 }
  ];

  // Top selling products
  const topProducts = [
    { name: 'Mountain Bike 26" - Shimano Gears', sales: 45, revenue: 675000 },
    { name: 'Cycling Helmet - Pro Series', sales: 89, revenue: 267000 },
    { name: 'Bike Lock - Heavy Duty', sales: 124, revenue: 186000 },
    { name: 'Water Bottle Cage', sales: 156, revenue: 93600 },
    { name: 'Puncture Repair Kit', sales: 203, revenue: 101500 }
  ];

  const formatCurrency = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with Oshocks Junior Bike Shop today.</p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 12.5%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 8.2%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 15.3%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Customers</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> 5.7%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-800 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-900">{stats.lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Active Vendors</p>
                <p className="text-2xl font-bold text-blue-900">{stats.activeVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (KSh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                      <p className="text-sm text-gray-600">{order.items} items</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                  View All <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;