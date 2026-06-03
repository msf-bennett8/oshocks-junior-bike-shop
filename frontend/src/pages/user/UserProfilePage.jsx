import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, CreditCard, Bell, ShoppingBag, Heart, Settings, Camera, Save, X, Edit2, Trash2, Plus, Home, Building, AlertCircle, CheckCircle, Eye, EyeOff, LogOut, Shield } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import addressService from '../../services/addressService';

// Helper to remove distance from zone display
const formatCityDisplay = (city) => {
  if (!city) return '';
  return city.replace(/\s*\([^)]*\)/g, '');
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { wishlistCount, refreshWishlist } = useWishlist();
  
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

  const [addresses, setAddresses] = useState([]);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Payment modal states (same as SettingsPage)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalTab, setPaymentModalTab] = useState('mpesa');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  
  // New payment form data (same as SettingsPage)
  const [newPaymentData, setNewPaymentData] = useState({
    mpesaNumber: '',
    mpesaName: '',
    cardNumber: '',
    cardName: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardCvv: '',
    cardBrand: 'visa'
  });

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
  
  // Login Activity State
  const [loginActivity, setLoginActivity] = useState([]);

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
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    reviewsWritten: 0,
    loyaltyPoints: 0
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

// Load all user data
useEffect(() => {
  if (user) {
    loadUserData();
  }
}, [user]);

