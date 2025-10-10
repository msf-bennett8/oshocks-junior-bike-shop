import { useState, useEffect } from 'react';
import { Database, AlertTriangle, RefreshCw, Home, ArrowLeft, Server, Activity, XCircle, Clock, Info, HelpCircle, Zap, Shield, CheckCircle, Phone, Mail, FileText, TrendingDown, AlertCircle, Users, ShoppingCart, Package, CreditCard, BarChart3, Globe, Wifi, WifiOff, Download, ExternalLink, Bell, BellOff } from 'lucide-react';

const DatabaseErrorPage = () => {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [timeUntilRetry, setTimeUntilRetry] = useState(30);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [affectedUsers, setAffectedUsers] = useState(0);

  // Enhanced database error details
  const errorData = {
    errorType: 'Connection Timeout',
    errorCode: 'DB_CONNECTION_TIMEOUT',
    timestamp: new Date().toISOString(),
    database: 'MySQL 8.0.35',
    host: 'db.oshocksjunior.co.ke',
    port: 3306,
    affectedServices: ['Product Catalog', 'User Accounts', 'Shopping Cart', 'Order History', 'Vendor Dashboard', 'Payment Processing'],
    severity: 'High',
    estimatedResolution: '5-10 minutes',
    incidentId: 'INC-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    lastSuccessfulConnection: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    connectionPool: {
      active: 0,
      idle: 0,
      waiting: 12,
      max: 50,
      timeout: 5000
    },
    region: 'Nairobi, Kenya',
    server: 'db-primary-nbo-01',
    environment: 'Production',
    affectedRegions: ['Nairobi', 'Mombasa', 'Kisumu'],
    errorMessage: 'Connection acquisition timeout after 5000ms',
    stackTrace: 'at Connection.connect() in mysql2/lib/connection.js:85'
  };

  useEffect(() => {
    // Simulate affected users counter
    const userCounter = setInterval(() => {
      setAffectedUsers(prev => Math.min(prev + Math.floor(Math.random() * 5), 127));
    }, 2000);

    // Simulate response time monitoring
    const responseMonitor = setInterval(() => {
      setResponseTime(Math.floor(Math.random() * 5000) + 3000);
    }, 3000);

    // Check connection status periodically
    const statusCheck = setInterval(() => {
      const isConnected = Math.random() > 0.7;
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    }, 10000);

    // Auto-retry countdown
    const timer = setInterval(() => {
      if (autoRetryEnabled) {
        setTimeUntilRetry(prev => {
          if (prev <= 1) {
            handleRetry();
            return 30;
          }
          return prev - 1;
        });
      }
    }, 1000);

    // Track error event
    if (window.gtag) {
      window.gtag('event', 'database_error', {
        error_type: errorData.errorType,
        error_code: errorData.errorCode,
        incident_id: errorData.incidentId,
        affected_services: errorData.affectedServices.length
      });
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    window.scrollTo(0, 0);

    return () => {
      clearInterval(userCounter);
      clearInterval(responseMonitor);
      clearInterval(statusCheck);
      clearInterval(timer);
    };
  }, [autoRetryEnabled]);

  const handleRetry = async () => {
    setRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Simulate retry attempt
    setTimeout(() => {
      setRetrying(false);
      const success = Math.random() > 0.5;
      
      if (success) {
        // Show success notification
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Connection Restored', {
            body: 'Database connection has been successfully restored',
            icon: '/logo.png'
          });
        }
        window.history.back();
      } else {
        setTimeUntilRetry(30);
      }
    }, 2000);
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
        }
      });
    } else {
      setNotificationsEnabled(false);
    }
  };

  const downloadErrorReport = () => {
    const report = {
      ...errorData,
      retryCount,
      responseTime,
      affectedUsers,
      reportGeneratedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${errorData.incidentId}.json`;
    a.click();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    return `${seconds}s`;
  };

  // Error types with detailed info
  const errorTypes = {
    'Connection Timeout': {
      icon: <Clock className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      description: 'The database server is not responding within the expected time',
      possibleCauses: [
        'High database load from concurrent requests',
        'Network connectivity issues or latency',
        'Database server undergoing maintenance',
        'Connection pool exhaustion',
        'Firewall or security group blocking traffic'
      ],
      troubleshooting: [
        'Wait for automatic retry',
        'Check your internet connection',
        'Clear browser cache and cookies',
        'Try accessing from a different network'
      ]
    },
    'Connection Refused': {
      icon: <XCircle className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      description: 'Unable to establish a connection to the database server',
      possibleCauses: [
        'Database server is down or restarting',
        'Firewall blocking connection',
        'Incorrect connection credentials',
        'Database port not accessible'
      ],
      troubleshooting: [
        'Wait for server restart to complete',
        'Contact system administrator',
        'Check server status page',
        'Verify network connectivity'
      ]
    },
    'Query Timeout': {
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      description: 'A database query took too long to execute',
      possibleCauses: [
        'Complex query execution',
        'Missing database indexes',
        'Large dataset processing',
        'Database lock contention'
      ],
      troubleshooting: [
        'Simplify your search criteria',
        'Try again in a few minutes',
        'Contact support if issue persists',
        'Use basic search instead of advanced filters'
      ]
    },
    'Connection Lost': {
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      description: 'The connection to the database was unexpectedly terminated',
      possibleCauses: [
        'Network interruption',
        'Database restart',
        'Idle connection timeout',
        'Server resource limits'
      ],
      troubleshooting: [
        'Refresh the page',
        'Check your internet connection',
        'Clear browser cache',
        'Try again in a few moments'
      ]
    }
  };

  const currentError = errorTypes[errorData.errorType] || errorTypes['Connection Timeout'];

  // Enhanced service status
  const services = [
    { name: 'Web Application', status: 'operational', icon: <Activity className="w-4 h-4" />, uptime: '99.9%' },
    { name: 'API Gateway', status: 'operational', icon: <Server className="w-4 h-4" />, uptime: '99.8%' },
    { name: 'Database (MySQL)', status: 'degraded', icon: <Database className="w-4 h-4" />, uptime: '95.2%' },
    { name: 'Redis Cache', status: 'operational', icon: <Zap className="w-4 h-4" />, uptime: '99.9%' },
    { name: 'Cloudinary CDN', status: 'operational', icon: <FileText className="w-4 h-4" />, uptime: '100%' },
    { name: 'M-Pesa Gateway', status: 'operational', icon: <CreditCard className="w-4 h-4" />, uptime: '99.5%' },
    { name: 'Stripe Payments', status: 'operational', icon: <Shield className="w-4 h-4" />, uptime: '99.7%' },
    { name: 'Email Service', status: 'operational', icon: <Mail className="w-4 h-4" />, uptime: '99.6%' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Enhanced available actions
  const availableActions = [
    {
      icon: <Home className="w-6 h-6" />,
      title: 'Browse Static Pages',
      description: 'View our about page and contact information',
      action: () => window.location.href = '/about',
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'View Cached Content',
      description: 'Access recently viewed pages from cache',
      action: () => window.location.href = '/cache',
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Contact Support',
      description: 'Speak with our team directly',
      action: () => window.location.href = '/contact',
      color: 'from-purple-500 to-purple-600',
      available: true
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Download Error Report',
      description: 'Get technical details for support',
      action: downloadErrorReport,
      color: 'from-indigo-500 to-indigo-600',
      available: true
    }
  ];

  // Quick recovery tips
  const recoveryTips = [
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Wait and Retry',
      description: 'Database connections usually restore within minutes'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Check Back Later',
      description: 'Bookmark this page and return in 5-10 minutes'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Monitor Status',
      description: 'Follow our status page for real-time updates'
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Get Notified',
      description: 'Enable notifications for recovery updates'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
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
                onClick={toggleNotifications}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  notificationsEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
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
              <div className={`w-24 h-24 bg-gradient-to-br ${currentError.color} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                <Database className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center border-4 border-white">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Database Connection Error
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            We're experiencing technical difficulties connecting to our database
          </p>
          
          {/* Real-time metrics */}
          <div className="flex justify-center items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">{affectedUsers} users affected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600">Response time: {responseTime}ms</span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-gray-600 capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>

        {/* Auto-Retry Status */}
        {autoRetryEnabled && !retrying && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Auto-Retry Active</h3>
                    <p className="text-sm text-gray-600">Attempting to reconnect automatically</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoRetryEnabled(false)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Disable
                </button>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Next retry in:</span>
                <span className="text-2xl font-bold text-blue-600">{formatTime(timeUntilRetry)}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-1000"
                  style={{ width: `${((30 - timeUntilRetry) / 30) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Retry attempt #{retryCount + 1}</p>
            </div>
          </div>
        )}

        {/* Retrying State */}
        {retrying && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Attempting to Reconnect...</h3>
              <p className="text-gray-600">Please wait while we try to restore the connection</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error Details Card */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6 sm:p-8">
            <div className="flex items-start space-x-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  {currentError.icon}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {errorData.errorType}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {currentError.description}
                </p>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-orange-900 font-semibold mb-2">Possible Causes:</p>
                      <ul className="text-sm text-orange-800 space-y-1">
                        {currentError.possibleCauses.map((cause, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Troubleshooting steps */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-semibold mb-2">What You Can Try:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {currentError.troubleshooting.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Details */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Error Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Incident ID</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{errorData.incidentId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Error Code</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{errorData.errorCode}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Database</p>
                  <p className="text-sm font-medium text-gray-900">{errorData.database}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Host</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{errorData.host}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Port</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{errorData.port}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Server</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{errorData.server}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Region</p>
                  <p className="text-sm font-medium text-gray-900">{errorData.region}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Environment</p>
                  <p className="text-sm font-medium text-gray-900">{errorData.environment}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(errorData.timestamp)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Severity</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {errorData.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Affected Services
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {errorData.affectedServices.map((service, index) => (
                  <div key={index} className="text-sm text-yellow-800 flex items-center">
                    <XCircle className="w-3 h-3 mr-2" />
                    {service}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-xs text-yellow-700 mb-3">
                  Estimated resolution time: <strong>{errorData.estimatedResolution}</strong>
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-yellow-600">Active</p>
                    <p className="text-lg font-bold text-yellow-900">{errorData.connectionPool.active}</p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600">Idle</p>
                    <p className="text-lg font-bold text-yellow-900">{errorData.connectionPool.idle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600">Waiting</p>
                    <p className="text-lg font-bold text-red-600">{errorData.connectionPool.waiting}</p>
                  </div>
                  <div>
                    <p className="text-xs text-yellow-600">Max Pool</p>
                    <p className="text-lg font-bold text-yellow-900">{errorData.connectionPool.max}</p>
                  </div>
                </div>
              </div>
              
              {/* Affected Regions */}
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-xs text-yellow-700 mb-2 flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  Affected Regions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {errorData.affectedRegions.map((region, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-200 text-yellow-900">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Retry Button */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Retry Connection
            </h3>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {retrying ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Retrying Connection...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Reconnecting Now</span>
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 text-center mt-3">
              Click to manually attempt reconnection to the database
            </p>
          </div>
        </div>

        {/* System Status */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                System Status
              </div>
              <a
                href="/status"
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center transition-colors"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </h3>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${service.status === 'operational' ? 'bg-green-100' : service.status === 'degraded' ? 'bg-yellow-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                      {service.icon}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900 block">{service.name}</span>
                      <span className="text-xs text-gray-500">Uptime: {service.uptime}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                    {service.status === 'operational' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {service.status === 'degraded' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {service.status === 'down' && <XCircle className="w-3 h-3 mr-1" />}
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recovery Tips */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 sm:p-8 text-white">
            <h3 className="text-2xl font-bold mb-2 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              What Can You Do?
            </h3>
            <p className="text-blue-100 mb-6">
              Follow these steps while we work to restore the connection
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recoveryTips.map((tip, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
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

        {/* Available Actions */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What You Can Still Do
            </h3>
            <p className="text-gray-600 mb-6">
              These features are still available while we restore database connectivity
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  disabled={!action.available}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">{action.title}</h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Real-Time Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Affected Users</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-900">{affectedUsers}</p>
                <p className="text-xs text-blue-700 mt-1">Currently experiencing issues</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900">Response Time</span>
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-900">{responseTime}ms</p>
                <p className="text-xs text-orange-700 mt-1">Current latency</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900">Retry Attempts</span>
                  <RefreshCw className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">{retryCount}</p>
                <p className="text-xs text-green-700 mt-1">Automatic reconnection tries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Immediate Assistance?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our technical support team if this issue persists or is urgent.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                  <span className="font-semibold text-gray-900 block">Emergency Line</span>
                  <span className="text-sm text-gray-600">+254 712 345 678</span>
                </div>
              </a>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <a href="/help" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <HelpCircle className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">Help Center</span>
              </a>
              <a href="/status" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Activity className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">Status Page</span>
              </a>
              <a href="/faq" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Info className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">FAQ</span>
              </a>
              <a href="/community" className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-xs text-gray-700 font-medium">Community</span>
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Reference Incident ID <span className="font-mono font-semibold text-gray-900">{errorData.incidentId}</span> when contacting support
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-600" />
                <span>Technical Details (For Developers)</span>
              </span>
              <span className="text-sm text-gray-500">
                {showTechnicalDetails ? 'Click to collapse' : 'Click to expand'}
              </span>
            </button>
            
            {showTechnicalDetails && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="mt-4">
                  <div className="bg-gray-900 rounded-lg p-4 text-gray-100 font-mono text-sm overflow-x-auto">
                    <pre>{JSON.stringify({
                      error: "database_connection_error",
                      error_type: errorData.errorType,
                      error_code: errorData.errorCode,
                      database: errorData.database,
                      host: errorData.host,
                      port: errorData.port,
                      server: errorData.server,
                      environment: errorData.environment,
                      timestamp: errorData.timestamp,
                      last_successful_connection: errorData.lastSuccessfulConnection,
                      affected_services: errorData.affectedServices,
                      affected_regions: errorData.affectedRegions,
                      severity: errorData.severity,
                      incident_id: errorData.incidentId,
                      estimated_resolution: errorData.estimatedResolution,
                      retry_count: retryCount,
                      connection_pool: errorData.connectionPool,
                      error_message: errorData.errorMessage,
                      stack_trace: errorData.stackTrace,
                      metrics: {
                        affected_users: affectedUsers,
                        response_time_ms: responseTime,
                        connection_status: connectionStatus
                      }
                    }, null, 2)}</pre>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        HTTP Status Code: <span className="font-semibold text-gray-900">503 Service Unavailable</span>
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Connection String: <span className="font-mono text-gray-900">mysql://{errorData.host}:{errorData.port}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Laravel Environment: <span className="font-mono text-gray-900">{errorData.environment}</span>
                      </p>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-sm font-semibold text-red-900 mb-2">Error Message:</p>
                      <p className="text-sm font-mono text-red-800">{errorData.errorMessage}</p>
                      <p className="text-xs font-mono text-red-700 mt-2">{errorData.stackTrace}</p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={downloadErrorReport}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Full Report</span>
                      </button>
                      <button
                        onClick={() => {
                          const technicalData = JSON.stringify({
                            incident_id: errorData.incidentId,
                            error_code: errorData.errorCode,
                            timestamp: errorData.timestamp
                          }, null, 2);
                          navigator.clipboard.writeText(technicalData);
                        }}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Copy to Clipboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-700 mb-3">
              <strong>System Status:</strong> Our engineering team has been automatically notified and is working to resolve this issue.
            </p>
            <p className="text-xs text-gray-600">
              Last updated: {formatDateTime(new Date().toISOString())} • Incident ID: {errorData.incidentId}
            </p>
            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="/status" className="hover:text-gray-700 transition-colors">System Status</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseErrorPage;
