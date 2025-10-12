import { useState } from 'react';
import { Camera, Save, Eye, EyeOff, AlertCircle, CheckCircle, Store, User, CreditCard, Bell, Shield, MapPin, Phone, Mail, Building } from 'lucide-react';

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState('shop');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Shop Profile State
  const [shopProfile, setShopProfile] = useState({
    shopName: 'Oshocks Junior Bike Shop',
    shopDescription: 'Your trusted source for quality bicycles and cycling accessories in Nairobi',
    shopLogo: null,
    shopBanner: null,
    businessRegistration: 'BN/2023/12345',
    taxId: 'A123456789P',
    phoneNumber: '+254712345678',
    email: 'shop@oshocks.co.ke',
    address: '123 Ngong Road, Nairobi',
    city: 'Nairobi',
    county: 'Nairobi',
    postalCode: '00100'
  });

  // Personal Profile State
  const [personalProfile, setPersonalProfile] = useState({
    fullName: 'John Kamau',
    idNumber: '12345678',
    phoneNumber: '+254712345678',
    email: 'john@oshocks.co.ke',
    profilePhoto: null
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    mpesaNumber: '+254712345678',
    mpesaName: 'John Kamau',
    bankName: 'Equity Bank',
    accountNumber: '1234567890',
    accountName: 'Oshocks Junior Bike Shop',
    branchCode: '068',
    swiftCode: 'EQBLKENA'
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      newOrders: true,
      lowStock: true,
      customerMessages: true,
      productReviews: true,
      weeklyReport: false
    },
    smsNotifications: {
      newOrders: true,
      lowStock: false,
      urgentAlerts: true
    }
  });

  const handleShopProfileChange = (field, value) => {
    setShopProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePersonalProfileChange = (field, value) => {
    setPersonalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentSettingsChange = (field, value) => {
    setPaymentSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingsChange = (field, value) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (category, field) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleImageUpload = (field, category = 'shop') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (category === 'shop') {
            setShopProfile(prev => ({ ...prev, [field]: event.target.result }));
          } else {
            setPersonalProfile(prev => ({ ...prev, [field]: event.target.result }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    setSaveStatus(null);
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      setIsLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1500);
  };

  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setSaveStatus('error');
      return;
    }
    handleSave('security');
  };

  const tabs = [
    { id: 'shop', label: 'Shop Profile', icon: Store },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Settings</h1>
          <p className="mt-2 text-gray-600">Manage your shop profile, payment methods, and account preferences</p>
        </div>

        {/* Status Messages */}
        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Passwords do not match. Please try again.</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Shop Profile Tab */}
              {activeTab === 'shop' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Profile</h2>
                    <p className="text-gray-600 mb-6">Update your shop information that customers will see</p>
                  </div>

                  {/* Shop Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {shopProfile.shopLogo ? (
                          <img src={shopProfile.shopLogo} alt="Shop Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Store className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={() => handleImageUpload('shopLogo')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Logo
                      </button>
                    </div>
                  </div>

                  {/* Shop Banner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Banner</label>
                    <div className="space-y-3">
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {shopProfile.shopBanner ? (
                          <img src={shopProfile.shopBanner} alt="Shop Banner" className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-gray-400">No banner uploaded</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleImageUpload('shopBanner')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Banner
                      </button>
                    </div>
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                    <input
                      type="text"
                      value={shopProfile.shopName}
                      onChange={(e) => handleShopProfileChange('shopName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Shop Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shop Description</label>
                    <textarea
                      value={shopProfile.shopDescription}
                      onChange={(e) => handleShopProfileChange('shopDescription', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Business Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />
                        Business Registration No.
                      </label>
                      <input
                        type="text"
                        value={shopProfile.businessRegistration}
                        onChange={(e) => handleShopProfileChange('businessRegistration', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / PIN</label>
                      <input
                        type="text"
                        value={shopProfile.taxId}
                        onChange={(e) => handleShopProfileChange('taxId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={shopProfile.phoneNumber}
                        onChange={(e) => handleShopProfileChange('phoneNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={shopProfile.email}
                        onChange={(e) => handleShopProfileChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Physical Address
                    </label>
                    <input
                      type="text"
                      value={shopProfile.address}
                      onChange={(e) => handleShopProfileChange('address', e.target.value)}
                      placeholder="Street address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={shopProfile.city}
                        onChange={(e) => handleShopProfileChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
                      <input
                        type="text"
                        value={shopProfile.county}
                        onChange={(e) => handleShopProfileChange('county', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={shopProfile.postalCode}
                        onChange={(e) => handleShopProfileChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => handleSave('shop')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Shop Profile'}
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                    <p className="text-gray-600 mb-6">Update your personal details and contact information</p>
                  </div>

                  {/* Profile Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {personalProfile.profilePhoto ? (
                          <img src={personalProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>
                      <button
                        onClick={() => handleImageUpload('profilePhoto', 'personal')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={personalProfile.fullName}
                      onChange={(e) => handlePersonalProfileChange('fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                    <input
                      type="text"
                      value={personalProfile.idNumber}
                      onChange={(e) => handlePersonalProfileChange('idNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={personalProfile.phoneNumber}
                        onChange={(e) => handlePersonalProfileChange('phoneNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={personalProfile.email}
                        onChange={(e) => handlePersonalProfileChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => handleSave('personal')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Personal Info'}
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
                    <p className="text-gray-600 mb-6">Manage how you receive payments from customers</p>
                  </div>

                  {/* M-Pesa Details */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Account</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Number</label>
                        <input
                          type="tel"
                          value={paymentSettings.mpesaNumber}
                          onChange={(e) => handlePaymentSettingsChange('mpesaNumber', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                        <input
                          type="text"
                          value={paymentSettings.mpesaName}
                          onChange={(e) => handlePaymentSettingsChange('mpesaName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        <input
                          type="text"
                          value={paymentSettings.bankName}
                          onChange={(e) => handlePaymentSettingsChange('bankName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                          <input
                            type="text"
                            value={paymentSettings.accountNumber}
                            onChange={(e) => handlePaymentSettingsChange('accountNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                          <input
                            type="text"
                            value={paymentSettings.accountName}
                            onChange={(e) => handlePaymentSettingsChange('accountName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                          <input
                            type="text"
                            value={paymentSettings.branchCode}
                            onChange={(e) => handlePaymentSettingsChange('branchCode', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code</label>
                          <input
                            type="text"
                            value={paymentSettings.swiftCode}
                            onChange={(e) => handlePaymentSettingsChange('swiftCode', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => handleSave('payment')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Payment Methods'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                    <p className="text-gray-600 mb-6">Choose how you want to receive notifications about your shop</p>
                  </div>

                  {/* Email Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                          <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationChange('emailNotifications', key)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
                    <div className="space-y-3">
                      {Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                          <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationChange('smsNotifications', key)}
                            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <button
                      onClick={() => handleSave('notifications')}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Notification Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                    <p className="text-gray-600 mb-6">Manage your password and security preferences</p>
                  </div>

                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={securitySettings.currentPassword}
                            onChange={(e) => handleSecuritySettingsChange('currentPassword', e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={securitySettings.newPassword}
                            onChange={(e) => handleSecuritySettingsChange('newPassword', e.target.value)}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={securitySettings.confirmPassword}
                          onChange={(e) => handleSecuritySettingsChange('confirmPassword', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorEnabled}
                          onChange={(e) => handleSecuritySettingsChange('twoFactorEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Current Device</p>
                          <p className="text-sm text-gray-600">Nairobi, Kenya • Last active now</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Chrome on Windows</p>
                          <p className="text-sm text-gray-600">Nairobi, Kenya • 2 hours ago</p>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}