import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, MoreVertical, Eye, Edit2, Trash2, 
  Package, Truck, CheckCircle, XCircle, Clock, AlertCircle,
  Phone, Mail, MapPin, Calendar, DollarSign, CreditCard,
  ChevronDown, ChevronUp, User, ShoppingBag, FileText,
  Printer, Send, RefreshCw, ArrowUpDown, X, Check
} from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Mock orders data
  useEffect(() => {
    const mockOrders = [
      {
        id: 'ORD-10234',
        orderNumber: 10234,
        customer: {
          name: 'John Kamau',
          email: 'john.kamau@email.com',
          phone: '+254 712 345 678',
          address: 'Westlands, Nairobi'
        },
        items: [
          { id: 1, name: 'Mountain Bike Pro X5', quantity: 1, price: 35000, image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100' },
          { id: 2, name: 'Safety Helmet', quantity: 1, price: 5000, image: 'https://images.unsplash.com/photo-1562955779-e6be6c4a7c4e?w=100' },
          { id: 3, name: 'Bike Lock', quantity: 1, price: 5000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' }
        ],
        subtotal: 45000,
        shipping: 1000,
        tax: 0,
        discount: 0,
        total: 46000,
        status: 'completed',
        paymentMethod: 'M-Pesa',
        paymentStatus: 'paid',
        paymentDate: '2025-10-10 14:30',
        transactionId: 'MPESA-XYZ123',
        shippingMethod: 'Standard Delivery',
        trackingNumber: 'TRK-45678',
        createdAt: '2025-10-10 14:30',
        updatedAt: '2025-10-10 16:45',
        notes: 'Customer requested morning delivery',
        statusHistory: [
          { status: 'pending', date: '2025-10-10 14:30', note: 'Order placed' },
          { status: 'processing', date: '2025-10-10 14:45', note: 'Payment confirmed' },
          { status: 'shipped', date: '2025-10-10 15:30', note: 'Order shipped' },
          { status: 'completed', date: '2025-10-10 16:45', note: 'Order delivered' }
        ]
      },
      {
        id: 'ORD-10235',
        orderNumber: 10235,
        customer: {
          name: 'Sarah Wanjiku',
          email: 'sarah.w@email.com',
          phone: '+254 722 456 789',
          address: 'Karen, Nairobi'
        },
        items: [
          { id: 4, name: 'Road Racer Elite', quantity: 1, price: 125000, image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100' }
        ],
        subtotal: 125000,
        shipping: 2000,
        tax: 0,
        discount: 5000,
        total: 122000,
        status: 'processing',
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        paymentDate: '2025-10-10 13:15',
        transactionId: 'CARD-ABC789',
        shippingMethod: 'Express Delivery',
        trackingNumber: null,
        createdAt: '2025-10-10 13:15',
        updatedAt: '2025-10-10 13:20',
        notes: '',
        statusHistory: [
          { status: 'pending', date: '2025-10-10 13:15', note: 'Order placed' },
          { status: 'processing', date: '2025-10-10 13:20', note: 'Payment confirmed' }
        ]
      },
      {
        id: 'ORD-10236',
        orderNumber: 10236,
        customer: {
          name: 'David Ochieng',
          email: 'david.o@email.com',
          phone: '+254 733 567 890',
          address: 'Kilimani, Nairobi'
        },
        items: [
          { id: 5, name: 'LED Bike Light Set', quantity: 2, price: 1500, image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=100' },
          { id: 6, name: 'Water Bottle Holder', quantity: 3, price: 800, image: 'https://images.unsplash.com/photo-1575435123966-8811167ec52a?w=100' },
          { id: 7, name: 'Bike Pump', quantity: 1, price: 2500, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' }
        ],
        subtotal: 7900,
        shipping: 500,
        tax: 0,
        discount: 0,
        total: 8400,
        status: 'shipped',
        paymentMethod: 'M-Pesa',
        paymentStatus: 'paid',
        paymentDate: '2025-10-10 11:45',
        transactionId: 'MPESA-DEF456',
        shippingMethod: 'Standard Delivery',
        trackingNumber: 'TRK-45679',
        createdAt: '2025-10-10 11:45',
        updatedAt: '2025-10-10 12:30',
        notes: '',
        statusHistory: [
          { status: 'pending', date: '2025-10-10 11:45', note: 'Order placed' },
          { status: 'processing', date: '2025-10-10 11:50', note: 'Payment confirmed' },
          { status: 'shipped', date: '2025-10-10 12:30', note: 'Order shipped' }
        ]
      },
      {
        id: 'ORD-10237',
        orderNumber: 10237,
        customer: {
          name: 'Mary Akinyi',
          email: 'mary.a@email.com',
          phone: '+254 744 678 901',
          address: 'South C, Nairobi'
        },
        items: [
          { id: 8, name: 'Kids Explorer Bike', quantity: 2, price: 18000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
          { id: 9, name: 'Kids Helmet', quantity: 2, price: 3000, image: 'https://images.unsplash.com/photo-1562955779-e6be6c4a7c4e?w=100' }
        ],
        subtotal: 42000,
        shipping: 1000,
        tax: 0,
        discount: 2000,
        total: 41000,
        status: 'pending',
        paymentMethod: 'M-Pesa',
        paymentStatus: 'pending',
        paymentDate: null,
        transactionId: null,
        shippingMethod: 'Standard Delivery',
        trackingNumber: null,
        createdAt: '2025-10-10 10:20',
        updatedAt: '2025-10-10 10:20',
        notes: 'Waiting for payment confirmation',
        statusHistory: [
          { status: 'pending', date: '2025-10-10 10:20', note: 'Order placed' }
        ]
      },
      {
        id: 'ORD-10238',
        orderNumber: 10238,
        customer: {
          name: 'Peter Mwangi',
          email: 'peter.m@email.com',
          phone: '+254 755 789 012',
          address: 'Parklands, Nairobi'
        },
        items: [
          { id: 10, name: 'Bike Repair Kit', quantity: 1, price: 5000, image: 'https://images.unsplash.com/photo-1581256106164-7b1b3a5f97e8?w=100' }
        ],
        subtotal: 5000,
        shipping: 500,
        tax: 0,
        discount: 0,
        total: 5500,
        status: 'cancelled',
        paymentMethod: 'Card',
        paymentStatus: 'refunded',
        paymentDate: '2025-10-10 09:05',
        transactionId: 'CARD-GHI012',
        shippingMethod: 'Standard Delivery',
        trackingNumber: null,
        createdAt: '2025-10-10 09:05',
        updatedAt: '2025-10-10 09:30',
        notes: 'Customer requested cancellation',
        statusHistory: [
          { status: 'pending', date: '2025-10-10 09:05', note: 'Order placed' },
          { status: 'cancelled', date: '2025-10-10 09:30', note: 'Cancelled by customer' }
        ]
      },
      {
        id: 'ORD-10239',
        orderNumber: 10239,
        customer: {
          name: 'Grace Njeri',
          email: 'grace.n@email.com',
          phone: '+254 766 890 123',
          address: 'Upperhill, Nairobi'
        },
        items: [
          { id: 11, name: 'Mountain Bike Tires', quantity: 2, price: 4500, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100' },
          { id: 12, name: 'Bike Chain', quantity: 1, price: 2000, image: 'https://images.unsplash.com/photo-1581256106164-7b1b3a5f97e8?w=100' }
        ],
        subtotal: 11000,
        shipping: 500,
        tax: 0,
        discount: 0,
        total: 11500,
        status: 'processing',
        paymentMethod: 'M-Pesa',
        paymentStatus: 'paid',
        paymentDate: '2025-10-09 16:40',
        transactionId: 'MPESA-JKL345',
        shippingMethod: 'Standard Delivery',
        trackingNumber: null,
        createdAt: '2025-10-09 16:40',
        updatedAt: '2025-10-09 16:45',
        notes: '',
        statusHistory: [
          { status: 'pending', date: '2025-10-09 16:40', note: 'Order placed' },
          { status: 'processing', date: '2025-10-09 16:45', note: 'Payment confirmed' }
        ]
      },
      {
        id: 'ORD-10240',
        orderNumber: 10240,
        customer: {
          name: 'James Otieno',
          email: 'james.o@email.com',
          phone: '+254 777 901 234',
          address: 'Lavington, Nairobi'
        },
        items: [
          { id: 13, name: 'Cycling Jersey Pro', quantity: 2, price: 3500, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100' },
          { id: 14, name: 'Cycling Shorts', quantity: 2, price: 2500, image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100' }
        ],
        subtotal: 12000,
        shipping: 500,
        tax: 0,
        discount: 1000,
        total: 11500,
        status: 'shipped',
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        paymentDate: '2025-10-09 14:20',
        transactionId: 'CARD-MNO678',
        shippingMethod: 'Express Delivery',
        trackingNumber: 'TRK-45680',
        createdAt: '2025-10-09 14:20',
        updatedAt: '2025-10-09 15:10',
        notes: '',
        statusHistory: [
          { status: 'pending', date: '2025-10-09 14:20', note: 'Order placed' },
          { status: 'processing', date: '2025-10-09 14:25', note: 'Payment confirmed' },
          { status: 'shipped', date: '2025-10-09 15:10', note: 'Order shipped' }
        ]
      },
      {
        id: 'ORD-10241',
        orderNumber: 10241,
        customer: {
          name: 'Lucy Wambui',
          email: 'lucy.w@email.com',
          phone: '+254 788 012 345',
          address: 'Runda, Nairobi'
        },
        items: [
          { id: 15, name: 'Electric Bike City Cruiser', quantity: 1, price: 185000, image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100' }
        ],
        subtotal: 185000,
        shipping: 3000,
        tax: 0,
        discount: 10000,
        total: 178000,
        status: 'completed',
        paymentMethod: 'Card',
        paymentStatus: 'paid',
        paymentDate: '2025-10-08 11:30',
        transactionId: 'CARD-PQR901',
        shippingMethod: 'Premium Delivery',
        trackingNumber: 'TRK-45681',
        createdAt: '2025-10-08 11:30',
        updatedAt: '2025-10-09 10:15',
        notes: 'VIP customer',
        statusHistory: [
          { status: 'pending', date: '2025-10-08 11:30', note: 'Order placed' },
          { status: 'processing', date: '2025-10-08 11:35', note: 'Payment confirmed' },
          { status: 'shipped', date: '2025-10-08 14:00', note: 'Order shipped' },
          { status: 'completed', date: '2025-10-09 10:15', note: 'Order delivered' }
        ]
      }
    ];

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // Filter and search
  useEffect(() => {
    let result = [...orders];

    // Search
    if (searchTerm) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.paymentMethod === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        if (dateFilter === 'today') {
          return orderDate >= today;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return orderDate >= sevenDaysAgo;
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return orderDate >= thirtyDaysAgo;
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'date') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortField === 'total') {
        aValue = a.total;
        bValue = b.total;
      } else if (sortField === 'customer') {
        aValue = a.customer.name.toLowerCase();
        bValue = b.customer.name.toLowerCase();
      } else if (sortField === 'status') {
        aValue = a.status;
        bValue = b.status;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, sortField, sortDirection, orders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return `KES ${amount.toLocaleString()}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: AlertCircle,
      processing: Clock,
      shipped: Truck,
      completed: CheckCircle,
      cancelled: XCircle
    };
    return icons[status] || Clock;
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Toggle order selection
  const toggleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  // Select all orders
  const selectAllOrders = () => {
    if (selectedOrders.size === currentOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(order => order.id)));
    }
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        const newHistory = [...order.statusHistory, {
          status: newStatus,
          date: new Date().toISOString().replace('T', ' ').split('.')[0],
          note: `Status changed to ${newStatus}`
        }];
        return {
          ...order,
          status: newStatus,
          statusHistory: newHistory,
          updatedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    showNotification(`Order ${orderId} status updated to ${newStatus}`);
  };

  // Delete order
  const deleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(order => order.id !== orderId));
      showNotification('Order deleted successfully');
    }
  };

  // Bulk delete
  const bulkDelete = () => {
    if (selectedOrders.size === 0) return;
    
    if (window.confirm(`Delete ${selectedOrders.size} selected orders?`)) {
      setOrders(orders.filter(order => !selectedOrders.has(order.id)));
      setSelectedOrders(new Set());
      showNotification(`${selectedOrders.size} orders deleted`);
    }
  };

  // Export orders
  const exportOrders = () => {
    const dataStr = JSON.stringify(filteredOrders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Orders exported successfully');
  };

  // Toggle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Manage and track all customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
          <p className="text-xs text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{orderStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-400">
          <p className="text-xs text-gray-600 mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{orderStats.processing}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-400">
          <p className="text-xs text-gray-600 mb-1">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{orderStats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-400">
          <p className="text-xs text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-400">
          <p className="text-xs text-gray-600 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-400 col-span-2">
          <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-indigo-600">{formatCurrency(orderStats.totalRevenue)}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payment</option>
              <option value="M-Pesa">M-Pesa</option>
              <option value="Card">Card</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <button
              onClick={exportOrders}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedOrders.size} order(s) selected
            </span>
            <button
              onClick={bulkDelete}
              className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === currentOrders.length && currentOrders.length > 0}
                    onChange={selectAllOrders}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Order
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Status
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  const isExpanded = expandedOrder === order.id;
                  
                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.id}</p>
                            <p className="text-xs text-gray-500">{order.createdAt}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {order.items.length}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              <StatusIcon size={14} />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <CreditCard size={12} />
                              {order.paymentMethod}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Toggle Details"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailModal(true);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <div className="relative group">
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded">
                                <MoreVertical size={16} />
                              </button>
                              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Clock size={14} />
                                  Mark Processing
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Truck size={14} />
                                  Mark Shipped
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <CheckCircle size={14} />
                                  Mark Completed
                                </button>
                                <button
                                  onClick={() => window.print()}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
                                >
                                  <Printer size={14} />
                                  Print Invoice
                                </button>
                                <button
                                  onClick={() => showNotification('Email sent to customer')}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Send size={14} />
                                  Send Email
                                </button>
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 border-t"
                                >
                                  <Trash2 size={14} />
                                  Delete Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan="8" className="px-4 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Order Items */}
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                      <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="w-12 h-12 rounded object-cover"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(item.price * item.quantity)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Order Summary */}
                                <div className="mt-4 bg-white p-3 rounded-lg space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-medium">{formatCurrency(order.shipping)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                      <span>Discount:</span>
                                      <span className="font-medium">-{formatCurrency(order.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                                    <span>Total:</span>
                                    <span>{formatCurrency(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Customer & Shipping Info */}
                              <div className="space-y-4">
                                {/* Customer Info */}
                                <div className="bg-white p-4 rounded-lg">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <User size={16} />
                                    Customer Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                      <User size={14} className="text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Mail size={14} className="text-gray-400 mt-0.5" />
                                      <p className="text-gray-600">{order.customer.email}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Phone size={14} className="text-gray-400 mt-0.5" />
                                      <p className="text-gray-600">{order.customer.phone}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin size={14} className="text-gray-400 mt-0.5" />
                                      <p className="text-gray-600">{order.customer.address}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="bg-white p-4 rounded-lg">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Truck size={16} />
                                    Shipping Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Method:</span>
                                      <span className="font-medium">{order.shippingMethod}</span>
                                    </div>
                                    {order.trackingNumber && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Tracking:</span>
                                        <span className="font-medium text-blue-600">{order.trackingNumber}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-white p-4 rounded-lg">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard size={16} />
                                    Payment Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Method:</span>
                                      <span className="font-medium">{order.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                      </span>
                                    </div>
                                    {order.transactionId && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-medium text-xs">{order.transactionId}</span>
                                      </div>
                                    )}
                                    {order.paymentDate && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Date:</span>
                                        <span className="font-medium text-xs">{order.paymentDate}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Notes */}
                                {order.notes && (
                                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                      <FileText size={16} />
                                      Order Notes
                                    </h3>
                                    <p className="text-sm text-gray-700">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingBag size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-2xl font-bold">Order Details</h2>
                <p className="text-sm text-gray-600">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                <div className="space-y-3">
                  {selectedOrder.statusHistory.map((history, index) => {
                    const StatusIcon = getStatusIcon(history.status);
                    const isLast = index === selectedOrder.statusHistory.length - 1;
                    
                    return (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isLast ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <StatusIcon size={18} className={isLast ? 'text-blue-600' : 'text-gray-600'} />
                          </div>
                          {index < selectedOrder.statusHistory.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-900">
                            {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                          </p>
                          <p className="text-sm text-gray-600">{history.note}</p>
                          <p className="text-xs text-gray-500 mt-1">{history.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Clock size={18} />
                  Mark Processing
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Truck size={18} />
                  Mark Shipped
                </button>
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle size={18} />
                  Mark Completed
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer size={18} />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;