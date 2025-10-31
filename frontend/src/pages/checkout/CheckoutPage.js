import { useState, useEffect } from 'react';
import { CreditCard, Truck, MapPin, Phone, Mail, User, ShoppingBag, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    postalCode: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  
  
  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kiambu', 'Machakos', 'Kajiado', 'Nyeri', 'Meru', 'Kakamega', 'Bungoma'
  ];
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const shippingCost = shippingInfo.county === 'Nairobi' ? 500 : 1000;
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + shippingCost + tax;
  
  // Validation functions
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Email is invalid';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(254|0)[17]\d{8}$/.test(shippingInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter valid Kenyan phone number';
    }
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'City is required';
    if (!shippingInfo.county) newErrors.county = 'County is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePayment = () => {
    const newErrors = {};
    
    if (paymentMethod === 'mpesa') {
      if (!mpesaPhone.trim()) newErrors.mpesaPhone = 'M-Pesa number is required';
      else if (!/^(254|0)[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
        newErrors.mpesaPhone = 'Enter valid M-Pesa number';
      }
    } else if (paymentMethod === 'card') {
      if (!cardInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      else if (!/^\d{16}$/.test(cardInfo.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Enter valid 16-digit card number';
      }
      if (!cardInfo.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
      if (!cardInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      if (!cardInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3}$/.test(cardInfo.cvv)) newErrors.cvv = 'CVV must be 3 digits';
    }
    
    if (!agreedToTerms) newErrors.terms = 'You must agree to terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;
    
    setLoading(true);
    
    // Simulate API call - replace with actual API integration
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Prepare order data to pass to success page
      const orderData = {
        orderNumber: `OS${Date.now().toString().slice(-8)}`,
        orderDate: new Date().toISOString(),
        status: 'confirmed',
        customer: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          phone: shippingInfo.phone
        },
        shipping: {
          address: shippingInfo.address,
          city: shippingInfo.city,
          county: shippingInfo.county,
          postalCode: shippingInfo.postalCode
        },
        payment: {
          method: paymentMethod === 'mpesa' ? 'M-Pesa' : 'Credit/Debit Card',
          transactionId: `TXN${Date.now().toString().slice(-10)}`,
          amount: total,
          status: 'completed'
        }
      };
      
      // Navigate to success page with order data
      navigate('/order-success', {
        state: {
          orderData: orderData,
          items: cartItems,
          discount: 0 // Add discount if you have it
        }
      });
      
      // Clear the cart after successful order
      // clearCart(); // Uncomment this when you want to clear cart after order
      
    } catch (error) {
      setErrors({ submit: 'Payment failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };
  
  // Redirect if cart is empty
  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Add some items to your cart before checking out.
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase in a few easy steps</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="ml-2 font-medium text-gray-700">Shipping</span>
            </div>
            <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="ml-2 font-medium text-gray-700">Payment</span>
            </div>
            <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="ml-2 font-medium text-gray-700">Confirm</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <Truck className="w-6 h-6 text-orange-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="john@example.com"
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="0712345678 or 254712345678"
                        />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="123 Main Street, Apartment 4B"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City/Town *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nairobi"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <select
                        value={shippingInfo.county}
                        onChange={(e) => setShippingInfo({...shippingInfo, county: e.target.value})}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.county ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select County</option>
                        {kenyanCounties.map(county => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                      {errors.county && <p className="text-red-500 text-xs mt-1">{errors.county}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="00100"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}
            
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-orange-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit}>
                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'mpesa' 
                            ? 'border-orange-600 bg-orange-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">M-PESA</div>
                          <div className="text-sm text-gray-600">Pay with M-Pesa</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'card' 
                            ? 'border-orange-600 bg-orange-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <CreditCard className="w-8 h-8 mx-auto mb-1 text-blue-600" />
                          <div className="text-sm text-gray-600">Credit/Debit Card</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* M-Pesa Payment */}
                  {paymentMethod === 'mpesa' && (
                    <div className="mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-green-900 mb-2">How M-Pesa Payment Works:</h3>
                        <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                          <li>Enter your M-Pesa phone number below</li>
                          <li>You'll receive an STK push notification on your phone</li>
                          <li>Enter your M-Pesa PIN to complete payment</li>
                          <li>You'll receive a confirmation SMS immediately</li>
                        </ol>
                      </div>
                      
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M-Pesa Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.mpesaPhone ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="0712345678 or 254712345678"
                        />
                      </div>
                      {errors.mpesaPhone && <p className="text-red-500 text-xs mt-1">{errors.mpesaPhone}</p>}
                    </div>
                  )}
                  
                  {/* Card Payment */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cardNumber}
                          onChange={(e) => setCardInfo({...cardInfo, cardNumber: formatCardNumber(e.target.value)})}
                          maxLength="19"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={cardInfo.cardName}
                          onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value})}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="JOHN DOE"
                        />
                        {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={cardInfo.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardInfo({...cardInfo, expiryDate: value});
                            }}
                            maxLength="5"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="MM/YY"
                          />
                          {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, '')})}
                            maxLength="3"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="123"
                          />
                          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Terms and Conditions */}
                    <div className="mb-6">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 mr-2 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms-of-service" className="text-orange-600 hover:underline font-medium">
                            Terms and Conditions
                          </Link>
                          {' and '}
                          <Link to="/privacy-policy" className="text-orange-600 hover:underline font-medium">
                            Privacy Policy
                          </Link>
                          {' *'}
                        </span>
                      </label>
                      {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                    </div>
                  
                  {errors.submit && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Pay ${formatCurrency(total)}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Policy Links Footer */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              By completing this purchase, you agree to our{' '}
              <Link to="/terms-of-service" className="text-orange-600 hover:underline font-medium">
                Terms of Service
              </Link>
              {', '}
              <Link to="/privacy-policy" className="text-orange-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              {', '}
              <Link to="/shipping-policy" className="text-orange-600 hover:underline font-medium">
                Shipping Policy
              </Link>
              {', and '}
              <Link to="/refund-policy" className="text-orange-600 hover:underline font-medium">
                Refund Policy
              </Link>
              .
            </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <ShoppingBag className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
              </div>
              
              {/* Cart Items */}
              <div className="mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 last:border-0">
                    <img 
                      src={item.thumbnail || item.image || '/api/placeholder/64/64'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shippingInfo.county ? formatCurrency(shippingCost) : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">VAT (16%)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                </div>
              </div>
              
              {/* Total */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(total)}</span>
              </div>
              
              {/* Shipping Info Display */}
              {shippingInfo.county && (
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-sm text-orange-800 mb-1">
                    <Truck className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      {shippingInfo.county === 'Nairobi' ? 'Same-day delivery available' : 'Delivery in 2-3 days'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700">
                    Shipping to {shippingInfo.city}, {shippingInfo.county}
                  </p>
                </div>
              )}
              
              {/* Security Badge */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span>Secure checkout with 256-bit SSL encryption</span>
                </div>
              </div>
              
              {/* Accepted Payment Methods */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">We accept:</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-700">M-PESA</div>
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-700">VISA</div>
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-700">Mastercard</div>
                </div>
              </div>
              
             {/* Support Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Need help?</p>
                <Link 
                  to="/contact-support" 
                  className="flex items-center text-xs text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  <span>Contact Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Secure Payment</h4>
                <p className="text-sm text-gray-600">Your payment is 100% secure</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                <p className="text-sm text-gray-600">Delivered to your doorstep</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Easy Returns</h4>
                <p className="text-sm text-gray-600">7-day return policy</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Privacy Protected</h4>
                <p className="text-sm text-gray-600">
                  <Link to="/privacy-policy" className="text-orange-600 hover:underline">
                    View our privacy policy
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;