import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import sellerDashboardService from '../../services/sellerDashboardService';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users,
  Eye, Star, AlertCircle, Clock, CheckCircle, XCircle, Truck, Heart,
  MessageSquare, ArrowUp, ArrowDown, Calendar, Download, RefreshCw,
  BarChart3, PieChart, Activity, Zap, Target, Award, ShoppingBag,
  CreditCard, Percent, Bell, Settings, Plus, ChevronRight, Filter,
  MapPin, Phone, Mail, ExternalLink, Search, ChevronDown, Minus,
  Wallet, Gift, UserPlus, ShieldCheck, AlertTriangle, Info
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const SellerDashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  // Real data from API
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [commissionBreakdown, setCommissionBreakdown] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [error, setError] = useState(null);

  // Mock data - Replace with API calls
  const [stats, setStats] = useState({
    revenue: {
      total: 2450000,
      change: 12.5,
      trend: 'up',
      target: 3000000,
      targetProgress: 81.67
    },
    orders: {
      total: 487,
      change: 8.3,
      trend: 'up',
      pending: 23,
      processing: 45,
      shipped: 21,
      completed: 398,
      cancelled: 21,
      avgOrderValue: 5031
    },
    products: {
      total: 145,
      active: 132,
      outOfStock: 8,
      lowStock: 15,
      draft: 5
    },
    customers: {
      total: 1234,
      new: 87,
      returning: 1147,
      change: 15.2,
      repeatRate: 62.5
    },
    views: {
      total: 45678,
      change: 23.4,
      unique: 32456,
      avgDuration: '3:45',
      bounceRate: 42.3
    },
    conversion: {
      rate: 3.2,
      change: 0.5,
      cartAbandonment: 68.5
    },
    rating: {
      average: 4.6,
      total: 1289,
      breakdown: { 5: 856, 4: 312, 3: 89, 2: 21, 1: 11 }
    }
  });

  const salesData = [
    { date: '01 Oct', revenue: 285000, orders: 42, profit: 95000, customers: 38 },
    { date: '02 Oct', revenue: 320000, orders: 48, profit: 105000, customers: 45 },
    { date: '03 Oct', revenue: 298000, orders: 45, profit: 98000, customers: 41 },
    { date: '04 Oct', revenue: 410000, orders: 62, profit: 145000, customers: 58 },
    { date: '05 Oct', revenue: 380000, orders: 58, profit: 132000, customers: 52 },
    { date: '06 Oct', revenue: 445000, orders: 68, profit: 155000, customers: 63 },
    { date: '07 Oct', revenue: 520000, orders: 79, profit: 182000, customers: 71 },
    { date: '08 Oct', revenue: 395000, orders: 61, profit: 138000, customers: 56 },
    { date: '09 Oct', revenue: 467000, orders: 71, profit: 165000, customers: 65 }
  ];

  const hourlyData = [
    { hour: '00:00', orders: 2, revenue: 8500 },
    { hour: '03:00', orders: 1, revenue: 3200 },
    { hour: '06:00', orders: 5, revenue: 21000 },
    { hour: '09:00', orders: 12, revenue: 54000 },
    { hour: '12:00', orders: 18, revenue: 89000 },
    { hour: '15:00', orders: 15, revenue: 72000 },
    { hour: '18:00', orders: 22, revenue: 105000 },
    { hour: '21:00', orders: 14, revenue: 68000 }
  ];

  const categoryPerformance = [
    { name: 'Bicycles', sales: 1250000, orders: 145, percentage: 51, color: '#ea580c', profit: 425000, roi: 34 },
    { name: 'Accessories', sales: 680000, orders: 234, percentage: 28, color: '#f97316', profit: 238000, roi: 35 },
    { name: 'Parts', sales: 420000, orders: 89, percentage: 17, color: '#fb923c', profit: 147000, roi: 35 },
    { name: 'Clothing', sales: 100000, orders: 19, percentage: 4, color: '#fdba74', profit: 35000, roi: 35 }
  ];

  const topProducts = [
    { 
      id: 1, 
      name: 'Mountain Bike Pro X500', 
      sku: 'MTB-500',
      sales: 45, 
      revenue: 2025000, 
      views: 1234, 
      stock: 15,
      rating: 4.8,
      reviews: 156,
      trend: 'up',
      trendValue: 12,
      wishlist: 89
    },
    { 
      id: 2, 
      name: 'Road Racing Bike Elite', 
      sku: 'RRB-ELT',
      sales: 32, 
      revenue: 2080000, 
      views: 987, 
      stock: 8,
      rating: 4.9,
      reviews: 98,
      trend: 'up',
      trendValue: 18,
      wishlist: 124
    },
    { 
      id: 3, 
      name: 'Kids Bicycle 16" Rainbow', 
      sku: 'KDS-16R',
      sales: 78, 
      revenue: 975000, 
      views: 2341, 
      stock: 25,
      rating: 4.7,
      reviews: 234,
      trend: 'up',
      trendValue: 8,
      wishlist: 67
    },
    { 
      id: 4, 
      name: 'Professional Bike Helmet', 
      sku: 'HLM-PRO',
      sales: 156, 
      revenue: 546000, 
      views: 3456, 
      stock: 50,
      rating: 4.6,
      reviews: 445,
      trend: 'down',
      trendValue: 5,
      wishlist: 45
    },
    { 
      id: 5, 
      name: 'Electric Mountain Bike E-Pro', 
      sku: 'EMB-EPR',
      sales: 12, 
      revenue: 1500000, 
      views: 876, 
      stock: 5,
      rating: 4.9,
      reviews: 67,
      trend: 'up',
      trendValue: 25,
      wishlist: 234
    }
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'LED Bike Light Set is running low on stock (3 units left)', time: '10 mins ago', action: 'Restock' },
    { id: 2, type: 'error', message: 'Hydraulic Disc Brakes Set is out of stock', time: '1 hour ago', action: 'Restock Now' },
    { id: 3, type: 'info', message: 'You have 23 pending orders to process', time: '2 hours ago', action: 'View Orders' },
    { id: 4, type: 'success', message: 'Mountain Bike Pro X500 has received 5 new reviews (4.8★)', time: '5 hours ago', action: 'View Reviews' },
    { id: 5, type: 'warning', message: 'Electric Mountain Bike E-Pro stock is critically low (5 units)', time: '6 hours ago', action: 'Restock' },
    { id: 6, type: 'info', message: 'Your store received 234 new visitors today', time: '8 hours ago', action: 'View Analytics' }
  ];

  const revenueByPayment = [
    { name: 'M-Pesa', value: 1470000, percentage: 60, color: '#22c55e', transactions: 312 },
    { name: 'Card Payment', value: 735000, percentage: 30, color: '#3b82f6', transactions: 98 },
    { name: 'Cash on Delivery', value: 245000, percentage: 10, color: '#f59e0b', transactions: 77 }
  ];

  const customerSegments = [
    { segment: 'New Customers', count: 87, revenue: 325000, avgOrder: 3736, color: '#3b82f6' },
    { segment: 'Returning Customers', count: 245, revenue: 1456000, avgOrder: 5943, color: '#22c55e' },
    { segment: 'VIP Customers', count: 23, revenue: 669000, avgOrder: 29087, color: '#a855f7' }
  ];

  const trafficSources = [
    { source: 'Direct', visitors: 12345, percentage: 38, orders: 156, conversion: 1.26 },
    { source: 'Social Media', visitors: 8976, percentage: 28, orders: 234, conversion: 2.61 },
    { source: 'Search Engine', visitors: 7654, percentage: 24, orders: 187, conversion: 2.44 },
    { source: 'Email Marketing', visitors: 3209, percentage: 10, orders: 98, conversion: 3.05 }
  ];

  const performanceMetrics = [
    { metric: 'Product Quality', score: 92, max: 100 },
    { metric: 'Delivery Speed', score: 85, max: 100 },
    { metric: 'Customer Service', score: 88, max: 100 },
    { metric: 'Pricing', score: 78, max: 100 },
    { metric: 'Packaging', score: 90, max: 100 },
    { metric: 'Communication', score: 86, max: 100 }
  ];

  const upcomingTasks = [
    { id: 1, task: 'Process 23 pending orders', priority: 'high', deadline: 'Today' },
    { id: 2, task: 'Restock 8 out-of-stock items', priority: 'high', deadline: 'Today' },
    { id: 3, task: 'Respond to 12 customer messages', priority: 'medium', deadline: 'Tomorrow' },
    { id: 4, task: 'Review and approve 5 product returns', priority: 'medium', deadline: 'Tomorrow' },
    { id: 5, task: 'Update pricing for 15 products', priority: 'low', deadline: 'This Week' }
  ];

  const recentOrdersTable = [
    { 
      id: 'ORD-2024-1234', 
      customer: 'John Kamau', 
      items: 2,
      total: 45000, 
      status: 'pending', 
      date: '2 mins ago',
      payment_method: 'mpesa'
    },
    { 
      id: 'ORD-2024-1235', 
      customer: 'Jane Wanjiku', 
      items: 3,
      total: 65000, 
      status: 'processing', 
      date: '12 mins ago',
      payment_method: 'card'
    },
    { 
      id: 'ORD-2024-1236', 
      customer: 'Peter Ochieng', 
      items: 1,
      total: 12500, 
      status: 'shipped', 
      date: '1 hour ago',
      payment_method: 'mpesa'
    },
    { 
      id: 'ORD-2024-1237', 
      customer: 'Mary Njeri', 
      items: 1,
      total: 3500, 
      status: 'completed', 
      date: '2 hours ago',
      payment_method: 'cod'
    },
    { 
      id: 'ORD-2024-1238', 
      customer: 'David Mwangi', 
      items: 2,
      total: 8500, 
      status: 'cancelled', 
      date: '3 hours ago',
      payment_method: 'mpesa'
    }
  ];

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
      icon: UserPlus,
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

  const lowStockProducts = [
    { id: 1, name: 'Road Racer Elite', stock: 8, threshold: 10, category: 'Bicycles' },
    { id: 2, name: 'Mountain Bike Tires', stock: 5, threshold: 15, category: 'Spare Parts' },
    { id: 3, name: 'Bike Lock Pro', stock: 3, threshold: 20, category: 'Accessories' },
    { id: 4, name: 'Cycling Gloves M', stock: 6, threshold: 12, category: 'Accessories' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all dashboard data in parallel
      const [overviewData, transactionsData, commissionsData, payoutsData] = await Promise.all([
        sellerDashboardService.getOverview(timeRange === '24hours' ? 'today' : timeRange === '7days' ? 'week' : 'month'),
        sellerDashboardService.getTransactions({ 
          page: 1, 
          per_page: 10 
        }),
        sellerDashboardService.getCommissionBreakdown(timeRange === '24hours' ? 'today' : timeRange === '7days' ? 'week' : 'month'),
        sellerDashboardService.getPayouts()
      ]);

      console.log('✅ Dashboard data loaded:', { overviewData, transactionsData, commissionsData, payoutsData });
      
      // Update state with real data
      setDashboardData(overviewData.data);
      setTransactions(transactionsData.data || []);
      setCommissionBreakdown(commissionsData.data);
      setPayouts(payoutsData.data || []);

      // Map API data to stats structure
      if (overviewData.data) {
        const apiData = overviewData.data;
        setStats(prev => ({
          ...prev,
          revenue: {
            total: parseFloat(apiData.total_sales?.amount || 0),
            change: apiData.total_sales?.change_percentage || 0,
            trend: (apiData.total_sales?.change_percentage || 0) > 0 ? 'up' : (apiData.total_sales?.change_percentage || 0) < 0 ? 'down' : 'flat',
            target: 3000000,
            targetProgress: ((parseFloat(apiData.total_sales?.amount || 0)) / 3000000) * 100
          },
          orders: {
            total: apiData.order_statistics?.total_orders || 0,
            change: apiData.order_statistics?.change_percentage || 0,
            trend: (apiData.order_statistics?.change_percentage || 0) > 0 ? 'up' : (apiData.order_statistics?.change_percentage || 0) < 0 ? 'down' : 'flat',
            pending: apiData.order_statistics?.pending_orders || 0,
            processing: apiData.order_statistics?.processing_orders || 0,
            shipped: 0,
            completed: apiData.order_statistics?.completed_orders || 0,
            cancelled: apiData.order_statistics?.cancelled_orders || 0,
            avgOrderValue: apiData.order_statistics?.average_order_value || 0
          },
          customers: {
            ...prev.customers,
            total: apiData.unique_customers || 0
          }
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: RefreshCw },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAlertIcon = (type) => {
    const icons = {
      warning: { icon: AlertTriangle, color: 'text-yellow-600' },
      error: { icon: XCircle, color: 'text-red-600' },
      info: { icon: Info, color: 'text-blue-600' },
      success: { icon: CheckCircle, color: 'text-green-600' }
    };
    return icons[type];
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const StatCard = ({ icon: Icon, label, value, change, trend, color, suffix = '', subtitle = '' }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUp className="w-4 h-4" />}
            {trend === 'down' && <ArrowDown className="w-4 h-4" />}
            {trend === 'flat' && <Minus className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {change !== undefined && (
        <p className="text-xs text-gray-500 mt-1">vs. previous period</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
                {refreshing && <RefreshCw className="w-6 h-6 text-orange-600 animate-spin" />}
              </h1>
              <p className="text-gray-600 mt-1">Here's your business overview for today</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-500">Last updated: Just now</span>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  Live
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none pr-10 bg-white"
                >
                  <option value="24hours">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {alerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {alerts.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {alerts.map(alert => {
                        const alertIcon = getAlertIcon(alert.type);
                        const AlertIcon = alertIcon.icon;
                        return (
                          <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex gap-3">
                              <AlertIcon className={`w-5 h-5 ${alertIcon.color} flex-shrink-0 mt-0.5`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 mb-1">{alert.message}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{alert.time}</span>
                                  <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                                    {alert.action}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Revenue Target Progress */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Monthly Revenue Target</h3>
              <p className="text-orange-100 text-sm">October 2024</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">KSh {(stats.revenue.total / 1000).toFixed(0)}K</p>
              <p className="text-orange-100 text-sm">of KSh {(stats.revenue.target / 1000).toFixed(0)}K goal</p>
            </div>
          </div>
          <div className="w-full bg-orange-400 rounded-full h-3 mb-2">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.revenue.targetProgress}%`