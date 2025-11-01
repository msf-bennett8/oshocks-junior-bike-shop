import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, CreditCard, AlertCircle, ArrowLeft, User } from 'lucide-react';

const OrderTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const [orderId, setOrderId] = useState(orderNumber || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if order data was passed from order success page
  useEffect(() => {
    if (location.state?.orderData) {
      const passedOrder = location.state.orderData;
      const items = location.state.items || [];
      const discount = location.state.discount || 0;
      
      // Transform the data to match our display format
      const transformedData = transformOrderData(passedOrder, items, discount);
      setOrderData(transformedData);
      setOrderId(passedOrder.orderNumber);
    }
  }, [location.state]);

  // Transform order data from checkout to tracker format
  const transformOrderData = (orderInfo, items, discount = 0) => {
    const now = new Date();
    const orderDate = new Date(orderInfo.orderDate);
    const estimatedDelivery = new Date(orderDate);
    
    // Calculate delivery estimate based on county
    const county = orderInfo.shipping?.county || orderInfo.shipping?.city || 'Unknown';
    const deliveryDays = county === 'Nairobi County' ? 1 : 3;
    estimatedDelivery.setDate(orderDate.getDate() + deliveryDays);

    // Calculate order summary
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    const shippingCost = orderInfo.payment?.shippingCost || 0;
    // const tax = Math.round(subtotal * 0.16); // 16% VAT - Commented out (business under KSh 5M threshold)
    const tax = 0; // No VAT charged for small businesses
    const total = subtotal + shippingCost + tax - discount;

    // Build timeline based on payment method and status
    const isPending = orderInfo.payment?.status === 'pending';
    const timeline = [
      {
        status: 'order_placed',
        title: 'Order Placed',
        description: 'Your order has been received and confirmed',
        timestamp: orderInfo.orderDate,
        completed: true
      },
      {
        status: 'payment_confirmed',
        title: 'Payment Confirmed',
        description: `${orderInfo.payment?.method || 'Payment'} ${isPending ? 'pending' : 'successfully processed'}`,
        timestamp: isPending ? null : orderInfo.orderDate,
        completed: !isPending
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Your items are being prepared for shipment',
        timestamp: isPending ? null : orderInfo.orderDate,
        completed: !isPending,
        current: !isPending && (orderInfo.status === 'confirmed' || orderInfo.status === 'processing')
      },
      {
        status: 'in_transit',
        title: 'In Transit',
        description: 'Package is on the way to your location',
        timestamp: null,
        completed: false
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
    ];

    // Full address with zone
    const fullAddress = orderInfo.shipping?.zone 
      ? `${orderInfo.shipping.address}, ${orderInfo.shipping.zone.includes(' - ') ? orderInfo.shipping.zone.split(' - ')[1] : orderInfo.shipping.zone}, ${county}${orderInfo.shipping.postalCode ? ', ' + orderInfo.shipping.postalCode : ''}`
      : `${orderInfo.shipping?.address || 'N/A'}, ${county}${orderInfo.shipping?.postalCode ? ', ' + orderInfo.shipping.postalCode : ''}`;

    return {
      orderId: orderInfo.orderNumber,
      status: orderInfo.status || 'confirmed',
      orderDate: orderInfo.orderDate,
      estimatedDelivery: estimatedDelivery.toISOString(),
      customer: {
        name: orderInfo.customer?.name || 'N/A',
        email: orderInfo.customer?.email || 'N/A',
        phone: orderInfo.customer?.phone || 'N/A',
        address: fullAddress
      },
      shipping: {
        address: orderInfo.shipping?.address || 'N/A',
        county: county,
        zone: orderInfo.shipping?.zone || 'N/A',
        postalCode: orderInfo.shipping?.postalCode || 'N/A'
      },
      items: items.map(item => ({
        id: item.id || item.product_id,
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 1,
        price: Number(item.price) || 0,
        image: item.image || item.thumbnail || '/api/placeholder/100/100'
      })),
      payment: {
        method: orderInfo.payment?.method || 'N/A',
        transactionId: orderInfo.payment?.transactionId || 'N/A',
        amount: total,
        status: orderInfo.payment?.status || 'completed',
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        discount: discount
      },
      timeline: timeline,
      tracking: {
        carrier: 'Oshocks Delivery',
        trackingNumber: `OSH-TRK-${orderInfo.orderNumber.slice(-6)}`,
        currentLocation: isPending ? 'Awaiting Payment Confirmation' : 'Oshocks Warehouse - Nairobi',
        updates: isPending ? [
          {
            location: 'Oshocks Shop - Nairobi',
            status: 'Order received - Awaiting payment confirmation',
            timestamp: orderInfo.orderDate
          }
        ] : [
          {
            location: 'Oshocks Warehouse',
            status: 'Package prepared and ready for dispatch',
            timestamp: orderInfo.orderDate
          },
          {
            location: 'Oshocks Shop - Nairobi',
            status: 'Order confirmed and labeled',
            timestamp: orderInfo.orderDate
          }
        ]
      },
      deliveryInstructions: orderInfo.deliveryInstructions || 'N/A'
    };
  };

  const handleTrackOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!orderId.trim()) {
        setError('Please enter a valid order ID');
        setLoading(false);
        return;
      }

      // TODO: Replace with actual API call
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${apiUrl}/orders/${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        const transformedData = transformOrderData(data.order, data.items, data.discount || 0);
        setOrderData(transformedData);
      } else if (response.status === 404) {
        setError('Order not found. Please check your order ID and try again.');
      } else {
        setError('Unable to fetch order details. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Unable to connect to the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
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
    if (current) return 'bg-orange-600 text-white';
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
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

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
              placeholder="Enter Order ID (e.g., OS12345678)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleTrackOrder}
              disabled={loading}
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order #{orderData.orderId}</h2>
                  <p className="text-gray-600">Placed on {formatDate(orderData.orderDate)}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Estimated Delivery</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {new Date(orderData.estimatedDelivery).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded-r-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">
                      {orderData.timeline.find(t => t.current)?.title || 'Order Confirmed'}
                    </h3>
                    <p className="text-orange-700 text-sm">
                      {orderData.timeline.find(t => t.current)?.description || 'Your order has been received'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
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
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <h4 className={`font-semibold ${item.current ? 'text-orange-600' : item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
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

            {/* Tracking Updates */}
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
                    <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{update.status}</p>
                      <p className="text-sm text-gray-600">{update.location}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(update.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => { e.target.src = '/api/placeholder/100/100'; }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(orderData.payment.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping ({orderData.shipping.zone !== 'N/A' ? orderData.shipping.zone.split(' - ')[0] : 'Standard'})</span>
                    <span className="font-medium text-gray-900">{formatCurrency(orderData.payment.shippingCost)}</span>
                  </div>
                  {/* VAT display removed - business under KSh 5M annual turnover threshold
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (16%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(orderData.payment.tax)}</span>
                  </div>
                  */}
                  {orderData.payment.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(orderData.payment.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-orange-600">{formatCurrency(orderData.payment.amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Payment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="font-medium text-gray-900">{orderData.customer.name}</p>
                    </div>
                  </div>
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
                  {orderData.deliveryInstructions !== 'N/A' && (
                    <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Instructions</p>
                        <p className="font-medium text-gray-900">{orderData.deliveryInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{orderData.payment.method}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${orderData.payment.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`} />
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <p className={`font-medium capitalize ${orderData.payment.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                        {orderData.payment.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium text-gray-900">{orderData.payment.transactionId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                    <Package className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      <p className="font-medium text-gray-900 capitalize">{orderData.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help Section */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="mb-4 text-orange-100">
                Our customer support team is here to assist you with any questions about your order.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/contact-support')}
                  className="px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                >
                  Contact Support
                </button>
                <a
                  href="tel:+254712345678"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 transition-colors"
                >
                  Call Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracker;