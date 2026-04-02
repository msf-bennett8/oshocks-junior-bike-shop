import React, { useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Calendar, Box, Star, RefreshCw } from 'lucide-react';

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending Payment', icon: Clock },
      processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Processing', icon: Package },
      shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'Shipped', icon: Truck },
      in_transit: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'In Transit', icon: Truck },
      out_for_delivery: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Out for Delivery', icon: MapPin },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Delivered', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled', icon: X },
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-600">
                Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
            
            {/* Status Banner */}
            <div className={`${statusConfig.color} border rounded-lg p-4 mb-6`}>
              <div className="flex items-center gap-3">
                <StatusIcon className="w-6 h-6" />
                <div>
                  <h3 className="font-bold">{statusConfig.label}</h3>
                  <p className="text-sm">
                    {order.status === 'delivered' 
                      ? `Delivered on ${formatDate(order.deliveredDate)}`
                      : `Estimated delivery: ${formatDate(order.estimatedDelivery)}`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={item.image}
                          alt={item.product_name || item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Box className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product_name || item.name}</h4>
                      {item.variant_name && (
                        <p className="text-sm text-gray-600">{item.variant_name}</p>
                      )}
                      <p className="text-sm text-gray-500">{item.seller_shop_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.price)} each
                        </span>
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(item.total || item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount - (order.shipping_fee || 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(order.shipping_fee || 0)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Delivery Info */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Method:</span> {order.paymentMethod}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Delivery Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Order Date:</span> {formatDate(order.placedDate)}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Estimated:</span> {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {order.canReview && (
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium">
                  <Star className="w-4 h-4" />
                  Write Review
                </button>
              )}
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;