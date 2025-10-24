import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, 
  Shield, Bell, CreditCard, Package, Heart, Star, Settings, 
  Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Upload,
  ShoppingBag, Award, TrendingUp, Clock, FileText, Trash2,
  LogOut, ExternalLink, Download, Bike, MessageSquare
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  const [userData, setUserData] = useState({
  id: user?.id || '',
  firstName: user?.name?.split(' ')[0] || '',
  lastName: user?.name?.split(' ')[1] || '',
  email: user?.email || '',
  phone: user?.phone || '',
  city: user?.address || '',
  address: user?.address || '',
  postalCode: '',
  dateOfBirth: '',
  gender: '',
  bio: '',
  avatar: null,
  joinDate: user?.created_at || '',
  userType: user?.role || 'customer',
  emailVerified: user?.email_verified_at ? true : false,
  phoneVerified: false,
  newsletter: true,
  twoFactorEnabled: false
});

  // Profile stats
  const [profileStats, setProfileStats] = useState({
    totalOrders: 24,
    totalSpent: 145600,
    activeOrders: 2,
    wishlistItems: 8,
    reviewsGiven: 12,
    loyaltyPoints: 3450,
    membershipTier: 'Gold',
    lastOrderDate: '2024-10-05'
  });

  // Recent activity
  const [recentActivity] = useState([
    { id: 1, type: 'order', title: 'Ordered Mountain Bike Pro X3000', date: '2024-10-05', icon: ShoppingBag },
    { id: 2, type: 'review', title: 'Reviewed Cycling Helmet Premium', date: '2024-10-03', icon: Star },
    { id: 3, type: 'wishlist', title: 'Added Road Bike Elite to wishlist', date: '2024-10-01', icon: Heart },
    { id: 4, type: 'profile', title: 'Updated profile information', date: '2024-09-28', icon: User }
  ]);

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedData, setEditedData] = useState({...userData});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Password change state
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
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
    productRestock: true,
    priceDrops: false,
    newArrivals: true,
    smsNotifications: false,
    pushNotifications: true
  });

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Load user data on mount (simulate API call)
  useEffect(() => {
    if (user) {
      setUserData({
        id: user.id || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.address || '',
        address: user.address || '',
        postalCode: '',
        dateOfBirth: '',
        gender: '',
        bio: '',
        avatar: null,
        joinDate: user.created_at || '',
        userType: user.role || 'customer',
        emailVerified: user.email_verified_at ? true : false,
        phoneVerified: false,
        newsletter: true,
        twoFactorEnabled: false
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle profile edit
  const handleEditClick = () => {
    setIsEditingProfile(true);
    setEditedData({...userData});
    setSaveError('');
    setSaveSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedData({...userData});
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileData = () => {
    const errors = {};
    
    if (!editedData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!editedData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!editedData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email)) {
      errors.email = 'Invalid email address';
    }
    if (!editedData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileData()) return;
    
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');
    
    try {
      // Prepare data for API
      const updates = {
        name: `${editedData.firstName} ${editedData.lastName}`,
        email: editedData.email,
        phone: editedData.phone,
        address: editedData.city || editedData.address
      };
      
      // Call AuthContext updateProfile
      const result = await updateProfile(updates);
      
      if (result.success) {
        setUserData(editedData);
        setIsEditingProfile(false);
        setSaveSuccess('Profile updated successfully!');
        setTimeout(() => setSaveSuccess(''), 5000);
      } else {
        setSaveError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      setSaveError('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Image size must be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload avatar
    setIsUploadingAvatar(true);
    try {
      // API call to upload avatar
      // const formData = new FormData();
      // formData.append('avatar', file);
      // await axios.post('/api/user/avatar', formData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSaveSuccess('Profile picture updated successfully!');
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setSaveError('Failed to upload profile picture');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
  // Call AuthContext changePassword
  const result = await changePassword({
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
    newPasswordConfirmation: passwordData.confirmPassword
  });
  
  if (result.success) {
    setPasswordSuccess('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSuccess(''), 5000);
  } else {
    setPasswordError(result.error || 'Failed to change password');
  }
} catch (err) {
  console.error('Failed to change password:', err);
  setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
} finally {
  setIsChangingPassword(false);
}
  };

  // Handle notification preferences
  const handleNotificationChange = async (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    
    try {
      // API call to update notification preferences
      // await axios.put('/api/user/notifications', newNotifications);
    } catch (err) {
      console.error('Failed to update notifications:', err);
      // Revert on error
      setNotifications(notifications);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;
    
    try {
      // API call to delete account
      // await axios.delete('/api/user/account');
      
      // Clear auth and redirect
      navigate('/login');
    } catch (err) {
      console.error('Failed to delete account:', err);
      setSaveError('Failed to delete account. Please contact support.');
    }
  };

  // Handle logout
 const handleLogout = async () => {
  try {
    await logout();
    navigate('/login');
  } catch (err) {
    console.error('Logout failed:', err);
    // Navigate anyway
    navigate('/login');
  }
};

  // Render membership badge
  const renderMembershipBadge = () => {
    const colors = {
      Bronze: 'bg-orange-100 text-orange-800',
      Silver: 'bg-gray-100 text-gray-800',
      Gold: 'bg-yellow-100 text-yellow-800',
      Platinum: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[profileStats.membershipTier] || colors.Bronze}`}>
        {profileStats.membershipTier} Member
      </span>
    );
  };

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your profile, orders, and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{saveSuccess}</p>
          </div>
        )}
        
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{saveError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 overflow-hidden">
                    {avatarPreview || userData.avatar ? (
                      <img 
                        src={avatarPreview || userData.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      `${userData.firstName[0]}${userData.lastName[0]}`
                    )}
                  </div>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-bold text-lg">
                  {userData.firstName} {userData.lastName}
                </h3>
                <p className="text-blue-100 text-sm">{userData.email}</p>
                <div className="mt-3">
                  {renderMembershipBadge()}
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="p-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'profile', label: 'Edit Profile', icon: Edit2 },
                  { id: 'orders', label: 'My Orders', icon: Package },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
                
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingBag className="w-8 h-8 text-blue-600" />
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profileStats.totalOrders}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      KSh {profileStats.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profileStats.wishlistItems}</p>
                    <p className="text-sm text-gray-600">Wishlist Items</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{profileStats.loyaltyPoints}</p>
                    <p className="text-sm text-gray-600">Loyalty Points</p>
                  </div>
                </div>

                {/* Account Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Account Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Member Since</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(userData.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Last Order</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(profileStats.lastOrderDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                      <p className="font-semibold text-gray-900">{profileStats.activeOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reviews Given</p>
                      <p className="font-semibold text-gray-900">{profileStats.reviewsGiven}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-6 text-white">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to="/shop"
                      className="flex items-center space-x-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
                    >
                      <Bike className="w-6 h-6" />
                      <span className="font-medium">Browse Products</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
                    >
                      <Package className="w-6 h-6" />
                      <span className="font-medium">Track Orders</span>
                    </Link>
                    <Link
                      to="/support"
                      className="flex items-center space-x-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="font-medium">Get Support</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={handleEditClick}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Avatar Upload */}
                <div className="mb-8 flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-600 overflow-hidden">
                      {avatarPreview || userData.avatar ? (
                        <img 
                          src={avatarPreview || userData.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${userData.firstName[0]}${userData.lastName[0]}`
                      )}
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Loader className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <span className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>Change Photo</span>
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={isEditingProfile ? editedData.firstName : userData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        } ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {validationErrors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={isEditingProfile ? editedData.lastName : userData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        } ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {validationErrors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                        {userData.emailVerified && (
                          <CheckCircle className="inline w-4 h-4 text-green-600 ml-2" />
                        )}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={isEditingProfile ? editedData.email : userData.email}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        } ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                        {userData.phoneVerified && (
                          <CheckCircle className="inline w-4 h-4 text-green-600 ml-2" />
                        )}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={isEditingProfile ? editedData.phone : userData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        } ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {validationErrors.phone && (
                        <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={isEditingProfile ? editedData.dateOfBirth : userData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={isEditingProfile ? editedData.gender : userData.gender}
                        onChange={handleInputChange}
                        disabled={!isEditingProfile}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        }`}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={isEditingProfile ? editedData.city : userData.city}
                      onChange={handleInputChange}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    >
                      <option value="Nairobi">Nairobi</option>
                      <option value="Mombasa">Mombasa</option>
                      <option value="Kisumu">Kisumu</option>
                      <option value="Nakuru">Nakuru</option>
                      <option value="Eldoret">Eldoret</option>
                      <option value="Thika">Thika</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={isEditingProfile ? editedData.address : userData.address}
                      onChange={handleInputChange}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={isEditingProfile ? editedData.bio : userData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditingProfile}
                      rows="4"
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {isEditingProfile && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                  
                  {passwordSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">{passwordSuccess}</p>
                    </div>
                  )}
                  
                  {passwordError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{passwordError}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Eye className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={isChangingPassword}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Changing Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userData.twoFactorEnabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {userData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Shield className="w-5 h-5" />
                    <span>{userData.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}</span>
                  </button>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Chrome on Windows</p>
                          <p className="text-sm text-gray-600">Nairobi, Kenya • Current session</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active Now</span>
                    </div>
                  </div>
                  <button className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium">
                    Sign out of all other sessions
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {[
                    { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about your order status' },
                    { key: 'promotions', label: 'Promotions & Offers', description: 'Receive special deals and discounts' },
                    { key: 'newsletter', label: 'Newsletter', description: 'Weekly cycling tips and news' },
                    { key: 'productRestock', label: 'Product Restock', description: 'Alert when wishlist items are back in stock' },
                    { key: 'priceDrops', label: 'Price Drops', description: 'Notify when prices drop on watched items' },
                    { key: 'newArrivals', label: 'New Arrivals', description: 'Get updates on new products' },
                    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive important updates via SMS' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(item.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-4">
                    <Link to="/download-data" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Download className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Download Your Data</p>
                          <p className="text-sm text-gray-600">Get a copy of your account information</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link to="/privacy-settings" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Privacy Settings</p>
                          <p className="text-sm text-gray-600">Manage your privacy preferences</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </Link>

                    <Link to="/connected-accounts" className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Link className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Connected Accounts</p>
                          <p className="text-sm text-gray-600">Manage linked social accounts</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                  <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab Placeholder */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Order management coming soon</p>
                  <Link to="/orders" className="text-blue-600 hover:text-blue-700 font-medium">
                    View full order history →
                  </Link>
                </div>
              </div>
            )}

            {/* Wishlist Tab Placeholder */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your wishlist is managed separately</p>
                  <Link to="/wishlist" className="text-blue-600 hover:text-blue-700 font-medium">
                    Go to wishlist →
                  </Link>
                </div>
              </div>
            )}

            {/* Addresses Tab Placeholder */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Manage your delivery addresses</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add New Address
                  </button>
                </div>
              </div>
            )}

            {/* Payment Tab Placeholder */}
            {activeTab === 'payment' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Manage your payment methods</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;