//src/frontend/src/pages/auth/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { useDeviceFingerprint } from '../../hooks/useDeviceFingerprint';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import Logo from '../../components/common/Logo';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get auth state from AuthContext
  const { login: loginUser, googleLogin, stravaLogin, isAuthenticated, loading, error } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Device fingerprint and failure tracking
  const { fingerprint } = useDeviceFingerprint();
  const [failureCount, setFailureCount] = useState(() => 
    parseInt(sessionStorage.getItem('login_failure_count') || '0')
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Display success message from registration or password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

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

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    
    // Login field validation
      if (!formData.login.trim()) {
        errors.login = 'Email, phone, or username is required';
      }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Dispatch login action (you'll need to create this in your Redux auth slice)
      // Example: await dispatch(loginUser(formData)).unwrap();
      
      // Call login from AuthContext
      const result = await loginUser({
        login: formData.login.trim(),
        password: formData.password
      });

      if (result.success) {
        // Clear failure count on success
        sessionStorage.removeItem('login_failure_count');
        
        // Navigate to intended page or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        // Handle error from AuthContext
        setValidationErrors({
          general: result.error || 'Login failed. Please try again.'
        });
        
        // Log failed login attempt
        try {
          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
          const newFailureCount = failureCount + 1;
          setFailureCount(newFailureCount);
          sessionStorage.setItem('login_failure_count', newFailureCount.toString());
          
          await logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_FAILED, {
            category: 'auth',
            severity: 'high',
            metadata: {
              identifier_attempted: formData.login,
              failure_reason: result.error || 'invalid_credentials',
              failure_count: newFailureCount,
              device_fingerprint: fingerprint,
              timestamp: new Date().toISOString(),
            },
          });
          
          // Check for suspicious activity (3+ failures in session)
          if (newFailureCount >= 3) {
            await logFrontendAuditEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED, {
              category: 'security',
              severity: 'critical',
              metadata: {
                activity_type: 'multiple_failed_logins',
                failure_count: newFailureCount,
                identifier_attempted: formData.login,
                device_fingerprint: fingerprint,
                timestamp: new Date().toISOString(),
              },
            });
          }
        } catch (e) {
          // Silently fail
        }
      }
      
    } catch (err) {
      // Handle login error
      console.error('Login error:', err);
      setValidationErrors({
        general: err.response?.data?.message || 'Invalid email or password. Please try again.'
      });
      
      // Log failed login attempt
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
        const newFailureCount = failureCount + 1;
        setFailureCount(newFailureCount);
        sessionStorage.setItem('login_failure_count', newFailureCount.toString());
        
        await logFrontendAuditEvent(AUDIT_EVENTS.LOGIN_FAILED, {
          category: 'auth',
          severity: 'high',
          metadata: {
            identifier_attempted: formData.login,
            failure_reason: err.response?.data?.message || 'exception',
            error_code: err.response?.status,
            failure_count: newFailureCount,
            device_fingerprint: fingerprint,
            timestamp: new Date().toISOString(),
          },
        });
        
        // Check for suspicious activity (3+ failures in session)
        if (newFailureCount >= 3) {
          await logFrontendAuditEvent(AUDIT_EVENTS.SUSPICIOUS_ACTIVITY_DETECTED, {
            category: 'security',
            severity: 'critical',
            metadata: {
              activity_type: 'multiple_failed_logins',
              failure_count: newFailureCount,
              identifier_attempted: formData.login,
              device_fingerprint: fingerprint,
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (e) {
        // Silently fail
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social login (Google, Strava, etc.)
  const handleSocialLogin = (provider) => {
    console.log(`🔄 Initiating ${provider} OAuth flow`);
    
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
      {/* Left Side - Branding (Bennet4.5 Style) */}
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10" style={{ backgroundColor: 'transparent' }}>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Sign in</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue shopping</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {validationErrors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{validationErrors.general}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Login Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email, Phone, or Username:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="login"
                  name="login"
                  type="text"
                  autoComplete="username"
                  value={formData.login}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg border ${
                    validationErrors.login ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/50 transition-colors`}
                  style={{ backgroundColor: '#1a1f26' }}
                  placeholder="email@example.com or username"
                />
              </div>
              {validationErrors.login && (
                <p className="mt-1 text-xs text-red-400">{validationErrors.login}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 rounded-lg border ${
                    validationErrors.password ? 'border-red-500' : 'border-gray-700'
                  } text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-colors`}
                  style={{ backgroundColor: '#1a1f26' }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-orange-400 hover:text-orange-300 hover:underline underline-offset-2 transition-all duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-500/20 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-400 hover:to-orange-500 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-out"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-400" style={{ backgroundColor: '#0a0a0f' }}>Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg bg-gray-800/50 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-orange-500/50 hover:text-white hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] transition-all duration-200 ease-out"
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
              onClick={() => handleSocialLogin('strava')}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg bg-gray-800/50 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-orange-500/50 hover:text-white hover:shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] transition-all duration-200 ease-out"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#FC4C02">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
              Strava
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-400 mt-6">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium hover:underline underline-offset-2 transition-all duration-200">
              Sign up
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            By signing up, you acknowledge that you agree to our{' '}
            <Link to="/terms-of-service" className="text-orange-400 hover:text-orange-300 hover:underline underline-offset-2 transition-all duration-200">Terms of Service</Link> and{' '}
            <Link to="/privacy-policy" className="text-orange-400 hover:text-orange-300 hover:underline underline-offset-2 transition-all duration-200">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;