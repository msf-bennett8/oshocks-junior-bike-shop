import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Loader, CheckCircle, AlertCircle, CreditCard, Banknote, Smartphone } from 'lucide-react';
import recorderService from '../../services/recorder/recorderService';

const RecordPaymentPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    payment_method: 'cash',
    external_reference: '',
    external_transaction_id: '',
    customer_phone: '',
    notes: ''
  });

  useEffect(() => {
    loadOrderDetails();
  }, [orderNumber]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await recorderService.getOrderDetails(orderNumber);
      
      if (response.success) {
        setOrder(response.data.order);
        setFormData(prev => ({
          ...prev,
          customer_phone: response.data.order.customer_phone || ''
        }));
      }
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.payment_method) {
      setError('Please select a payment method');
      return;
    }

    if (['mpesa_manual', 'bank_transfer'].includes(formData.payment_method)) {
      if (!formData.external_reference || formData.external_reference.length < 8) {
        setError('Customer reference must be at least 8 characters for M-Pesa/Bank transfers');
        return;
      }
      if (!formData.external_transaction_id || formData.external_transaction_id.length < 10) {
        setError('Transaction ID must be at least 10 characters for M-Pesa/Bank transfers');
        return;
      }
    }

    try {
      setSubmitting(true);

      const paymentData = {
        order_id: order.id,
        payment_method: formData.payment_method,
        amount: parseFloat(order.total),
        county: order.address?.county || 'Unknown',
        zone: order.delivery_zone,
        customer_phone: formData.customer_phone || null,
        external_reference: formData.external_reference || null,
        external_transaction_id: formData.external_transaction_id || null,
        notes: formData.notes || null
      };

      const response = await recorderService.recordPayment(paymentData);

      if (response.success) {
        setSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/recorder');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Order not found</p>
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

  if (order.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-4">This order has already been paid</p>
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Recorded Successfully!</h2>
          <p className="text-gray-600 mb-6">Redirecting to dashboard...</p>
          <Loader className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const requiresReference = ['mpesa_manual', 'bank_transfer'].includes(formData.payment_method);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(`/recorder/order/${orderNumber}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Order Details
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Order Number</p>
              <p className="text-2xl font-bold text-blue-900">{order.order_number}</p>
              <p className="text-sm text-blue-700 mt-2">{order.customer_name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 font-medium mb-1">Amount to Collect</p>
              <p className="text-3xl font-bold text-blue-900">
                KES {parseFloat(order.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'cash' }))}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.payment_method === 'cash'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-6 h-6 mb-2 text-green-600" />
                <p className="font-medium text-gray-900">Cash</p>
                <p className="text-xs text-gray-600">Physical cash payment</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'mpesa_manual' }))}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.payment_method === 'mpesa_manual'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-6 h-6 mb-2 text-green-600" />
                <p className="font-medium text-gray-900">M-Pesa</p>
                <p className="text-xs text-gray-600">Manual M-Pesa entry</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payment_method: 'bank_transfer' }))}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  formData.payment_method === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-xs text-gray-600">Bank payment</p>
              </button>
            </div>
          </div>

          {/* Customer Phone (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone (Optional)
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="e.g., 0712345678 or 254712345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 0712345678 or 254712345678</p>
          </div>

          {/* M-Pesa/Bank Transfer Fields */}
          {requiresReference && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Reference *
                </label>
                <input
                  type="text"
                  name="external_reference"
                  value={formData.external_reference}
                  onChange={handleInputChange}
                  placeholder="e.g., Customer name or reference"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  name="external_transaction_id"
                  value={formData.external_transaction_id}
                  onChange={handleInputChange}
                  placeholder="e.g., M-Pesa code or bank reference"
                  required
                  minLength={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about this payment..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Recording Payment...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                Confirm & Record Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentPage;