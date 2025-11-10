import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, ChevronDown, ChevronUp, Download, 
  Eye, MessageCircle, RotateCcw, Star, MapPin, Clock, Check,
  Truck, XCircle, AlertCircle, RefreshCw, Calendar, DollarSign,
  ShoppingBag, Phone, Mail, Copy, CheckCircle, X
} from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        // Mock data for development
        setOrders(generateMockOrders());
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders(generateMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        id: 'ORD-2025-001234',
        orderNumber: 'ORD-2025-001234',
        date: '2025-10-05',
        status: 'delivered',
        total: 45800,
        paymentMethod: 'M-Pesa',
        paymentStatus: 'paid',
        items: [
          {
            id: 1,
            name: 'Mountain Bike Pro X1',
            image: '/api/placeholder/80/80',
            quantity: 1,
            price: 42000,
            sku: 'MTB-001'
          },
          {
            id: 2,
            name: 'Bike Helmet - Safety Plus',
            image: '/api/placeholder/80/80',
            quantity: 1,
            price: 3800,
            sku: 'HLM-045'
          }
        ],
        shipping: {
          address: 'Waiyaki Way, Mara Building, 3rd Floor, Westlands, Nairobi',
          method: 'Standard Delivery',
          cost: 500,
          trackingNumber: 'TRK-KE-2025-5678'
        },
        timeline: [
          { status: 'placed', date: '2025-10-05 14:30', completed: true },
          { status: 'confirmed', date: '2025-10-05 15:00', completed: true },
          { status: 'processing', date: '2025-10-06 09:00', completed: true },
          { status: 'shipped', date: '2025-10-06 16:00', completed: true },
          { status: 'delivered', date: '2025-10-08 11:30', completed: true }
        ],
        canReview: true,
        canReturn: true
      },
      {
        id: 'ORD-2025-001233',
        orderNumber: 'ORD-2025-001233',
        date: '2025-10-03',
        status: 'shipped',
        total: 15600,
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        items: [
          {
            id: 3,
            name: 'Cycling Gloves Premium',
            image: '/api/placeholder/80/80',
            quantity: 2,
            price: 2800,
            sku: 'GLV-023'
          },
          {
            id: 4,
            name: 'Water Bottle Holder',
            image: '/api/placeholder/80/80',
            quantity: 3,
            price: 3000,
            sku: 'ACC-089'
          }
        ],
        shipping: {
          address: 'Moi Avenue, Pioneer House, Mombasa',
          method: 'Express Delivery',
          cost: 1000,
          trackingNumber: 'TRK-KE-2025-5679'
        },
        timeline: [
          { status: 'placed', date: '2025-10-03 10:15', completed: true },
          { status: 'confirmed', date: '2025-10-03 11:00', completed: true },
          { status: 'processing', date: '2025-10-04 08:30', completed: true },
          { status: 'shipped', date: '2025-10-07 14:20', completed: true },
          { status: 'delivered', date: null, completed: false }
        ],
        canReview: false,
        canReturn: false
      },
      {
        id: 'ORD-2025-001232',
        orderNumber: 'ORD-2025-001232',
        date: '2025-09-28',
        status: 'cancelled',
        total: 28500,
        paymentMethod: 'M-Pesa',
        paymentStatus: 'refunded',
        items: [
          {
            id: 5,
            name: 'Road Bike Elite 2000',
            image: '/api/placeholder/80/80',
            quantity: 1,
            price: 28000,
            sku: 'RDB-012'
          }
        ],
        shipping: {
          address: 'Kenyatta Avenue, ACK Garden House, Nakuru',
          method: 'Standard Delivery',
          cost: 500,
          trackingNumber: null
        },
        timeline: [
          { status: 'placed', date: '2025-09-28 16:45', completed: true },
          { status: 'cancelled', date: '2025-09-29 09:00', completed: true }
        ],
        cancellationReason: 'Customer requested cancellation',
        canReview: false,
        canReturn: false
      }
    ];
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case '7days': return diffDays <= 7;
          case '30days': return diffDays <= 30;
          case '90days': return diffDays <= 90;
          case '6months': return diffDays <= 180;
          default: return true;
        }
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      processing: { 
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: RefreshCw,
        label: 'Processing'
      },
      shipped: { 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Truck,
        label: 'Shipped'
      },
      delivered: { 
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: Check,
        label: 'Delivered'
      },
      cancelled: { 
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      refunded: { 
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: RotateCcw,
        label: 'Refunded'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleReorder = async (order) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Add all items from this order to your cart?')) {
      try {
        const response = await fetch('/api/cart/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ orderId: order.id })
        });

        if (response.ok) {
          alert('Items added to cart successfully!');
        }
      } catch (err) {
        console.error('Error reordering:', err);
      }
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        a.click();
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  const handleTrackOrder = (trackingNumber) => {
    window.open(`/track/${trackingNumber}`, '_blank');
  };

  const handleCopyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const openReviewModal = (product, order) => {
    setReviewProduct({ ...product, orderId: order.id });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: reviewProduct.id,
          orderId: reviewProduct.orderId,
          rating,
          review: reviewText
        })
      });

      if (response.ok) {
        alert('Review submitted successfully!');
        setShowReviewModal(false);
        setRating(0);
        setReviewText('');
        setReviewProduct(null);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        </div>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="6months">Last 6 Months</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(orders.reduce((sum, o) => sum + o.total, 0))}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>

      {/* Orders List */}
      {currentOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You haven\'t placed any orders yet'}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                          <button
                            onClick={() => handleCopyOrderId(order.orderNumber)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy order ID"
                          >
                            {copiedOrderId === order.orderNumber ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">Placed on {formatDate(order.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3 mb-4">
                    {order.items.slice(0, isExpanded ? order.items.length : 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        {order.canReview && order.status === 'delivered' && (
                          <button
                            onClick={() => openReviewModal(item, order)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Star className="w-4 h-4" />
                            Review
                          </button>
                        )}
                      </div>
                    ))}
                    {order.items.length > 2 && !isExpanded && (
                      <button
                        onClick={() => setExpandedOrder(order.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + {order.items.length - 2} more items
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      {/* Shipping Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          Delivery Address
                        </h4>
                        <p className="text-gray-700 ml-7">{order.shipping.address}</p>
                        <p className="text-sm text-gray-600 ml-7 mt-1">
                          Method: {order.shipping.method} ({formatCurrency(order.shipping.cost)})
                        </p>
                        {order.shipping.trackingNumber && (
                          <button
                            onClick={() => handleTrackOrder(order.shipping.trackingNumber)}
                            className="ml-7 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Truck className="w-4 h-4" />
                            Track: {order.shipping.trackingNumber}
                          </button>
                        )}
                      </div>

                      {/* Order Timeline */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          Order Timeline
                        </h4>
                        <div className="ml-7 space-y-3">
                          {order.timeline.map((event, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`mt-1 w-3 h-3 rounded-full ${event.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <div className="flex-1">
                                <p className={`font-medium capitalize ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {event.status}
                                </p>
                                <p className="text-sm text-gray-600">{formatDateTime(event.date)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          Payment Details
                        </h4>
                        <div className="ml-7 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">
                              {formatCurrency(order.total - order.shipping.cost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-900">{formatCurrency(order.shipping.cost)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-gray-900">{formatCurrency(order.total)}</span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="text-gray-900">{order.paymentMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className={`font-medium capitalize ${
                              order.paymentStatus === 'paid' ? 'text-green-600' : 
                              order.paymentStatus === 'refunded' ? 'text-blue-600' : 
                              'text-yellow-600'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      {order.cancellationReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-900 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Cancellation Reason
                          </h4>
                          <p className="text-red-700 text-sm">{order.cancellationReason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {isExpanded ? 'Show Less' : 'View Details'}
                    </button>

                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>

                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Buy Again
                      </button>
                    )}

                    {order.shipping.trackingNumber && ['shipped', 'processing'].includes(order.status) && (
                      <button
                        onClick={() => handleTrackOrder(order.shipping.trackingNumber)}
                        className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Truck className="w-4 h-4" />
                        Track Order
                      </button>
                    )}

                    <button
                      className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Support
                    </button>

                    {order.canReturn && order.status === 'delivered' && (
                      <button
                        className="flex items-center gap-1 px-4 py-2 text-sm border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Return Items
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
        <div className="mt-8 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
                  <p className="text-gray-700">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Date</h3>
                  <p className="text-gray-700">{formatDate(selectedOrder.date)}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Total</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setRating(0);
                    setReviewText('');
                    setReviewProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={reviewProduct.image}
                  alt={reviewProduct.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{reviewProduct.name}</h3>
                  <p className="text-sm text-gray-600">SKU: {reviewProduct.sku}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="4"
                  placeholder="Share your experience with this product..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitReview}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setRating(0);
                    setReviewText('');
                    setReviewProduct(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State for No Orders Ever */}
      {orders.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
            <p className="text-gray-600 mb-8">
              Start your cycling journey today! Browse our extensive collection of bikes, accessories, and gear.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Browse Bikes
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                View Accessories
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-600 rounded-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Need Help with Your Order?</h3>
            <p className="text-gray-700 text-sm mb-4">
              Our customer support team is here to help you with any questions about your orders, returns, or deliveries.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Phone className="w-4 h-4" />
                Call Us: 0712 345 678
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                Email Support
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
          <Download className="w-6 h-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Download All Invoices</h4>
          <p className="text-sm text-gray-600">Export all your order invoices as PDF</p>
        </button>
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
          <Calendar className="w-6 h-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Order History Report</h4>
          <p className="text-sm text-gray-600">Generate a detailed spending report</p>
        </button>
        <button className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left">
          <Star className="w-6 h-6 text-blue-600 mb-2" />
          <h4 className="font-semibold text-gray-900 mb-1">Pending Reviews</h4>
          <p className="text-sm text-gray-600">
            {orders.filter(o => o.canReview).length} products waiting for review
          </p>
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;