const loadUserData = async () => {
  try {
    setLoading(true);
    
    // Parallel data loading
    const [statsRes, addressesRes, paymentRes, prefsRes, activityRes] = await Promise.all([
      profileService.getStats(),
      addressService.getAddresses(),
      profileService.getPaymentMethods(),
      profileService.getPreferences(),
      profileService.getLoginActivity()
    ]);

    // Update stats
    if (statsRes.success) {
      setStats({
        totalOrders: statsRes.data.total_orders,
        totalSpent: statsRes.data.total_spent,
        wishlistItems: statsRes.data.wishlist_count,
        reviewsWritten: statsRes.data.reviews_count,
        loyaltyPoints: statsRes.data.loyalty_points
      });
    }

    // Update addresses
    if (addressesRes.success) {
      // Remove duplicates based on ID
      const uniqueAddresses = addressesRes.data.filter((addr, index, self) => 
        index === self.findIndex(a => a.id === addr.id)
      );
      
      setAddresses(uniqueAddresses.map(addr => ({
        id: addr.id,
        type: addr.type,
        isDefault: addr.is_default,
        fullName: addr.full_name,
        phone: addr.phone,
        street: addr.address_line1,
        building: addr.address_line2 || '',
        city: addr.city,
        county: addr.county,
        postalCode: addr.postal_code,
        deliveryInstructions: addr.delivery_instructions || ''
      })));
    }

    // Update payment methods - now from dedicated API with proper defaults
    if (paymentRes.success) {
      const methods = [
        ...paymentRes.data.mpesa.map(m => ({ ...m, isDefault: m.isDefault ?? false })),
        ...paymentRes.data.cards.map(c => ({ ...c, isDefault: c.isDefault ?? false }))
      ];
      setPaymentMethods(methods);
    }

    // Update preferences
    if (prefsRes.success) {
      setPreferences({
        emailNotifications: prefsRes.data.email_notifications,
        smsNotifications: prefsRes.data.sms_notifications,
        orderUpdates: prefsRes.data.order_updates,
        promotionalEmails: prefsRes.data.promotional_emails,
        newArrivals: prefsRes.data.new_arrivals,
        priceDropAlerts: prefsRes.data.price_drop_alerts,
        newsletter: prefsRes.data.newsletter,
        twoFactorAuth: prefsRes.data.two_factor_auth,
        language: prefsRes.data.language,
        currency: prefsRes.data.currency
      });
    }

    // Update login activity
    if (activityRes.success) {
      setLoginActivity(activityRes.data.map(activity => ({
        id: activity.id,
        date: new Date(activity.occurred_at).toLocaleDateString('en-KE', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        device: activity.user_agent,
        location: 'Nairobi, Kenya',
        status: activity.type === 'login_success' ? 'success' : 'info',
        isCurrentSession: activity.is_current_session
      })));
    }

    // Set user data from auth context
    setUserData({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: '',
      profileImage: user.profile_image || null,
      bio: '',
      memberSince: user.created_at || ''
    });

  } catch (error) {
    console.error('Failed to load user data:', error);
    showNotification('Failed to load profile data', 'error');
  } finally {
    setLoading(false);
  }
};

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
    
    // Store original values for audit comparison
    const originalEmail = user?.email;
    const originalPhone = user?.phone;
    
    // Call AuthContext updateProfile
    const result = await updateProfile(updates);
    
    if (result.success) {
      showNotification('Profile updated successfully!');
      
      // Log profile updated event
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
        
        const changedFields = [];
        const oldValues = {};
        const newValues = {};
        
        if (originalEmail !== userData.email) {
          changedFields.push('email');
          oldValues.email = originalEmail;
          newValues.email = userData.email;
        }
        if (originalPhone !== userData.phone) {
          changedFields.push('phone');
          oldValues.phone = originalPhone;
          newValues.phone = userData.phone;
        }
        if (user?.name !== updates.name) {
          changedFields.push('name');
          oldValues.name = user?.name;
          newValues.name = updates.name;
        }
        
        // Log PROFILE_UPDATED
        if (changedFields.length > 0) {
          await logFrontendAuditEvent(AUDIT_EVENTS.PROFILE_UPDATED, {
            category: 'user',
            severity: 'low',
            metadata: {
              changed_fields: changedFields,
              old_values: oldValues,
              new_values: newValues,
              timestamp: new Date().toISOString(),
            },
          });
        }
        
        // Log EMAIL_CHANGED if email was modified
        if (originalEmail !== userData.email) {
          await logFrontendAuditEvent(AUDIT_EVENTS.EMAIL_CHANGED, {
            category: 'user',
            severity: 'medium',
            metadata: {
              old_email: originalEmail,
              new_email: userData.email,
              verification_status: 'pending',
              timestamp: new Date().toISOString(),
            },
          });
        }
        
        // Log PHONE_CHANGED if phone was modified
        if (originalPhone !== userData.phone) {
          await logFrontendAuditEvent(AUDIT_EVENTS.PHONE_CHANGED, {
            category: 'user',
            severity: 'medium',
            metadata: {
              old_phone_hash: originalPhone ? btoa(originalPhone).substring(0, 20) : null,
              new_phone_hash: userData.phone ? btoa(userData.phone).substring(0, 20) : null,
              verification_status: 'pending',
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (e) {
        // Silently fail
      }
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

  const handleAddressSubmit = async (address) => {
    try {
      setSaving(true);
      
      const addressData = {
        full_name: address.fullName,
        phone: address.phone,
        address_line1: address.street,
        address_line2: address.building,
        city: address.city,
        county: address.county,
        postal_code: address.postalCode,
        delivery_instructions: address.deliveryInstructions,
        country: 'Kenya',
        type: address.type,
        is_default: address.isDefault
      };

      if (editingAddress) {
        const response = await addressService.updateAddress(editingAddress.id, addressData);
        if (response.success) {
          setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...address, id: editingAddress.id } : a));
          showNotification('Address updated successfully!');
        }
      } else {
        const response = await addressService.createAddress(addressData);
        if (response.success) {
          setAddresses([...addresses, { ...address, id: response.data.id }]);
          showNotification('Address added successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      showNotification('Failed to save address', 'error');
    } finally {
      setSaving(false);
      setShowAddressForm(false);
      setEditingAddress(null);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      showNotification('Address deleted successfully!');
    } catch (error) {
      console.error('Failed to delete address:', error);
      showNotification('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
      showNotification('Default address updated!');
    } catch (error) {
      console.error('Failed to set default address:', error);
      showNotification('Failed to update default address', 'error');
    }
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
      
      // Use a direct value to ensure we have latest state
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

   const handlePreferenceChange = async (key) => {
    const oldValue = preferences[key];
    const newValue = !oldValue;
    const newPreferences = { ...preferences, [key]: newValue };
    setPreferences(newPreferences);
    
    // Log notification settings changed
    if (['emailNotifications', 'smsNotifications', 'pushNotifications', 'orderUpdates', 'promotionalEmails', 'newArrivals', 'priceDropAlerts', 'newsletter'].includes(key)) {
      try {
        const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
        await logFrontendAuditEvent(AUDIT_EVENTS.NOTIFICATION_SETTINGS_CHANGED, {
          category: 'notification',
          severity: 'low',
          metadata: {
            setting_key: key,
            old_value: oldValue,
            new_value: newValue,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        // Silently fail
      }
    }
    
    // Debounce the API call
    clearTimeout(window.prefTimeout);
    window.prefTimeout = setTimeout(async () => {
      try {
        await profileService.updatePreferences({
          [key]: newPreferences[key]
        });
        showNotification('Preferences saved!');
      } catch (error) {
        console.error('Failed to save preferences:', error);
        showNotification('Failed to save preferences', 'error');
      }
    }, 500);
  };

  const handlePreferenceSelectChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await profileService.updatePreferences({ [key]: value });
      showNotification('Preferences saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      showNotification('Failed to save preferences', 'error');
    }
  };

    const handleAccountDelete = async () => {
    try {
      // Log account deactivated event BEFORE deletion
      const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
      
      await logFrontendAuditEvent(AUDIT_EVENTS.ACCOUNT_DEACTIVATED, {
        category: 'user',
        severity: 'high',
        metadata: {
          reason: 'user_requested_deletion',
          deactivated_by: user?.id || 'self',
          timestamp: new Date().toISOString(),
          reactivation_eligible_date: null,
        },
      });
      
      // Log account deleted event
      await logFrontendAuditEvent(AUDIT_EVENTS.ACCOUNT_DELETED, {
        category: 'user',
        severity: 'critical',
        metadata: {
          deleted_by: user?.id || 'self',
          reason: 'user_requested',
          deletion_type: 'GDPR',
          timestamp: new Date().toISOString(),
          data_retention_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      });
      
      // Log data anonymization
      await logFrontendAuditEvent(AUDIT_EVENTS.DATA_ANONYMIZED, {
        category: 'privacy',
        severity: 'high',
        metadata: {
          anonymized_user_id: `anon_${Date.now()}`,
          retention_reason: 'legal_obligation_orders',
          orders_retained: true,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      // Silently fail - still proceed with deletion
    }
    
    // Implement account deletion
    alert('Account deletion requested. Our team will contact you.');
    setShowDeleteModal(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: preferences.currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Navigation handlers
  const handleOrdersClick = () => navigate('/orders');
  const handleWishlistClick = () => navigate('/wishlist');

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
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
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-center text-2xl md:text-3xl font-bold border-4 border-orange-100">
                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-600 to-orange-500 text-white p-2 rounded-full cursor-pointer hover:from-orange-700 hover:to-orange-600 transition-colors">
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
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={handleOrdersClick}
              >
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                <div className="text-xs text-gray-600">Orders</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-gray-600">Spent</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={handleWishlistClick}
              >
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
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
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
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
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
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
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
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
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
                    ? 'border-orange-600 text-orange-600 bg-orange-50'
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Tell us about yourself and your cycling interests..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors disabled:opacity-50 flex items-center"
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
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors"
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
                          <p>{formatCityDisplay(address.city)}, {address.county}</p>
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
                    onClick={handleAddPaymentClick}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Payment
                  </button>
                </div>

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
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors"
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
                          className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors disabled:opacity-50"
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
                      {loginActivity.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent login activity found.</p>
                      ) : (
                        loginActivity.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {activity.isCurrentSession ? 'Current Session' : activity.date}
                              </p>
                              <p className="text-xs text-gray-600">Nairobi, Kenya • {activity.device}</p>
                            </div>
                            {activity.isCurrentSession && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Active</span>
                            )}
                          </div>
                        ))
                      )}
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
                        onChange={(e) => handlePreferenceSelectChange('language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        onChange={(e) => handlePreferenceSelectChange('currency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors"
                  >
                    <Save className="w-5 h-5 inline mr-2" />
                    Save Preferences
                  </button>
                </div>

                {/* Data Export Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Privacy</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      Request a copy of your personal data. This may take up to 24 hours to prepare.
                    </p>
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm(
                          'Request a copy of your personal data? This may take up to 24 hours to prepare.'
                        );
                        if (!confirmed) return;
                        
                        try {
                          const { logFrontendAuditEvent, AUDIT_EVENTS } = await import('../../utils/auditUtils');
                          
                          await logFrontendAuditEvent(AUDIT_EVENTS.DATA_EXPORT_REQUESTED, {
                            category: 'privacy',
                            severity: 'medium',
                            metadata: {
                              request_id: `export_${Date.now()}`,
                              requested_at: new Date().toISOString(),
                              export_type: 'full',
                              formats: ['JSON', 'CSV'],
                              status: 'pending',
                              deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                            },
                          });
                          
                          showNotification('Data export requested! You will receive an email when ready.', 'success');
                        } catch (e) {
                          console.error('Failed to log export request:', e);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Download Your Data (GDPR Export)
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-gray-500">Otherwise preferences are saved automatically when you make changes.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
                      ? 'border-green-600 text-green-600'
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
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
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                        <select
                          value={selectedPaymentMethod.expiry_month || ''}
                          onChange={(e) => setSelectedPaymentMethod(prev => ({...prev, expiry_month: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 font-medium transition-colors"
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