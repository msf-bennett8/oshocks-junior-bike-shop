import React, { useState, useEffect } from 'react';
import { 
  WifiOff,
  RefreshCw,
  Bike,
  ShoppingBag,
  Heart,
  Package,
  CheckCircle,
  XCircle,
  Signal,
  Smartphone,
  Router,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [cachedData, setCachedData] = useState({
    cart: 3,
    wishlist: 12,
    viewedProducts: 8
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setRetrying(true);
    setLastChecked(new Date());
    
    setTimeout(() => {
      setRetrying(false);
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 2000);
  };

  const troubleshootingSteps = [
    {
      icon: <Signal className="w-5 h-5" />,
      title: 'Check Your Connection',
      steps: [
        'Make sure Wi-Fi or mobile data is turned on',
        'Try toggling Airplane mode on and off',
        'Check if other apps/websites are working'
      ]
    },
    {
      icon: <Router className="w-5 h-5" />,
      title: 'Router Issues',
      steps: [
        'Restart your Wi-Fi router',
        'Move closer to your router',
        'Check if other devices can connect'
      ]
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: 'Mobile Data',
      steps: [
        'Ensure you have an active data bundle',
        'Check your network signal strength',
        'Try switching between 4G/3G/2G'
      ]
    }
  ];

  const cachedFeatures = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: 'Shopping Cart',
      count: cachedData.cart,
      description: 'Items saved in your cart',
      available: true
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Wishlist',
      count: cachedData.wishlist,
      description: 'Products you favorited',
      available: true
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Recently Viewed',
      count: cachedData.viewedProducts,
      description: 'Products you looked at',
      available: true
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Order History',
      count: 0,
      description: 'Requires internet connection',
      available: false
    }
  ];

  const offlineTips = [
    'Your shopping cart and wishlist are saved locally',
    'You can browse previously viewed products',
    'Reconnect to complete your purchase',
    'All your data will sync when you\'re back online'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 rounded-lg p-2">
                <Bike className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Oshocks Junior Bike Shop</h1>
                <p className="text-xs text-gray-500">Kenya's Premier Cycling Marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <WifiOff className="w-6 h-6 text-red-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-sm text-red-600 font-medium hidden sm:inline">Offline</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Connection Status Alert */}
        {isOnline ? (
          <div className="bg-green-100 border-2 border-green-500 rounded-xl p-6 mb-8 text-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Connection Restored!</h3>
            <p className="text-green-700">Reloading page...</p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6 relative">
              <WifiOff className="w-16 h-16 text-red-500" />
              <div className="absolute -top-2 -right-2">
                <div className="relative">
                  <div className="w-6 h-6 bg-red-500 rounded-full animate-ping absolute"></div>
                  <div className="w-6 h-6 bg-red-500 rounded-full relative"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-4">No Internet Connection</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              It looks like you're not connected to the internet. Please check your connection and try again.
            </p>

            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
            </div>

            <button
              onClick={handleRetry}
              disabled={retrying}
              className="bg-orange-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Checking...' : 'Retry Connection'}</span>
            </button>
          </div>
        )}

        {/* Cached Data Available */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Download className="w-6 h-6 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-900">Available Offline</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Don't worry! Some of your data is saved locally and available while offline.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cachedFeatures.map((feature, index) => (
              <div 
                key={index}
                className={`rounded-xl p-6 border-2 ${
                  feature.available 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  feature.available ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                }`}>
                  {feature.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{feature.count}</span>
                  {feature.available ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Tips */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-6 h-6" />
            <span>What You Should Know</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Troubleshooting Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {troubleshootingSteps.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-orange-500 text-white p-2 rounded-lg">
                    {section.icon}
                  </div>
                  <h4 className="font-bold text-gray-900">{section.title}</h4>
                </div>
                <ul className="space-y-3">
                  {section.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-orange-500 font-bold mt-1">•</span>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Network Providers in Kenya */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <Signal className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Network Issues in Kenya?</h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            If you're experiencing persistent connectivity issues, you may want to check with your service provider:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {['Safaricom', 'Airtel', 'Telkom', 'Faiba'].map((provider, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <p className="font-semibold">{provider}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-green-100 text-sm">
            <p>Check your data bundle balance or contact customer support</p>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens When You Reconnect?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-4 mb-3">
                <RefreshCw className="w-8 h-8 text-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Auto-Sync</h4>
              <p className="text-gray-600 text-sm">Your cart and wishlist will sync automatically</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-4 mb-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">No Data Loss</h4>
              <p className="text-gray-600 text-sm">All your selections are safely stored</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 rounded-full p-4 mb-3">
                <ShoppingBag className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Continue Shopping</h4>
              <p className="text-gray-600 text-sm">Pick up right where you left off</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Your data is safe and will sync when you reconnect</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OfflinePage;