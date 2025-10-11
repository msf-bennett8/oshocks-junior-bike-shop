import { useState, useEffect } from 'react';
import { XCircle, AlertTriangle, RefreshCw, CreditCard, Smartphone, Mail, Phone, ArrowLeft, ShoppingCart, Home, HelpCircle, Clock, Copy, CheckCircle } from 'lucide-react';

const PaymentFailedPage = () => {
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // In a real app, get this data from props, URL params, or global state
  // For demo purposes, using sample data
  const failureData = {
    orderId: 'OS-2025-10-' + Math.floor(Math.random() * 10000),
    amount: 45750.00,
    currency: 'KES',
    paymentMethod: 'M-Pesa',
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'Payment could not be processed - Insufficient balance',
    timestamp: new Date().toISOString(),
    transactionId: 'TXN' + Date.now(),
    customerEmail: 'customer@example.com',
    customerPhone: '+254712345678'
  };

  const {
    orderId,
    amount,
    currency,
    paymentMethod,
    errorCode,
    errorMessage,
    timestamp,
    transactionId,
    customerEmail,
    customerPhone
  } = failureData;

  useEffect(() => {
    // Track payment failure event for analytics
    if (window.gtag) {
      window.gtag('event', 'payment_failed', {
        order_id: orderId,
        payment_method: paymentMethod,
        error_code: errorCode,
        amount: amount
      });
    }

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [orderId, paymentMethod, errorCode, amount]);

  // Error code explanations
  const errorExplanations = {
    'INSUFFICIENT_FUNDS': {
      title: 'Insufficient Funds',
      description: 'Your account does not have enough balance to complete this transaction.',
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      suggestions: [
        'Check your M-Pesa balance by dialing *234#',
        'Add funds to your account and try again',
        'Try a different payment method'
      ]
    },
    'TRANSACTION_TIMEOUT': {
      title: 'Transaction Timeout',
      description: 'The payment request expired before completion.',
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      suggestions: [
        'Complete the M-Pesa prompt within 60 seconds',
        'Ensure you have good network connectivity',
        'Try the payment again'
      ]
    },
    'USER_CANCELLED': {
      title: 'Payment Cancelled',
      description: 'You cancelled the payment request.',
      icon: <XCircle className="w-12 h-12 text-gray-500" />,
      suggestions: [
        'Your items are still in your cart',
        'Return to checkout when ready',
        'Contact support if you need assistance'
      ]
    },
    'WRONG_PIN': {
      title: 'Incorrect PIN',
      description: 'The PIN you entered was incorrect.',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      suggestions: [
        'Double-check your M-Pesa PIN',
        'Reset your PIN by dialing *234*5#',
        'Contact Safaricom if you\'ve forgotten your PIN'
      ]
    },
    'NETWORK_ERROR': {
      title: 'Network Error',
      description: 'A network connectivity issue prevented the transaction.',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Switch to a more stable network'
      ]
    },
    'CARD_DECLINED': {
      title: 'Card Declined',
      description: 'Your card was declined by the issuing bank.',
      icon: <CreditCard className="w-12 h-12 text-red-500" />,
      suggestions: [
        'Verify your card details are correct',
        'Contact your bank to authorize the transaction',
        'Try a different card or payment method'
      ]
    },
    'INVALID_PHONE': {
      title: 'Invalid Phone Number',
      description: 'The phone number provided is not registered for M-Pesa.',
      icon: <Smartphone className="w-12 h-12 text-red-500" />,
      suggestions: [
        'Verify your phone number is correct',
        'Ensure your number is registered for M-Pesa',
        'Try a different M-Pesa number'
      ]
    },
    'PAYMENT_GATEWAY_ERROR': {
      title: 'Payment Gateway Error',
      description: 'The payment processor encountered an error.',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      suggestions: [
        'This is usually temporary',
        'Try again in a few minutes',
        'Contact support if the problem persists'
      ]
    },
    'UNKNOWN_ERROR': {
      title: 'Payment Failed',
      description: 'An unexpected error occurred during payment processing.',
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      suggestions: [
        'Try the payment again',
        'Use a different payment method',
        'Contact our support team for assistance'
      ]
    }
  };

  const currentError = errorExplanations[errorCode] || errorExplanations['UNKNOWN_ERROR'];

  const handleRetryPayment = async () => {
    setRetrying(true);
    
    // Simulate retry delay
    setTimeout(() => {
      setRetrying(false);
      // In a real app, navigate back to checkout
      // navigate('/checkout', { state: { retryOrder: orderId, orderAmount: amount } });
      window.location.href = '/checkout';
    }, 1000);
  };

  const handleCopyTransactionId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-500">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Error Icon and Status */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {currentError.icon}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600">
            {currentError.title}
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6 sm:p-8 mb-6">
          <div className="flex items-start space-x-3 mb-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                What Happened?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {currentError.description}
              </p>
              {errorMessage && errorMessage !== currentError.description && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  Error: {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="text-base font-medium text-gray-900">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-base font-medium text-gray-900">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-base font-medium text-gray-900">{paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="text-base font-medium text-gray-900">{formatDateTime(timestamp)}</p>
              </div>
              {transactionId && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-base font-mono text-gray-900 flex-1">{transactionId}</p>
                    <button
                      onClick={handleCopyTransactionId}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy Transaction ID"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              What You Can Do
            </h3>
            <ul className="space-y-2">
              {currentError.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start text-sm text-blue-900">
                  <span className="mr-2 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retrying ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Retry Payment</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.location.href = '/checkout'}
              className="flex items-center justify-center space-x-2 bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold border-2 border-blue-700 hover:bg-blue-50 transition-all"
            >
              <CreditCard className="w-5 h-5" />
              <span>Try Another Method</span>
            </button>

            <button
              onClick={() => window.location.href = '/cart'}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>View Cart</span>
            </button>

            <button
              onClick={() => window.location.href = '/shop'}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Alternative Payment Methods */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Try Alternative Payment Methods
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">M-Pesa</h4>
                  <p className="text-xs text-gray-500">Mobile Money</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Fast and secure mobile payments. Most popular in Kenya.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Card Payment</h4>
                  <p className="text-xs text-gray-500">Visa, Mastercard</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Pay with your credit or debit card securely.
              </p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-6">
            Our customer support team is here to assist you with any payment issues.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="mailto:support@oshocksjunior.co.ke"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">Email Us</span>
              <span className="text-sm text-gray-600 text-center">support@oshocksjunior.co.ke</span>
            </a>

            <a
              href="tel:+254712345678"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">Call Us</span>
              <span className="text-sm text-gray-600 text-center">+254 712 345 678</span>
            </a>

            <button
              onClick={() => {
                // Initialize Tawk.to chat if available
                if (window.Tawk_API) {
                  window.Tawk_API.maximize();
                }
              }}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">Live Chat</span>
              <span className="text-sm text-gray-600 text-center">Chat with support</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Reference Order ID <span className="font-mono font-semibold text-gray-900">{orderId}</span> when contacting support
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Your items are saved in your cart and your order has not been processed.
          </p>
          <p className="text-sm text-gray-500">
            No charges have been made to your account.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4">
              <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="/help" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;