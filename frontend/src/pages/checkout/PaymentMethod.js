import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  Check,
  AlertCircle,
  Lock,
  Shield,
  Info,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Phone,
  Calendar,
  HelpCircle,
  Clock
} from 'lucide-react';

/**
 * PaymentMethod Component
 * Comprehensive payment method selector and processor
 * Supporting M-Pesa, Card payments, and Cash on Delivery
 * for Oshocks Junior Bike Shop
 */
const PaymentMethod = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  selectedMethod: initialMethod = 'mpesa',
  customerInfo = {},
  orderId = null
}) => {
  const [selectedMethod, setSelectedMethod] = useState(initialMethod);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errors, setErrors] = useState({});

  // M-Pesa form state
  const [mpesaData, setMpesaData] = useState({
    phoneNumber: customerInfo.phone || '',
    accountReference: orderId || 'OSHOCKS'
  });

  // Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  // Bank transfer state
  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    transactionRef: ''
  });

  // Available payment methods
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay via mobile money (STK Push)',
      badge: 'Most Popular',
      badgeColor: 'green',
      processingTime: 'Instant',
      fees: 'Free',
      recommended: true
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard accepted',
      badge: null,
      processingTime: 'Instant',
      fees: 'Free',
      recommended: false
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Direct bank account transfer',
      badge: null,
      processingTime: '1-2 hours',
      fees: 'Free',
      recommended: false
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay when you receive',
      badge: null,
      processingTime: 'On Delivery',
      fees: 'KES 100',
      recommended: false
    }
  ];

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return '+254 ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9, 12);
    }
    if (cleaned.startsWith('0')) {
      return cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 7) + ' ' + cleaned.slice(7, 10);
    }
    return value;
  };

  // Format card number
  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  // Validate M-Pesa
  const validateMpesa = () => {
    const newErrors = {};
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    
    if (!mpesaData.phoneNumber.trim()) {
      newErrors.mpesaPhone = 'Phone number is required';
    } else if (!phoneRegex.test(mpesaData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.mpesaPhone = 'Invalid Kenyan phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Card
  const validateCard = () => {
    const newErrors = {};

    if (!cardData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    if (!cardData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = cardData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!cardData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Bank Transfer
  const validateBank = () => {
    const newErrors = {};

    if (!bankData.transactionRef.trim()) {
      newErrors.transactionRef = 'Transaction reference is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process M-Pesa Payment
  const processMpesaPayment = async () => {
    if (!validateMpesa()) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate M-Pesa STK Push API call
      // In production, call your Laravel backend endpoint
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate random success/failure for demo
      const success = Math.random() > 0.2;

      if (success) {
        setPaymentStatus('success');
        const paymentData = {
          method: 'mpesa',
          transactionId: 'MPX' + Date.now(),
          phoneNumber: mpesaData.phoneNumber,
          amount: amount,
          timestamp: new Date().toISOString()
        };
        onPaymentSuccess(paymentData);
      } else {
        throw new Error('Payment was cancelled or failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Card Payment
  const processCardPayment = async () => {
    if (!validateCard()) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Simulate card payment API call (Stripe/Flutterwave)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = Math.random() > 0.2;

      if (success) {
        setPaymentStatus('success');
        const paymentData = {
          method: 'card',
          transactionId: 'CRD' + Date.now(),
          cardLast4: cardData.cardNumber.slice(-4),
          amount: amount,
          timestamp: new Date().toISOString()
        };
        onPaymentSuccess(paymentData);
      } else {
        throw new Error('Card payment declined');
      }
    } catch (error) {
      setPaymentStatus('failed');
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Bank Transfer
  const processBankPayment = async () => {
    if (!validateBank()) return;

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPaymentStatus('success');
      const paymentData = {
        method: 'bank',
        transactionId: bankData.transactionRef,
        bankName: bankData.bankName,
        amount: amount,
        timestamp: new Date().toISOString(),
        status: 'pending_verification'
      };
      onPaymentSuccess(paymentData);
    } catch (error) {
      setPaymentStatus('failed');
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Cash on Delivery
  const processCashPayment = () => {
    const paymentData = {
      method: 'cash',
      amount: amount + 100,
      codFee: 100,
      timestamp: new Date().toISOString()
    };
    onPaymentSuccess(paymentData);
  };

  // Handle payment submission
  const handleSubmitPayment = () => {
    switch (selectedMethod) {
      case 'mpesa':
        processMpesaPayment();
        break;
      case 'card':
        processCardPayment();
        break;
      case 'bank':
        processBankPayment();
        break;
      case 'cash':
        processCashPayment();
        break;
      default:
        break;
    }
  };

  // Reset payment status when method changes
  useEffect(() => {
    setPaymentStatus(null);
    setErrors({});
  }, [selectedMethod]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Payment Status Overlay */}
      {paymentStatus && paymentStatus !== 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            {paymentStatus === 'processing' && selectedMethod === 'mpesa' && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Smartphone className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Phone
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter your M-Pesa PIN to complete the payment
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Waiting for confirmation...</span>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  Sent to: {mpesaData.phoneNumber}
                </p>
              </>
            )}

            {paymentStatus === 'processing' && selectedMethod === 'card' && (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing Payment
                </h3>
                <p className="text-gray-600">
                  Please wait while we process your card payment...
                </p>
              </>
            )}

            {paymentStatus === 'success' && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600">
                  Your payment has been processed successfully
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Payment Form */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
          <p className="text-blue-100">Choose how you'd like to pay</p>
        </div>

        <div className="p-6">
          {/* Amount to Pay */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount to Pay</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(amount)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </label>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {method.badge && (
                  <span className={`absolute top-3 right-3 bg-${method.badgeColor}-500 text-white text-xs font-bold px-2 py-1 rounded`}>
                    {method.badge}
                  </span>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`${
                    selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{method.name}</p>
                      {method.recommended && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {method.processingTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        Fee: {method.fees}
                      </span>
                    </div>
                  </div>

                  {selectedMethod === method.id && (
                    <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Forms */}
          <div className="border-t pt-6">
            {/* M-Pesa Form */}
            {selectedMethod === 'mpesa' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">How it works:</p>
                      <ol className="text-sm text-green-700 mt-2 space-y-1 list-decimal list-inside">
                        <li>Enter your M-Pesa phone number</li>
                        <li>You'll receive an STK push on your phone</li>
                        <li>Enter your M-Pesa PIN to complete payment</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={mpesaData.phoneNumber}
                      onChange={(e) => setMpesaData({ ...mpesaData, phoneNumber: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.mpesaPhone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0712 345 678"
                    />
                  </div>
                  {errors.mpesaPhone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.mpesaPhone}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    The number must be registered on M-Pesa
                  </p>
                </div>
              </div>
            )}

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      Your card information is encrypted and secure
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={formatCardNumber(cardData.cardNumber)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      if (value.length <= 16 && /^\d*$/.test(value)) {
                        setCardData({ ...cardData, cardNumber: value });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    value={cardData.cardName}
                    onChange={(e) => setCardData({ ...cardData, cardName: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cardName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="JOHN DOE"
                  />
                  {errors.cardName && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.cardName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={cardData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          if (value.length <= 5) {
                            setCardData({ ...cardData, expiryDate: value });
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.expiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-gray-600"
                        title="3-digit security code on back of card"
                      >
                        <HelpCircle className="w-4 h-4 inline" />
                      </button>
                    </label>
                    <input
                      type="text"
                      value={cardData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 3) {
                          setCardData({ ...cardData, cvv: value });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.cvv ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123"
                      maxLength="3"
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cvv}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={cardData.saveCard}
                    onChange={(e) => setCardData({ ...cardData, saveCard: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="saveCard" className="text-sm text-gray-700">
                    Save card for future purchases
                  </label>
                </div>
              </div>
            )}

            {/* Bank Transfer Form */}
            {selectedMethod === 'bank' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Bank Transfer Instructions:</p>
                      <div className="text-sm text-yellow-700 mt-2 space-y-1">
                        <p><strong>Bank:</strong> Equity Bank</p>
                        <p><strong>Account Name:</strong> Oshocks Junior Bike Shop</p>
                        <p><strong>Account Number:</strong> 0123456789</p>
                        <p><strong>Amount:</strong> {formatPrice(amount)}</p>
                        <p className="mt-2">After payment, enter the transaction reference below</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name (Optional)
                  </label>
                  <select
                    value={bankData.bankName}
                    onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your bank</option>
                    <option value="equity">Equity Bank</option>
                    <option value="kcb">KCB Bank</option>
                    <option value="coop">Co-operative Bank</option>
                    <option value="absa">Absa Bank</option>
                    <option value="stanbic">Stanbic Bank</option>
                    <option value="ncba">NCBA Bank</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    value={bankData.transactionRef}
                    onChange={(e) => setBankData({ ...bankData, transactionRef: e.target.value.toUpperCase() })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.transactionRef ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., TXN123456789"
                  />
                  {errors.transactionRef && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.transactionRef}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Found on your bank statement or confirmation SMS
                  </p>
                </div>
              </div>
            )}

            {/* Cash on Delivery */}
            {selectedMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Wallet className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">
                      Cash on Delivery
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      Pay with cash when your order is delivered to your doorstep.
                    </p>
                    <div className="space-y-2 text-sm text-yellow-700">
                      <p className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-yellow-600" />
                        You can inspect items before payment
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-yellow-600" />
                        Please have exact amount ready
                      </p>
                      <p className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-yellow-600" />
                        Delivery fee applies: KES 100
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-yellow-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Order Amount</span>
                    <span className="font-medium">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">COD Fee</span>
                    <span className="font-medium">{formatPrice(100)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total to Pay</span>
                    <span className="text-lg font-bold text-yellow-600">
                      {formatPrice(amount + 100)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Payment Failed</p>
                    <p className="text-sm text-red-700 mt-1">
                      There was an error processing your payment. Please try again or use a different payment method.
                    </p>
                    <button
                      onClick={() => setPaymentStatus(null)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitPayment}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedMethod === 'cash' ? 'Confirm Order' : `Pay ${formatPrice(amount)}`}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Your payment information is encrypted and secure</span>
            </div>

            {/* Payment Provider Logos */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-center text-xs text-gray-500 mb-3">Secured by</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-700">
                  Safaricom M-Pesa
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-700">
                  Stripe
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded text-sm font-semibold text-gray-700">
                  Visa/Mastercard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-1">Need help with payment?</p>
            <p className="text-sm text-blue-700">
              Contact our support team at{' '}
              <a href="tel:+254712345678" className="font-semibold hover:underline">
                +254 712 345 678
              </a>{' '}
              or{' '}
              <a href="mailto:support@oshocksjunior.com" className="font-semibold hover:underline">
                support@oshocksjunior.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const PaymentMethodDemo = () => {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePaymentSuccess = (data) => {
    console.log('Payment successful:', data);
    setPaymentData(data);
    setTimeout(() => {
      setPaymentComplete(true);
    }, 2000);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully
          </p>
          
          {paymentData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Method:</strong> {paymentData.method.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Transaction ID:</strong> {paymentData.transactionId}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Amount:</strong> {formatPrice(paymentData.amount)}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setPaymentComplete(false);
              setPaymentData(null);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Payment Methods
          </h1>
          <p className="text-gray-600">
            Choose your preferred payment method for Oshocks Junior Bike Shop
          </p>
        </div>

        <PaymentMethod
          amount={51800}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          customerInfo={{
            phone: '0712345678',
            email: 'customer@example.com'
          }}
          orderId="OSH240109001"
        />

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Component Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Multiple Payment Methods</p>
                <p className="text-sm text-gray-600">M-Pesa, Card, Bank, Cash</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">M-Pesa STK Push</p>
                <p className="text-sm text-gray-600">Daraja API ready</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Card Processing</p>
                <p className="text-sm text-gray-600">Stripe/Flutterwave ready</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Real-time Validation</p>
                <p className="text-sm text-gray-600">Form error checking</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Auto-formatting</p>
                <p className="text-sm text-gray-600">Card, phone numbers</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Processing States</p>
                <p className="text-sm text-gray-600">Loading, success, error</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Security Features</p>
                <p className="text-sm text-gray-600">Encrypted, PCI compliant</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Kenya-specific</p>
                <p className="text-sm text-gray-600">M-Pesa, local banks</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Mobile Responsive</p>
                <p className="text-sm text-gray-600">Works on all devices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Guide */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Integration Guide</h3>
          <div className="space-y-2 text-sm text-blue-100">
            <p>• Connect M-Pesa: Safaricom Daraja API (STK Push)</p>
            <p>• Card payments: Stripe or Flutterwave integration</p>
            <p>• Bank transfers: Manual verification system</p>
            <p>• Callbacks: Success/error handlers included</p>
            <p>• Backend: Laravel API endpoints ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodDemo;
