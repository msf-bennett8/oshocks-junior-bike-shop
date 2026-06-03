import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const SuperAdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7days');

  // Mock data for revenue trends
  const revenueData = [
    { date: 'Oct 02', revenue: 45000, orders: 12, mpesa: 35000, card: 10000 },
    { date: 'Oct 03', revenue: 52000, orders: 15, mpesa: 40000, card: 12000 },
    { date: 'Oct 04', revenue: 38000, orders: 10, mpesa: 28000, card: 10000 },
    { date: 'Oct 05', revenue: 65000, orders: 18, mpesa: 50000, card: 15000 },
    { date: 'Oct 06', revenue: 71000, orders: 20, mpesa: 55000, card: 16000 },
    { date: 'Oct 07', revenue: 58000, orders: 16, mpesa: 43000, card: 15000 },
    { date: 'Oct 08', revenue: 82000, orders: 24, mpesa: 62000, card: 20000 },
  ];

  // Product category performance
  const categoryData = [
    { name: 'Complete Bikes', value: 45, revenue: 450000 },
    { name: 'Accessories', value: 25, revenue: 180000 },
    { name: 'Spare Parts', value: 20, revenue: 120000 },
    { name: 'Cycling Gear', value: 10, revenue: 85000 },
  ];

  // Top selling products
  const topProducts = [
    { name: 'Mountain Bike X200', sold: 45, revenue: 225000, stock: 12 },
    { name: 'Road Bike Pro', sold: 38, revenue: 285000, stock: 8 },
    { name: 'Helmet Safety Plus', sold: 156, revenue: 78000, stock: 45 },
    { name: 'Bike Lock Premium', sold: 89, revenue: 44500, stock: 23 },
    { name: 'Water Bottle Set', sold: 234, revenue: 35100, stock: 67 },
  ];

  // Customer locations
  const locationData = [
    { city: 'Nairobi', orders: 234, revenue: 1250000 },
    { city: 'Mombasa', orders: 89, revenue: 445000 },
    { city: 'Kisumu', orders: 67, revenue: 335000 },
    { city: 'Nakuru', orders: 45, revenue: 225000 },
    { city: 'Eldoret', orders: 34, revenue: 178000 },
  ];

  // Traffic sources
  const trafficData = [
    { name: 'Direct', value: 35 },
    { name: 'Google', value: 40 },
    { name: 'Social Media', value: 15 },
    { name: 'Referral', value: 10 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`w-5 h-5 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {prefix}{value.toLocaleString()}{suffix}
            </p>
            <div className="flex items-center mt-2">
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your marketplace performance and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {['7days', '30days', '90days', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : range === '90days' ? 'Last 90 Days' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={411000}
            change={15.3}
            icon={DollarSign}
            prefix="KES "
          />
          <StatCard
            title="Total Orders"
            value={115}
            change={8.2}
            icon={ShoppingCart}
          />
          <StatCard
            title="New Customers"
            value={48}
            change={22.5}
            icon={Users}
          />
          <StatCard
            title="Products Sold"
            value={562}
            change={12.1}
            icon={Package}
          />
        </div>

        {/* Revenue & Orders Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue & Orders Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => `KES ${value.toLocaleString()}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue (KES)"
              />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods & Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => `KES ${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="mpesa" fill="#10b981" name="M-Pesa" radius={[8, 8, 0, 0]} />
                <Bar dataKey="card" fill="#3b82f6" name="Card" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Category</h2>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products & Customer Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">{product.sold} sold</span>
                      <span className="text-sm text-green-600 font-medium">
                        KES {product.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.stock > 30 ? 'bg-green-100 text-green-700' : 
                    product.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.stock} in stock
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customer Locations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Customer Locations</h2>
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{location.city}</p>
                    <p className="text-sm text-gray-600 mt-1">{location.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      KES {location.revenue.toLocaleString()}
                    </p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(location.revenue / 1250000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Traffic Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {trafficData.map((source, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS[index] + '20' }}>
                  <Eye className="w-8 h-8" style={{ color: COLORS[index] }} />
                </div>
                <p className="font-medium text-gray-900">{source.name}</p>
                <p className="text-2xl font-bold mt-2" style={{ color: COLORS[index] }}>
                  {source.value}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold text-gray-900">KES 3,574</p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> +5.2% from last period
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-gray-900">3.8%</p>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> +0.4% from last period
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Return Rate</h3>
            <p className="text-3xl font-bold text-gray-900">2.1%</p>
            <p className="text-sm text-red-600 mt-2 flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" /> -0.3% from last period
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;