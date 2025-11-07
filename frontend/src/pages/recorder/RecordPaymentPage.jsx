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
      setOrder(response.data);  // Changed from response.data.order
      setFormData(prev => ({
        ...prev,
        customer_phone: response.data.customer_phone || ''  // Changed from response.data.order.customer_phone
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
        //order_id: order.id,// -recorderService will add it
        payment_method: formData.payment_method,
        amount_received: parseFloat(order.total),
        county: order.address?.county || 'Unknown',
        zone: order.delivery_zone,
        customer_phone: formData.customer_phone || null,
        external_reference: formData.external_reference || null,
        external_transaction_id: formData.external_transaction_id || null,
        notes: formData.notes || null
      };

      console.log('🔍 Sending payment data:', paymentData);

      const response = await recorderService.recordPayment(orderNumber, paymentData);

      if (response.success) {
        // Store the payment transaction reference from response
        setOrder(prev => ({
          ...prev,
          transaction_reference: response.data.transaction_reference
        }));
        setSuccess(true);
        // Don't auto-redirect - let user review summary
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Recorded!</h2>
          <p className="text-gray-600">The payment has been successfully recorded</p>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Order Number</span>
            <span className="font-semibold text-gray-900">{order.order_number}</span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-gray-600">Transaction ID</span>
          <span className="font-mono text-sm text-gray-900">{order.transaction_reference}</span>
        </div>
          
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Customer</span>
            <span className="font-semibold text-gray-900">{order.customer_name}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Amount Collected</span>
            <span className="font-bold text-green-600 text-xl">
              KES {parseFloat(order.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-semibold text-gray-900 capitalize">
              {formData.payment_method === 'mpesa_manual' ? 'M-Pesa' : 
               formData.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
            </span>
          </div>
          
          {formData.external_transaction_id && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-gray-900">{formData.external_transaction_id}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Recorded At</span>
            <span className="text-sm text-gray-900">
              {new Date().toLocaleString('en-KE', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              const summaryText = `
                PAYMENT RECEIPT
                =====================================

                Order Number: ${order.order_number}
                Transaction ID: ${order.transaction_reference || 'N/A'}
                Customer: ${order.customer_name}
                Amount Collected: KES ${parseFloat(order.total).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                Payment Method: ${formData.payment_method === 'mpesa_manual' ? 'M-Pesa' : formData.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                ${formData.external_transaction_id ? `External Ref: ${formData.external_transaction_id}` : ''}
                Recorded At: ${new Date().toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}

                =====================================
                `.trim();
              
              navigator.clipboard.writeText(summaryText);
              alert('Payment details copied to clipboard!');
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            Copy Details
          </button>
          
          <button
            onClick={() => navigate('/recorder')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
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