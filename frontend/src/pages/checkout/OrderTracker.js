import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, CreditCard, AlertCircle } from 'lucide-react';

const OrderTracker = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mockOrderData = {
    orderId: 'OSH2024-001234',
    status: 'in_transit',
    orderDate: '2024-10-08T10:30:00',
    estimatedDelivery: '2024-10-12T17:00:00',
    customer: {
      name: 'John Kamau',
      email: 'john.kamau@email.com',
      phone: '+254712345678',
      address: '123 Ngong Road, Nairobi, Kenya'
    },
    items: [
      {
        id: 1,
        name: 'Mountain Bike - Trek X-Caliber',
        quantity: 1,
        price: 45000,
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100&h=100&fit=crop'
      },
      {
        id: 2,
        name: 'Bike Helmet - Giro Register',
        quantity: 2,
        price: 3500,
        image: 'https://images.unsplash.com/photo-1557836938-3e91f32b2d1a?w=100&h=100&fit=crop'
      }
    ],
    payment: {
      method: 'M-Pesa',
      transactionId: 'QGH12345XYZ',
      amount: 52000,
      status: 'completed'
    },
    timeline: [
      {
        status: 'order_placed',
        title: 'Order Placed',
        description: 'Your order has been received and confirmed',
        timestamp: '2024-10-08T10:30:00',
        completed: true
      },
      {
        status: 'payment_confirmed',
        title: 'Payment Confirmed',
        description: 'M-Pesa payment successfully processed',
        timestamp: '2024-10-08T10:32:00',
        completed: true
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Your items are being prepared for shipment',
        timestamp: '2024-10-09T09:15:00',
        completed: true
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Package is on the way to your location',
        timestamp: '2024-10-10T14:20:00',
        completed: true,
        current: true
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Package is out with our delivery partner',
        timestamp: null,
        completed: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Package successfully delivered',
        timestamp: null,
        completed: false
      }
    ],
    tracking: {
      carrier: 'Oshocks Delivery',
      trackingNumber: 'OSH-TRK-789456',
      currentLocation: 'Nairobi Distribution Center',
      updates: [
        {
          location: 'Nairobi Distribution Center',
          status: 'Package sorted and ready for dispatch',
          timestamp: '2024-10-10T14:20:00'
        },
        {
          location: 'Oshocks Warehouse',
          status: 'Package picked up by courier',
          timestamp: '2024-10-10T08:00:00'
        },
        {
          location: 'Oshocks Shop - Nairobi',
          status: 'Package prepared and labeled',
          timestamp: '2024-10-09T16:30:00'
        }
      ]
    }
  };

  const handleTrackOrder = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      if (orderId.trim()) {
        setOrderData(mockOrderData);
        setLoading(false);
      } else {
        setError('Please enter a valid order ID');
        setLoading(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTrackOrder();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'order_placed':
        return <CheckCircle className="w-6 h-6" />;
      case 'payment_confirmed':
        return <CreditCard className="w-6 h-6" />;
      case 'processing':
        return <Package className="w-6 h-6" />;
      case 'in_transit':
        return <Truck className="w-6 h-6" />;
      case 'out_for_delivery':
        return <MapPin className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (completed, current) => {
    if (current) return 'bg-blue-600 text-white';
    if (completed) return 'bg-green-600 text-white';
    return 'bg-gray-300 text-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to track your delivery status</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Order ID (e.g., OSH2024-001234)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleTrackOrder}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {orderData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order #{orderData.orderId}</h2>
                  <p className="text-gray-600">Placed on {formatDate(orderData.orderDate)}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Delivery</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatDate(orderData.estimatedDelivery)}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {orderData.timeline.find(t => t.current)?.title}
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {orderData.timeline.find(t => t.current)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                <div className="space-y-6">
                  {orderData.timeline.map((item, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                      <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(item.completed, item.current)}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${item.current ? 'text-blue-600' : item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {item.title}
                          </h4>
                          {item.timestamp && (
                            <span className="text-sm text-gray-500">{formatDate(item.timestamp)}</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tracking Updates</h3>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold text-gray-900">{orderData.tracking.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carrier</p>
                    <p className="font-semibold text-gray-900">{orderData.tracking.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Location</p>
                    <p className="font-semibold text-gray-900">{orderData.tracking.currentLocation}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {orderData.tracking.updates.map((update, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{update.status}</p>
                      <p className="text-sm text-gray-600">{update.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(update.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-600">each</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatCurrency(orderData.payment.amount)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-medium text-gray-900">{orderData.customer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">{orderData.customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{orderData.customer.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{orderData.payment.method}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className="font-medium text-green-600 capitalize">{orderData.payment.status}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium text-gray-900">{orderData.payment.transactionId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="mb-4 text-blue-100">
                Our customer support team is here to assist you with any questions about your order.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Contact Support
                </button>
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors">
                  Live Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracker;