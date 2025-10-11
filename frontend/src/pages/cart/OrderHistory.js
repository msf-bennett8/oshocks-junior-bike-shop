import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Download, RefreshCw, Eye, MessageCircle, Star } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD-2024-001',
        date: '2024-10-05',
        status: 'delivered',
        total: 45000,
        items: [
          { id: 1, name: 'Mountain Bike Pro X1', quantity: 1, price: 42000, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100' },
          { id: 2, name: 'Bike Helmet Safety Plus', quantity: 1, price: 3000, image: 'https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=100' }
        ],
        shippingAddress: 'Westlands, Nairobi',
        paymentMethod: 'M-Pesa',
        trackingNumber: 'TRK-KE-2024-001',
        estimatedDelivery: '2024-10-10'
      },
      {
        id: 'ORD-2024-002',
        date: '2024-10-08',
        status: 'shipped',
        total: 8500,
        items: [
          { id: 3, name: 'Professional Bike Lock', quantity: 1, price: 4500, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
          { id: 4, name: 'LED Front Light', quantity: 2, price: 2000, image: 'https://images.unsplash.com/photo-1571756165700-984d33199b85?w=100' }
        ],
        shippingAddress: 'Karen, Nairobi',
        paymentMethod: 'Card',
        trackingNumber: 'TRK-KE-2024-002',
        estimatedDelivery: '2024-10-12'
      },
      {
        id: 'ORD-2024-003',
        date: '2024-10-09',
        status: 'processing',
        total: 125000,
        items: [
          { id: 5, name: 'Electric Bike E-Speed 3000', quantity: 1, price: 125000, image: 'https://images.unsplash.com/photo-1591971833386-7c0f7ead315e?w=100' }
        ],
        shippingAddress: 'Kilimani, Nairobi',
        paymentMethod: 'M-Pesa',
        trackingNumber: null,
        estimatedDelivery: '2024-10-15'
      },
      {
        id: 'ORD-2024-004',
        date: '2024-09-20',
        status: 'cancelled',
        total: 15000,
        items: [
          { id: 6, name: 'Cycling Jersey Pro', quantity: 2, price: 7500, image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=100' }
        ],
        shippingAddress: 'Parklands, Nairobi',
        paymentMethod: 'Card',
        trackingNumber: null,
        estimatedDelivery: null
      },
      {
        id: 'ORD-2024-005',
        date: '2024-08-15',
        status: 'delivered',
        total: 22000,
        items: [
          { id: 7, name: 'Bike Repair Tool Kit', quantity: 1, price: 12000, image: 'https://images.unsplash.com/photo-1590946113149-49e80e6fbf6d?w=100' },
          { id: 8, name: 'Water Bottle Holder', quantity: 2, price: 5000, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100' }
        ],
        shippingAddress: 'Lavington, Nairobi',
        paymentMethod: 'M-Pesa',
        trackingNumber: 'TRK-KE-2024-005',
        estimatedDelivery: '2024-08-20'
      }
    ];

    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        const orderDate = new Date(order.date);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === '30days') return diffDays <= 30;
        if (dateFilter === '90days') return diffDays <= 90;
        if (dateFilter === '6months') return diffDays <= 180;
        if (dateFilter === 'year') return diffDays <= 365;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'highest') return b.total - a.total;
      if (sortBy === 'lowest') return a.total - b.total;
      return 0;
    });

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, dateFilter, sortBy, orders]);

  const getStatusConfig = (status) => {
    const configs = {
      processing: { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Processing' },
      shipped: { icon: Truck, color: 'text-purple-600 bg-purple-50', label: 'Shipped' },
      delivered: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Delivered' },
      cancelled: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelled' }
    };
    return configs[status] || configs.processing;
  };

  const formatPrice = (price) => {
    return `KSh ${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReorder = (orderId) => {
    alert(`Reordering items from ${orderId}. This will add items to your cart.`);
    // Implement reorder logic
  };

  const handleTrackOrder = (trackingNumber) => {
    alert(`Tracking order: ${trackingNumber}`);
    // Implement tracking logic
  };

  const handleDownloadInvoice = (orderId) => {
    alert(`Downloading invoice for ${orderId}`);
    // Implement invoice download
  };

  const handleContactSupport = (orderId) => {
    alert(`Opening support chat for ${orderId}`);
    // Implement support contact
  };

  const handleReview = (orderId) => {
    alert(`Opening review form for ${orderId}`);
    // Implement review functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-green-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
          <p className="text-gray-600">View and manage all your orders from Oshocks Junior Bike Shop</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-green-600 hover:text-green-700 flex items-center"
            >
              <Filter className="w-4 h-4 mr-1" />
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Ordered: {formatDate(order.date)}</span>
                          <span>•</span>
                          <span>Total: {formatPrice(order.total)}</span>
                          <span>•</span>
                          <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="text-gray-600 hover:text-gray-900 transition"
                      >
                        {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t">
                      {/* Items List */}
                      <div className="mt-6 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.name}</h5>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Shipping Address</h5>
                          <p className="text-gray-600">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-700 mb-2">Payment Method</h5>
                          <p className="text-gray-600">{order.paymentMethod}</p>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Tracking Number</h5>
                            <p className="text-gray-600 font-mono text-sm">{order.trackingNumber}</p>
                          </div>
                        )}
                        {order.estimatedDelivery && (
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Estimated Delivery</h5>
                            <p className="text-gray-600">{formatDate(order.estimatedDelivery)}</p>
                          </div>
                        )}
                      </div>

                      {/* Order Total */}
                      <div className="flex justify-end mb-6">
                        <div className="w-full md:w-64">
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900">{formatPrice(order.total * 0.9)}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900">{formatPrice(order.total * 0.1)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-t font-semibold text-lg">
                            <span className="text-gray-900">Total</span>
                            <span className="text-gray-900">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="px-6 pb-6 flex flex-wrap gap-3">
                    {order.trackingNumber && order.status !== 'delivered' && (
                      <button
                        onClick={() => handleTrackOrder(order.trackingNumber)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Track Order
                      </button>
                    )}
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reorder
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleReview(order.id)}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write Review
                      </button>
                    )}
                    <button
                      onClick={() => handleContactSupport(order.id)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Support
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;