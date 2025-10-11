import { useState, useEffect } from 'react';
import { Shield, Clock, AlertTriangle, RefreshCw, Home, ArrowLeft, TrendingUp, Zap, CheckCircle, XCircle, Info, Lock, Activity, Timer, Coffee, HelpCircle } from 'lucide-react';

const RateLimitExceededPage = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canRetry, setCanRetry] = useState(false);
  const [retrying, setRetrying] = useState(false);
  
  // Rate limit details - can be passed as props in real implementation
  const rateLimitData = {
    limitType: 'API Request Limit',
    maxRequests: 100,
    currentRequests: 103,
    timeWindow: '1 hour',
    resetTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    endpoint: '/api/products/search',
    ipAddress: '192.168.1.1',
    userId: 'user_12345',
    retryAfter: 300 // seconds
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanRetry(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Track rate limit event
    if (window.gtag) {
      window.gtag('event', 'rate_limit_exceeded', {
        limit_type: rateLimitData.limitType,
        endpoint: rateLimitData.endpoint
      });
    }

    window.scrollTo(0, 0);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = async () => {
    if (!canRetry) return;
    
    setRetrying(true);
    
    // Simulate retry
    setTimeout(() => {
      setRetrying(false);
      // In real app, retry the original request
      window.location.reload();
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-KE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Rate limit types
  const limitTypes = {
    'API Request Limit': {
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'Too many API requests in a short period'
    },
    'Login Attempts': {
      icon: <Lock className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      description: 'Multiple failed login attempts detected'
    },
    'Search Queries': {
      icon: <Activity className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      description: 'Too many search requests'
    },
    'Form Submissions': {
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Exceeded form submission limit'
    }
  };

  const currentLimit = limitTypes[rateLimitData.limitType] || limitTypes['API Request Limit'];

  // Why rate limits exist
  const reasons = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Security Protection',
      description: 'Prevents abuse, spam, and malicious attacks on our platform'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Performance',
      description: 'Ensures fast and reliable service for all users'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Fair Usage',
      description: 'Guarantees equal access to resources for everyone'
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: 'System Stability',
      description: 'Maintains server health and prevents overload'
    }
  ];

  // Tips to avoid rate limits
  const tips = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Slow Down Requests',
      description: 'Add delays between consecutive requests'
    },
    {
      icon: <Coffee className="w-5 h-5" />,
      title: 'Take Breaks',
      description: 'Avoid rapid-fire clicking or refreshing'
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Use Caching',
      description: 'Store results locally to reduce requests'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Optimize Searches',
      description: 'Be specific to reduce multiple searches'
    }
  ];

  // Alternative actions
  const alternatives = [
    {
      icon: <Home className="w-6 h-6" />,
      title: 'Browse Products',
      description: 'Explore our catalog manually',
      action: () => window.location.href = '/shop',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'View Categories',
      description: 'Navigate by category',
      action: () => window.location.href = '/categories',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Popular Items',
      description: 'Check trending products',
      action: () => window.location.href = '/trending',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const progressPercentage = ((rateLimitData.retryAfter - timeLeft) / rateLimitData.retryAfter) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className={`w-24 h-24 bg-gradient-to-br ${currentLimit.color} rounded-full flex items-center justify-center shadow-lg`}>
                {currentLimit.icon}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-yellow-400"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Rate Limit Exceeded
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentLimit.description}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${currentLimit.color} rounded-full flex items-center justify-center`}>
                  <Timer className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {canRetry ? 'Ready to Retry!' : 'Please Wait'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {canRetry ? 'You can now try again' : `Rate limit resets in ${formatTime(timeLeft)}`}
                  </p>
                </div>
              </div>
              {canRetry && (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
            </div>

            {!canRetry && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${currentLimit.color} h-4 rounded-full transition-all duration-1000`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Time elapsed</span>
                  <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
                </div>
              </div>
            )}

            {canRetry && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className={`w-full bg-gradient-to-r ${currentLimit.color} text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again Now</span>
                  </>
                )}
              </button>
            )}

            {!canRetry && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Your request limit will automatically reset at <strong>{formatDateTime(rateLimitData.resetTime)}</strong>. 
                    Please wait before trying again.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rate Limit Details */}
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
                  You've exceeded the rate limit for <strong>{rateLimitData.limitType}</strong>. 
                  Our system allows a maximum of <strong>{rateLimitData.maxRequests} requests per {rateLimitData.timeWindow}</strong>, 
                  and you've made <strong>{rateLimitData.currentRequests} requests</strong>.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-blue-900 flex items-start">
                    <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>This is a temporary restriction to ensure fair usage and maintain service quality for all users.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Limit Stats */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Rate Limit Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-xs font-semibold text-red-900 uppercase">Current Usage</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{rateLimitData.currentRequests}</p>
                  <p className="text-xs text-red-700 mt-1">requests made</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-900 uppercase">Limit</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{rateLimitData.maxRequests}</p>
                  <p className="text-xs text-yellow-700 mt-1">per {rateLimitData.timeWindow}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-900 uppercase">Reset Time</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatTime(timeLeft)}</p>
                  <p className="text-xs text-blue-700 mt-1">remaining</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Endpoint</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{rateLimitData.endpoint}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">IP Address</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{rateLimitData.ipAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Rate Limits Exist */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
              Why Do Rate Limits Exist?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {reason.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{reason.title}</h4>
                      <p className="text-sm text-gray-600">{reason.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips to Avoid Rate Limits */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-xl p-6 sm:p-8 text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              Tips to Avoid Rate Limits
            </h3>
            <p className="text-blue-100 mb-6">
              Follow these best practices to stay within our usage limits
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
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

        {/* Alternative Actions */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              While You Wait
            </h3>
            <p className="text-gray-600 mb-6">
              Explore these alternatives while your rate limit resets
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {alternatives.map((action, index) => (
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

        {/* Technical Details (for developers) */}
        <div className="max-w-4xl mx-auto">
          <details className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Technical Details</span>
              </span>
              <span className="text-sm text-gray-500">Click to expand</span>
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-900 rounded-lg p-4 text-gray-100 font-mono text-sm overflow-x-auto">
                <pre>{JSON.stringify({
                  error: "rate_limit_exceeded",
                  limit_type: rateLimitData.limitType,
                  max_requests: rateLimitData.maxRequests,
                  current_requests: rateLimitData.currentRequests,
                  time_window: rateLimitData.timeWindow,
                  retry_after: rateLimitData.retryAfter,
                  reset_time: rateLimitData.resetTime.toISOString(),
                  endpoint: rateLimitData.endpoint,
                  ip_address: rateLimitData.ipAddress
                }, null, 2)}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                HTTP Status Code: <span className="font-semibold text-gray-900">429 Too Many Requests</span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Retry-After Header: <span className="font-semibold text-gray-900">{rateLimitData.retryAfter} seconds</span>
              </p>
            </div>
          </details>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Rate limits help us maintain a fast and reliable service for everyone.
          </p>
          <p className="text-sm text-gray-500">
            If you believe this limit is incorrect, please contact our support team.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <div className="flex items-center justify-center space-x-4">
              <a href="/api-docs" className="hover:text-blue-600 transition-colors">API Documentation</a>
              <span>•</span>
              <a href="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="/help" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RateLimitExceededPage;