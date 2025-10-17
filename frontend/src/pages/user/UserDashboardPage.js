import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, ShoppingBag, Heart, MapPin, Bell, User, TrendingUp, Clock, CheckCircle, 
  XCircle, Truck, Star, Eye, MessageSquare, CreditCard, Gift, Award, Zap, 
  ShoppingCart, DollarSign, TrendingDown, Calendar, FileText, Download, 
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Filter, Search, 
  RefreshCw, Settings, ChevronRight, AlertCircle, Bookmark, Target,
  Percent, Tag, Box, Headphones, Share2, ExternalLink, Phone
} from 'lucide-react';

const UserDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('7days');
  const [showOrderDetails, setShowOrderDetails] = useState(null);
  const [activeWidget, setActiveWidget] = useState('overview');
  const { user } = useAuth();

  const [recentOrders] = useState([
    {
      id: 'ORD-2024-001',
      date: '2024-10-10',
      status: 'delivered',
      total: 45000,
      items: 3,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      product: 'Mountain Bike Pro X1',
      trackingNumber: 'TRK789012345',
      estimatedDelivery: '2024-10-15',
      paymentMethod: 'M-Pesa',
      shippingAddress: 'Moi Avenue, Nairobi'
    },
    {
      id: 'ORD-2024-002',
      date: '2024-10-12',
      status: 'in_transit',
      total: 3500,
      items: 2,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      product: 'Cycling Helmet & Gloves',
      trackingNumber: 'TRK789012346',
      estimatedDelivery: '2024-10-16',
      paymentMethod: 'Card',
      shippingAddress: 'Kenyatta Avenue, Nairobi'
    },
    {
      id: 'ORD-2024-003',
      date: '2024-10-13',
      status: 'processing',
      total: 12000,
      items: 1,
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400',
      product: 'Carbon Fiber Road Bike',
      trackingNumber: 'Pending',
      estimatedDelivery: '2024-10-18',
      paymentMethod: 'M-Pesa',
      shippingAddress: 'Westlands, Nairobi'
    },
    {
      id: 'ORD-2024-004',
      date: '2024-10-08',
      status: 'delivered',
      total: 2800,
      items: 1,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      product: 'Smart Bike Lock',
      trackingNumber: 'TRK789012344',
      estimatedDelivery: '2024-10-13',
      paymentMethod: 'M-Pesa',
      shippingAddress: 'Moi Avenue, Nairobi'
    }
  ]);

  const [wishlistItems] = useState([
    {
      id: 1,
      name: 'Electric Mountain Bike',
      price: 85000,
      originalPrice: 95000,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
      inStock: true,
      discount: 11,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Professional Cycling Shoes',
      price: 8500,
      originalPrice: 10000,
      image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400',
      inStock: true,
      discount: 15,
      rating: 4.8
    },
    {
      id: 3,
      name: 'Bike Repair Tool Kit',
      price: 4200,
      image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=400',
      inStock: false,
      discount: 0,
      rating: 4.3
    },
    {
      id: 4,
      name: 'Smart Bike Lock',
      price: 6500,
      originalPrice: 7500,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      inStock: true,
      discount: 13,
      rating: 4.6
    }
  ]);

  const [achievements] = useState([
    { id: 1, name: 'First Purchase', icon: ShoppingBag, unlocked: true, description: 'Made your first order' },
    { id: 2, name: 'Loyal Customer', icon: Heart, unlocked: true, description: '10+ orders completed' },
    { id: 3, name: 'Review Master', icon: MessageSquare, unlocked: false, description: 'Write 5 reviews' },
    { id: 4, name: 'Referral Champion', icon: Share2, unlocked: false, description: 'Refer 3 friends' }
  ]);

  const [activityLog] = useState([
    { id: 1, action: 'Order delivered', item: 'Mountain Bike Pro X1', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Added to wishlist', item: 'Electric Mountain Bike', time: '5 hours ago', type: 'info' },
    { id: 3, action: 'Review submitted', item: 'Cycling Helmet', time: '1 day ago', type: 'success' },
    { id: 4, action: 'Order placed', item: 'Cycling Helmet & Gloves', time: '2 days ago', type: 'info' },
    { id: 5, action: 'Points redeemed', item: '500 points for discount', time: '3 days ago', type: 'reward' }
  ]);

  const stats = [
    { label: 'Total Spent', value: '156,800', icon: DollarSign, color: 'bg-green-500', trend: '+12%', trendUp: true },
    { label: 'Total Orders', value: '24', icon: ShoppingBag, color: 'bg-blue-500', trend: '+3', trendUp: true },
    { label: 'Active Orders', value: '2', icon: Truck, color: 'bg-orange-500', trend: null, trendUp: null },
    { label: 'Wishlist Items', value: wishlistItems.length, icon: Heart, color: 'bg-red-500', trend: '+2', trendUp: true },
    { label: 'Reward Points', value: '1,250', icon: Star, color: 'bg-yellow-500', trend: '+150', trendUp: true },
    { label: 'Saved Addresses', value: '3', icon: MapPin, color: 'bg-purple-500', trend: null, trendUp: null },
    { label: 'Reviews Written', value: '8', icon: MessageSquare, color: 'bg-indigo-500', trend: '+2', trendUp: true },
    { label: 'Avg. Rating Given', value: '4.5', icon: Award, color: 'bg-pink-500', trend: null, trendUp: null }
  ];

  const spendingData = [
    { month: 'Apr', amount: 12000 },
    { month: 'May', amount: 18000 },
    { month: 'Jun', amount: 15000 },
    { month: 'Jul', amount: 25000 },
    { month: 'Aug', amount: 22000 },
    { month: 'Sep', amount: 28000 },
    { month: 'Oct', amount: 36800 }
  ];

  const getStatusInfo = (status) => {
    const statusMap = {
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      in_transit: { label: 'In Transit', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
      processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      returned: { label: 'Returned', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: RefreshCw }
    };
    return statusMap[status] || statusMap.processing;
  };

  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const maxSpending = Math.max(...spendingData.map(d => d.amount));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
                Welcome back, {user?.name?.split(' ')[0]}! 
                <span className="text-2xl">👋</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Track your orders, manage wishlist, and explore personalized recommendations
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Shop</span>
              </button>
            </div>
          </div>

          {/* Time Filter */}
          <div className="mt-4 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            {['Today', '7 days', '30 days', 'This Year', 'All Time'].map((filter, idx) => (
              <button
                key={idx}
                onClick={() => setTimeFilter(filter.toLowerCase().replace(' ', ''))}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  timeFilter === filter.toLowerCase().replace(' ', '')
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${stat.color} p-2 sm:p-2.5 rounded-lg`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Spending Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    Spending Analytics
                  </h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs sm:text-sm font-medium">
                      Monthly
                    </button>
                    <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg text-xs sm:text-sm font-medium">
                      Yearly
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-end justify-between gap-2 h-48 sm:h-64">
                  {spendingData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative group">
                        <div 
                          className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-500 hover:to-green-300"
                          style={{ height: `${(data.amount / maxSpending) * 100}%`, minHeight: '20px' }}
                        >
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {formatCurrency(data.amount)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 font-medium">{data.month}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total Spent</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">KES 156.8K</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Avg. Order</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">KES 6.5K</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Saved</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900">KES 12.4K</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    Recent Orders
                  </h2>
                  <div className="flex gap-2">
                    <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <a href="/orders" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {recentOrders.map(order => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  const isExpanded = showOrderDetails === order.id;
                  
                  return (
                    <div key={order.id} className="hover:bg-gray-50 transition-colors">
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img 
                            src={order.image} 
                            alt={order.product}
                            className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-bold text-gray-900 text-sm sm:text-base">{order.id}</p>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <p className="text-sm sm:text-base text-gray-900 font-medium mb-1">{order.product}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(order.date).toLocaleDateString()}
                                  </span>
                                  <span>•</span>
                                  <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-gray-900">{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Order Actions */}
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => setShowOrderDetails(isExpanded ? null : order.id)}
                                className="text-xs sm:text-sm px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                              {order.status !== 'delivered' && order.trackingNumber !== 'Pending' && (
                                <button className="text-xs sm:text-sm px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  Track Order
                                </button>
                              )}
                              {order.status === 'delivered' && (
                                <button className="text-xs sm:text-sm px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  Write Review
                                </button>
                              )}
                              <button className="text-xs sm:text-sm px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                Invoice
                              </button>
                              <button className="text-xs sm:text-sm px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors flex items-center gap-1">
                                <Headphones className="w-3 h-3" />
                                Support
                              </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Tracking Number</p>
                                  <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Est. Delivery</p>
                                  <p className="font-medium text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Payment Method</p>
                                  <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs mb-1">Shipping Address</p>
                                  <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wishlist - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    My Wishlist
                    <span className="text-sm font-normal text-gray-500">({wishlistItems.length} items)</span>
                  </h2>
                  <a href="/wishlist" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {wishlistItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.discount > 0 && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
                            -{item.discount}%
                          </span>
                        )}
                        {!item.inStock && (
                          <span className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                            Out of Stock
                          </span>
                        )}
                        <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                          <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({item.rating})</span>
                        </div>
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{item.name}</h3>
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <p className="text-green-600 font-bold text-sm sm:text-base">{formatCurrency(item.price)}</p>
                            {item.originalPrice && (
                              <p className="text-gray-400 text-xs line-through">{formatCurrency(item.originalPrice)}</p>
                            )}
                          </div>
                        </div>
                        <button 
                          className={`w-full py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                            item.inStock 
                              ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!item.inStock}
                        >
                          {item.inStock ? (
                            <span className="flex items-center justify-center gap-1">
                              <ShoppingCart className="w-3 h-3" />
                              Add to Cart
                            </span>
                          ) : 'Notify Me'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  { label: 'My Orders', sublabel: 'Track & manage', icon: Package, color: 'blue', link: '/orders' },
                  { label: 'Account Settings', sublabel: 'Update profile', icon: User, color: 'green', link: '/settings' },
                  { label: 'Addresses', sublabel: 'Manage locations', icon: MapPin, color: 'purple', link: '/addresses' },
                  { label: 'My Reviews', sublabel: 'View feedback', icon: MessageSquare, color: 'yellow', link: '/reviews' },
                  { label: 'Payment Methods', sublabel: 'Manage payments', icon: CreditCard, color: 'indigo', link: '/payments' },
                  { label: 'Refer & Earn', sublabel: 'Invite friends', icon: Gift, color: 'pink', link: '/referral' }
                ].map((action, idx) => (
                  <a 
                    key={idx}
                    href={action.link}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`bg-${action.color}-100 p-2 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}>
                      <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{action.label}</p>
                      <p className="text-xs text-gray-600">{action.sublabel}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Loyalty Program - Enhanced */}
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold">Rewards Program</h2>
                  <div className="bg-yellow-400 p-2 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-900" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-2">Your Points Balance</p>
                  <p className="text-4xl sm:text-5xl font-bold mb-1">1,250</p>
                  <p className="text-xs opacity-75">Worth KES 1,250 in discounts</p>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Progress to Gold Tier</p>
                    <p className="text-sm font-bold">60%</p>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded-full h-2 mb-2">
                    <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{width: '60%'}}></div>
                  </div>
                  <p className="text-xs opacity-90">750 more points to unlock exclusive benefits</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs opacity-75 mb-1">Points Earned</p>
                    <p className="text-xl font-bold">+150</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs opacity-75 mb-1">This Month</p>
                    <p className="text-xl font-bold">3 Orders</p>
                  </div>
                </div>
                
                <button className="w-full bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                  <Gift className="w-5 h-5" />
                  Redeem Points
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Achievements
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map(achievement => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        achievement.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className={`inline-flex p-3 rounded-full mb-2 ${
                        achievement.unlocked ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <p className="text-xs font-semibold text-gray-900 mb-1">{achievement.name}</p>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      {achievement.unlocked && (
                        <div className="mt-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {activityLog.map(activity => (
                  <div key={activity.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'reward' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 truncate">{activity.item}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/activity" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium mt-4">
                View Full History
              </a>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Notifications
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </h2>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                    <p className="text-xs text-gray-600 mt-1">Your order #ORD-2024-001 has been delivered successfully</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">2 hours ago</p>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View Order</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Price Drop Alert</p>
                    <p className="text-xs text-gray-600 mt-1">Electric Mountain Bike is now 11% off!</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">1 day ago</p>
                      <button className="text-xs text-green-600 hover:text-green-700 font-medium">View Product</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Back in Stock</p>
                    <p className="text-xs text-gray-600 mt-1">Bike Repair Tool Kit is available again</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">3 days ago</p>
                      <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">Shop Now</button>
                    </div>
                  </div>
                </div>
              </div>
              <a href="/notifications" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium mt-4 flex items-center justify-center gap-1">
                View All Notifications
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Need Help?</h3>
                  <p className="text-xs opacity-90">We're here 24/7</p>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-4">
                Have questions about your orders or products? Our support team is ready to assist you.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-white text-blue-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
                <button className="w-full bg-white bg-opacity-20 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-opacity-30 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Support
                </button>
              </div>
            </div>

            {/* Referral Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Refer & Earn</h3>
                    <p className="text-xs opacity-90">KES 500 per friend</p>
                  </div>
                </div>
                
                <p className="text-sm opacity-90 mb-4">
                  Share Oshocks with friends and earn KES 500 for each successful referral!
                </p>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-mono">JOHN2024</span>
                  <button className="text-xs bg-white text-purple-600 px-3 py-1.5 rounded font-semibold hover:bg-gray-100 transition-colors">
                    Copy Code
                  </button>
                </div>
                
                <button className="w-full bg-white text-purple-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Now
                </button>
              </div>
            </div>

            {/* Special Offers */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Special Offers
                </h3>
                <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-full font-bold">NEW</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="font-semibold text-sm mb-1">Weekend Sale</p>
                  <p className="text-xs opacity-90 mb-2">Up to 40% off on select bikes</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">Ends in 2 days</span>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
                  <p className="font-semibold text-sm mb-1">Free Shipping</p>
                  <p className="text-xs opacity-90 mb-2">On orders above KES 10,000</p>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3 h-3" />
                    <span className="text-xs">Limited time</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-white text-orange-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors mt-4 flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View All Offers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;