import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Home,
  CreditCard,
  Smartphone,
  Wallet,
  Shield,
  AlertCircle,
  Check,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2
} from 'lucide-react';

/**
 * CheckoutForm Component
 * Comprehensive multi-step checkout form for Oshocks Junior Bike Shop
 * Handles customer info, shipping, payment method selection
 */
const CheckoutForm = ({
  cartItems = [],
  totalAmount = 0,
  onSubmitOrder,
  onBack
}) => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Shipping Address
    address: '',
    city: '',
    county: 'Nairobi',
    postalCode: '',
    deliveryInstructions: '',
    
    // Payment
    paymentMethod: 'mpesa',
    mpesaNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
    
    // Additional
    saveInfo: false,
    agreeTerms: false,
    subscribeNewsletter: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kenyan counties for dropdown
  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru',
    'Kisii', 'Kiambu', 'Machakos', 'Kajiado', 'Kilifi', 'Kwale'
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay via mobile money (STK Push)',
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard accepted'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay when you receive'
    }
  ];

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Personal information validation
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      
      const phoneRegex = /^(\+254|0)[17]\d{8}$/;
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Kenyan phone number (e.g., 0712345678)';
      }
    }

    if (step === 2) {
      // Shipping address validation
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City/Town is required';
      if (!formData.county) newErrors.county = 'County is required';
    }

    if (step === 3) {
      // Payment validation
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Select payment method';
      
      if (formData.paymentMethod === 'mpesa') {
        const mpesaRegex = /^(\+254|0)[17]\d{8}$/;
        if (!formData.mpesaNumber.trim()) {
          newErrors.mpesaNumber = 'M-Pesa number is required';
        } else if (!mpesaRegex.test(formData.mpesaNumber.replace(/\s/g, ''))) {
          newErrors.mpesaNumber = 'Invalid M-Pesa number';
        }
      }

      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) {
          newErrors.cardNumber = 'Card number is required';
        } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
          newErrors.cardNumber = 'Invalid card number';
        }
        
        if (!formData.cardExpiry.trim()) {
          newErrors.cardExpiry = 'Expiry date is required';
        }
        
        if (!formData.cardCVV.trim()) {
          newErrors.cardCVV = 'CVV is required';
        } else if (formData.cardCVV.length !== 3) {
          newErrors.cardCVV = 'CVV must be 3 digits';
        }
        
        if (!formData.cardName.trim()) {
          newErrors.cardName = 'Cardholder name is required';
        }
      }

      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const orderData = {
        ...formData,
        orderDate: new Date().toISOString(),
        totalAmount,
        items: cartItems
      };
      
      onSubmitOrder(orderData);
      setIsSubmitting(false);
    }, 2000);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Steps configuration
  const steps = [
    { number: 1, title: 'Personal Info', icon: <User className="w-5 h-5" /> },
    { number: 2, title: 'Shipping', icon: <MapPin className="w-5 h-5" /> },
    { number: 3, title: 'Payment', icon: <CreditCard className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep > step.number
                      ? 'bg-green-600 border-green-600 text-white'
                      : currentStep === step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  style={{ marginBottom: '2rem' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Personal Information
                    </h2>
                    <p className="text-gray-600">
                      Enter your contact details for order updates
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0712 345 678"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      We'll send order updates via SMS
                    </p>
                  </div>

                  {/* Newsletter */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="subscribeNewsletter"
                      name="subscribeNewsletter"
                      checked={formData.subscribeNewsletter}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="subscribeNewsletter" className="text-sm text-gray-700">
                      Subscribe to newsletter for exclusive deals and cycling tips
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Shipping Address
                    </h2>
                    <p className="text-gray-600">
                      Where should we deliver your order?
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123 Kimathi Street, Building Name"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City/Town *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Nairobi"
                        />
                      </div>
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* County */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                          name="county"
                          value={formData.county}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.county ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          {counties.map(county => (
                            <option key={county} value={county}>
                              {county}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.county && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.county}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00100"
                    />
                  </div>

                  {/* Delivery Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Leave at reception, Call before delivery, Gate code: #123"
                    />
                  </div>

                  {/* Save Info */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveInfo"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="saveInfo" className="text-sm text-gray-700">
                      Save this address for future orders
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Payment Method
                    </h2>
                    <p className="text-gray-600">
                      Choose how you'd like to pay
                    </p>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <div
                        key={method.id}
                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.id } })}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {method.popular && (
                          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            POPULAR
                          </span>
                        )}
                        <div className="flex items-center gap-4">
                          <div className={`${
                            formData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          {formData.paymentMethod === method.id && (
                            <Check className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* M-Pesa Details */}
                  {formData.paymentMethod === 'mpesa' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-start gap-2">
                        <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">M-Pesa STK Push</p>
                          <p className="text-sm text-green-700">
                            You'll receive a prompt on your phone to complete payment
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          M-Pesa Number *
                        </label>
                        <input
                          type="tel"
                          name="mpesaNumber"
                          value={formData.mpesaNumber}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.mpesaNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0712 345 678"
                        />
                        {errors.mpesaNumber && (
                          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.mpesaNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Card Details */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formatCardNumber(formData.cardNumber)}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '');
                            if (value.length <= 16 && /^\d*$/.test(value)) {
                              handleChange({ target: { name: 'cardNumber', value } });
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              if (value.length <= 5) {
                                handleChange({ target: { name: 'cardExpiry', value } });
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.cardExpiry ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.cardExpiry && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.cardExpiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cardCVV"
                            value={formData.cardCVV}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                handleChange({ target: { name: 'cardCVV', value } });
                              }
                            }}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors.cardCVV ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="123"
                            maxLength="3"
                          />
                          {errors.cardCVV && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.cardCVV}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
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

                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span>Your payment information is encrypted and secure</span>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {formData.paymentMethod === 'cash' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Wallet className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900">Cash on Delivery</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            Pay with cash when your order is delivered. Please have exact amount ready.
                          </p>
                          <p className="text-sm text-yellow-700 mt-2">
                            Additional delivery fee: KES 100
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className={`w-4 h-4 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${
                          errors.agreeTerms ? 'border-red-500' : ''
                        }`}
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1 ml-6">
                        <AlertCircle className="w-4 h-4" />
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Previous
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || '/api/placeholder/64/64'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                {formData.paymentMethod === 'cash' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Fee</span>
                    <span className="font-medium">{formatPrice(100)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {formatPrice(totalAmount + (formData.paymentMethod === 'cash' ? 100 : 0))}
                  </span>
                </div>
              </div>

              {/* Delivery Estimate */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-900">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Estimated Delivery</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">3-5 business days</p>
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// Demo Component
const CheckoutFormDemo = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const demoCartItems = [
    {
      id: 1,
      name: 'Mountain Bike Pro X1',
      price: 45000,
      quantity: 1,
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      name: 'Cycling Helmet',
      price: 2500,
      quantity: 2,
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      name: 'Bike Lock',
      price: 1800,
      quantity: 1,
      image: '/api/placeholder/100/100'
    }
  ];

  const totalAmount = demoCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = (data) => {
    setOrderData(data);
    setShowSuccess(true);
  };

  const handleBack = () => {
    alert('Navigate back to cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Order #OSH{Date.now().toString().slice(-6)}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Email:</strong> {orderData?.email}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Phone:</strong> {orderData?.phone}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Delivery:</strong> {orderData?.address}, {orderData?.city}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Payment:</strong> {orderData?.paymentMethod.toUpperCase()}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            We've sent a confirmation email with order details
          </p>
          <button
            onClick={() => setShowSuccess(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order - Total: {formatPrice(totalAmount)}
          </p>
        </div>

        <CheckoutForm
          cartItems={demoCartItems}
          totalAmount={totalAmount}
          onSubmitOrder={handleSubmitOrder}
          onBack={handleBack}
        />

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Component Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Multi-step Form</p>
                <p className="text-sm text-gray-600">3-step checkout process</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Form Validation</p>
                <p className="text-sm text-gray-600">Real-time error checking</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Payment Methods</p>
                <p className="text-sm text-gray-600">M-Pesa, Card, Cash</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Kenya-specific</p>
                <p className="text-sm text-gray-600">Counties, phone validation</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Order Summary</p>
                <p className="text-sm text-gray-600">Sticky sidebar with items</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Mobile Responsive</p>
                <p className="text-sm text-gray-600">Works on all devices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFormDemo;