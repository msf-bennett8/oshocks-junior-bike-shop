import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, CreditCard, Bell, ShoppingBag, Heart, Settings, Camera, Save, X, Edit2, Trash2, Plus, Home, Building, AlertCircle, CheckCircle, Eye, EyeOff, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isTabsStuck, setIsTabsStuck] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);

  // User Data State
  const [userData, setUserData] = useState({
  firstName: user?.name?.split(' ')[0] || '',
  lastName: user?.name?.split(' ').slice(1).join(' ') || '',
  email: user?.email || '',
  phone: user?.phone || '',
  alternatePhone: '',
  dateOfBirth: '',
  gender: '',
  profileImage: null,
  bio: '',
  memberSince: user?.created_at || ''
});

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'home',
      isDefault: true,
      fullName: 'John Kamau',
      phone: '+254 712 345 678',
      street: 'Ngong Road, ABC Place',
      building: 'Building C, 3rd Floor, Apt C304',
      city: 'Nairobi',
      county: 'Nairobi County',
      postalCode: '00100',
      deliveryInstructions: 'Call before delivery. Gate code: 1234'
    },
    {
      id: 2,
      type: 'work',
      isDefault: false,
      fullName: 'John Kamau',
      phone: '+254 712 345 678',
      street: 'Moi Avenue',
      building: 'Kencom House, 5th Floor',
      city: 'Nairobi',
      county: 'Nairobi County',
      postalCode: '00200',
      deliveryInstructions: 'Deliver to reception'
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'mpesa',
      phoneNumber: '+254 712 345 678',
      isDefault: true,
      name: 'Primary M-Pesa'
    },
    {
      id: 2,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '2026',
      isDefault: false,
      name: 'Personal Card'
    }
  ]);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    promotionalEmails: true,
    newArrivals: false,
    priceDropAlerts: true,
    newsletter: true,
    twoFactorAuth: false,
    language: 'en',
    currency: 'KES'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [stats, setStats] = useState({
    totalOrders: 24,
    totalSpent: 284500,
    wishlistItems: 12,
    reviewsWritten: 8,
    loyaltyPoints: 2845
  });

  // Redirect if not authenticated
useEffect(() => {
  if (!isAuthenticated) {
    navigate('/login');
  }
}, [isAuthenticated, navigate]);


//sticky navigation header
useEffect(() => {
  let lastScrollY = window.scrollY;
  
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const currentScrollY = window.scrollY;
    
    // Determine if navbar should be visible
    if (currentScrollY < lastScrollY || currentScrollY < 10) {
      setNavbarVisible(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setNavbarVisible(false);
    }
    
    // Check if tabs should be stuck
    setIsTabsStuck(scrollPosition > 150);
    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Sync user data when user changes
useEffect(() => {
  if (user) {
    setUserData({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: '',
      profileImage: null,
      bio: '',
      memberSince: user.created_at || ''
    });
    setLoading(false);
  }
}, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProfileUpdate = async (e) => {
  e.preventDefault();
  setSaving(true);
  
  try {
    // Prepare data for API
    const updates = {
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      email: userData.email,
      phone: userData.phone,
      address: userData.city || userData.address || ''
    };
    
    // Call AuthContext updateProfile
    const result = await updateProfile(updates);
    
    if (result.success) {
      showNotification('Profile updated successfully!');
    } else {
      showNotification(result.error || 'Failed to update profile', 'error');
    }
  } catch (err) {
    console.error('Failed to update profile:', err);
    showNotification('Failed to update profile. Please try again.', 'error');
  } finally {
    setSaving(false);
  }
};

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData({ ...userData, profileImage: reader.result });
        showNotification('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

 const handlePasswordChange = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }
  if (passwordData.newPassword.length < 8) {
    showNotification('Password must be at least 8 characters!', 'error');
    return;
  }
  
  setSaving(true);
  
  try {
    // Call AuthContext changePassword
    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      newPasswordConfirmation: passwordData.confirmPassword
    });
    
    if (result.success) {
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Password changed successfully!');
    } else {
      showNotification(result.error || 'Failed to change password', 'error');
    }
  } catch (err) {
    console.error('Failed to change password:', err);
    showNotification(err.response?.data?.message || 'Failed to change password. Please check your current password.', 'error');
  } finally {
    setSaving(false);
  }
};

  const handleAddressSubmit = (address) => {
    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...address, id: editingAddress.id } : a));
      showNotification('Address updated successfully!');
    } else {
      setAddresses([...addresses, { ...address, id: Date.now() }]);
      showNotification('Address added successfully!');
    }
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    showNotification('Address deleted successfully!');
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    showNotification('Default address updated!');
  };

  const handleDeletePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(p => p.id !== id));
    showNotification('Payment method removed!');
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(p => ({ ...p, isDefault: p.id === id })));
    showNotification('Default payment method updated!');
  };

  const handlePreferenceChange = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleAccountDelete = () => {
    // Implement account deletion
    alert('Account deletion requested. Our team will contact you.');
    setShowDeleteModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Show loading while user data is being fetched
if (!user || loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <button
          onClick={async () => {
            try {
              await logout();
              navigate('/login');
            } catch (err) {
              console.error('Logout failed:', err);
              navigate('/login');
            }
          }}
          className="hidden md:flex items-center px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
        <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Profile Image and Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {userData.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-green-100"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-green-100">
                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </h3>
                <p className="text-sm text-gray-600">{userData.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Member since {new Date(userData.memberSince).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <div className="text-xs text-gray-600">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-gray-600">Spent</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.wishlistItems}</div>
                <div className="text-xs text-gray-600">Wishlist</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.loyaltyPoints}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation Tabs - Sticky Below Navbar */}
        <div 
            className={`bg-white rounded-lg shadow-sm sticky z-40 transition-all duration-300 ${
              isTabsStuck ? 'shadow-lg' : ''
            }`}
            style={{ 
              top: navbarVisible ? '64px' : '0px',
              transition: 'top 0.3s ease'
            }}
          >
          <div className="overflow-x-auto scrollbar-hide">
            <nav className="flex border-b border-gray-200 min-w-max">
              <button
                onClick={() => setActiveTab('personal')}
                className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'personal'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 mr-2" />
                <span>Personal Info</span>
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'addresses'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                <span>Addresses</span>
              </button>
              
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                <span>Payment Methods</span>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'security'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5 mr-2" />
                <span>Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex items-center px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === 'preferences'
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5 mr-2" />
                <span>Preferences</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Logout Button - Mobile */}
        <div className="md:hidden">
          <button
            onClick={async () => {
              try {
                await logout();
                navigate('/login');
              } catch (err) {
                console.error('Logout failed:', err);
                navigate('/login');
              }
            }}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div>
            {/* Personal Information */}
            {activeTab === 'personal' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={userData.firstName}
                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={userData.lastName}
                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={userData.email}
                          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alternate Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={userData.alternatePhone}
                          onChange={(e) => setUserData({ ...userData, alternatePhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={userData.dateOfBirth}
                        onChange={(e) => setUserData({ ...userData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="male"
                            checked={userData.gender === 'male'}
                            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                            className="mr-2"
                          />
                          Male
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="female"
                            checked={userData.gender === 'female'}
                            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                            className="mr-2"
                          />
                          Female
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="other"
                            checked={userData.gender === 'other'}
                            onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                            className="mr-2"
                          />
                          Other
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={userData.bio}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tell us about yourself and your cycling interests..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        setShowAddressForm(true);
                        setEditingAddress(null);
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">
                            DEFAULT
                          </span>
                        )}
                        
                        <div className="flex items-center mb-3">
                          {address.type === 'home' ? <Home className="w-5 h-5 text-gray-600 mr-2" /> : <Building className="w-5 h-5 text-gray-600 mr-2" />}
                          <span className="font-bold text-gray-900 capitalize">{address.type}</span>
                        </div>

                        <div className="text-sm text-gray-700 space-y-1 mb-4">
                          <p className="font-semibold">{address.fullName}</p>
                          <p>{address.phone}</p>
                          <p>{address.street}</p>
                          <p>{address.building}</p>
                          <p>{address.city}, {address.county}</p>
                          <p>Postal Code: {address.postalCode}</p>
                          {address.deliveryInstructions && (
                            <p className="text-xs text-gray-500 mt-2 italic">{address.deliveryInstructions}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingAddress(address);
                              setShowAddressForm(true);
                            }}
                            className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium transition-colors"
                            disabled={address.isDefault}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address Form Modal */}
                {showAddressForm && (
                  <AddressFormModal
                    address={editingAddress}
                    onSubmit={handleAddressSubmit}
                    onClose={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                    }}
                  />
                )}
              </div>
            )}

            {/* Payment Methods */}
            {activeTab === 'payments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                  <button
                    onClick={() => alert('Add payment method form')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Payment
                  </button>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          method.type === 'mpesa' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <CreditCard className={`w-6 h-6 ${
                            method.type === 'mpesa' ? 'text-green-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{method.name}</p>
                          {method.type === 'mpesa' ? (
                            <p className="text-sm text-gray-600">{method.phoneNumber}</p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              {method.brand} •••• {method.last4} - Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          )}
                          {method.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPayment(method.id)}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                          disabled={method.isDefault}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>

                  {/* Change Password */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-sm text-gray-600">Update your password regularly for better security</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type={showPasswords.current ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
                        >
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Shield className="w-5 h-5 text-gray-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                        </div>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.twoFactorAuth}
                          onChange={() => handlePreferenceChange('twoFactorAuth')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Login History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Login Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Current Session</p>
                          <p className="text-xs text-gray-600">Nairobi, Kenya • Chrome on Windows</p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">2 hours ago</p>
                          <p className="text-xs text-gray-600">Nairobi, Kenya • Mobile Safari on iPhone</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Yesterday</p>
                          <p className="text-xs text-gray-600">Nairobi, Kenya • Chrome on Android</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

                {/* Notifications */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive notifications via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={() => handlePreferenceChange('emailNotifications')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive important updates via SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={() => handlePreferenceChange('smsNotifications')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Order Updates</p>
                        <p className="text-sm text-gray-600">Get notified about order status changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.orderUpdates}
                          onChange={() => handlePreferenceChange('orderUpdates')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Promotional Emails</p>
                        <p className="text-sm text-gray-600">Receive offers, discounts and promotions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.promotionalEmails}
                          onChange={() => handlePreferenceChange('promotionalEmails')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">New Arrivals</p>
                        <p className="text-sm text-gray-600">Be notified when new products arrive</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.newArrivals}
                          onChange={() => handlePreferenceChange('newArrivals')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Price Drop Alerts</p>
                        <p className="text-sm text-gray-600">Get notified when wishlist items go on sale</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.priceDropAlerts}
                          onChange={() => handlePreferenceChange('priceDropAlerts')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Newsletter</p>
                        <p className="text-sm text-gray-600">Weekly cycling tips and news</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.newsletter}
                          onChange={() => handlePreferenceChange('newsletter')}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Language & Region */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => showNotification('Preferences saved successfully!')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Delete Account</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 text-center mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <p className="font-semibold mb-2">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your profile and personal information</li>
                  <li>Order history</li>
                  <li>Saved addresses and payment methods</li>
                  <li>Wishlist items</li>
                  <li>Loyalty points</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
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

// Address Form Modal Component
const AddressFormModal = ({ address, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(
    address || {
      type: 'home',
      fullName: '',
      phone: '',
      street: '',
      building: '',
      city: '',
      county: '',
      postalCode: '',
      deliveryInstructions: '',
      isDefault: false
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {address ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="home"
                    checked={formData.type === 'home'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <Home className="w-5 h-5 mr-1" />
                  Home
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="work"
                    checked={formData.type === 'work'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mr-2"
                  />
                  <Building className="w-5 h-5 mr-1" />
                  Work
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Ngong Road, ABC Place"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building / Apartment *
              </label>
              <input
                type="text"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Building C, 3rd Floor, Apt 304"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <input
                  type="text"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Instructions
              </label>
              <textarea
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Any special instructions for delivery (gate codes, landmarks, etc.)"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Set as default address</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              {address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;