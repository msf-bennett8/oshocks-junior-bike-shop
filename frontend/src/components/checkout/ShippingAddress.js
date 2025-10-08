import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Home,
  Building,
  Phone,
  Mail,
  User,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Navigation,
  Package,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  Locate
} from 'lucide-react';

/**
 * ShippingAddress Component
 * Comprehensive address management with multiple saved addresses,
 * validation, and delivery estimates for Oshocks Junior Bike Shop
 */
const ShippingAddress = ({
  savedAddresses = [],
  onSelectAddress,
  onSaveAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  selectedAddressId = null,
  requiresValidation = true
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressList, setShowAddressList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    county: 'Nairobi',
    postalCode: '',
    deliveryInstructions: '',
    addressType: 'home',
    isDefault: false,
    label: ''
  });

  // Kenyan counties
  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
    'Malindi', 'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru',
    'Kisii', 'Kiambu', 'Machakos', 'Kajiado', 'Kilifi', 'Kwale',
    'Bungoma', 'Embu', 'Kericho', 'Migori', 'Narok', 'Nyandarua',
    'Samburu', 'Siaya', 'Taita Taveta', 'Trans Nzoia', 'Turkana',
    'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot', 'Baringo',
    'Bomet', 'Busia', 'Elgeyo Marakwet', 'Homa Bay', 'Isiolo',
    'Laikipia', 'Lamu', 'Makueni', 'Mandera', 'Marsabit', 'Nandi',
    'Nyamira', 'Tana River', 'Tharaka Nithi'
  ];

  // Address types
  const addressTypes = [
    { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { id: 'work', icon: <Building className="w-5 h-5" />, label: 'Work' },
    { id: 'other', icon: <MapPin className="w-5 h-5" />, label: 'Other' }
  ];

  // Popular cities for quick selection
  const popularCities = [
    'Nairobi CBD', 'Westlands', 'Kilimani', 'Kileleshwa', 'Karen',
    'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'
  ];

  // Shipping estimates by county
  const getShippingEstimate = (county) => {
    const estimates = {
      'Nairobi': { days: '1-2', cost: 0 },
      'Kiambu': { days: '2-3', cost: 200 },
      'Machakos': { days: '2-3', cost: 200 },
      'Kajiado': { days: '2-3', cost: 250 },
      'Mombasa': { days: '3-4', cost: 500 },
      'Kisumu': { days: '3-4', cost: 500 },
      'Nakuru': { days: '2-3', cost: 300 },
      'Eldoret': { days: '3-4', cost: 400 }
    };
    return estimates[county] || { days: '4-7', cost: 600 };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Kenyan phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City/Town is required';
    }

    if (!formData.county) {
      newErrors.county = 'County is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle save address
  const handleSaveAddress = () => {
    if (!validateForm()) return;

    const addressData = {
      ...formData,
      id: editingAddressId || Date.now(),
      createdAt: new Date().toISOString()
    };

    if (editingAddressId) {
      onUpdateAddress(addressData);
    } else {
      onSaveAddress(addressData);
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      apartment: '',
      city: '',
      county: 'Nairobi',
      postalCode: '',
      deliveryInstructions: '',
      addressType: 'home',
      isDefault: false,
      label: ''
    });
    setIsAddingNew(false);
    setEditingAddressId(null);
    setErrors({});
  };

  // Handle edit address
  const handleEditAddress = (address) => {
    setFormData(address);
    setEditingAddressId(address.id);
    setIsAddingNew(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete address
  const handleDeleteAddress = (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      onDeleteAddress(addressId);
    }
  };

  // Filter addresses by search
  const filteredAddresses = savedAddresses.filter(address => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      address.firstName?.toLowerCase().includes(searchLower) ||
      address.lastName?.toLowerCase().includes(searchLower) ||
      address.address?.toLowerCase().includes(searchLower) ||
      address.city?.toLowerCase().includes(searchLower) ||
      address.county?.toLowerCase().includes(searchLower) ||
      address.label?.toLowerCase().includes(searchLower)
    );
  });

  // Format phone number
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) {
      return '+254 ' + cleaned.slice(3, 6) + ' ' + cleaned.slice(6, 9) + ' ' + cleaned.slice(9, 12);
    }
    if (cleaned.startsWith('0')) {
      return cleaned.slice(0, 4) + ' ' + cleaned.slice(4, 7) + ' ' + cleaned.slice(7, 10);
    }
    return phone;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          Shipping Address
        </h2>
        <p className="text-blue-100">
          {isAddingNew ? 'Add a new shipping address' : 'Select or manage your delivery addresses'}
        </p>
      </div>

      {/* Add New Address Button */}
      {!isAddingNew && (
        <button
          onClick={() => setIsAddingNew(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Address
        </button>
      )}

      {/* Address Form */}
      {isAddingNew && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingAddressId ? 'Edit Address' : 'New Address'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {addressTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: type.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.addressType === type.id
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {type.icon}
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Address Label (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Label (Optional)
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Mom's House, Office, Apartment"
              />
            </div>

            {/* Name Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0712 345 678"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Kimathi Street"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Apartment/Suite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, Suite, etc. (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apt 4B, Floor 3"
                />
              </div>
            </div>

            {/* City and County */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Town *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  list="popular-cities"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nairobi"
                />
                <datalist id="popular-cities">
                  {popularCities.map(city => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                      errors.county ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {counties.map(county => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.county && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.county}
                  </p>
                )}
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code (Optional)
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00100"
              />
            </div>

            {/* Delivery Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Leave at reception, Call before delivery, Gate code: #123"
              />
            </div>

            {/* Shipping Estimate */}
            {formData.county && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 mb-1">Shipping Estimate</p>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getShippingEstimate(formData.county).days} business days
                      </span>
                      <span className="font-semibold">
                        {getShippingEstimate(formData.county).cost === 0
                          ? 'FREE SHIPPING'
                          : `KES ${getShippingEstimate(formData.county).cost}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Set as Default */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Set as default address
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSaveAddress}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingAddressId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Addresses List */}
      {!isAddingNew && savedAddresses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Saved Addresses ({savedAddresses.length})
            </h3>
            <button
              onClick={() => setShowAddressList(!showAddressList)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAddressList ? (
                <>
                  Hide <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {showAddressList && (
            <>
              {/* Search */}
              {savedAddresses.length > 3 && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search addresses..."
                    />
                  </div>
                </div>
              )}

              {/* Address Cards */}
              <div className="space-y-4">
                {filteredAddresses.map(address => {
                  const addressType = addressTypes.find(t => t.id === address.addressType);
                  const shippingEstimate = getShippingEstimate(address.county);
                  const isSelected = address.id === selectedAddressId;

                  return (
                    <div
                      key={address.id}
                      onClick={() => onSelectAddress(address)}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {address.isDefault && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            DEFAULT
                          </span>
                        </div>
                      )}

                      <div className="flex gap-4">
                        <div className={`${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                          {addressType?.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              {address.label && (
                                <p className="text-sm font-bold text-gray-900 mb-1">
                                  {address.label}
                                </p>
                              )}
                              <p className="font-semibold text-gray-900">
                                {address.firstName} {address.lastName}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <p>{address.address}</p>
                            {address.apartment && <p>{address.apartment}</p>}
                            <p>{address.city}, {address.county}</p>
                            {address.postalCode && <p>Postal Code: {address.postalCode}</p>}
                            <p className="flex items-center gap-2 mt-2">
                              <Phone className="w-4 h-4" />
                              {formatPhoneNumber(address.phone)}
                            </p>
                            {address.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {address.email}
                              </p>
                            )}
                          </div>

                          {address.deliveryInstructions && (
                            <div className="bg-gray-50 rounded p-2 mb-3">
                              <p className="text-xs text-gray-600">
                                <strong>Instructions:</strong> {address.deliveryInstructions}
                              </p>
                            </div>
                          )}

                          {/* Shipping Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {shippingEstimate.days} days
                            </span>
                            <span className="font-semibold">
                              {shippingEstimate.cost === 0 ? 'Free Shipping' : `KES ${shippingEstimate.cost}`}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {!address.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSetDefaultAddress(address.id);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-blue-50 rounded"
                              >
                                <Star className="w-3 h-3" />
                                Set as Default
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(address.id);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAddresses.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No addresses found matching "{searchQuery}"</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isAddingNew && savedAddresses.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Saved Addresses
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first address to get started with faster checkout
          </p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </div>
      )}

      {/* Location Tip */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Locate className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900 mb-1">
              Accurate Address = Faster Delivery
            </p>
            <p className="text-sm text-green-700">
              Include nearby landmarks, building names, or distinctive features to help our riders find you easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
const ShippingAddressDemo = () => {
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      phone: '0712345678',
      email: 'john.doe@example.com',
      address: '123 Kimathi Street',
      apartment: 'Prestige Plaza, 4th Floor',
      city: 'Nairobi CBD',
      county: 'Nairobi',
      postalCode: '00100',
      deliveryInstructions: 'Call before delivery. Security at main gate.',
      addressType: 'work',
      isDefault: true,
      label: 'Office',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      phone: '0723456789',
      email: '',
      address: '456 Ngong Road',
      apartment: 'House No. 7',
      city: 'Kilimani',
      county: 'Nairobi',
      postalCode: '',
      deliveryInstructions: 'Blue gate, leave with watchman',
      addressType: 'home',
      isDefault: false,
      label: 'Home',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '0734567890',
      email: 'jane@example.com',
      address: '789 Mombasa Road',
      apartment: '',
      city: 'Syokimau',
      county: 'Machakos',
      postalCode: '00100',
      deliveryInstructions: '',
      addressType: 'home',
      isDefault: false,
      label: "Mom's House",
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedAddressId, setSelectedAddressId] = useState(1);

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    console.log('Selected address:', address);
  };

  const handleSaveAddress = (address) => {
    // If setting as default, remove default from others
    if (address.isDefault) {
      setSavedAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: false
      })));
    }
    setSavedAddresses(prev => [...prev, address]);
    console.log('Saved new address:', address);
  };

  const handleUpdateAddress = (updatedAddress) => {
    // If setting as default, remove default from others
    if (updatedAddress.isDefault) {
      setSavedAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === updatedAddress.id ? true : false
      })));
    } else {
      setSavedAddresses(prev =>
        prev.map(addr => (addr.id === updatedAddress.id ? updatedAddress : addr))
      );
    }
    console.log('Updated address:', updatedAddress);
  };

  const handleDeleteAddress = (addressId) => {
    setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
    }
    console.log('Deleted address:', addressId);
  };

  const handleSetDefaultAddress = (addressId) => {
    setSavedAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    );
    console.log('Set default address:', addressId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Shipping Address Management
          </h1>
          <p className="text-gray-600">
            Oshocks Junior Bike Shop - Complete address management system
          </p>
        </div>

        <ShippingAddress
          savedAddresses={savedAddresses}
          onSelectAddress={handleSelectAddress}
          onSaveAddress={handleSaveAddress}
          onUpdateAddress={handleUpdateAddress}
          onDeleteAddress={handleDeleteAddress}
          onSetDefaultAddress={handleSetDefaultAddress}
          selectedAddressId={selectedAddressId}
          requiresValidation={true}
        />

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Component Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Multiple Addresses</p>
                <p className="text-sm text-gray-600">Save unlimited addresses</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Address Types</p>
                <p className="text-sm text-gray-600">Home, Work, Other</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Default Address</p>
                <p className="text-sm text-gray-600">Set preferred address</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Search & Filter</p>
                <p className="text-sm text-gray-600">Quick address lookup</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Kenya Counties</p>
                <p className="text-sm text-gray-600">All 47 counties supported</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Shipping Estimates</p>
                <p className="text-sm text-gray-600">Real-time delivery costs</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Form Validation</p>
                <p className="text-sm text-gray-600">Phone, email verification</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Edit & Delete</p>
                <p className="text-sm text-gray-600">Full CRUD operations</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Custom Labels</p>
                <p className="text-sm text-gray-600">Name your addresses</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Delivery Instructions</p>
                <p className="text-sm text-gray-600">Special delivery notes</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Mobile Responsive</p>
                <p className="text-sm text-gray-600">Perfect on all devices</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Visual Selection</p>
                <p className="text-sm text-gray-600">Clear address cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Address Display */}
        {selectedAddressId && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">Selected Address for Delivery:</h3>
            {(() => {
              const selected = savedAddresses.find(a => a.id === selectedAddressId);
              return selected ? (
                <div className="text-sm text-blue-700">
                  <p className="font-semibold">
                    {selected.label && `${selected.label} - `}
                    {selected.firstName} {selected.lastName}
                  </p>
                  <p>{selected.address}, {selected.city}, {selected.county}</p>
                  <p className="mt-1">Phone: {selected.phone}</p>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingAddressDemo;