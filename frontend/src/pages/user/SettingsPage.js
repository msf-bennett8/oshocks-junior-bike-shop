import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Lock, MapPin, Bell, Shield, CreditCard, Trash2, Save, Eye, EyeOff, Plus, Edit2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import addressService from '../../services/addressService';

// Helper to remove distance from zone display (same as ProfilePage)
const formatCityDisplay = (city) => {
  if (!city) return '';
  return city.replace(/\s*\([^)]*\)/g, '');
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [notification, setNotification] = useState(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState([]);

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

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalTab, setPaymentModalTab] = useState('mpesa'); // 'mpesa' | 'card'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  
  // New payment form data
  const [newPaymentData, setNewPaymentData] = useState({
    // M-Pesa fields
    mpesaNumber: '',
    mpesaName: '',
    // Card fields
    cardNumber: '',
    cardName: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCvv: '',
    cardBrand: 'visa'
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  });

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load all settings data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user) {
      loadSettingsData();
    }
  }, [user, isAuthenticated, navigate]);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      
      // Parallel data loading
      const [addressesRes, prefsRes, paymentRes] = await Promise.all([
        addressService.getAddresses(),
        profileService.getPreferences(),
        profileService.getPaymentMethods()
      ]);

      // Set profile data from user
      setProfileData({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.profile_image || null
      });

      // Update addresses
      if (addressesRes.success) {
        setAddresses(addressesRes.data.map(addr => ({
          id: addr.id,
          type: addr.type,
          name: addr.full_name,
          street: addr.address_line1,
          city: formatCityDisplay(addr.city),
          county: addr.county,
          postalCode: addr.postal_code,
          phone: addr.phone,
          isDefault: addr.is_default
        })));
      }

      // Update notifications/preferences
      if (prefsRes.success) {
        setNotifications({
          orderUpdates: prefsRes.data.order_updates,
          promotions: prefsRes.data.promotional_emails,
          newsletter: prefsRes.data.newsletter,
          productReviews: prefsRes.data.new_arrivals, // Using new_arrivals for product reviews
          smsNotifications: prefsRes.data.sms_notifications,
          emailNotifications: prefsRes.data.email_notifications,
          pushNotifications: true // Default if not in backend
        });
        
        // Update privacy settings
        setPrivacy({
          profileVisibility: prefsRes.data.profile_visibility || 'public',
          showEmail: prefsRes.data.show_email || false,
          showPhone: prefsRes.data.show_phone || false,
          dataSharing: prefsRes.data.data_sharing || false
        });
      }

      // Update payment methods - now from dedicated API
      const paymentMethodsRes = await profileService.getPaymentMethods();
      if (paymentMethodsRes.success) {
        // Flatten the mpesa and cards arrays and add isDefault flag
        const methods = [
          ...paymentMethodsRes.data.mpesa.map(m => ({ ...m, isDefault: m.isDefault ?? false })),
          ...paymentMethodsRes.data.cards.map(c => ({ ...c, isDefault: c.isDefault ?? false }))
        ];
        setPaymentMethods(methods);
      }

    } catch (error) {
      console.error('Failed to load settings:', error);
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = async (field) => {
    const newNotifications = { ...notifications, [field]: !notifications[field] };
    setNotifications(newNotifications);
    
    // Map frontend field names to backend field names
    const fieldMapping = {
      'orderUpdates': 'order_updates',
      'promotions': 'promotional_emails',
      'newsletter': 'newsletter',
      'productReviews': 'new_arrivals',
      'smsNotifications': 'sms_notifications',
      'emailNotifications': 'email_notifications',
      'pushNotifications': 'email_notifications' // Map push to email for now
    };
    
    const backendField = fieldMapping[field];
    if (backendField) {
      try {
        await profileService.updatePreferences({
          [backendField]: newNotifications[field]
        });
        showNotification('Notification preference saved!');
      } catch (error) {
        console.error('Failed to save notification preference:', error);
        showNotification('Failed to save preference', 'error');
      }
    }
  };

  const handlePrivacyChange = async (field, value) => {
    const newPrivacy = { ...privacy, [field]: value };
    setPrivacy(newPrivacy);
    
    // Map frontend field names to backend field names
    const fieldMapping = {
      'profileVisibility': 'profile_visibility',
      'showEmail': 'show_email',
      'showPhone': 'show_phone',
      'dataSharing': 'data_sharing'
    };
    
    const backendField = fieldMapping[field];
    if (backendField) {
      try {
        await profileService.updatePreferences({
          [backendField]: value
        });
        showNotification('Privacy setting saved!');
      } catch (error) {
        console.error('Failed to save privacy setting:', error);
        showNotification('Failed to save privacy setting', 'error');
      }
    }
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const updates = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
      };
      
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

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match!', 'error');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long!', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPasswordConfirmation: passwordData.confirmPassword
      });
      
      if (result.success) {
        showNotification('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      const addressData = {
        full_name: newAddress.name,
        phone: newAddress.phone,
        address_line1: newAddress.street,
        address_line2: '',
        city: newAddress.city,
        county: newAddress.county,
        postal_code: newAddress.postalCode,
        country: 'Kenya',
        type: newAddress.type,
        is_default: newAddress.isDefault
      };
      
      const response = await addressService.createAddress(addressData);
      
      if (response.success) {
        setAddresses(prev => [...prev, { ...newAddress, id: response.data.id }]);
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
        showNotification('Address added successfully!');
      }
    } catch (error) {
      console.error('Failed to add address:', error);
      showNotification('Failed to add address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setShowAddressModal(true);
  };

  const handleUpdateAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setSaving(true);
      
      const addressData = {
        full_name: newAddress.name,
        phone: newAddress.phone,
        address_line1: newAddress.street,
        address_line2: '',
        city: newAddress.city,
        county: newAddress.county,
        postal_code: newAddress.postalCode,
        country: 'Kenya',
        type: newAddress.type,
        is_default: newAddress.isDefault
      };
      
      const response = await addressService.updateAddress(editingAddress.id, addressData);
      
      if (response.success) {
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
        showNotification('Address updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      showNotification('Failed to update address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(id);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        showNotification('Address deleted successfully!');
      } catch (error) {
        console.error('Failed to delete address:', error);
        showNotification('Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      })));
      showNotification('Default address updated!');
    } catch (error) {
      console.error('Failed to set default address:', error);
      showNotification('Failed to update default address', 'error');
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion request submitted. You will receive an email confirmation.');
    setShowDeleteModal(false);
  };

  const handleSetDefaultPayment = async (id) => {
    try {
      setPaymentLoading(true);
      
      const response = await profileService.setDefaultPaymentMethod(id);
      
      if (response.success) {
        setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
        showNotification('Default payment method updated!');
      } else {
        showNotification(response.message || 'Failed to update default payment', 'error');
      }
    } catch (error) {
      console.error('Failed to set default payment:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update default payment';
      showNotification(errorMsg, 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        setPaymentLoading(true);
        
        const response = await profileService.deletePaymentMethod(id);
        
        if (response.success) {
          setPaymentMethods(prev => prev.filter(p => p.id !== id));
          showNotification('Payment method removed!');
        } else {
          showNotification(response.message || 'Failed to remove payment method', 'error');
        }
      } catch (error) {
        console.error('Failed to delete payment method:', error);
        const errorMsg = error.response?.data?.message || 'Failed to remove payment method';
        showNotification(errorMsg, 'error');
      } finally {
        setPaymentLoading(false);
      }
    }
  };

  const handlePaymentMethodClick = (method) => {
    setSelectedPaymentMethod(method);
    setShowPaymentDetailsModal(true);
  };

  const handleAddPaymentClick = () => {
    setPaymentModalTab('mpesa');
    setNewPaymentData({
      mpesaNumber: '',
      mpesaName: '',
      cardNumber: '',
      cardName: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCvv: '',
      cardBrand: 'visa'
    });
    setShowPaymentModal(true);
  };

  const handleSaveNewPayment = async () => {
    try {
      setSaving(true);
      
      if (paymentModalTab === 'mpesa') {
        // Validate M-Pesa data
        if (!newPaymentData.mpesaNumber || !newPaymentData.mpesaName) {
          showNotification('Please fill in all M-Pesa fields', 'error');
          return;
        }
        
        // Format phone number
        let formattedPhone = newPaymentData.mpesaNumber.replace(/\s/g, '');
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+')) {
          formattedPhone = formattedPhone.slice(1);
        }
        
        // Save to database via API
        const response = await profileService.createPaymentMethod({
          type: 'mpesa',
          phone_number: formattedPhone,
          mpesa_name: newPaymentData.mpesaName,
          is_default: paymentMethods.length === 0
        });
        
        if (response.success) {
          // Add to local state with returned ID
          const newMethod = {
            id: response.data.id,
            type: 'mpesa',
            phone_number: formattedPhone,
            name: newPaymentData.mpesaName || 'M-Pesa (' + formattedPhone.slice(-4) + ')',
            mpesa_name: newPaymentData.mpesaName,
            isDefault: response.data.is_default ?? (paymentMethods.length === 0)
          };
          
          setPaymentMethods(prev => [...prev, newMethod]);
          showNotification('M-Pesa payment method added successfully!');
        } else {
          showNotification(response.message || 'Failed to add payment method', 'error');
          return;
        }
        
      } else {
        // Validate card data
        if (!newPaymentData.cardNumber || !newPaymentData.cardName || 
            !newPaymentData.cardExpiryMonth || !newPaymentData.cardExpiryYear || !newPaymentData.cardCvv) {
          showNotification('Please fill in all card fields', 'error');
          return;
        }
        
        // Extract last 4 digits
        const last4 = newPaymentData.cardNumber.slice(-4);
        
        // Save to database via API
        const response = await profileService.createPaymentMethod({
          type: 'card',
          last4: last4,
          brand: newPaymentData.cardBrand,
          expiry_month: newPaymentData.cardExpiryMonth,
          expiry_year: newPaymentData.cardExpiryYear,
          card_name: newPaymentData.cardName,
          is_default: paymentMethods.length === 0
        });
        
        if (response.success) {
          // Add to local state with returned ID
          const newMethod = {
            id: response.data.id,
            type: 'card',
            last4: last4,
            brand: newPaymentData.cardBrand,
            expiry_month: newPaymentData.cardExpiryMonth,
            expiry_year: newPaymentData.cardExpiryYear,
            name: newPaymentData.cardName,
            card_name: newPaymentData.cardName,
            isDefault: response.data.is_default ?? (paymentMethods.length === 0)
          };
          
          setPaymentMethods(prev => [...prev, newMethod]);
          showNotification('Card payment method added successfully!');
        } else {
          showNotification(response.message || 'Failed to add payment method', 'error');
          return;
        }
      }
      
      setShowPaymentModal(false);
      setNewPaymentData({
        mpesaNumber: '',
        mpesaName: '',
        cardNumber: '',
        cardName: '',
        cardExpiryMonth: '',
        cardExpiryYear: '',
        cardCvv: '',
        cardBrand: 'visa'
      });
      
    } catch (error) {
      console.error('Failed to add payment method:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add payment method';
      showNotification(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!selectedPaymentMethod) return;
    
    try {
      setSaving(true);
      
      // Use a ref or direct value to ensure we have latest state
      const currentMethod = selectedPaymentMethod;
      
      const updateData = {};
      
      if (currentMethod.type === 'mpesa') {
        // Only send fields that can actually be updated
        updateData.mpesa_name = currentMethod.mpesa_name || currentMethod.name;
        updateData.phone_number = currentMethod.phone_number;
      } else {
        updateData.card_name = currentMethod.card_name || currentMethod.name;
        updateData.expiry_month = currentMethod.expiry_month;
        updateData.expiry_year = currentMethod.expiry_year;
      }
      
      updateData.is_default = currentMethod.isDefault;
      
      console.log('Updating payment method with data:', updateData);
      
      const response = await profileService.updatePaymentMethod(currentMethod.id, updateData);
      
      if (response.success) {
        // Merge the response data with current method to ensure we have latest
        const updatedMethod = { ...currentMethod, ...response.data };
        
        // Update the payment method in the list
        setPaymentMethods(prev => prev.map(p => 
          p.id === currentMethod.id ? updatedMethod : p
        ));
        
        showNotification('Payment method updated successfully!');
        setShowPaymentDetailsModal(false);
        setSelectedPaymentMethod(null);
      } else {
        showNotification(response.message || 'Failed to update payment method', 'error');
      }
      
    } catch (error) {
      console.error('Failed to update payment method:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update payment method';
      showNotification(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? '✓' : '✕'}
            {notification.message}
          </div>
        )}

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
                      ? 'border-orange-600 text-orange-700 font-medium bg-orange-50'
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
                  <label className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white p-2 rounded-full cursor-pointer hover:from-orange-700 hover:to-orange-600 transition-colors">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
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
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
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
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors text-sm sm:text-base"
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
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Promotions & Offers</span>
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Newsletter</span>
                      <input
                        type="checkbox"
                        checked={notifications.newsletter}
                        onChange={() => handleNotificationChange('newsletter')}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Product Reviews</span>
                      <input
                        type="checkbox"
                        checked={notifications.productReviews}
                        onChange={() => handleNotificationChange('productReviews')}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
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
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-700 text-sm sm:text-base">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={() => handleNotificationChange('pushNotifications')}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
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
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
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
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
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
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
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
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No saved payment methods found.</p>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      onClick={() => handlePaymentMethodClick(method)}
                      className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:border-green-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 rounded flex items-center justify-center flex-shrink-0 bg-white border border-gray-200 overflow-hidden">
                          {method.type === 'mpesa' ? (
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                              alt="M-Pesa" 
                              className="h-6 w-auto object-contain"
                            />
                          ) : method.brand === 'visa' ? (
                            <img 
                              src="/assets/images/visa-logo.svg" 
                              alt="Visa" 
                              className="h-6 w-auto object-contain"
                            />
                          ) : method.brand === 'mastercard' ? (
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                              alt="Mastercard" 
                              className="h-6 w-auto object-contain"
                            />
                          ) : method.brand === 'amex' ? (
                            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">AMEX</div>
                          ) : (
                            <CreditCard className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">{method.name}</p>
                          {method.type === 'mpesa' ? (
                            <p className="text-sm text-gray-600">{method.phone_number}</p>
                          ) : (
                            <p className="text-sm text-gray-600">
                              •••• {method.last4} - Expires {method.expiry_month}/{method.expiry_year}
                            </p>
                          )}
                          {method.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        {!method.isDefault && (
                          <button 
                            onClick={() => handleSetDefaultPayment(method.id)}
                            className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded hover:bg-green-50"
                          >
                            Set Default
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50"
                          disabled={method.isDefault}
                          title={method.isDefault ? "Cannot delete default payment method" : "Remove payment method"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button 
                  onClick={handleAddPaymentClick}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="Building name, street, apartment"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
                    <select
                      value={newAddress.county}
                      onChange={(e) => setNewAddress({...newAddress, county: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                      placeholder="+254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  {saving ? (editingAddress ? 'Updating...' : 'Adding...') : (editingAddress ? 'Update Address' : 'Add Address')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* Add Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add Payment Method</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setPaymentModalTab('mpesa')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    paymentModalTab === 'mpesa'
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                      alt="M-Pesa" 
                      className="h-6 w-auto object-contain"
                    />
                    M-Pesa
                  </div>
                </button>
                <button
                  onClick={() => setPaymentModalTab('card')}
                  className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors ${
                    paymentModalTab === 'card'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center gap-1">
                      <img 
                        src="/assets/images/visa-logo.svg" 
                        alt="Visa" 
                        className="h-4 w-auto object-contain opacity-60"
                      />
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                        alt="Mastercard" 
                        className="h-4 w-auto object-contain opacity-60"
                      />
                    </div>
                    Credit Card
                  </div>
                </button>
              </div>

              {/* M-Pesa Form */}
              {paymentModalTab === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Number *
                    </label>
                    <input
                      type="tel"
                      value={newPaymentData.mpesaNumber}
                      onChange={(e) => setNewPaymentData({...newPaymentData, mpesaNumber: e.target.value})}
                      placeholder="e.g., 0712 345 678 or 254712345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter your Safaricom M-Pesa number</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newPaymentData.mpesaName}
                      onChange={(e) => setNewPaymentData({...newPaymentData, mpesaName: e.target.value})}
                      placeholder="e.g., My M-Pesa"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> You'll receive an STK push notification on this number to verify ownership when making payments.
                    </p>
                  </div>
                </div>
              )}

              {/* Card Form */}
              {paymentModalTab === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={newPaymentData.cardNumber}
                      onChange={(e) => setNewPaymentData({...newPaymentData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                      maxLength={16}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={newPaymentData.cardName}
                      onChange={(e) => setNewPaymentData({...newPaymentData, cardName: e.target.value})}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Month *
                      </label>
                      <select
                        value={newPaymentData.cardExpiryMonth}
                        onChange={(e) => setNewPaymentData({...newPaymentData, cardExpiryMonth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">MM</option>
                        {Array.from({length: 12}, (_, i) => {
                          const month = String(i + 1).padStart(2, '0');
                          return <option key={month} value={month}>{month}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year *
                      </label>
                      <select
                        value={newPaymentData.cardExpiryYear}
                        onChange={(e) => setNewPaymentData({...newPaymentData, cardExpiryYear: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">YY</option>
                        {Array.from({length: 10}, (_, i) => {
                          const year = String(new Date().getFullYear() + i).slice(-2);
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="password"
                        value={newPaymentData.cardCvv}
                        onChange={(e) => setNewPaymentData({...newPaymentData, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Brand
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'visa', label: 'Visa', logo: '/assets/images/visa-logo.svg' },
                        { id: 'mastercard', label: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
                        { id: 'amex', label: 'Amex', logo: null }
                      ].map((brand) => (
                        <button
                          key={brand.id}
                          onClick={() => setNewPaymentData({...newPaymentData, cardBrand: brand.id})}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                            newPaymentData.cardBrand === brand.id
                              ? 'border-orange-600 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {brand.logo ? (
                            <img 
                              src={brand.logo} 
                              alt={brand.label} 
                              className="h-4 w-auto object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold">AMEX</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Secure:</strong> Your card details are encrypted and stored securely. We never store your CVV.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewPayment}
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600"
                >
                  {saving ? 'Saving...' : 'Add Payment Method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Details Modal */}
      {showPaymentDetailsModal && selectedPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Payment Method Details</h3>
                <button
                  onClick={() => {
                    setShowPaymentDetailsModal(false);
                    setSelectedPaymentMethod(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-gray-200 overflow-hidden">
                  {selectedPaymentMethod.type === 'mpesa' ? (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                      alt="M-Pesa" 
                      className="h-8 w-auto object-contain"
                    />
                  ) : selectedPaymentMethod.brand === 'visa' ? (
                    <img 
                      src="/assets/images/visa-logo.svg" 
                      alt="Visa" 
                      className="h-8 w-auto object-contain"
                    />
                  ) : selectedPaymentMethod.brand === 'mastercard' ? (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                      alt="Mastercard" 
                      className="h-8 w-auto object-contain"
                    />
                  ) : selectedPaymentMethod.brand === 'amex' ? (
                    <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded">AMEX</div>
                  ) : (
                    <CreditCard className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedPaymentMethod.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{selectedPaymentMethod.type}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {selectedPaymentMethod.type === 'mpesa' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={selectedPaymentMethod.phone_number || ''}
                        onChange={(e) => setSelectedPaymentMethod(prev => ({...prev, phone_number: e.target.value}))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={selectedPaymentMethod.name || ''}
                        onChange={(e) => setSelectedPaymentMethod(prev => ({
                          ...prev, 
                          name: e.target.value, 
                          mpesa_name: e.target.value
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={`•••• •••• •••• ${selectedPaymentMethod.last4}`}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">For security, only last 4 digits are shown</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={selectedPaymentMethod.name || ''}
                        onChange={(e) => setSelectedPaymentMethod(prev => ({
                          ...prev, 
                          name: e.target.value, 
                          card_name: e.target.value
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                        <select
                          value={selectedPaymentMethod.expiry_month || ''}
                          onChange={(e) => setSelectedPaymentMethod(prev => ({...prev, expiry_month: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {Array.from({length: 12}, (_, i) => {
                            const month = String(i + 1).padStart(2, '0');
                            return <option key={month} value={month}>{month}</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                        <select
                          value={selectedPaymentMethod.expiry_year || ''}
                          onChange={(e) => setSelectedPaymentMethod(prev => ({...prev, expiry_year: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {Array.from({length: 10}, (_, i) => {
                            const year = String(new Date().getFullYear() + i).slice(-2);
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedPaymentMethod.isDefault || false}
                    onChange={(e) => setSelectedPaymentMethod(prev => ({...prev, isDefault: e.target.checked}))}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Set as default payment method</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowPaymentDetailsModal(false);
                    setSelectedPaymentMethod(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePaymentMethod}
                  disabled={saving}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          ... (existing delete modal content)
        </div>
      )}
    </div>
  );
};

export default SettingsPage;