import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Home, 
  ArrowLeft, 
  Mail, 
  Phone,
  Bike,
  Lock,
  User,
  Crown,
  Store,
  Settings,
  AlertTriangle,
  HelpCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';

const ForbiddenPage = () => {
  const [userRole] = useState('customer'); // Could be: customer, vendor, admin
  const [requestedResource] = useState(window.location.pathname);

  const rolePermissions = {
    customer: [
      { icon: <User className="w-5 h-5" />, text: 'Browse and purchase products', allowed: true },
      { icon: <User className="w-5 h-5" />, text: 'Manage personal orders', allowed: true },
      { icon: <User className="w-5 h-5" />, text: 'Add items to wishlist', allowed: true },
      { icon: <Lock className="w-5 h-5" />, text: 'Access vendor dashboard', allowed: false },
      { icon: <Lock className="w-5 h-5" />, text: 'Manage other users', allowed: false },
      { icon: <Lock className="w-5 h-5" />, text: 'View admin analytics', allowed: false }
    ],
    vendor: [
      { icon: <Store className="w-5 h-5" />, text: 'Manage your products', allowed: true },
      { icon: <Store className="w-5 h-5" />, text: 'View your sales', allowed: true },
      { icon: <Store className="w-5 h-5" />, text: 'Process your orders', allowed: true },
      { icon: <Lock className="w-5 h-5" />, text: 'Access other vendor data', allowed: false },
      { icon: <Lock className="w-5 h-5" />, text: 'Modify platform settings', allowed: false },
      { icon: <Lock className="w-5 h-5" />, text: 'Manage all users', allowed: false }
    ]
  };

  const accountTypes = [
    {
      type: 'Customer',
      icon: <User className="w-8 h-8" />,
      color: 'bg-blue-500',
      description: 'Browse and purchase products',
      features: ['Shop all products', 'Track orders', 'Save favorites', 'Write reviews']
    },
    {
      type: 'Vendor',
      icon: <Store className="w-8 h-8" />,
      color: 'bg-purple-500',
      description: 'Sell products on our platform',
      features: ['List products', 'Manage inventory', 'Process orders', 'View analytics']
    },
    {
      type: 'Admin',
      icon: <Crown className="w-8 h-8" />,
      color: 'bg-orange-500',
      description: 'Platform management access',
      features: ['Manage all vendors', 'Platform settings', 'User management', 'Full analytics']
    }
  ];

  const commonReasons = [
    {
      icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
      title: 'Insufficient Permissions',
      description: 'Your account type doesn\'t have access to this resource'
    },
    {
      icon: <Lock className="w-5 h-5 text-yellow-500" />,
      title: 'Role Restriction',
      description: 'This feature requires vendor or admin privileges'
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      title: 'Account Limitation',
      description: 'Your account may need verification or upgrade'
    }
  ];

  const quickActions = [
    {
      title: 'Go Back',
      icon: <ArrowLeft className="w-5 h-5" />,
      action: () => window.history.back(),
      color: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      title: 'Go Home',
      icon: <Home className="w-5 h-5" />,
      action: () => window.location.href = '/',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: 'Contact Support',
      icon: <Mail className="w-5 h-5" />,
      action: () => window.location.href = '/contact',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
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
              <span className="text-sm text-gray-600">Logged in as:</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6 relative">
            <ShieldAlert className="w-16 h-16 text-red-500" />
            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2 animate-pulse">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-4">403</h1>
          <h2 className="text-2xl sm:text-4xl font-semibold text-gray-800 mb-3">Access Forbidden</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
            You don't have permission to access this resource. Your account type doesn't include the necessary privileges for this action.
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Requested: {requestedResource}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="bg-white/20 rounded-full p-4">
                  {action.icon}
                </div>
                <h3 className="text-xl font-bold">{action.title}</h3>
              </div>
            </button>
          ))}
        </div>

        {/* Why This Happened */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <HelpCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900">Why Am I Seeing This?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {commonReasons.map((reason, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-5">
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

        {/* Your Current Permissions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Current Permissions</h3>
          <div className="max-w-3xl mx-auto">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-bold text-blue-900 capitalize text-lg">{userRole} Account</h4>
                  <p className="text-blue-700 text-sm">You have standard {userRole} permissions</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {rolePermissions[userRole]?.map((permission, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    permission.allowed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={permission.allowed ? 'text-green-600' : 'text-gray-400'}>
                      {permission.icon}
                    </div>
                    <span className={`${permission.allowed ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
                      {permission.text}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    permission.allowed 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {permission.allowed ? 'Allowed' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Account Types & Access Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accountTypes.map((account, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
                  account.type.toLowerCase() === userRole 
                    ? 'border-orange-500' 
                    : 'border-gray-200'
                }`}
              >
                <div className={`${account.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    {account.icon}
                    {account.type.toLowerCase() === userRole && (
                      <span className="bg-white text-orange-500 px-3 py-1 rounded-full text-xs font-bold">
                        YOUR ROLE
                      </span>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{account.type}</h4>
                  <p className="text-white/90 text-sm">{account.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {account.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <div className="text-green-500 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Become a Vendor */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/20 rounded-lg p-3">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">Become a Vendor</h3>
            </div>
            <p className="text-purple-100 mb-6">
              Want to sell your cycling products on our platform? Apply to become a verified vendor and reach thousands of cycling enthusiasts across Kenya.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-purple-50">List unlimited products</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-purple-50">Manage your own storefront</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span className="text-purple-50">Access to seller analytics</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/become-vendor'}
              className="w-full bg-white text-purple-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Apply to Become a Vendor
            </button>
          </div>

          {/* Need Help */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <Settings className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Need Different Access?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              If you believe you should have access to this resource or need to upgrade your account permissions, please contact our support team.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Call Support</p>
                  <p className="text-sm text-gray-600">+254 700 000 000</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">support@oshocksjunior.co.ke</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/contact'}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => window.location.href = '/account/settings'}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="bg-gray-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">What Can I Do Now?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow hover:shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Go Back</span>
            </button>
            <button
              onClick={() => window.location.href = '/shop'}
              className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow hover:shadow-md transition-all"
            >
              <Bike className="w-4 h-4" />
              <span className="font-medium">Browse Products</span>
            </button>
            <button
              onClick={() => window.location.href = '/account'}
              className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow hover:shadow-md transition-all"
            >
              <User className="w-4 h-4" />
              <span className="font-medium">My Account</span>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
              }}
              className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow hover:shadow-md transition-all text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Switch Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">© 2025 Oshocks Junior Bike Shop. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-2">Protected resource - Access based on account permissions</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ForbiddenPage;