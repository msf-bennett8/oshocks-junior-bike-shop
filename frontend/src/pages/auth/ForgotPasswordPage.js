import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Loader, CheckCircle, ArrowLeft, Send, Clock, RefreshCw } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [validationError, setValidationError] = useState('');

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear errors when user types
    if (validationError) setValidationError('');
    if (error) setError('');
  };

  // Validate email format
  const validateEmail = () => {
    if (!email.trim()) {
      setValidationError('Email address is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccessMessage('');
    
    // Validate email
    if (!validateEmail()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to request password reset
      // Example: await dispatch(requestPasswordReset({ email })).unwrap();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response - replace with actual API call
      const response = {
        success: true,
        message: 'Password reset instructions have been sent to your email address.'
      };
      
      if (response.success) {
        setSuccessMessage(response.message);
        setEmailSent(true);
        setResendCooldown(60); // 60 seconds cooldown
        
        // Store email for resend functionality
        sessionStorage.setItem('resetEmail', email);
      }
      
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Handle different error scenarios
      if (err.response?.status === 404) {
        setError('No account found with this email address. Please check and try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      // API call to resend password reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Reset link has been resent to your email.');
      setResendCooldown(60);
      
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Oshocks</span>
            </div>
          </Link>
          
          {!emailSent ? (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We've sent password reset instructions to your email address.
              </p>
            </>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          {!emailSent ? (
            // Email Input Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
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
                    autoFocus
                    value={email}
                    onChange={handleEmailChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${
                      validationError ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
                {validationError && (
                  <p className="mt-1 text-xs text-red-600">{validationError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Enter the email address associated with your account
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </form>
          ) : (
            // Email Sent Confirmation
            <div className="space-y-6">
              {/* Email Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Email Address Display */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Reset link sent to:</p>
                <p className="text-base font-semibold text-gray-900">{email}</p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Check your email inbox (and spam folder)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Click the password reset link in the email
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Create a new password for your account
                  </p>
                </div>
              </div>

              {/* Expiration Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  This reset link will expire in <strong>1 hour</strong> for security reasons.
                </p>
              </div>

              {/* Resend Button */}
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600">
                  Didn't receive the email?
                </p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isSubmitting || resendCooldown > 0}
                  className="w-full flex justify-center items-center py-3 px-4 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Resending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <Clock className="w-5 h-5 mr-2" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Resend Reset Link
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Back to Login */}
              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Help Links */}
        <div className="text-center space-y-4">
          {!emailSent && (
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          )}

          {/* Contact Support */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              Still having trouble accessing your account?
            </p>
            <Link
              to="/contact-support"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Contact Support
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500">
            For your security, password reset links are single-use and expire after 1 hour
          </p>
        </div>

        {/* Additional Help */}
        <div className="text-center text-xs text-gray-500 space-x-4">
          <Link to="/help" className="hover:text-gray-700 transition-colors">
            Help Center
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;