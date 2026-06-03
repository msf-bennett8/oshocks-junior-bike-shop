import React, { useState } from 'react';
import { Settings, Store, Bell, CreditCard, Truck, Mail, Shield, Globe, Image, DollarSign, Package, Users, Save, Upload, Eye, EyeOff, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Oshocks Junior Bike Shop',
    tagline: 'Kenya\'s Premier Cycling Marketplace',
    email: 'support@oshocks.co.ke',
    phone: '+254712345678',
    address: 'Kilimani, Nairobi, Kenya',
    timezone: 'Africa/Nairobi',
    currency: 'KES',
    language: 'en'
  });

  const [paymentSettings, setPaymentSettings] = useState({
    mpesaEnabled: true,
    mpesaConsumerKey: 'your_consumer_key_here',
    mpesaConsumerSecret: 'your_consumer_secret_here',
    mpesaShortcode: '174379',
    mpesaPasskey: 'your_passkey_here',
    mpesaEnvironment: 'sandbox',
    stripeEnabled: true,
    stripePublicKey: 'pk_test_xxxxxxxxxxxxx',
    stripeSecretKey: 'sk_test_xxxxxxxxxxxxx',
    flutterwaveEnabled: false,
    flutterwavePublicKey: '',
    flutterwaveSecretKey: ''
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 5000,
    flatRate: 500,
    nairobiRate: 300,
    mombasaRate: 800,
    kisumuRate: 700,
    otherCitiesRate: 1000,
    estimatedDays: '3-5'
  });

  const [emailSettings, setEmailSettings] = useState({
    provider: 'sendgrid',
    sendgridApiKey: '',
    fromEmail: 'noreply@oshocks.co.ke',
    fromName: 'Oshocks Junior Bike Shop',
    orderConfirmation: true,
    shippingUpdate: true,
    passwordReset: true,
    promotionalEmails: true
  });

  const [sellerSettings, setSellerSettings] = useState({
    commissionRate: 10,
    minProductPrice: 500,
    maxProductPrice: 500000,
    autoApproveProducts: false,
    requireShopVerification: true,
    allowMultipleShops: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrderAlert: true,
    lowStockAlert: true,
    newUserRegistration: true,
    newSellerApplication: true,
    productReview: true,
    stockThreshold: 5
  });

  const handleSave = (section) => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    console.log(`Saving ${section} settings...`);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'seller', label: 'Seller', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your marketplace configuration and preferences</p>
        </div>

        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">Settings saved successfully!</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm md:text-base">Configuration</h2>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-medium text-sm md:text-base">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              
              {activeTab === 'general' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">General Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                        <input
                          type="text"
                          value={generalSettings.siteName}
                          onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                        <input
                          type="text"
                          value={generalSettings.tagline}
                          onChange={(e) => setGeneralSettings({...generalSettings, tagline: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                        <input
                          type="email"
                          value={generalSettings.email}
                          onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={generalSettings.phone}
                          onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                      <input
                        type="text"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={generalSettings.timezone}
                          onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                          <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                          <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                          value={generalSettings.currency}
                          onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="KES">KES - Kenyan Shilling</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="sw">Swahili</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('general')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Payment Settings</h2>
                  </div>

                  <div className="space-y-8">
                    <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Smartphone className="text-green-600" size={24} />
                          <h3 className="text-lg font-semibold text-gray-900">M-Pesa (Daraja API)</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.mpesaEnabled}
                            onChange={(e) => setPaymentSettings({...paymentSettings, mpesaEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Key</label>
                            <input
                              type="text"
                              value={paymentSettings.mpesaConsumerKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, mpesaConsumerKey: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Consumer Secret</label>
                            <div className="relative">
                              <input
                                type={showSecretKey ? "text" : "password"}
                                value={paymentSettings.mpesaConsumerSecret}
                                onChange={(e) => setPaymentSettings({...paymentSettings, mpesaConsumerSecret: e.target.value})}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSecretKey(!showSecretKey)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showSecretKey ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shortcode</label>
                            <input
                              type="text"
                              value={paymentSettings.mpesaShortcode}
                              onChange={(e) => setPaymentSettings({...paymentSettings, mpesaShortcode: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Passkey</label>
                            <input
                              type="password"
                              value={paymentSettings.mpesaPasskey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, mpesaPasskey: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                            <select
                              value={paymentSettings.mpesaEnvironment}
                              onChange={(e) => setPaymentSettings({...paymentSettings, mpesaEnvironment: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="sandbox">Sandbox (Testing)</option>
                              <option value="production">Production (Live)</option>
                            </select>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                          <div>
                            <p className="text-sm text-blue-800 font-medium">M-Pesa Integration</p>
                            <p className="text-xs text-blue-700 mt-1">Obtain credentials from Safaricom Daraja Portal. Use sandbox for testing.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CreditCard className="text-purple-600" size={24} />
                          <h3 className="text-lg font-semibold text-gray-900">Stripe</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.stripeEnabled}
                            onChange={(e) => setPaymentSettings({...paymentSettings, stripeEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                            <input
                              type="text"
                              value={paymentSettings.stripePublicKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, stripePublicKey: e.target.value})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                            <div className="relative">
                              <input
                                type={showApiKey ? "text" : "password"}
                                value={paymentSettings.stripeSecretKey}
                                onChange={(e) => setPaymentSettings({...paymentSettings, stripeSecretKey: e.target.value})}
                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <DollarSign className="text-orange-600" size={24} />
                          <h3 className="text-lg font-semibold text-gray-900">Flutterwave</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentSettings.flutterwaveEnabled}
                            onChange={(e) => setPaymentSettings({...paymentSettings, flutterwaveEnabled: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Public Key</label>
                            <input
                              type="text"
                              value={paymentSettings.flutterwavePublicKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, flutterwavePublicKey: e.target.value})}
                              placeholder="FLWPUBK-xxxxxxxxxxxxx"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                            <input
                              type="password"
                              value={paymentSettings.flutterwaveSecretKey}
                              onChange={(e) => setPaymentSettings({...paymentSettings, flutterwaveSecretKey: e.target.value})}
                              placeholder="FLWSECK-xxxxxxxxxxxxx"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('payment')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Payment Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shipping Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (KSh)</label>
                      <input
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: e.target.value})}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Orders above this amount get free shipping</p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Rates by Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Flat Rate (Default)</label>
                          <input
                            type="number"
                            value={shippingSettings.flatRate}
                            onChange={(e) => setShippingSettings({...shippingSettings, flatRate: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nairobi</label>
                          <input
                            type="number"
                            value={shippingSettings.nairobiRate}
                            onChange={(e) => setShippingSettings({...shippingSettings, nairobiRate: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mombasa</label>
                          <input
                            type="number"
                            value={shippingSettings.mombasaRate}
                            onChange={(e) => setShippingSettings({...shippingSettings, mombasaRate: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Kisumu</label>
                          <input
                            type="number"
                            value={shippingSettings.kisumuRate}
                            onChange={(e) => setShippingSettings({...shippingSettings, kisumuRate: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Other Cities</label>
                          <input
                            type="number"
                            value={shippingSettings.otherCitiesRate}
                            onChange={(e) => setShippingSettings({...shippingSettings, otherCitiesRate: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Days</label>
                          <input
                            type="text"
                            value={shippingSettings.estimatedDays}
                            onChange={(e) => setShippingSettings({...shippingSettings, estimatedDays: e.target.value})}
                            placeholder="e.g., 3-5"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('shipping')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Shipping Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Mail className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Email Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Provider</label>
                        <select
                          value={emailSettings.provider}
                          onChange={(e) => setEmailSettings({...emailSettings, provider: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="sendgrid">SendGrid</option>
                          <option value="resend">Resend</option>
                          <option value="mailgun">Mailgun</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <input
                          type="password"
                          value={emailSettings.sendgridApiKey}
                          onChange={(e) => setEmailSettings({...emailSettings, sendgridApiKey: e.target.value})}
                          placeholder="SG.xxxxxxxxxxxxx"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                        <input
                          type="email"
                          value={emailSettings.fromEmail}
                          onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                        <input
                          type="text"
                          value={emailSettings.fromName}
                          onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <span className="font-medium text-gray-700">Order Confirmation Emails</span>
                          <input
                            type="checkbox"
                            checked={emailSettings.orderConfirmation}
                            onChange={(e) => setEmailSettings({...emailSettings, orderConfirmation: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <span className="font-medium text-gray-700">Shipping Update Emails</span>
                          <input
                            type="checkbox"
                            checked={emailSettings.shippingUpdate}
                            onChange={(e) => setEmailSettings({...emailSettings, shippingUpdate: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <span className="font-medium text-gray-700">Password Reset Emails</span>
                          <input
                            type="checkbox"
                            checked={emailSettings.passwordReset}
                            onChange={(e) => setEmailSettings({...emailSettings, passwordReset: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <span className="font-medium text-gray-700">Promotional Emails</span>
                          <input
                            type="checkbox"
                            checked={emailSettings.promotionalEmails}
                            onChange={(e) => setEmailSettings({...emailSettings, promotionalEmails: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('email')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Email Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'seller' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Store className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Seller Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={sellerSettings.commissionRate}
                          onChange={(e) => setSellerSettings({...sellerSettings, commissionRate: e.target.value})}
                          min="0"
                          max="100"
                          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-600">% of each sale</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Commission charged to sellers on each successful sale</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Product Price (KSh)</label>
                        <input
                          type="number"
                          value={sellerSettings.minProductPrice}
                          onChange={(e) => setSellerSettings({...sellerSettings, minProductPrice: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Product Price (KSh)</label>
                        <input
                          type="number"
                          value={sellerSettings.maxProductPrice}
                          onChange={(e) => setSellerSettings({...sellerSettings, maxProductPrice: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Policies</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">Auto-Approve Products</span>
                            <span className="text-sm text-gray-500">Products go live immediately without admin review</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerSettings.autoApproveProducts}
                            onChange={(e) => setSellerSettings({...sellerSettings, autoApproveProducts: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">Require Shop Verification</span>
                            <span className="text-sm text-gray-500">Sellers must verify business documents before listing</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerSettings.requireShopVerification}
                            onChange={(e) => setSellerSettings({...sellerSettings, requireShopVerification: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">Allow Multiple Shops</span>
                            <span className="text-sm text-gray-500">Sellers can create multiple shop accounts</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerSettings.allowMultipleShops}
                            onChange={(e) => setSellerSettings({...sellerSettings, allowMultipleShops: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave('seller')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Seller Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Notification Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Alerts</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">New Order Alert</span>
                            <span className="text-sm text-gray-500">Get notified when a new order is placed</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.newOrderAlert}
                            onChange={(e) => setNotificationSettings({...notificationSettings, newOrderAlert: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">Low Stock Alert</span>
                            <span className="text-sm text-gray-500">Alert when product stock is low</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.lowStockAlert}
                            onChange={(e) => setNotificationSettings({...notificationSettings, lowStockAlert: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">New User Registration</span>
                            <span className="text-sm text-gray-500">Notify when new users sign up</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.newUserRegistration}
                            onChange={(e) => setNotificationSettings({...notificationSettings, newUserRegistration: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">New Seller Application</span>
                            <span className="text-sm text-gray-500">Alert when sellers apply to join marketplace</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.newSellerApplication}
                            onChange={(e) => setNotificationSettings({...notificationSettings, newSellerApplication: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div>
                            <span className="font-medium text-gray-700 block">Product Review Alert</span>
                            <span className="text-sm text-gray-500">Notify when customers leave product reviews</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings.productReview}
                            onChange={(e) => setNotificationSettings({...notificationSettings, productReview: e.target.checked})}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={notificationSettings.stockThreshold}
                        onChange={(e) => setNotificationSettings({...notificationSettings, stockThreshold: e.target.value})}
                        min="1"
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">Trigger alert when stock falls below this number</p>
                    </div>

                    <button
                      onClick={() => handleSave('notifications')}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="text-gray-400" size={24} />
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Security Settings</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">Security Best Practices</p>
                        <p className="text-xs text-yellow-700 mt-1">Always use strong passwords and enable two-factor authentication for admin accounts.</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input
                            type="password"
                            placeholder="Enter current password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            placeholder="Enter new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-700 block">Enable 2FA</span>
                          <span className="text-sm text-gray-500">Add an extra layer of security to your account</span>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                          Enable
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Management</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-700 block">Active Sessions</span>
                            <span className="text-sm text-gray-500">2 active sessions found</span>
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                            Logout All
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
                      <div className="space-y-3">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Login from Nairobi, Kenya</span>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-sm text-gray-600">IP: 197.248.x.x</p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Settings updated</span>
                            <span className="text-sm text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-sm text-gray-600">Payment settings modified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;