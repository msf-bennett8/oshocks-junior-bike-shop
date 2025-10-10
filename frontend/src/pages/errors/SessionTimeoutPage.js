import { useState, useEffect } from 'react';
import { Clock, LogIn, RefreshCw, Shield, AlertTriangle, Home, ShoppingCart, User, Lock, CheckCircle, Info, ArrowRight, XCircle, Zap, Phone, Mail, HelpCircle } from 'lucide-react';

const SessionTimeoutPage = () => {
  const [countdown, setCountdown] = useState(60);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [sessionDetails, setSessionDetails] = useState({
    lastActivity: null,
    timeoutDuration: '30 minutes',
    sessionId: 'SES-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    ipAddress: '192.168.1.1',
    device: 'Desktop - Chrome',
    location: 'Nairobi, Kenya'
  });

  useEffect(() => {
    // Set last activity time
    const lastActivity = new Date(Date.now() - 31 * 60 * 1000); // 31 minutes ago
    setSessionDetails(prev => ({
      ...prev,
      lastActivity: lastActivity
    }));

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (autoRefreshEnabled) {
            handleAutoRedirect();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Track page view
    if (window.gtag) {
      window.gtag('event', 'session_timeout', {
        session_id: sessionDetails.sessionId
      });
    }

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  const handleAutoRedirect = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  const handleLogin = () => {
    // Store return URL before redirecting
    sessionStorage.setItem('returnUrl', window.location.pathname);
    window.location.href = '/login';
  };

  const handleContinueAsGuest = () => {
    window.location.href = '/';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const securityTips = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'Always Log Out',
      description: 'Log out when finished, especially on shared devices.'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Use Strong Passwords',
      description: 'Create unique passwords for better account security.'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Enable Auto-Lock',
      description: 'Set your device to lock automatically when idle.'
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'Verify Login Attempts',
      description: 'Check your email for suspicious login notifications.'
    }
  ];

  const quickActions = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'View Cart',
      description: 'Check saved items',
      action: () => window.location.href = '/cart',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: 'Home',
      description: 'Browse products',
      action: handleContinueAsGuest,
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <User className="w-6 h-6" />,
      title: 'My Orders',
      description: 'Track purchases',
      action: handleLogin,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const reasons = [
    {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      title: 'Security',
      description: 'Protects your account from unauthorized access'
    },
    {
      icon: <Lock className="w-5 h-5 text-green-600" />,
      title: 'Privacy',
      description: 'Keeps your personal information safe'
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
      title: 'Best Practice',
      description: 'Industry standard for online security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">OS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-500">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <button
              onClick={handleContinueAsGuest}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Session Expired Icon and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Session Expired
          </h1>
          <p className="text-lg text-gray-600">
            Your session has timed out due to inactivity
          </p>
        </div>

        {/* Auto-Redirect Countdown */}
        {autoRefreshEnabled && countdown > 0 && !isRedirecting && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Auto-Redirect Enabled</h3>
                    <p className="text-sm text-gray-600">Taking you to login page</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoRefreshEnabled(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${(countdown / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 min-w-[80px] text-right">
                  {formatTime(countdown)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Redirecting State */}
        {isRedirecting && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Redirecting...</h3>
              <p className="text-gray-600">Taking you to the login page</p>
            </div>
          </div>
        )}

        {/* Session Information Card */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex items-start space-x-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  What Happened?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For your security, we automatically log you out after <strong>{sessionDetails.timeoutDuration}</strong> of inactivity. 
                  This helps protect your account and personal information from unauthorized access.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-900 flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Any unsaved changes may have been lost. Please log in again to continue where you left off.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Session Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Session ID</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{sessionDetails.sessionId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Last Activity</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(sessionDetails.lastActivity)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Timeout Duration</p>
                  <p className="text-sm font-medium text-gray-900">{sessionDetails.timeoutDuration}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Device</p>
                  <p className="text-sm font-medium text-gray-900">{sessionDetails.device}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">IP Address</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{sessionDetails.ipAddress}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900">{sessionDetails.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What Would You Like to Do?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleLogin}
                className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg group"
              >
                <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Log In Again</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleContinueAsGuest}
                className="flex items-center justify-center space-x-3 bg-white text-gray-700 px-6 py-4 rounded-lg font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Continue as Guest</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? 
                <a href="/register" className="text-blue-600 hover:text-blue-800 font-semibold ml-1 transition-colors">
                  Sign Up Free
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all group text-left"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Why Sessions Expire */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
              Why Do Sessions Expire?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reasons.map((reason, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    {reason.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{reason.title}</h4>
                  <p className="text-sm text-gray-600">{reason.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Important Note</h4>
                  <p className="text-sm text-yellow-800">
                    Sessions expire to protect your account on shared or public devices. Always log out manually 
                    when using computers in public spaces like cafes or libraries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 sm:p-8 text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Security Tips
            </h3>
            <p className="text-blue-100 mb-6">
              Keep your account secure with these best practices
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityTips.map((tip, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{tip.title}</h4>
                      <p className="text-sm text-blue-100">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Having Trouble Logging Back In?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Clear Browser Cache</h4>
                  <p className="text-sm text-gray-600">Clear your browser's cache and cookies, then try logging in again.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Forgot Password?</h4>
                  <p className="text-sm text-gray-600">
                    Use the "Forgot Password" link on the login page to reset your password.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Account Locked?</h4>
                  <p className="text-sm text-gray-600">
                    Multiple failed login attempts may lock your account. Contact support if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is ready to assist you with any login or account issues.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="mailto:support@oshocksjunior.co.ke"
                className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">Email Support</span>
                  <span className="text-sm text-gray-600">support@oshocksjunior.co.ke</span>
                </div>
              </a>

              <a
                href="tel:+254712345678"
                className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 block">Call Us</span>
                  <span className="text-sm text-gray-600">+254 712 345 678</span>
                </div>
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Reference Session ID <span className="font-mono font-semibold text-gray-900">{sessionDetails.sessionId}</span> when contacting support
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Your shopping cart and wishlist items are saved and will be available after you log in.
          </p>
          <p className="text-sm text-gray-500">
            Session timeout helps protect your account security and privacy.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4">
              <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/security" className="hover:text-blue-600 transition-colors">Security</a>
              <span>•</span>
              <a href="/help" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SessionTimeoutPage;