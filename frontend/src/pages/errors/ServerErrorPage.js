import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  Server,
  ShoppingBag,
  Bike,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ServerErrorPage = () => {
  const [errorCode, setErrorCode] = useState('ERR_500_' + Date.now().toString(36).toUpperCase());
  const [timeStamp, setTimeStamp] = useState(new Date().toLocaleString());
  const [countdown, setCountdown] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoRefresh && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoRefresh && countdown === 0) {
      window.location.reload();
    }
  }, [countdown, autoRefresh]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleCopyError = () => {
    const errorDetails = `Error Code: ${errorCode}\nTimestamp: ${timeStamp}\nURL: ${window.location.href}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickActions = [
    {
      title: 'Refresh Page',
      description: 'Try reloading the page',
      icon: <RefreshCw className="w-6 h-6" />,
      action: handleRefresh,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Go to Homepage',
      description: 'Start from the beginning',
      icon: <Home className="w-6 h-6" />,
      action: () => window.location.href = '/',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Contact Support',
      description: 'Get immediate help',
      icon: <MessageCircle className="w-6 h-6" />,
      action: () => window.location.href = '/contact',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  const commonIssues = [
    {
      title: 'Temporary Server Issue',
      description: 'Our servers might be experiencing high traffic. Please wait a moment and try again.',
      icon: <Server className="w-5 h-5 text-orange-500" />
    },
    {
      title: 'Maintenance in Progress',
      description: 'We might be updating our systems to serve you better. This usually takes just a few minutes.',
      icon: <Clock className="w-5 h-5 text-blue-500" />
    },
    {
      title: 'Connection Problem',
      description: 'There might be a temporary connection issue between your device and our servers.',
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  ];

  const alternativeActions = [
    { name: 'Browse Categories', link: '/categories', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'View Your Cart', link: '/cart', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Track Orders', link: '/orders', icon: <Bike className="w-4 h-4" /> },
    { name: 'Visit Store', link: '/locations', icon: <Home className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, orange 1px, transparent 1px),
                           radial-gradient(circle at 80% 80%, orange 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 rounded-lg p-2">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-300">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-500/20 backdrop-blur-sm rounded-full mb-6 animate-pulse border-4 border-red-500/30">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-bold text-white mb-4">500</h1>
          <h2 className="text-2xl sm:text-4xl font-semibold text-white mb-3">Server Error</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Oops! Something went wrong on our end. Our team has been notified and we're working to fix this issue.
            Don't worry, your data is safe!
          </p>

          {/* Error Code Badge */}
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Error Code:</span>
              <span className="text-white font-mono font-semibold">{errorCode}</span>
            </div>
            <button
              onClick={handleCopyError}
              className="text-orange-400 hover:text-orange-300 transition-colors"
              title="Copy error details"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Auto-refresh Countdown */}
        {autoRefresh && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-white">Auto-refreshing in {countdown} seconds...</span>
                </div>
                <button
                  onClick={() => setAutoRefresh(false)}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/20 rounded-full p-4">
                  {action.icon}
                </div>
                <h3 className="text-xl font-bold">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Common Issues Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">What Might Have Happened?</h3>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {issue.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">{issue.title}</h4>
                      <p className="text-gray-400 text-sm">{issue.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Try These Instead</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {alternativeActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = action.link}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-xl p-4 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="text-gray-400 group-hover:text-orange-500 transition-colors">
                      {action.icon}
                    </div>
                    <span className="text-white text-sm font-medium group-hover:text-orange-500 transition-colors">
                      {action.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Details Accordion */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full px-8 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-white font-semibold">Technical Details</span>
              {showTechnicalDetails ? 
                <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </button>
            
            {showTechnicalDetails && (
              <div className="px-8 py-6 border-t border-white/10 bg-black/20">
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error Code:</span>
                    <span className="text-white">{errorCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-white">{timeStamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">URL:</span>
                    <span className="text-white truncate ml-4">{window.location.href}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Browser:</span>
                    <span className="text-white">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-200 text-xs">
                    💡 Tip: Share this error code with our support team for faster assistance
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl shadow-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Need Immediate Assistance?</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Our support team is available 24/7 to help you. If this error persists, please contact us 
              and provide the error code above for faster resolution.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Phone className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Call Us</p>
                <p className="text-orange-100 text-xs">+254 700 000 000</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Mail className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Email Us</p>
                <p className="text-orange-100 text-xs">support@oshocksjunior.co.ke</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <MessageCircle className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Live Chat</p>
                <p className="text-orange-100 text-xs">Available 24/7</p>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Contact Support Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-black/30 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <p className="text-gray-500 text-xs mt-2">
              We apologize for the inconvenience. Our team is working to resolve this issue.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServerErrorPage;
