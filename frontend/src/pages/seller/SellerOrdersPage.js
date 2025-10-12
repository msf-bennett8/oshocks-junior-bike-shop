import { useState, useEffect } from 'react';
import {
  Search, Filter, Download, RefreshCw, ChevronDown, ChevronUp,
  Package, Truck, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, Edit, Printer, Mail, Phone, MapPin, Calendar,
  DollarSign, CreditCard, Smartphone, User, MoreVertical,
  ArrowUpDown, FileText, MessageSquare, Box, ShoppingBag
} from 'lucide-react';

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Mock orders data
  const mockOrders = [
    {
      id: 'ORD-2025-001',
      orderNumber: '#001',
      customer: {
        name: 'John Kamau',
        email: 'john.kamau@email.com',
        phone: '+254 712 345 678',
        address: '123 Kenyatta Avenue, Nairobi'
      },
      items: [
        { id: 1, name: 'Mountain King Pro 29"', quantity: 1, price: 125000, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100' },
        { id: 2, name: 'Bike Helmet - Safety Pro', quantity: 1, price: 4500, image: 'https://images.unsplash.com/photo-1557687790-adf1e62c2f8c?w=100' }
      ],
      subtotal: 129500,
      shipping: 1500,
      tax: 0,
      total: 131000,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'paid',
      date: '2025-01-10T10:30:00',
      shippingMethod: 'Standard Delivery',
      trackingNumber: 'TRK-12345-KE',
      notes: 'Please deliver before 5 PM'
    },
    {
      id: 'ORD-2025-002',
      orderNumber: '#002',
      customer: {
        name: 'Mary Wanjiru',
        email: 'mary.w@email.com',
        phone: '+254 722 456 789',
        address: '456 Moi Avenue, Mombasa'
      },
      items: [
        { id: 3, name: 'City Cruiser Elite', quantity: 1, price: 45000, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100' }
      ],
      subtotal: 45000,
      shipping: 2000,
      tax: 0,
      total: 47000,
      status: 'processing',
      paymentMethod: 'Card',
      paymentStatus: 'paid',
      date: '2025-01-10T14:20:00',
      shippingMethod: 'Express Delivery',
      trackingNumber: null,
      notes: null
    },
    {
      id: 'ORD-2025-003',
      orderNumber: '#003',
      customer: {
        name: 'Peter Omondi',
        email: 'peter.o@email.com',
        phone: '+254 733 567 890',
        address: '789 Uhuru Highway, Kisumu'
      },
      items: [
        { id: 4, name: 'Road Racer X1', quantity: 1, price: 185000, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100' },
        { id: 5, name: 'Cycling Jersey Pro', quantity: 2, price: 3500, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100' }
      ],
      subtotal: 192000,
      shipping: 2500,
      tax: 0,
      total: 194500,
      status: 'shipped',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'paid',
      date: '2025-01-09T09:15:00',
      shippingMethod: 'Express Delivery',
      trackingNumber: 'TRK-67890-KE',
      notes: null
    },
    {
      id: 'ORD-2025-004',
      orderNumber: '#004',
      customer: {
        name: 'Grace Akinyi',
        email: 'grace.a@email.com',
        phone: '+254 744 678 901',
        address: '321 Jogoo Road, Nairobi'
      },
      items: [
        { id: 6, name: 'Electric Commuter Pro', quantity: 1, price: 295000, image: 'https://images.unsplash.com/photo-1591993715414-b2f1e8ff4fc6?w=100' }
      ],
      subtotal: 295000,
      shipping: 0,
      tax: 0,
      total: 295000,
      status: 'completed',
      paymentMethod: 'Card',
      paymentStatus: 'paid',
      date: '2025-01-09T16:45:00',
      shippingMethod: 'Store Pickup',
      trackingNumber: null,
      notes: 'Customer will pick up at store'
    },
    {
      id: 'ORD-2025-005',
      orderNumber: '#005',
      customer: {
        name: 'David Kipchoge',
        email: 'david.k@email.com',
        phone: '+254 755 789 012',
        address: '654 Ngong Road, Nairobi'
      },
      items: [
        { id: 7, name: 'Kids BMX Champion', quantity: 2, price: 28000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' }
      ],
      subtotal: 56000,
      shipping: 1000,
      tax: 0,
      total: 57000,
      status: 'pending',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'pending',
      date: '2025-01-08T11:30:00',
      shippingMethod: 'Standard Delivery',
      trackingNumber: null,
      notes: null
    },
    {
      id: 'ORD-2025-006',
      orderNumber: '#006',
      customer: {
        name: 'Sarah Muthoni',
        email: 'sarah.m@email.com',
        phone: '+254 766 890 123',
        address: '987 Waiyaki Way, Nairobi'
      },
      items: [
        { id: 8, name: 'Hybrid Pathfinder', quantity: 1, price: 95000, image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=100' },
        { id: 9, name: 'Water Bottle Holder', quantity: 2, price: 800, image: 'https://images.unsplash.com/photo-1523362628745-0c100150b5d8?w=100' }
      ],
      subtotal: 96600,
      shipping: 1500,
      tax: 0,
      total: 98100,
      status: 'cancelled',
      paymentMethod: 'Card',
      paymentStatus: 'refunded',
      date: '2025-01-08T08:20:00',
      shippingMethod: 'Standard Delivery',
      trackingNumber: null,
      notes: 'Customer requested cancellation'
    },
    {
      id: 'ORD-2025-007',
      orderNumber: '#007',
      customer: {
        name: 'James Otieno',
        email: 'james.o@email.com',
        phone: '+254 777 901 234',
        address: '147 Thika Road, Ruiru'
      },
      items: [
        { id: 10, name: 'Fat Tire Explorer', quantity: 1, price: 155000, image: 'https://images.unsplash.com/photo-1475666675596-cca2035b3d79?w=100' }
      ],
      subtotal: 155000,
      shipping: 2000,
      tax: 0,
      total: 157000,
      status: 'processing',
      paymentMethod: 'M-Pesa',
      paymentStatus: 'paid',
      date: '2025-01-07T13:10:00',
      shippingMethod: 'Express Delivery',
      trackingNumber: null,
      notes: null
    },
    {
      id: 'ORD-2025-008',
      orderNumber: '#008',
      customer: {
        name: 'Lucy Nyambura',
        email: 'lucy.n@email.com',
        phone: '+254 788 012 345',
        address: '258 Limuru Road, Kikuyu'
      },
      items: [
        { id: 11, name: 'Folding Compact 20"', quantity: 1, price: 65000, image: 'https://images.unsplash.com/photo-1511994714008-b6fa96f075e7?w=100' }
      ],
      subtotal: 65000,
      shipping: 1500,
      tax: 0,
      total: 66500,
      status: 'shipped',
      paymentMethod: 'Card',
      paymentStatus: 'paid',
      date: '2025-01-07T10:00:00',
      shippingMethod: 'Standard Delivery',
      trackingNumber: 'TRK-11223-KE',
      notes: null
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
    { value: 'processing', label: 'Processing', count: 0 },
    { value: 'shipped', label: 'Shipped', count: 0 },
    { value: 'completed', label: 'Completed', count: 0 },
    { value: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchQuery, statusFilter, paymentFilter, dateFilter, sortBy, orders]);

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod.toLowerCase() === paymentFilter.toLowerCase());
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case 'today': return diffDays <= 1;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      });
    }

    switch(sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'highest':
        filtered.sort((a, b) => b.total - a.total);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.total - b.total);
        break;
      default:
        break;
    }

    setFilteredOrders(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800', 
        icon: Clock,
        border: 'border-gray-300'
      },
      processing: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: Package,
        border: 'border-blue-300'
      },
      shipped: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800', 
        icon: Truck,
        border: 'border-purple-300'
      },
      completed: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: CheckCircle,
        border: 'border-green-300'
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XCircle,
        border: 'border-red-300'
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleBulkSelect = (orderId) => {
    setBulkSelection(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (bulkSelection.length === filteredOrders.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(filteredOrders.map(o => o.id));
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
                <ShoppingBag className="w-8 h-8 text-orange-600" />
                Orders Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and track all your orders</p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={() => setLoading(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {statusOptions.map(status => {
            const count = status.value === 'all' 
              ? orders.length 
              : orders.filter(o => o.status === status.value).length;
            const config = getStatusConfig(status.value);
            const Icon = config.icon || Package;

            return (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`p-4 rounded-lg border-2 transition ${
                  statusFilter === status.value
                    ? `${config.bg} ${config.border}`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${statusFilter === status.value ? config.text : 'text-gray-400'}`} />
                  <span className={`text-2xl font-bold ${statusFilter === status.value ? config.text : 'text-gray-900'}`}>
                    {count}
                  </span>
                </div>
                <p className={`text-sm font-medium ${statusFilter === status.value ? config.text : 'text-gray-600'}`}>
                  {status.label}
                </p>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="m-pesa">M-Pesa</option>
              <option value="card">Card</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value</option>
              <option value="lowest">Lowest Value</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Bulk Actions */}
          {bulkSelection.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-orange-900">
                {bulkSelection.length} order(s) selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-white border border-orange-300 text-orange-700 rounded hover:bg-orange-50 text-sm font-medium">
                  Mark as Processing
                </button>
                <button className="px-3 py-1 bg-white border border-orange-300 text-orange-700 rounded hover:bg-orange-50 text-sm font-medium">
                  Export Selected
                </button>
                <button
                  onClick={() => setBulkSelection([])}
                  className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={bulkSelection.length === filteredOrders.length && filteredOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Items</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={bulkSelection.includes(order.id)}
                          onChange={() => handleBulkSelect(order.id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900">{order.id}</div>
                        <div className="text-xs text-gray-500">{order.orderNumber}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{order.customer.name}</div>
                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg border-2 border-white object-cover"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-10 h-10 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-gray-500">
                          {order.paymentStatus === 'paid' ? (
                            <span className="text-green-600">● Paid</span>
                          ) : order.paymentStatus === 'pending' ? (
                            <span className="text-yellow-600">● Pending</span>
                          ) : (
                            <span className="text-red-600">● Refunded</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {order.paymentMethod === 'M-Pesa' ? (
                            <Smartphone className="w-4 h-4 text-green-600" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm text-gray-700">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700">{formatDate(order.date)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                              <button
                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Package className="w-4 h-4" />
                                Mark as Processing
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Truck className="w-4 h-4" />
                                Mark as Shipped
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Completed
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel Order
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === idx + 1
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Status & Actions */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = getStatusConfig(selectedOrder.status);
                    const StatusIcon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                        <StatusIcon className="w-5 h-5" />
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    );
                  })()}
                  <span className="text-sm text-gray-600">
                    {formatDate(selectedOrder.date)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                    <Printer className="w-4 h-4" />
                    Print Invoice
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Mail className="w-4 h-4" />
                    Email Customer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Address</p>
                        <p className="font-medium text-gray-900">{selectedOrder.customer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-600" />
                      Shipping Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Shipping Method</p>
                        <p className="font-medium text-gray-900">{selectedOrder.shippingMethod}</p>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Tracking Number</p>
                          <p className="font-medium text-orange-600">{selectedOrder.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-orange-600" />
                      Payment Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {selectedOrder.paymentMethod === 'M-Pesa' ? (
                            <Smartphone className="w-4 h-4 text-green-600" />
                          ) : (
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          )}
                          {selectedOrder.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Status</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Box className="w-5 h-5 text-orange-600" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span>{selectedOrder.shipping > 0 ? formatCurrency(selectedOrder.shipping) : 'Free'}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                    Order Notes
                  </h3>
                  <p className="text-gray-700">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'processing');
                    setShowOrderModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Package className="w-5 h-5" />
                  Mark as Processing
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'shipped');
                    setShowOrderModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Truck className="w-5 h-5" />
                  Mark as Shipped
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'completed');
                    setShowOrderModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrdersPage;
