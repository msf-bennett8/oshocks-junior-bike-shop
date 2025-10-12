import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, 
  Eye, Star, Calendar, Download, Filter, RefreshCw, BarChart3, 
  PieChart, Activity, ArrowUpRight, ArrowDownRight, AlertCircle,
  Clock, CheckCircle, XCircle, Truck, ChevronDown, Search
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SellerAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 2847500,
      revenueChange: 12.5,
      totalOrders: 342,
      ordersChange: 8.3,
      totalProducts: 156,
      productsChange: 5.2,
      totalCustomers: 289,
      customersChange: 15.7,
      averageOrderValue: 8327,
      averageOrderChange: 3.8,
      conversionRate: 3.4,
      conversionChange: -0.8
    },
    revenueData: [
      { date: 'Jan 1', revenue: 85000, orders: 28, customers: 24 },
      { date: 'Jan 5', revenue: 92000, orders: 31, customers: 27 },
      { date: 'Jan 10', revenue: 88000, orders: 29, customers: 25 },
      { date: 'Jan 15', revenue: 105000, orders: 36, customers: 32 },
      { date: 'Jan 20', revenue: 98000, orders: 33, customers: 29 },
      { date: 'Jan 25', revenue: 112000, orders: 38, customers: 35 },
      { date: 'Jan 30', revenue: 118000, orders: 41, customers: 38 }
    ],
    topProducts: [
      { id: 1, name: 'Mountain King Pro 29"', sales: 1250, revenue: 156250000, views: 8540, rating: 4.8, stock: 45 },
      { id: 2, name: 'Road Racer X1', sales: 1560, revenue: 288600000, views: 12340, rating: 4.9, stock: 32 },
      { id: 3, name: 'City Cruiser Elite', sales: 980, revenue: 44100000, views: 5670, rating: 4.6, stock: 67 },
      { id: 4, name: 'Electric Commuter Pro', sales: 850, revenue: 250750000, views: 9870, rating: 4.8, stock: 12 },
      { id: 5, name: 'Kids BMX Champion', sales: 1120, revenue: 31360000, views: 6540, rating: 4.7, stock: 89 }
    ],
    categoryPerformance: [
      { category: 'Mountain Bikes', sales: 2840, revenue: 355000000, percentage: 32 },
      { category: 'Road Bikes', sales: 1950, revenue: 360750000, percentage: 28 },
      { category: 'E-Bikes', sales: 1230, revenue: 363450000, percentage: 25 },
      { category: 'City Bikes', sales: 1680, revenue: 75600000, percentage: 10 },
      { category: 'Kids Bikes', sales: 890, revenue: 24920000, percentage: 5 }
    ],
    orderStatus: [
      { status: 'Completed', count: 234, value: 68, color: '#10b981' },
      { status: 'Processing', count: 56, value: 16, color: '#f59e0b' },
      { status: 'Pending', count: 32, value: 10, color: '#6b7280' },
      { status: 'Shipped', count: 20, value: 6, color: '#3b82f6' }
    ],
    customerInsights: {
      newCustomers: 78,
      returningCustomers: 211,
      averageLifetimeValue: 24650,
      topLocation: 'Nairobi',
      repeatPurchaseRate: 42.3
    },
    trafficSources: [
      { source: 'Direct', visits: 3450, conversions: 142, value: 30 },
      { source: 'Google Search', visits: 2890, conversions: 98, value: 25 },
      { source: 'Social Media', visits: 2340, conversions: 76, value: 20 },
      { source: 'Referral', visits: 1560, conversions: 26, value: 15 },
      { source: 'Email', visits: 980, conversions: 45, value: 10 }
    ],
    recentOrders: [
      { id: '#ORD-001', customer: 'John Kamau', product: 'Mountain King Pro', amount: 125000, status: 'completed', date: '2025-01-10' },
      { id: '#ORD-002', customer: 'Mary Wanjiru', product: 'City Cruiser Elite', amount: 45000, status: 'processing', date: '2025-01-10' },
      { id: '#ORD-003', customer: 'Peter Omondi', product: 'Road Racer X1', amount: 185000, status: 'shipped', date: '2025-01-09' },
      { id: '#ORD-004', customer: 'Grace Akinyi', product: 'Electric Commuter', amount: 295000, status: 'completed', date: '2025-01-09' },
      { id: '#ORD-005', customer: 'David Kipchoge', product: 'Kids BMX Champion', amount: 28000, status: 'pending', date: '2025-01-08' }
    ]
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1200);
  }, [timeRange]);

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

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
      shipped: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle className="w-4 h-4" />,
      processing: <Clock className="w-4 h-4" />,
      pending: <AlertCircle className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const StatCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? formatCurrency(value) : 
                          format === 'percentage' ? `${value}%` : 
                          formatNumber(value);

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-orange-600" />
                Seller Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track your store performance and insights</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                <Download className="w-4 h-4" />
                Export Report
              </button>

              {/* Refresh Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={analyticsData.overview.totalRevenue}
            change={analyticsData.overview.revenueChange}
            icon={DollarSign}
            format="currency"
          />
          <StatCard
            title="Total Orders"
            value={analyticsData.overview.totalOrders}
            change={analyticsData.overview.ordersChange}
            icon={ShoppingCart}
          />
          <StatCard
            title="Total Products"
            value={analyticsData.overview.totalProducts}
            change={analyticsData.overview.productsChange}
            icon={Package}
          />
          <StatCard
            title="Total Customers"
            value={analyticsData.overview.totalCustomers}
            change={analyticsData.overview.customersChange}
            icon={Users}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Average Order Value</h3>
              <div className={`flex items-center gap-1 text-sm ${analyticsData.overview.averageOrderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.overview.averageOrderChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(analyticsData.overview.averageOrderChange)}%
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Conversion Rate</h3>
              <div className={`flex items-center gap-1 text-sm ${analyticsData.overview.conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analyticsData.overview.conversionChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(analyticsData.overview.conversionChange)}%
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 rounded-lg text-sm transition ${selectedMetric === 'revenue' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`px-3 py-1 rounded-lg text-sm transition ${selectedMetric === 'orders' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Orders
              </button>
              <button
                onClick={() => setSelectedMetric('customers')}
                className={`px-3 py-1 rounded-lg text-sm transition ${selectedMetric === 'customers' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Customers
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value)}
              />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#ea580c" 
                strokeWidth={2}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Category Performance</h2>
            <div className="space-y-4">
              {analyticsData.categoryPerformance.map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(category.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
            <div className="flex items-center justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={analyticsData.orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {analyticsData.orderStatus.map((status, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-600">{status.status}</p>
                    <p className="text-lg font-bold text-gray-900">{status.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sales</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Views</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rating</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProducts.map((product, idx) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">{idx + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{formatNumber(product.sales)}</td>
                    <td className="py-4 px-4 text-gray-700">{formatCurrency(product.revenue)}</td>
                    <td className="py-4 px-4 text-gray-700">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {formatNumber(product.views)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-700">{product.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 50 ? 'bg-green-100 text-green-800' :
                        product.stock > 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Sources & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Sources */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Traffic Sources</h2>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{source.source}</p>
                    <p className="text-sm text-gray-600">{formatNumber(source.visits)} visits • {source.conversions} conversions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{source.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
            <div className="space-y-3">
              {analyticsData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-orange-300 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{order.id}</span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.customer} • {order.product}</p>
                    <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;