import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, Mail, DollarSign, Loader, CheckCircle, XCircle } from 'lucide-react';
import recorderService from '../../services/recorder/recorderService';

const OrderDetailsPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, [orderNumber]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await recorderService.getOrderDetails(orderNumber);
      
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/recorder')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canRecordPayment = order.payment_status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/recorder')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ordered on {new Date(order.created_at).toLocaleString('en-KE', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700">{order.customer_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700">{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700">{order.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p>{order.address?.address_line1}</p>
                  <p>{order.delivery_zone}</p>
                  <p>{order.address?.county}</p>
                  {order.postal_code && <p>Postal Code: {order.postal_code}</p>}
                  {order.delivery_instructions && (
                    <p className="mt-2 text-gray-600 italic">
                      Note: {order.delivery_instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                  {item.variant_name && (
                    <p className="text-sm text-gray-600 mt-1">Variant: {item.variant_name}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    KES {parseFloat(item.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">
                    @ KES {parseFloat(item.price).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>KES {parseFloat(order.subtotal).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping Fee</span>
              <span>KES {parseFloat(order.shipping_fee).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>KES {parseFloat(order.tax).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- KES {parseFloat(order.discount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>KES {parseFloat(order.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium text-gray-900">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${
                order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Paid At</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.paid_at).toLocaleString('en-KE')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {canRecordPayment && (
          <button
            onClick={() => navigate(`/recorder/record-payment/${order.order_number}`)}
            className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Record Payment
          </button>
        )}

        {order.payment_status === 'paid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Payment has already been recorded for this order
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;