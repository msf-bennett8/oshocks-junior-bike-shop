import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Search, Filter, Download, Eye, RefreshCw, XCircle, AlertCircle, ChevronDown, Calendar, CreditCard, ShoppingBag, Box } from 'lucide-react';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ordersPerPage = 10;

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': window.location.origin  // Explicitly set Origin for CORS
          },
          credentials: 'include'  // Required for CORS with credentials
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        
        if (data.success) {
          // Map backend data to frontend format
          const mappedOrders = data.data.map(order => ({
            id: order.id,
            orderNumber: order.tracking_number || order.order_display,
            status: order.status === 'confirmed' ? 'processing' : order.status,
            placedDate: order.created_at,
            estimatedDelivery: order.estimated_delivery_date,
            deliveredDate: order.delivered_at,
            totalAmount: order.total,
            itemCount: order.item_count,
            product_count: order.product_count,
            first_product: order.first_product,
            items: order.items || [],
            paymentMethod: order.payment_method === 'mpesa' ? 'M-Pesa' : 
                          order.payment_method === 'card' ? 'Card' : 'Cash on Delivery',
            trackingNumber: order.tracking_number || order.order_display,
            canReview: order.status === 'delivered',
            canCancel: order.status === 'pending' || order.status === 'processing'
          }));
          
          setOrders(mappedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Payment', icon: Clock },
      paid: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Payment Confirmed', icon: CheckCircle },
      processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processing', icon: Package },
      shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Shipped', icon: Truck },
      in_transit: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Transit', icon: Truck },
      out_for_delivery: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Out for Delivery', icon: MapPin },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: XCircle },
      returned: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Returned', icon: RefreshCw }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
      inTransit: orders.filter(o => o.status === 'shipped' || o.status === 'in_transit' || o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.placedDate);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case '3months': return diffDays <= 90;
          case '6months': return diffDays <= 180;
          default: return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date_desc':
          return new Date(b.placedDate) - new Date(a.placedDate);
        case 'date_asc':
          return new Date(a.placedDate) - new Date(b.placedDate);
        case 'amount_desc':
          return b.totalAmount - a.totalAmount;
        case 'amount_asc':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredOrders = filterOrders();
  const stats = getOrderStats();

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleTrackOrder = (trackingNumber) => {
    window.open(`https://track.oshocks.co.ke/${trackingNumber}`, '_blank');
  };

  const handleReorder = (orderId) => {
    alert(`Items from order will be added to cart`);
  };

  const handleDownloadInvoice = (orderNumber) => {
    window.open(`/invoices/${orderNumber}.pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)'}}>
        <div className="text-center">
          {/* OS Logo */}
          <div className="w-20 h-20 rounded-xl flex items-end justify-start p-2 mb-6 mx-auto" 
               style={{
                 background: 'linear-gradient(135deg, rgb(255, 69, 0) 0%, rgb(255, 165, 0) 100%)', 
                 boxShadow: '0 10px 30px rgba(255, 69, 0, 0.4)',
                 animation: 'logo-pulse 2s ease-in-out infinite'
               }}>
            <span className="text-white text-4xl font-bold" style={{
              fontFamily: "'Lobster Two', cursive", 
              lineHeight: '1',
              transform: 'translateX(-5%) translateY(5%)',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
            }}>OS</span>
          </div>
          
          {/* Sequential Fill Spinner */}
          <div className="relative w-9 h-9 mx-auto mb-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-1 h-3 bg-transparent border border-white/85 rounded-sm overflow-hidden"
                   style={{
                     top: '50%', 
                     left: '50%',
                     transformOrigin: 'center bottom',
                     marginTop: '-12px', 
                     marginLeft: '-2.5px',
                     transform: `rotate(${i * 30}deg) translateY(-12px)`
                   }}>
                <div className="absolute bottom-0 left-0 right-0 w-full bg-white rounded-sm" 
                     style={{
                       height: '0%',
                       animation: `blade-fill 0.6s linear infinite`,
                       animationDelay: `${i * 0.05}s`
                     }}>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-white text-2xl mb-2" style={{
            fontFamily: "'Pacifico', cursive",
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>Loading Oshocks</p>
          
          <p className="text-white/95 text-base" style={{
            fontFamily: "'Lobster Two', cursive",
            textShadow: '1px 1px 4px rgba(0, 0, 0, 0.15)'
          }}>Fetching your orders...</p>
          
          {/* Progress Bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full mt-5 mx-auto overflow-hidden relative">
            <div className="h-full rounded-full" style={{
              background: 'linear-gradient(90deg, #ffffff 0%, #ffe4b5 50%, #ffffff 100%)',
              animation: 'progress 2s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}></div>
          </div>
        </div>
        
        <style>{`
          @keyframes logo-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 10px 30px rgba(255, 69, 0, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(255, 69, 0, 0.6); }
          }
          @keyframes blade-fill {
            0%, 100% { height: 0%; }
            8.33% { height: 100%; background: white; box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.2); }
            16.66% { height: 100%; background: rgba(255, 255, 255, 0.9); }
            25% { height: 0%; background: rgba(255, 255, 255, 0.7); }
          }
          @keyframes progress {
            0% { width: 0%; transform: translateX(0); }
            50% { width: 100%; transform: translateX(0); }
            100% { width: 100%; transform: translateX(100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track, manage and review your orders</p>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Processing</p>
                <p className="text-2xl font-bold text-purple-900">{stats.pending}</p>
              </div>
              <Package className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Transit</p>
                <p className="text-2xl font-bold text-blue-900">{stats.inTransit}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Highest Amount</option>
                  <option value="amount_asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Orders List */}
        {currentOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Box className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : "You haven't placed any orders yet"}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.trackingNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(order.placedDate)}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {order.paymentMethod}
                          </span>
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4 overflow-x-auto">
                      {/* Show first product image */}
                      {order.first_product?.image ? (
                        <div className="flex-shrink-0 relative">
                          <img
                            src={order.first_product.image}
                            alt={order.first_product.name}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                          {/* Show +X counter if more products */}
                          {(order.product_count > 1 || order.itemCount > 1) && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                              +{order.product_count > 1 ? order.product_count - 1 : order.itemCount - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <Box className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Show additional item thumbnails (max 3 more) */}
                      {order.items.slice(1, 4).map((item, idx) => (
                        item.image && (
                          <div key={idx} className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.product_name || item.name}
                              className="w-16 h-16 object-cover rounded border border-gray-200 opacity-75"
                            />
                          </div>
                        )
                      ))}
                    </div>

                    {/* Delivery Info */}
                    {order.status !== 'cancelled' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        {order.status === 'delivered' ? (
                          <p className="text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 inline text-green-600 mr-2" />
                            Delivered on {formatDate(order.deliveredDate)}
                          </p>
                        ) : order.estimatedDelivery ? (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <Clock className="w-4 h-4 inline text-blue-600 mr-2" />
                              <span className="font-medium">Estimated delivery:</span> {formatDate(order.estimatedDelivery)}
                            </p>
                            <p className="text-xs text-gray-500 ml-6">
                              Your order is being prepared and will be shipped soon
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700">
                            <Clock className="w-4 h-4 inline text-yellow-600 mr-2" />
                            Delivery date will be updated once order is processed
                          </p>
                        )}
                        
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                            <Truck className="w-4 h-4 inline mr-2" />
                            <span className="font-medium">Tracking Number:</span> <span className="font-mono font-semibold">{order.trackingNumber}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {order.status === 'cancelled' && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800">
                          <XCircle className="w-4 h-4 inline mr-2" />
                          Cancelled on {formatDate(order.cancelledDate)}
                        </p>
                        {order.refundStatus === 'completed' && (
                          <p className="text-sm text-red-700 mt-1">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            Refund processed
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>

                      {order.trackingNumber && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleTrackOrder(order.trackingNumber)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-lg hover:from-orange-600 hover:to-orange-500 font-medium transition-all shadow-md"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Track Package
                      </button>
                      )}

                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleReorder(order.id)}
                          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Buy Again
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadInvoice(order.orderNumber)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </button>

                      {order.canReview && (
                        <button
                          onClick={() => window.location.href = `/orders/${order.id}/review`}
                          className="flex items-center px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-green-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Results Info */}
        {filteredOrders.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal 
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      </div>
    </div>
  );
};

export default OrdersPage;