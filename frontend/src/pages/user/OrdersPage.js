import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Search, Filter, Download, Eye, RefreshCw, XCircle, AlertCircle, ChevronDown, Calendar, CreditCard, ShoppingBag, Box } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      // Simulate API call - Replace with: const response = await fetch('/api/user/orders');
      setTimeout(() => {
        setOrders([
          {
            id: 1,
            orderNumber: 'ORD-2024-10-1234',
            status: 'in_transit',
            placedDate: '2024-10-10T10:30:00',
            estimatedDelivery: '2024-10-16T18:00:00',
            totalAmount: 45800,
            itemCount: 3,
            items: [
              { name: 'Mountain Bike - Trek Marlin 7', image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=200', quantity: 1 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: 'OSH2024101234KE'
          },
          {
            id: 2,
            orderNumber: 'ORD-2024-09-0987',
            status: 'delivered',
            placedDate: '2024-09-25T14:20:00',
            estimatedDelivery: '2024-09-30T18:00:00',
            deliveredDate: '2024-09-29T16:45:00',
            totalAmount: 12500,
            itemCount: 2,
            items: [
              { name: 'Bike Helmet - Bell Z20 MIPS', image: 'https://images.unsplash.com/photo-1557536713-89f8f6b47e2e?w=200', quantity: 1 },
              { name: 'Cycling Gloves', image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=200', quantity: 1 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: 'OSH2024090987KE',
            canReview: true
          },
          {
            id: 3,
            orderNumber: 'ORD-2024-09-0756',
            status: 'processing',
            placedDate: '2024-10-13T09:15:00',
            estimatedDelivery: '2024-10-18T18:00:00',
            totalAmount: 8900,
            itemCount: 1,
            items: [
              { name: 'Bike Lock - Kryptonite U-Lock', image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=200', quantity: 1 }
            ],
            paymentMethod: 'Card',
            trackingNumber: null,
            canCancel: true
          },
          {
            id: 4,
            orderNumber: 'ORD-2024-08-0543',
            status: 'delivered',
            placedDate: '2024-08-15T11:30:00',
            estimatedDelivery: '2024-08-20T18:00:00',
            deliveredDate: '2024-08-19T15:20:00',
            totalAmount: 32000,
            itemCount: 4,
            items: [
              { name: 'Road Bike - Specialized Allez', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200', quantity: 1 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: 'OSH2024080543KE',
            canReview: false
          },
          {
            id: 5,
            orderNumber: 'ORD-2024-08-0321',
            status: 'cancelled',
            placedDate: '2024-08-10T13:45:00',
            estimatedDelivery: null,
            totalAmount: 5600,
            itemCount: 2,
            items: [
              { name: 'Water Bottle Cage', image: 'https://images.unsplash.com/photo-1523475496153-3d6cc0f0bf19?w=200', quantity: 2 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: null,
            cancelledDate: '2024-08-10T14:00:00',
            refundStatus: 'completed'
          },
          {
            id: 6,
            orderNumber: 'ORD-2024-07-0198',
            status: 'delivered',
            placedDate: '2024-07-20T10:00:00',
            estimatedDelivery: '2024-07-25T18:00:00',
            deliveredDate: '2024-07-24T14:30:00',
            totalAmount: 18700,
            itemCount: 3,
            items: [
              { name: 'Bike Pump - Floor Pump Pro', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=200', quantity: 1 }
            ],
            paymentMethod: 'Card',
            trackingNumber: 'OSH2024070198KE',
            canReview: false
          },
          {
            id: 7,
            orderNumber: 'ORD-2024-10-1567',
            status: 'out_for_delivery',
            placedDate: '2024-10-12T08:20:00',
            estimatedDelivery: '2024-10-14T18:00:00',
            totalAmount: 6800,
            itemCount: 1,
            items: [
              { name: 'Bike Lights Set - Front & Rear', image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=200', quantity: 1 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: 'OSH2024101567KE'
          },
          {
            id: 8,
            orderNumber: 'ORD-2024-09-0432',
            status: 'shipped',
            placedDate: '2024-10-11T15:30:00',
            estimatedDelivery: '2024-10-15T18:00:00',
            totalAmount: 15200,
            itemCount: 2,
            items: [
              { name: 'Cycling Jersey - Team Edition', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=200', quantity: 2 }
            ],
            paymentMethod: 'M-Pesa',
            trackingNumber: 'OSH2024090432KE'
          }
        ]);
        setLoading(false);
      }, 800);
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

  const handleViewOrder = (orderId) => {
    window.location.href = `/orders/${orderId}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
        </div>
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
                            Order #{order.orderNumber}
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
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                        </div>
                      ))}
                      {order.itemCount > order.items.length && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            +{order.itemCount - order.items.length}
                          </span>
                        </div>
                      )}
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
                          <p className="text-sm text-gray-700">
                            <Clock className="w-4 h-4 inline text-blue-600 mr-2" />
                            Estimated delivery: {formatDate(order.estimatedDelivery)}
                          </p>
                        ) : null}
                        
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-1">
                            <Truck className="w-4 h-4 inline mr-2" />
                            Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span>
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
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>

                      {order.trackingNumber && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleTrackOrder(order.trackingNumber)}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
      </div>
    </div>
  );
};

export default OrdersPage;