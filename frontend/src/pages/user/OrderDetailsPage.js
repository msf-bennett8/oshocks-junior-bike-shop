import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Download, MessageSquare, AlertCircle, ChevronRight, Calendar, CreditCard, User, Home, Star, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingExpanded, setTrackingExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState({});

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      // Simulate API call - Replace with: const response = await fetch(`/api/orders/${orderId}`);
      setTimeout(() => {
        setOrder({
          id: 'ORD-2024-10-1234',
          orderNumber: 'ORD-2024-10-1234',
          status: 'in_transit',
          placedDate: '2024-10-10T10:30:00',
          estimatedDelivery: '2024-10-16T18:00:00',
          deliveredDate: null,
          totalAmount: 45800,
          subtotal: 42000,
          shipping: 1800,
          tax: 2000,
          discount: 0,
          paymentMethod: 'M-Pesa',
          paymentStatus: 'paid',
          mpesaCode: 'QK7P9M4NXZ',
          canCancel: false,
          canReturn: false,
          items: [
            {
              id: 1,
              name: 'Mountain Bike - Trek Marlin 7 29" Aluminum Frame',
              image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
              price: 35000,
              quantity: 1,
              seller: 'Oshocks Junior',
              sku: 'MTB-TRK-ML7-BLK',
              color: 'Matte Black',
              size: 'Large (19.5")',
              reviewable: false
            },
            {
              id: 2,
              name: 'Bike Helmet - Bell Z20 MIPS Safety Certified',
              image: 'https://images.unsplash.com/photo-1557536713-89f8f6b47e2e?w=400',
              price: 4500,
              quantity: 1,
              seller: 'Oshocks Junior',
              sku: 'HLM-BLL-Z20-RED',
              color: 'Racing Red',
              size: 'Medium',
              reviewable: false
            },
            {
              id: 3,
              name: 'Bike Lock - Kryptonite Evolution U-Lock Series 4',
              image: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6?w=400',
              price: 2500,
              quantity: 1,
              seller: 'SafeCycle Kenya',
              sku: 'LCK-KRP-U12-BLK',
              color: 'Black',
              size: 'Standard',
              reviewable: false
            }
          ],
          shippingAddress: {
            fullName: 'John Kamau',
            phone: '+254 712 345 678',
            alternatePhone: '+254 789 012 345',
            email: 'john.kamau@email.com',
            street: 'Ngong Road, ABC Place',
            building: 'Building C, 3rd Floor, Apartment C304',
            city: 'Nairobi',
            county: 'Nairobi County',
            postalCode: '00100',
            deliveryInstructions: 'Please call before delivery. Security gate code: 1234'
          },
          trackingNumber: 'OSH2024101234KE',
          courierName: 'Oshocks Express',
          courierPhone: '+254 700 123 456',
          trackingHistory: [
            {
              status: 'Order Placed',
              date: '2024-10-10T10:30:00',
              location: 'Nairobi, Kenya',
              description: 'Your order has been received and confirmed',
              completed: true
            },
            {
              status: 'Payment Confirmed',
              date: '2024-10-10T10:32:00',
              location: 'Nairobi, Kenya',
              description: 'M-Pesa payment successfully processed',
              completed: true
            },
            {
              status: 'Processing',
              date: '2024-10-10T14:20:00',
              location: 'Oshocks Warehouse, Industrial Area',
              description: 'Items picked and quality checked',
              completed: true
            },
            {
              status: 'Packaged',
              date: '2024-10-11T08:00:00',
              location: 'Oshocks Warehouse, Industrial Area',
              description: 'Order securely packaged for shipping',
              completed: true
            },
            {
              status: 'Shipped',
              date: '2024-10-11T09:15:00',
              location: 'Oshocks Warehouse, Industrial Area',
              description: 'Package handed over to Oshocks Express courier',
              completed: true
            },
            {
              status: 'In Transit',
              date: '2024-10-12T11:45:00',
              location: 'Nairobi Distribution Hub',
              description: 'Package is on route to your delivery location',
              completed: true,
              current: true
            },
            {
              status: 'Out for Delivery',
              date: null,
              location: 'Westlands Delivery Station',
              description: 'Package will be delivered today',
              completed: false
            },
            {
              status: 'Delivered',
              date: null,
              location: 'Your Address',
              description: 'Package delivered and signed for',
              completed: false
            }
          ],
          invoiceUrl: '/invoices/ORD-2024-10-1234.pdf',
          customerNotes: 'Please handle with care - bicycle parts inside',
          sellerNotes: 'Bike has been assembled and tested before shipping'
        });
        setLoading(false);
      }, 800);
    };

    fetchOrderDetails();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Pending Payment', icon: Clock },
      paid: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Payment Confirmed', icon: CheckCircle },
      processing: { color: 'text-purple-600 bg-purple-50 border-purple-200', label: 'Processing', icon: Package },
      shipped: { color: 'text-indigo-600 bg-indigo-50 border-indigo-200', label: 'Shipped', icon: Truck },
      in_transit: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'In Transit', icon: Truck },
      out_for_delivery: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Out for Delivery', icon: MapPin },
      delivered: { color: 'text-green-600 bg-green-50 border-green-200', label: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Cancelled', icon: XCircle },
      returned: { color: 'text-orange-600 bg-orange-50 border-orange-200', label: 'Returned', icon: RefreshCw }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
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

  const handleDownloadInvoice = () => {
    window.open(order.invoiceUrl, '_blank');
  };

  const handleContactSupport = () => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize();
    } else {
      alert('Live chat will open here. Support available 24/7.');
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(false);
    alert('Order cancellation requested. Our team will contact you within 2 hours to process your refund.');
  };

  const handleTrackPackage = () => {
    window.open(`https://track.oshocks.co.ke/${order.trackingNumber}`, '_blank');
  };

  const handleReorder = () => {
    alert('Items added to cart. Redirecting to checkout...');
  };

  const handleLeaveReview = (itemId) => {
    alert(`Review page for item ${itemId} will open here.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for. Please check your order number and try again.</p>
          <button
            onClick={() => window.location.href = '/orders'}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Orders
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
              <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.placedDate)}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Invoice
              </button>
              <button
                onClick={handleTrackPackage}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <Package className="w-5 h-5 mr-2" />
                Track
              </button>
              <button
                onClick={handleContactSupport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Support
              </button>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`${statusConfig.color} border rounded-lg p-6 mb-6 shadow-sm`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-full mr-4">
                <StatusIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{statusConfig.label}</h3>
                <p className="text-sm mt-1 opacity-90">
                  {order.status === 'delivered' 
                    ? `Delivered on ${formatDate(order.deliveredDate)}`
                    : order.status === 'out_for_delivery'
                    ? 'Your package will be delivered today'
                    : `Estimated delivery: ${formatDate(order.estimatedDelivery)}`
                  }
                </p>
              </div>
            </div>
            {order.trackingNumber && (
              <div className="text-left md:text-right bg-white bg-opacity-50 rounded-lg p-3">
                <p className="text-xs font-medium opacity-75 uppercase">Tracking Number</p>
                <p className="text-lg font-bold mt-1">{order.trackingNumber}</p>
                {order.courierName && (
                  <p className="text-sm mt-1 opacity-90">via {order.courierName}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
                <button
                  onClick={() => setTrackingExpanded(!trackingExpanded)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                >
                  {trackingExpanded ? 'Show Less' : 'View Full History'}
                </button>
              </div>

              <div className="space-y-6">
                {order.trackingHistory.slice(0, trackingExpanded ? undefined : 4).map((track, idx) => (
                  <div key={idx} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        track.completed ? 'bg-green-600 shadow-lg shadow-green-200' : 'bg-gray-300'
                      } ${track.current ? 'ring-4 ring-green-200 animate-pulse' : ''}`}>
                        {track.completed ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Clock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {idx < order.trackingHistory.length - 1 && (
                        <div className={`w-1 flex-1 min-h-[60px] ${track.completed ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className={`font-bold text-lg ${track.completed ? 'text-gray-900' : 'text-gray-500'} ${track.current ? 'text-green-600' : ''}`}>
                          {track.status}
                        </h3>
                        {track.date && (
                          <span className="text-sm text-gray-500">{formatDate(track.date)}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{track.description}</p>
                      <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {track.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.courierPhone && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Contact Courier: <a href={`tel:${order.courierPhone}`} className="font-semibold text-green-600 hover:text-green-700">{order.courierPhone}</a>
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items ({order.items.length})</h2>
              <div className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 hover:text-green-600 cursor-pointer mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <p>SKU: <span className="font-mono text-xs">{item.sku}</span></p>
                        <p>Qty: <span className="font-semibold">{item.quantity}</span></p>
                        {item.color && <p>Color: <span className="font-medium">{item.color}</span></p>}
                        {item.size && <p>Size: <span className="font-medium">{item.size}</span></p>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Sold by:</span> {item.seller}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</span>
                        {order.status === 'delivered' && item.reviewable && (
                          <button
                            onClick={() => handleLeaveReview(item.id)}
                            className="text-sm px-3 py-1 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
                          >
                            <Star className="w-4 h-4 inline mr-1" />
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleReorder}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Reorder These Items
                </button>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center text-gray-700">
                    <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="font-medium">Payment Method</span>
                  </div>
                  <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                </div>
                {order.mpesaCode && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">Transaction Code</span>
                    <span className="font-mono font-bold text-green-600 bg-green-50 px-3 py-1 rounded">{order.mpesaCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Payment Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="font-medium">Payment Date</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{formatDate(order.placedDate)}</span>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            {(order.customerNotes || order.sellerNotes) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                {order.customerNotes && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Your Notes:</p>
                    <p className="text-sm text-blue-800">{order.customerNotes}</p>
                  </div>
                )}
                {order.sellerNotes && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-1">Seller Notes:</p>
                    <p className="text-sm text-green-800">{order.sellerNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">{formatCurrency(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (VAT 16%)</span>
                  <span className="font-semibold">{formatCurrency(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start">
                  <User className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    <p className="font-semibold">{order.shippingAddress.phone}</p>
                    {order.shippingAddress.alternatePhone && (
                      <p className="text-sm text-gray-500">{order.shippingAddress.alternatePhone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <p className="break-all">{order.shippingAddress.email}</p>
                </div>
                <div className="flex items-start">
                  <Home className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-gray-400" />
                  <div>
                    <p className="font-semibold">{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.building}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.county}</p>
                    <p className="text-sm text-gray-500">Postal Code: {order.shippingAddress.postalCode}</p>
                  </div>
                </div>
                {order.shippingAddress.deliveryInstructions && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">Delivery Instructions:</p>
                    <p className="text-sm text-yellow-800">{order.shippingAddress.deliveryInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <div className="space-y-3">
                {order.canCancel && (order.status === 'pending' || order.status === 'processing') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={handleContactSupport}
                  className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Support
                </button>
                {order.status === 'delivered' && (
                  <button
                    onClick={() => alert('Return/refund request page will open')}
                    className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Request Return
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Print Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone. Your refund will be processed within 5-7 business days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;