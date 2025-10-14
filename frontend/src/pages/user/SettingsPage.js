import { useState } from 'react';
import { Camera, User, Lock, MapPin, Bell, Shield, CreditCard, Trash2, Save, Eye, EyeOff, Plus, Edit2, X } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Kamau',
    email: 'john.kamau@example.com',
    phone: '+254712345678',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'home',
      name: 'Home Address',
      street: 'Moi Avenue, Building 12',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00100',
      phone: '+254712345678',
      isDefault: true
    },
    {
      id: 2,
      type: 'work',
      name: 'Work Address',
      street: 'Kenyatta Avenue, Office 5',
      city: 'Nairobi',
      county: 'Nairobi',
      postalCode: '00200',
      phone: '+254712345678',
      isDefault: false
    }
  ]);

  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    street: '',
    city: '',
    county: '',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    productReviews: true,
    smsNotifications: false,
    emailNotifications: true,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacy(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      alert('Please fill in all required fields');
      return;
    }
    const id = Math.max(...addresses.map(a => a.id), 0) + 1;
    setAddresses(prev => [...prev, { ...newAddress, id }]);
    setNewAddress({
      type: 'home',
      name: '',
      street: '',
      city: '',
      county: '',
      postalCode: '',
      phone: '',
      isDefault: false
    });
    setShowAddressModal(false);
    alert('Address added successfully!');
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddressModal(true);
  };

  const handleUpdateAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      alert('Please fill in all required fields');
      return;
    }
    setAddresses(prev => prev.map(addr => 
      addr.id === editingAddress.id ? { ...newAddress, id: addr.id } : addr
    ));
    setNewAddress({
      type: 'home',
      name: '',
      street: '',
      city: '',
      county: '',
      postalCode: '',
      phone: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddressModal(false);
    alert('Address updated successfully!');
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleDeleteAccount = () => {
    alert('Account deletion request submitted. You will receive an email confirmation.');
    setShowDeleteModal(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  const kenyanCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 
    'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Kiambu', 'Machakos'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your account preferences and settings</p>
        </div>

        {/* Horizontal Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max sm:min-w-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-700 font-medium bg-green-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Profile Information</h2>
              
              {/* Avatar Section */}
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {profileData.avatar ? (
                      <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900 text-lg">{profileData.firstName} {profileData.lastName}</h3>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Change Password</h2>
              <div className="max-w-md space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery Addresses</h2>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add Address
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {addresses.map(address => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                    {address.isDefault && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900">{address.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{address.type}</p>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.county}</p>
                      <p>{address.postalCode}</p>
                      <p>{address.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Order Updates</span>
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdates}
                        onChange={() => handleNotificationChange('orderUpdates')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Promotions & Offers</span>
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Newsletter</span>
                      <input
                        type="checkbox"
                        checked={notifications.newsletter}
                        onChange={() => handleNotificationChange('newsletter')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Product Reviews</span>
                      <input
                        type="checkbox"
                        checked={notifications.productReviews}
                        onChange={() => handleNotificationChange('productReviews')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Other Channels</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">SMS Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.smsNotifications}
                        onChange={() => handleNotificationChange('smsNotifications')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 pr-4">
                      <span className="text-gray-900 font-medium block text-sm sm:text-base">Show Email Address</span>
                      <span className="text-xs sm:text-sm text-gray-500">Other users can see your email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 pr-4">
                      <span className="text-gray-900 font-medium block text-sm sm:text-base">Show Phone Number</span>
                      <span className="text-xs sm:text-sm text-gray-500">Other users can see your phone</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showPhone}
                      onChange={() => handlePrivacyChange('showPhone', !privacy.showPhone)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-start justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex-1 pr-4">
                      <span className="text-gray-900 font-medium block text-sm sm:text-base">Data Sharing</span>
                      <span className="text-xs sm:text-sm text-gray-500">Share data with partners for better experience</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.dataSharing}
                      onChange={() => handlePrivacyChange('dataSharing', !privacy.dataSharing)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 flex-shrink-0"
                    />
                  </label>
                </div>

                <div className="border-t pt-6">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm sm:text-base"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Methods</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold flex-shrink-0">
                      MP
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">M-Pesa</p>
                      <p className="text-sm text-gray-600">+254 712 345 678</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 self-start sm:self-center">Edit</button>
                </div>

                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors">
                  <Plus className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm sm:text-base">Add Payment Method</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setNewAddress({
                      type: 'home',
                      name: '',
                      street: '',
                      city: '',
                      county: '',
                      postalCode: '',
                      phone: '',
                      isDefault: false
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                  <select
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Name *</label>
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    placeholder="e.g., Home, Office"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="Building name, street, apartment"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      placeholder="Nairobi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
                    <select
                      value={newAddress.county}
                      onChange={(e) => setNewAddress({...newAddress, county: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Select County</option>
                      {kenyanCounties.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                      placeholder="00100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      placeholder="+254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setEditingAddress(null);
                    setNewAddress({
                      type: 'home',
                      name: '',
                      street: '',
                      city: '',
                      county: '',
                      postalCode: '',
                      phone: '',
                      isDefault: false
                    });
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                  className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <h3 className="text-lg sm:text-xl font-bold">Delete Account</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;