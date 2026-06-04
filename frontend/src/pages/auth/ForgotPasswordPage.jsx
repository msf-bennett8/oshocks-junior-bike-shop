//src/frontend/src/pages/auth/ForgotPasswordPage.js
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeviceFingerprint } from '../../hooks/useDeviceFingerprint';
import { Mail, AlertCircle, Loader, CheckCircle, ArrowLeft, Send, Clock, RefreshCw } from 'lucide-react';
import Logo from '../../components/common/Logo';

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

  // Device fingerprint for audit logging
  const { fingerprint } = useDeviceFingerprint();

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
        
        // Log password reset requested event
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
          await logFrontendAuditEvent(AUDIT_EVENTS.PASSWORD_RESET_REQUESTED, {
            category: 'auth',
            severity: 'medium',
            metadata: {
              identifier_attempted: email,
              delivery_method: 'email',
              device_fingerprint: fingerprint,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (e) {
          // Silently fail
        }
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
    <div className="min-h-screen flex relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient background texture */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle radial orange glow - top right */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgb(255, 69, 0) 0%, transparent 60%)',
          }}
        />
        {/* Subtle radial orange glow - bottom left */}
        <div 
          className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-15"
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgb(255, 140, 0) 0%, transparent 50%)',
          }}
        />
        {/* Fine noise texture overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
        {/* Bottom fade to blend into footer */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      {/* LEFT COLUMN - Branding & Illustration (from LoginPage) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-900 via-transparent to-transparent"></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <Logo size="large" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-light text-white mb-4 leading-relaxed">
            Experience cycling gear<br />
            with seamless, scalable speed<br />
            with Oshocks Cloud.
          </h2>
          
          {/* Cloud Provider Icons */}
          <div className="flex items-center gap-6 mt-8 opacity-70">
            <div className="text-white flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.032.063.056.127.088.19l.256.415c.16.256.336.48.512.672.192.208.416.368.672.48.256.112.528.16.832.16.288 0 .544-.048.768-.16.224-.112.416-.272.576-.48.16-.208.304-.448.432-.72.128-.272.224-.576.288-.912.064-.336.096-.688.096-1.056 0-.368-.032-.72-.096-1.056a3.87 3.87 0 0 0-.288-.912 2.5 2.5 0 0 0-.576-.72c-.224-.192-.48-.288-.768-.288a1.8 1.8 0 0 0-.832.176 2.29 2.29 0 0 0-.672.496 3.46 3.46 0 0 0-.512.688l-.256.416a2.6 2.6 0 0 0-.088.192c-.112.208-.192.4-.256.576-.048.176-.08.416-.08.72zM12.02 14.4c.544 0 1.024-.112 1.44-.336.416-.224.768-.528 1.056-.896.288-.368.512-.8.656-1.28.144-.48.224-.992.224-1.52 0-.544-.08-1.056-.224-1.536a3.81 3.81 0 0 0-.656-1.28c-.288-.368-.64-.672-1.056-.896-.416-.224-.896-.336-1.44-.336-.544 0-1.024.112-1.44.336-.416.224-.768.528-1.056.896-.288.368-.512.8-.656 1.28-.144.48-.224.992-.224 1.536 0 .528.08 1.04.224 1.52.144.48.368.912.656 1.28.288.368.64.672 1.056.896.416.224.896.336 1.44.336z"/>
              </svg>
              <span className="text-sm">ann</span>
            </div>
            <div className="text-white flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03-.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-9.029-6.833zm3.836 14.169h-1.57a.477.477 0 0 0-.477.476v5.305h-5.774v-5.305a.477.477 0 0 0-.477-.476h-1.57a.477.477 0 0 0-.477.476v5.956a.476.476 0 0 0 .477.476h7.788a.477.477 0 0 0 .476-.476v-5.956a.476.476 0 0 0-.476-.476zm6.33-8.48v-.49h-1.61v.49h.945v5.426h-.945v.49h1.61v-.49h-.945V8.069h.945z"/>
              </svg>
              <span className="text-sm">isotope execution</span>
            </div>
            <div className="text-white flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 5.65h9.94v9.95H0V5.65zM14.06 5.65H24v9.95H14.06V5.65zM0 19.17h9.94V24H0v-4.83zM14.06 19.17H24V24H14.06v-4.83z"/>
              </svg>
              <span className="text-sm">accella silicon</span>
            </div>
          </div>
        </div>

        {/* Isometric Illustration */}
        <div className="relative z-10 mt-auto">
          <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto">
            <defs>
              <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#2d3748', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#1a202c', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#ff4500', stopOpacity:0.8}} />
                <stop offset="100%" style={{stopColor:'#ff8c00', stopOpacity:0.8}} />
              </linearGradient>
            </defs>
            
            {/* Buildings */}
            <rect x="50" y="100" width="60" height="200" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="120" y="150" width="80" height="150" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="210" y="80" width="70" height="220" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            <rect x="290" y="120" width="60" height="180" fill="url(#buildingGrad)" stroke="#4a5568" strokeWidth="2"/>
            
            {/* Windows with lights */}
            <rect x="60" y="120" width="15" height="15" fill="#ff8c00" opacity="0.6"/>
            <rect x="85" y="120" width="15" height="15" fill="#ff8c00" opacity="0.8"/>
            <rect x="60" y="145" width="15" height="15" fill="#ff4500" opacity="0.5"/>
            <rect x="85" y="145" width="15" height="15" fill="#ff8c00" opacity="0.7"/>
            
            <rect x="135" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.6"/>
            <rect x="165" y="170" width="20" height="20" fill="url(#accentGrad)" opacity="0.8"/>
            
            {/* Connecting lines */}
            <path d="M80 100 L130 80" stroke="#ff8c00" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
            <path d="M200 150 L250 120" stroke="#ff4500" strokeWidth="2" opacity="0.5" strokeDasharray="5,5"/>
            
            {/* Ground */}
            <ellipse cx="200" cy="300" rx="180" ry="20" fill="#1a202c" opacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* RIGHT COLUMN - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10" style={{ backgroundColor: 'transparent' }}>
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center">
            <Link to="/" className="inline-block lg:hidden">
              <Logo size="large" />
            </Link>
            
            {!emailSent ? (
              <>
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  Forgot your password?
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-6 text-3xl font-extrabold text-white">
                  Check your email
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  We've sent password reset instructions to your email address.
                </p>
              </>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start space-x-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-300">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div className="py-8 px-6 rounded-lg border border-gray-800" style={{ backgroundColor: '#111318' }}>
            {!emailSent ? (
              // Email Input Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
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
                        validationError ? 'border-red-500' : 'border-gray-700'
                      } rounded-lg focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 transition-colors text-white placeholder-gray-500`}
                      style={{ backgroundColor: '#1a1f26' }}
                      placeholder="you@example.com"
                    />
                  </div>
                  {validationError && (
                    <p className="mt-1 text-xs text-red-400">{validationError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Enter the email address associated with your account
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-600/20 text-sm font-semibold text-white bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-500 hover:to-orange-600 hover:shadow-orange-600/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-out"
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
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-orange-600/50 hover:text-white active:scale-[0.98] transition-all duration-200"
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
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20">
                    <Mail className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                {/* Email Address Display */}
                <div className="rounded-lg p-4 text-center border border-gray-700" style={{ backgroundColor: '#1a1f26' }}>
                  <p className="text-sm text-gray-400 mb-1">Reset link sent to:</p>
                  <p className="text-base font-semibold text-white">{email}</p>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center mt-0.5 border border-orange-500/20">
                      <span className="text-xs font-bold text-orange-500">1</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Check your email inbox (and spam folder)
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center mt-0.5 border border-orange-500/20">
                      <span className="text-xs font-bold text-orange-500">2</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Click the password reset link in the email
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-orange-500/10 rounded-full flex items-center justify-center mt-0.5 border border-orange-500/20">
                      <span className="text-xs font-bold text-orange-500">3</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Create a new password for your account
                    </p>
                  </div>
                </div>

                {/* Expiration Warning */}
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-300">
                    This reset link will expire in <strong>1 hour</strong> for security reasons.
                  </p>
                </div>

                {/* Resend Button */}
                <div className="space-y-3">
                  <p className="text-sm text-center text-gray-400">
                    Didn't receive the email?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isSubmitting || resendCooldown > 0}
                    className="w-full flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-orange-600/50 hover:text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500" style={{ backgroundColor: '#111318' }}>or</span>
                  </div>
                </div>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center items-center py-3 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-700 hover:border-orange-600/50 hover:text-white active:scale-[0.98] transition-all duration-200"
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
              <p className="text-sm text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-orange-500 hover:text-orange-400 hover:underline underline-offset-2 transition-all duration-200"
                >
                  Sign in
                </Link>
              </p>
            )}

            {/* Contact Support */}
            <div className="rounded-lg p-4 border border-gray-800" style={{ backgroundColor: '#111318' }}>
              <p className="text-xs text-gray-400 mb-2">
                Still having trouble accessing your account?
              </p>
              <Link
                to="/contact-support"
                className="inline-flex items-center text-sm font-medium text-orange-500 hover:text-orange-400 hover:underline underline-offset-2 transition-all duration-200"
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
            <Link to="/help" className="hover:text-gray-300 transition-colors">
              Help Center
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
