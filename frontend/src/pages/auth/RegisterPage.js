//src/frontend/src/pages/auth/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, User, Phone, MapPin, CheckCircle2, X } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin, stravaLogin, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    userType: 'customer',
    agreeToTerms: false,
    subscribeNewsletter: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (formData.password.length >= 12) strength++;
    if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[^a-zA-Z0-9]/.test(formData.password)) strength++;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate step 1 (Personal Information)
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate step 2 (Account Details)
  const validateStep2 = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current step
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare registration data
      const registrationData = {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        username: formData.username.trim() || null,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        address: formData.city.trim()
      };

      // Call register from AuthContext
      const result = await registerUser(registrationData);
      
      if (result.success) {
        // Navigate to login with success message
        navigate('/login', {
          state: {
            message: 'Registration successful! Please sign in with your new account.'
          }
        });
      } else {
        // Handle error from AuthContext
        setValidationErrors({
          general: result.error || 'Registration failed. Please try again.'
        });
      }
      
    } catch (err) {
      // Handle unexpected errors
      console.error('Registration error:', err);
      setValidationErrors({
        general: err.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social registration
  const handleSocialRegister = (provider) => {
    console.log(`🔄 Initiating ${provider} OAuth registration flow`);
    
    const redirectUri = window.location.origin + `/auth/${provider}/callback`;
    
    if (provider === 'google') {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=1033846968989-8694tr0qe79fusd3jg1jtev0pqolirv1.apps.googleusercontent.com&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      window.location.href = googleAuthUrl;
    } else if (provider === 'strava') {
      const stravaAuthUrl = `https://www.strava.com/oauth/authorize?` +
        `client_id=181136&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=read,activity:read`;
      
      window.location.href = stravaAuthUrl;
    }
  };

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Oshocks</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Kenya's premier cycling marketplace
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                } font-semibold`}>
                  {currentStep > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Personal Info
                </span>
              </div>
              
              {/* Divider */}
              <div className={`w-16 h-1 ${
                currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
              
              {/* Step 2 */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                } font-semibold`}>
                  2
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  Account Details
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* General Error Message */}
        {validationErrors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{validationErrors.general}</p>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I want to
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'customer' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.userType === 'customer'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">Buy Products</div>
                      <div className="text-xs text-gray-600 mt-1">Shop for bikes and accessories</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'seller' }))}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.userType === 'seller'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">Sell Products</div>
                      <div className="text-xs text-gray-600 mt-1">Start your cycling business</div>
                    </button>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Zablon"
                      />
                    </div>
                    {validationErrors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Bennett"
                      />
                    </div>
                    {validationErrors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Username (Optional) */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          validationErrors.username ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="coolcyclist"
                      />
                    </div>
                    {validationErrors.username && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.username}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Choose a unique username for easy login</p>
                  </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        validationErrors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="+254 712 345 678"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">For M-Pesa payments and order updates</p>
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Continue to Account Details
                </button>
              </div>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        validationErrors.city ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    >
                      <option value="">Select your city</option>
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Thika">Thika</option>
                      <option value="Malindi">Malindi</option>
                      <option value="Kitale">Kitale</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {validationErrors.city && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.city}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2.5 border ${
                        validationErrors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Use 8+ characters with uppercase, lowercase, and numbers
                      </p>
                    </div>
                  )}
                  
                  {validationErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-10 py-2.5 border ${
                        validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Newsletter */}
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className={`h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer ${
                        validationErrors.agreeToTerms ? 'border-red-300' : ''
                      }`}
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="text-blue-600 hover:text-blue-500 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-500 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {validationErrors.agreeToTerms && (
                    <p className="text-xs text-red-600">{validationErrors.agreeToTerms}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      id="subscribeNewsletter"
                      name="subscribeNewsletter"
                      type="checkbox"
                      checked={formData.subscribeNewsletter}
                      onChange={handleChange}
                      className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="subscribeNewsletter" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                      Send me updates about new products, deals, and cycling tips
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Social Registration - Only show on step 1 */}
          {currentStep === 1 && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialRegister('google')}
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialRegister('strava')}
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#FC4C02">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                    </svg>
                    Strava
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in instead
          </Link>
        </p>

        {/* Additional Info for Sellers */}
        {formData.userType === 'seller' && currentStep === 1 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Seller Benefits</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Reach thousands of cycling enthusiasts across Kenya</li>
              <li>• Easy-to-use dashboard for inventory management</li>
              <li>• Integrated M-Pesa and card payment processing</li>
              <li>• Low commission rates for sellers</li>
              <li>• Marketing support and promotional opportunities</li>
            </ul>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Lock className="w-4 h-4" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;