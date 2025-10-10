import React, { useState } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  CreditCard,
  Download,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Home,
  Building,
  FileText,
  MessageSquare,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

/**
 * OrderSummary Component
 * Comprehensive order confirmation and tracking summary
 * for Oshocks Junior Bike Shop
 */
const OrderSummary = ({
  order,
  onDownloadInvoice,
  onPrintInvoice,
  onContactSupport,
  onBackToShop,
  onTrackOrder
}) => {
  const [expandedItems, setExpandedItems] = useState(false);
  const [showShippingDetails, setShowShippingDetails] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(true);

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate estimated delivery
  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(orderDate.getDate() + (order.shippingMethod === 'express' ? 2 : 5));
    return formatDate(deliveryDate);
  };

  // Get order status info
  const getOrderStatusInfo = (status) => {
    const statusConfig = {
      pending: {
        color: 'yellow',
        icon: <Clock className="w-5 h-5" />,
        title: 'Order Pending',
        description: 'We are processing your payment'
      },
      confirmed: {
        color: 'blue',
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared'
      },
      processing: {
        color: 'purple',
        icon: <Package className="w-5 h-5" />,
        title: 'Processing',
        description: 'Your items are being prepared for shipment'
      },
      shipped: {
        color: 'indigo',
        icon: <Truck className="w-5 h-5" />,
        title: 'Shipped',
        description: 'Your order is on the way'
      },
      delivered: {
        color: 'green',
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: 'Delivered',
        description: 'Your order has been delivered'
      },
      cancelled: {
        color: 'red',
        icon: <AlertCircle className="w-5 h-5" />,
        title: 'Cancelled',
        description: 'This order has been cancelled'
      }
    };

    return statusConfig[status] || statusConfig.pending;
  };

  const statusInfo = getOrderStatusInfo(order.status);

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      mpesa: { name: 'M-Pesa', icon: '📱' },
      card: { name: 'Credit/Debit Card', icon: '💳' },
      cash: { name: 'Cash on Delivery', icon: '💵' }
    };
    return methods[method] || { name: method, icon: '💰' };
  };

  const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-xl p-8 mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-green-100 text-lg mb-4">
            Your order has been successfully placed
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
            <p className="text-sm text-green-100 mb-1">Order Number</p>
            <p className="text-2xl font-bold">#{order.orderNumber}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          onClick={onTrackOrder}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Truck className="w-5 h-5" />
          Track Order
        </button>
        <button
          onClick={onDownloadInvoice}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          <Download className="w-5 h-5" />
          Download Invoice
        </button>
        <button
          onClick={onPrintInvoice}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
        <button
          onClick={() => navigator.share && navigator.share({ 
            title: `Order #${order.orderNumber}`,
            text: 'Check out my order from Oshocks Junior Bike Shop!'
          })}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Order Status
            </h2>

            <div className={`bg-${statusInfo.color}-50 border border-${statusInfo.color}-200 rounded-lg p-4 mb-6`}>
              <div className="flex items-start gap-3">
                <div className={`text-${statusInfo.color}-600`}>
                  {statusInfo.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-${statusInfo.color}-900`}>
                    {statusInfo.title}
                  </p>
                  <p className={`text-sm text-${statusInfo.color}-700 mt-1`}>
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              {[
                { 
                  status: 'Order Placed', 
                  date: order.orderDate, 
                  completed: true,
                  description: 'We have received your order'
                },
                { 
                  status: 'Payment Confirmed', 
                  date: order.paymentDate, 
                  completed: order.status !== 'pending',
                  description: 'Payment has been verified'
                },
                { 
                  status: 'Processing', 
                  date: null, 
                  completed: ['processing', 'shipped', 'delivered'].includes(order.status),
                  description: 'Preparing your items'
                },
                { 
                  status: 'Shipped', 
                  date: order.shippedDate, 
                  completed: ['shipped', 'delivered'].includes(order.status),
                  description: 'Package is on the way'
                },
                { 
                  status: 'Delivered', 
                  date: order.deliveredDate, 
                  completed: order.status === 'delivered',
                  description: 'Order successfully delivered'
                }
              ].map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                      )}
                    </div>
                    {index < 4 && (
                      <div className={`w-0.5 h-12 ${
                        step.completed ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className={`font-semibold ${
                      step.completed ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.status}
                    </p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(step.date)} at {formatTime(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tracking Number</p>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {order.trackingNumber}
                    </p>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Track Package
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Order Items ({order.items.length})
              </h2>
              <button
                onClick={() => setExpandedItems(!expandedItems)}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
              >
                {expandedItems ? (
                  <>
                    Show Less <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show All <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {order.items.slice(0, expandedItems ? undefined : 3).map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              {!expandedItems && order.items.length > 3 && (
                <p className="text-center text-sm text-gray-500 py-2">
                  +{order.items.length - 3} more items
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowShippingDetails(!showShippingDetails)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Shipping Address
              </h2>
              {showShippingDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showShippingDetails && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Recipient</p>
                    <p className="font-semibold text-gray-900">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-gray-900">{order.shippingAddress.address}</p>
                    <p className="text-gray-900">
                      {order.shippingAddress.city}, {order.shippingAddress.county}
                    </p>
                    {order.shippingAddress.postalCode && (
                      <p className="text-gray-900">{order.shippingAddress.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-gray-900">{order.shippingAddress.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{order.shippingAddress.email}</p>
                  </div>
                </div>

                {order.shippingAddress.deliveryInstructions && (
                  <div className="flex items-start gap-3 pt-3 border-t">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Delivery Instructions</p>
                      <p className="text-gray-900">
                        {order.shippingAddress.deliveryInstructions}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 pt-3 border-t">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-green-600">
                      {getEstimatedDelivery()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="w-full flex items-center justify-between mb-4"
            >
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                Payment Information
              </h2>
              {showPaymentDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showPaymentDetails && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{paymentMethod.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{paymentMethod.name}</p>
                      <p className="text-sm text-gray-600">
                        {order.paymentMethod === 'mpesa' && order.mpesaNumber && 
                          `${order.mpesaNumber.slice(0, 4)}****${order.mpesaNumber.slice(-3)}`
                        }
                        {order.paymentMethod === 'card' && order.cardLast4 && 
                          `****${order.cardLast4}`
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-700'
                      : order.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 
                     order.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                </div>

                {order.transactionId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Transaction ID:</strong> {order.transactionId}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {order.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatPrice(order.shipping)
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                {order.codFee > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>COD Fee</span>
                    <span className="font-medium">{formatPrice(order.codFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                  <span>VAT (16% included)</span>
                  <span>{formatPrice(order.vat)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Need Help?
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Our support team is ready to assist you
              </p>
              <button
                onClick={onContactSupport}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Contact Support
              </button>
              <div className="mt-4 space-y-2 text-sm text-blue-100">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +254 712 345 678
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@oshocksjunior.com
                </p>
              </div>
            </div>

            {/* Back to Shop */}
            <button
              onClick={onBackToShop}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const OrderSummaryDemo = () => {
  const demoOrder = {
    orderNumber: 'OSH240109001',
    orderDate: new Date().toISOString(),
    paymentDate: new Date().toISOString(),
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'mpesa',
    mpesaNumber: '0712345678',
    transactionId: 'QGH7K8L9M0',
    trackingNumber: 'TRK2024010901',
    items: [
      {
        id: 1,
        name: 'Mountain Bike Pro X1 - 21 Speed Shimano',
        category: 'Mountain Bikes',
        price: 45000,
        quantity: 1,
        image: '/api/placeholder/100/100'
      },
      {
        id: 2,
        name: 'Professional Cycling Helmet',
        category: 'Safety Gear',
        price: 2500,
        quantity: 2,
        image: '/api/placeholder/100/100'
      },
      {
        id: 3,
        name: 'Heavy Duty U-Lock',
        category: 'Security',
        price: 1800,
        quantity: 1,
        image: '/api/placeholder/100/100'
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Kimathi Street, Prestige Plaza',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      phone: '0712 345 678',
      email: 'john.doe@example.com',
      deliveryInstructions: 'Please call before delivery. Gate code: #1234'
    },
    subtotal: 51800,
    shipping: 0,
    discount: 0,
    codFee: 0,
    vat: 7148,
    total: 51800
  };

  const handleDownloadInvoice = () => {
    alert('Downloading invoice...');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleContactSupport = () => {
    alert('Opening support chat...');
  };

  const handleBackToShop = () => {
    alert('Navigating back to shop...');
  };

  const handleTrackOrder = () => {
    alert('Opening order tracking...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <OrderSummary
        order={demoOrder}
        onDownloadInvoice={handleDownloadInvoice}
        onPrintInvoice={handlePrintInvoice}
        onContactSupport={handleContactSupport}
        onBackToShop={handleBackToShop}
        onTrackOrder={handleTrackOrder}
      />

      {/* Features Info */}
      <div className="max-w-6xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Component Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Order Status Timeline</p>
              <p className="text-sm text-gray-600">Visual tracking progress</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Complete Order Details</p>
              <p className="text-sm text-gray-600">Items, shipping, payment</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Invoice Actions</p>
              <p className="text-sm text-gray-600">Download, print, share</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Tracking Integration</p>
              <p className="text-sm text-gray-600">Real-time tracking number</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Customer Support</p>
              <p className="text-sm text-gray-600">Quick access to help</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Mobile Responsive</p>
              <p className="text-sm text-gray-600">Optimized for all devices</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Collapsible Sections</p>
              <p className="text-sm text-gray-600">Clean, organized layout</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Payment Verification</p>
              <p className="text-sm text-gray-600">Transaction ID display</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Delivery Estimates</p>
              <p className="text-sm text-gray-600">Calculated delivery dates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryDemo;