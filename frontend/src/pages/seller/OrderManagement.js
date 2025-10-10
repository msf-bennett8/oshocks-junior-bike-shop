import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  AlertCircle,
  ChevronDown,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD-2024-001',
          customer: {
            name: 'John Kamau',
            email: 'john.kamau@email.com',
            phone: '+254 712 345 678',
            address: '123 Kenyatta Avenue, Nairobi'
          },
          items: [
            {
              id: 1,
              name: 'Mountain Bike 29"',
              image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100',
              quantity: 1,
              price: 45000,
              sku: 'MTB-29-001'
            }
          ],
          subtotal: 45000,
          shipping: 500,
          total: 45500,
          status: 'pending',
          paymentMethod: 'M-Pesa',
          paymentStatus: 'paid',
          orderDate: '2024-10-08T10:30:00',
          trackingNumber: null
        },
        {
          id: 'ORD-2024-002',
          customer: {
            name: 'Sarah Wanjiku',
            email: 'sarah.w@email.com',
            phone: '+254 722 987 654',
            address: '45 Moi Avenue, Mombasa'
          },
          items: [
            {
              id: 2,
              name: 'Cycling Helmet - Adult',
              image: 'https://images.unsplash.com/photo-1557803175-1c1e91b1ce4e?w=100',
              quantity: 2,
              price: 3500,
              sku: 'HLM-ADT-002'
            },
            {
              id: 3,
              name: 'Water Bottle Holder',
              image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100',
              quantity: 2,
              price: 800,
              sku: 'ACC-WBH-003'
            }
          ],
          subtotal: 8600,
          shipping: 650,
          total: 9250,
          status: 'processing',
          paymentMethod: 'Card',
          paymentStatus: 'paid',
          orderDate: '2024-10-07T14:20:00',
          trackingNumber: null
        },
        {
          id: 'ORD-2024-003',
          customer: {
            name: 'Michael Ochieng',
            email: 'michael.o@email.com',
            phone: '+254 733 456 789',
            address: '78 Oginga Odinga Road, Kisumu'
          },
          items: [
            {
              id: 4,
              name: 'Bike Chain Lock',
              image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
              quantity: 1,
              price: 2500,
              sku: 'SEC-LCK-004'
            }
          ],
          subtotal: 2500,
          shipping: 400,
          total: 2900,
          status: 'shipped',
          paymentMethod: 'M-Pesa',
          paymentStatus: 'paid',
          orderDate: '2024-10-05T09:15:00',
          trackingNumber: 'TRK-KE-2024-789456'
        },
        {
          id: 'ORD-2024-004',
          customer: {
            name: 'Grace Akinyi',
            email: 'grace.akinyi@email.com',
            phone: '+254 745 123 456',
            address: '12 Tom Mboya Street, Nairobi'
          },
          items: [
            {
              id: 5,
              name: 'Kids Bicycle 16"',
              image: 'https://images.unsplash.com/photo-1560320588-39c37a6d3a1b?w=100',
              quantity: 1,
              price: 15000,
              sku: 'KDS-16-005'
            },
            {
              id: 6,
              name: 'Safety Knee Pads',
              image: 'https://images.unsplash.com/photo-1598300188904-f37906832fdc?w=100',
              quantity: 1,
              price: 1200,
              sku: 'SFT-KNP-006'
            }
          ],
          subtotal: 16200,
          shipping: 500,
          total: 16700,
          status: 'delivered',
          paymentMethod: 'Card',
          paymentStatus: 'paid',
          orderDate: '2024-10-01T16:45:00',
          trackingNumber: 'TRK-KE-2024-654321'
        },
        {
          id: 'ORD-2024-005',
          customer: {
            name: 'Peter Mwangi',
            email: 'peter.m@email.com',
            phone: '+254 756 789 012',
            address: '34 Haile Selassie Avenue, Nairobi'
          },
          items: [
            {
              id: 7,
              name: 'Bike Repair Kit',
              image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100',
              quantity: 3,
              price: 1800,
              sku: 'REP-KIT-007'
            }
          ],
          subtotal: 5400,
          shipping: 300,
          total: 5700,
          status: 'cancelled',
          paymentMethod: 'M-Pesa',
          paymentStatus: 'refunded',
          orderDate: '2024-10-03T11:00:00',
          trackingNumber: null
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search orders
  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(order => {
        const orderDate = new Date(order.orderDate);
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Apply search
    if (searchTerm) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, dateFilter, orders]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      shipped: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <AlertCircle className="w-4 h-4" />;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const addTrackingNumber = (orderId, trackingNumber) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, trackingNumber } : order
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, trackingNumber });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'Date'],
      ...filteredOrders.map(order => [
        order.id,
        order.customer.name,
        order.customer.email,
        order.customer.phone,
        order.total,
        order.status,
        order.paymentMethod,
        formatDate(order.orderDate)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage and fulfill customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{orderStats.total}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{orderStats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Processing</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{orderStats.processing}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Shipped</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{orderStats.shipped}</p>
            </div>
            <Truck className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Delivered</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{orderStats.delivered}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{order.items.length} item(s)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">{order.paymentMethod}</p>
                        <p className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {order.paymentStatus}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{formatDate(order.orderDate)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <p className="text-gray-600 mt-1">{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Order Status
                </label>
                <div className="flex gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter tracking number"
                      defaultValue={selectedOrder.trackingNumber || ''}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onBlur={(e) => {
                        if (e.target.value) {
                          addTrackingNumber(selectedOrder.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.customer.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">SKU: {item.sku}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.shipping)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-900">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Timeline</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        {selectedOrder.status !== 'pending' && (
                          <div className="w-0.5 h-full bg-green-200 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedOrder.orderDate)}</p>
                      </div>
                    </div>

                    {selectedOrder.status !== 'pending' && selectedOrder.status !== 'cancelled' && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedOrder.status === 'processing' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            <Package className={`w-5 h-5 ${
                              selectedOrder.status === 'processing' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                            <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-900">Processing</p>
                          <p className="text-sm text-gray-600">Order is being prepared</p>
                        </div>
                      </div>
                    )}

                    {(selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered') && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                              ? 'bg-purple-100'
                              : 'bg-gray-100'
                          }`}>
                            <Truck className={`w-5 h-5 ${
                              selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered'
                                ? 'text-purple-600'
                                : 'text-gray-400'
                            }`} />
                          </div>
                          {selectedOrder.status === 'delivered' && (
                            <div className="w-0.5 h-full bg-purple-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium text-gray-900">Shipped</p>
                          <p className="text-sm text-gray-600">
                            {selectedOrder.trackingNumber 
                              ? `Tracking: ${selectedOrder.trackingNumber}`
                              : 'In transit to customer'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === 'delivered' && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Delivered</p>
                          <p className="text-sm text-gray-600">Order completed successfully</p>
                        </div>
                      </div>
                    )}

                    {selectedOrder.status === 'cancelled' && (
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Cancelled</p>
                          <p className="text-sm text-gray-600">Order was cancelled</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;