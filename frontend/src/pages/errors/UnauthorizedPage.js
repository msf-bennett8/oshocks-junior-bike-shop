import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  LogIn, 
  UserPlus, 
  Home, 
  ShoppingBag, 
  Shield,
  Key,
  AlertCircle,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
  Bike,
  Heart,
  Package,
  Settings,
  CreditCard,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

const UnauthorizedPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(null);
  const [redirectUrl] = useState(window.location.pathname);
  const [timeLeft, setTimeLeft] = useState(null);

  // Simulate checking if user was recently logged out
  useEffect(() => {
    const logoutTime = localStorage.getItem('lastLogout');
    if (logoutTime) {
      const timeSince = Date.now() - parseInt(logoutTime);
      if (timeSince < 300000) { // 5 minutes
        setTimeLeft(Math.ceil((300000 - timeSince) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleLogin = () => {
    setLoginAttempt('processing');
    setTimeout(() => {
      setLoginAttempt('success');
      setTimeout(() => {
        window.location.href = '/login?redirect=' + encodeURIComponent(redirectUrl);
      }, 1000);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const protectedFeatures = [
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Order History',
      description: 'View and track all your orders',
      color: 'bg-blue-500'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Wishlist',
      description: 'Save your favorite products',
      color: 'bg-red-500'
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      color: 'bg-purple-500'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Saved Payment Methods',
      description: 'Quick checkout with saved cards',
      color: 'bg-green-500'
    }
  ];

  const accessReasons = [
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: 'Not Logged In',
      description: 'You need to sign in to access this page'
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: 'Session Expired',
      description: 'Your login session has expired for security'
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      title: 'Insufficient Permissions',
      description: 'Your account type doesn\'t have access to this resource'
    }
  ];

  const memberBenefits = [
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Faster checkout process' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Order tracking and history' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Exclusive member discounts' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Wishlist and saved items' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Personalized recommendations' },
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Early access to new products' }
  ];

  const quickActions = [
    {
      title: 'Browse as Guest',
      description: 'Continue shopping without logging in',
      icon: <ShoppingBag className="w-5 h-5" />,
      link: '/shop',
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      title: 'Go to Homepage',
      description: 'Start from the beginning',
      icon: <Home className="w-5 h-5" />,
      link: '/',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50">
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
            <button 
              onClick={() => window.location.href = '/'}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Alert Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-orange-100 rounded-full mb-6 relative">
            <Lock className="w-16 h-16 text-orange-500" />
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 animate-pulse">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 mb-4">401</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-3">Access Denied</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
            You need to be logged in to access this page. Please sign in to continue or create a new account to get started.
          </p>

          {timeLeft && timeLeft > 0 && (
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Session expired {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} ago</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-orange-500 rounded-lg p-2">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sign In</h3>
            </div>

            {loginAttempt === 'success' && (
              <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 text-sm">Redirecting to login...</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  onClick={() => window.location.href = '/forgot-password'}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loginAttempt === 'processing'}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loginAttempt === 'processing' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#FC4C02" d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Strava</span>
              </button>
            </div>
          </div>

          {/* Create Account Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 rounded-lg p-2">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">New to Oshocks?</h3>
            </div>

            <p className="text-orange-100 mb-6">
              Create an account to unlock exclusive features and enjoy a personalized shopping experience.
            </p>

            <div className="space-y-3 mb-6">
              {memberBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-white">
                    {benefit.icon}
                  </div>
                  <span className="text-orange-50">{benefit.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.location.href = '/register?redirect=' + encodeURIComponent(redirectUrl)}
              className="w-full bg-white text-orange-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Create Free Account</span>
            </button>

            <p className="text-orange-100 text-xs text-center mt-4">
              Free to join • No credit card required • Instant access
            </p>
          </div>
        </div>

        {/* Protected Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Features Requiring Authentication
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {protectedFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
                <div className="mt-4 flex items-center text-orange-500 text-sm font-medium">
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Login Required</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Access Denied */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900">Why Can't I Access This Page?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accessReasons.map((reason, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {reason.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{reason.title}</h4>
                    <p className="text-gray-600 text-sm">{reason.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => window.location.href = action.link}
              className={`${action.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-between group`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-lg p-3">
                  {action.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-lg">{action.title}</h4>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-100 text-center">
          <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Security Matters</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            We protect your account with industry-standard security measures. If you're having trouble accessing 
            your account or have security concerns, our support team is here to help.
          </p>
          <button
            onClick={() => window.location.href = '/contact'}
            className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-flex items-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Secure authentication powered by industry standards</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnauthorizedPage;