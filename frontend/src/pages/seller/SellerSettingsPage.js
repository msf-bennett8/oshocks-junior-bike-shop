import { useState } from 'react';
import { Camera, Store, User, Bell, Lock, CreditCard, MapPin, Globe, Mail, Phone, Save, Eye, EyeOff, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function SellerSettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Business Information State
  const [businessInfo, setBusinessInfo] = useState({
    shopName: 'Oshocks Junior Bike Shop',
    businessName: 'Oshocks Limited',
    description: 'Premium cycling products and accessories for all your biking needs',
    email: 'sales@oshocks.co.ke',
    phone: '+254 712 345 678',
    alternatePhone: '+254 733 456 789',
    address: '123 Cycling Avenue',
    city: 'Nairobi',
    county: 'Nairobi',
    postalCode: '00100',
    businessRegNo: 'BN12345/2023',
    taxPin: 'A001234567X'
  });

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'John',
    lastName: 'Kamau',
    email: 'john.kamau@email.com',
    phone: '+254 712 345 678',
    idNumber: '12345678'
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    mpesaNumber: '+254 712 345 678',
    mpesaName: 'John Kamau',
    bankName: 'Equity Bank',
    accountNumber: '1234567890',
    accountName: 'Oshocks Limited',
    branchCode: '068'
  });

  // Notification Preferences State
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailOrders: true,
    emailMessages: true,
    emailPromotions: false,
    emailUpdates: true,
    smsOrders: true,
    smsLowStock: true,
    pushOrders: true,
    pushMessages: true
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  // Shop Images State
  const [shopImages, setShopImages] = useState({
    logo: null,
    banner: null
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveBusinessInfo = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Business information updated successfully!');
    }, 1500);
  };

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Personal information updated successfully!');
    }, 1500);
  };

  const handleSavePaymentSettings = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Payment settings updated successfully!');
    }, 1500);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Notification preferences saved!');
    }, 1500);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      showNotification('Passwords do not match!', 'error');
      return;
    }
    
    if (securityData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters!', 'error');
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Password changed successfully!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securityData.twoFactorEnabled
      });
    }, 1500);
  };

  const handleImageUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopImages(prev => ({ ...prev, [type]: reader.result }));
        showNotification(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    setShopImages(prev => ({ ...prev, [type]: null }));
    showNotification(`${type === 'logo' ? 'Logo' : 'Banner'} removed`);
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Store },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Settings</h1>
          <p className="mt-2 text-gray-600">Manage your shop and account preferences</p>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Business Information Tab */}
              {activeTab === 'business' && (
                <form onSubmit={handleSaveBusinessInfo}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
                  
                  {/* Shop Images */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Images</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shop Logo
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {shopImages.logo ? (
                            <div className="relative">
                              <img src={shopImages.logo} alt="Shop Logo" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage('logo')}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Camera className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">Upload your shop logo</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('logo', e)}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label
                            htmlFor="logo-upload"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {shopImages.logo ? 'Change Logo' : 'Upload Logo'}
                          </label>
                        </div>
                      </div>

                      {/* Banner Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shop Banner
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          {shopImages.banner ? (
                            <div className="relative">
                              <img src={shopImages.banner} alt="Shop Banner" className="mx-auto h-32 w-full object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage('banner')}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <Camera className="mx-auto h-12 w-12 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-600">Upload banner image</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 5MB (1200x400 recommended)</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload('banner', e)}
                            className="hidden"
                            id="banner-upload"
                          />
                          <label
                            htmlFor="banner-upload"
                            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {shopImages.banner ? 'Change Banner' : 'Upload Banner'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name *
                      </label>
                      <input
                        type="text"
                        value={businessInfo.shopName}
                        onChange={(e) => setBusinessInfo({...businessInfo, shopName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessName}
                        onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shop Description *
                    </label>
                    <textarea
                      value={businessInfo.description}
                      onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Business Email *
                      </label>
                      <input
                        type="email"
                        value={businessInfo.email}
                        onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        value={businessInfo.phone}
                        onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      value={businessInfo.alternatePhone}
                      onChange={(e) => setBusinessInfo({...businessInfo, alternatePhone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={businessInfo.city}
                        onChange={(e) => setBusinessInfo({...businessInfo, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County *
                      </label>
                      <select
                        value={businessInfo.county}
                        onChange={(e) => setBusinessInfo({...businessInfo, county: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      >
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Nakuru">Nakuru</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Thika">Thika</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={businessInfo.postalCode}
                        onChange={(e) => setBusinessInfo({...businessInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Registration Number
                      </label>
                      <input
                        type="text"
                        value={businessInfo.businessRegNo}
                        onChange={(e) => setBusinessInfo({...businessInfo, businessRegNo: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN Number
                      </label>
                      <input
                        type="text"
                        value={businessInfo.taxPin}
                        onChange={(e) => setBusinessInfo({...businessInfo, taxPin: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <form onSubmit={handleSavePersonalInfo}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline w-4 h-4 mr-1" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      value={personalInfo.idNumber}
                      onChange={(e) => setPersonalInfo({...personalInfo, idNumber: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {/* Payment Settings Tab */}
              {activeTab === 'payment' && (
                <form onSubmit={handleSavePaymentSettings}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Settings</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">M-Pesa Details</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800">
                        Your M-Pesa number will be used to receive payments from customer purchases.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          M-Pesa Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={paymentSettings.mpesaNumber}
                          onChange={(e) => setPaymentSettings({...paymentSettings, mpesaNumber: e.target.value})}
                          placeholder="+254 712 345 678"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          M-Pesa Account Name *
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.mpesaName}
                          onChange={(e) => setPaymentSettings({...paymentSettings, mpesaName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800">
                        Bank details are used for bulk payouts and refund processing.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name *
                        </label>
                        <select
                          value={paymentSettings.bankName}
                          onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Bank</option>
                          <option value="Equity Bank">Equity Bank</option>
                          <option value="KCB">KCB Bank</option>
                          <option value="Cooperative Bank">Cooperative Bank</option>
                          <option value="NCBA">NCBA Bank</option>
                          <option value="Absa">Absa Bank</option>
                          <option value="Standard Chartered">Standard Chartered</option>
                          <option value="Stanbic">Stanbic Bank</option>
                          <option value="DTB">Diamond Trust Bank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch Code
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.branchCode}
                          onChange={(e) => setPaymentSettings({...paymentSettings, branchCode: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.accountNumber}
                          onChange={(e) => setPaymentSettings({...paymentSettings, accountNumber: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.accountName}
                          onChange={(e) => setPaymentSettings({...paymentSettings, accountName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Payment Settings'}
                  </button>
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <form onSubmit={handleSaveNotifications}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-8">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">New Orders</div>
                            <div className="text-sm text-gray-600">Get notified when you receive new orders</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.emailOrders}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, emailOrders: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">Customer Messages</div>
                            <div className="text-sm text-gray-600">Receive emails when customers send you messages</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.emailMessages}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, emailMessages: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">Promotional Emails</div>
                            <div className="text-sm text-gray-600">Receive tips, best practices, and promotional content</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.emailPromotions}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, emailPromotions: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">Platform Updates</div>
                            <div className="text-sm text-gray-600">Important updates about the platform and policies</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.emailUpdates}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, emailUpdates: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        SMS Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">New Orders</div>
                            <div className="text-sm text-gray-600">SMS alerts for new orders</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.smsOrders}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, smsOrders: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">Low Stock Alerts</div>
                            <div className="text-sm text-gray-600">Get notified when product inventory is low</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.smsLowStock}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, smsLowStock: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Push Notifications
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">New Orders</div>
                            <div className="text-sm text-gray-600">Browser push notifications for orders</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.pushOrders}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, pushOrders: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <div>
                            <div className="font-medium text-gray-900">Messages</div>
                            <div className="text-sm text-gray-600">Instant notifications for customer messages</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationPrefs.pushMessages}
                            onChange={(e) => setNotificationPrefs({...notificationPrefs, pushMessages: e.target.checked})}
                            className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  
                  {/* Change Password */}
                  <form onSubmit={handlePasswordChange} className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={securityData.currentPassword}
                            onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password *
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-5 h-5" />
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>

                  {/* Two-Factor Authentication */}
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">Enhance Your Account Security</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Two-factor authentication adds an extra layer of security to your account. 
                            When enabled, you'll need to enter a code from your phone in addition to your password.
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={securityData.twoFactorEnabled}
                                onChange={(e) => setSecurityData({...securityData, twoFactorEnabled: e.target.checked})}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                            <span className="text-sm font-medium text-gray-900">
                              {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t pt-8 mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Current Session</div>
                          <div className="text-sm text-gray-600">Nairobi, Kenya • Chrome on Windows</div>
                          <div className="text-xs text-gray-500 mt-1">Last active: Just now</div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Mobile Device</div>
                          <div className="text-sm text-gray-600">Nairobi, Kenya • Safari on iPhone</div>
                          <div className="text-xs text-gray-500 mt-1">Last active: 2 hours ago</div>
                        </div>
                        <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                          Revoke
                        </button>
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
}