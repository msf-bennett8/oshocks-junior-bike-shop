import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Star, Download, Calendar } from 'lucide-react';

const AdminReportsPage = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');

  // Mock data - replace with actual API calls
  const salesData = [
    { month: 'Jan', sales: 45000, orders: 120, revenue: 1200000 },
    { month: 'Feb', sales: 52000, orders: 145, revenue: 1450000 },
    { month: 'Mar', sales: 48000, orders: 135, revenue: 1350000 },
    { month: 'Apr', sales: 61000, orders: 165, revenue: 1650000 },
    { month: 'May', sales: 55000, orders: 150, revenue: 1500000 },
    { month: 'Jun', sales: 67000, orders: 180, revenue: 1800000 },
  ];

  const categoryData = [
    { name: 'Complete Bikes', value: 45, amount: 2250000 },
    { name: 'Accessories', value: 25, amount: 750000 },
    { name: 'Spare Parts', value: 20, amount: 600000 },
    { name: 'Cycling Gear', value: 10, amount: 400000 },
  ];

  const topProducts = [
    { id: 1, name: 'Mountain Bike Pro X1', sales: 45, revenue: 675000, rating: 4.8 },
    { id: 2, name: 'Road Bike Speed 200', sales: 38, revenue: 570000, rating: 4.7 },
    { id: 3, name: 'Helmet Premium Plus', sales: 120, revenue: 360000, rating: 4.9 },
    { id: 4, name: 'Bike Lock Heavy Duty', sales: 95, revenue: 285000, rating: 4.6 },
    { id: 5, name: 'LED Light Set', sales: 150, revenue: 225000, rating: 4.8 },
  ];

  const vendorPerformance = [
    { name: 'Oshocks Main Store', orders: 450, revenue: 4500000, commission: 0 },
    { name: 'Kenya Cycles Ltd', orders: 280, revenue: 2800000, commission: 280000 },
    { name: 'Nairobi Bike Hub', orders: 195, revenue: 1950000, commission: 195000 },
    { name: 'Mombasa Wheels', orders: 142, revenue: 1420000, commission: 142000 },
    { name: 'Kisumu Cycles', orders: 98, revenue: 980000, commission: 98000 },
  ];

  const paymentMethods = [
    { name: 'M-Pesa', value: 65, color: '#10B981' },
    { name: 'Credit Card', value: 25, color: '#3B82F6' },
    { name: 'Bank Transfer', value: 10, color: '#8B5CF6' },
  ];

  const kpiData = [
    { label: 'Total Revenue', value: 'KSh 8,500,000', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: '1,245', change: '+8.3%', icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Active Customers', value: '3,890', change: '+15.2%', icon: Users, color: 'bg-purple-500' },
    { label: 'Products Sold', value: '4,567', change: '+10.1%', icon: Package, color: 'bg-orange-500' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
  };

  const exportReport = (type) => {
    alert(`Exporting ${type} report... (This would trigger a CSV/PDF download in production)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
              <p className="text-gray-600">Comprehensive insights into your marketplace performance</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={() => exportReport('overview')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {['overview', 'sales', 'products', 'vendors', 'customers'].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 font-medium capitalize transition ${
                  reportType === type
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <kpi.icon className="text-white" size={24} />
                </div>
                <span className={`text-sm font-semibold ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{kpi.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Based on Report Type */}
        {reportType === 'overview' && (
          <div className="space-y-6">
            {/* Revenue & Orders Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue & Orders Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis yAxisId="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value) => typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue (KSh)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales by Category */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Sales by Category</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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

              {/* Payment Methods */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{method.name}</span>
                        <span className="font-bold text-gray-900">{method.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ width: `${method.value}%`, backgroundColor: method.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Top Performing Products</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{product.sales} units</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(product.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-medium text-gray-900">{product.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'vendors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Vendor Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorPerformance.map((vendor, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{vendor.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{formatCurrency(vendor.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600 font-medium">
                          {vendor.commission === 0 ? 'N/A' : formatCurrency(vendor.commission)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(reportType === 'sales' || reportType === 'customers') && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {reportType === 'sales' ? 'Sales Analysis' : 'Customer Insights'}
            </h3>
            <p className="text-gray-600">
              Detailed {reportType} reports coming soon. This section will include advanced analytics and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;