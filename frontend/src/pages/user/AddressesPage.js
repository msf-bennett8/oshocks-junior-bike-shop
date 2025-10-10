import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Edit2, Trash2, Check, X, Home, Briefcase, Navigation,
  Search, Star, Clock, Copy,
  Map, Phone, User, MessageSquare, AlertCircle, CheckCircle,
  MapPinned, Truck, Package, MoreVertical,
  Archive, ExternalLink, Mail, Save, RefreshCw, Download
} from 'lucide-react';

const AddressesPage = ({ 
  onSelectAddress, 
  selectedAddressId = null,
  allowSelection = true,
  showActions = true,
  mode = 'full' // 'full', 'compact', 'selection'
}) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, home, work, other
  const [sortBy, setSortBy] = useState('recent'); // recent, name, county, default
  const [viewMode, setViewMode] = useState('cards'); // cards, list, map
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [addressStats, setAddressStats] = useState({});
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [archivedAddresses, setArchivedAddresses] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    label: 'home',
    fullName: '',
    phoneNumber: '',
    alternativePhone: '',
    email: '',
    county: '',
    town: '',
    streetAddress: '',
    building: '',
    floor: '',
    apartmentNumber: '',
    landmark: '',
    deliveryInstructions: '',
    latitude: '',
    longitude: '',
    isDefault: false,
    isFavorite: false,
    allowWeekendDelivery: true,
    preferredDeliveryTime: 'anytime',
    accessCode: '',
    gateCode: '',
    notes: ''
  });

  // Kenyan counties with major towns
  const kenyanCounties = {
    'Nairobi': ['Westlands', 'Kilimani', 'Parklands', 'CBD', 'Karen', 'Lavington', 'Runda', 'Upperhill'],
    'Mombasa': ['Nyali', 'Bamburi', 'Likoni', 'CBD', 'Diani', 'Shanzu'],
    'Kisumu': ['Milimani', 'Mamboleo', 'CBD', 'Tom Mboya', 'Kondele'],
    'Nakuru': ['Milimani', 'Section 58', 'CBD', 'Pipeline', 'London'],
    'Eldoret': ['Pioneer', 'Langas', 'CBD', 'West Indies', 'Elgon View'],
    'Thika': ['Section 7', 'Makongeni', 'CBD', 'Landless', 'Gatuanyaga'],
    'Malindi': ['CBD', 'Shella', 'Watamu', 'Silversands'],
    'Kitale': ['CBD', 'Hospital', 'Milimani', 'Market'],
    'Machakos': ['CBD', 'Kwa Kyelu', 'Mua', 'Katangi'],
    'Kiambu': ['CBD', 'Thogoto', 'Kikuyu', 'Ruaka', 'Ruiru'],
    'Kajiado': ['CBD', 'Ongata Rongai', 'Ngong', 'Kiserian', 'Kitengela']
  };

  const allCounties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kiambu',
    'Kajiado', 'Kilifi', 'Bungoma', 'Embu', 'Kericho', 'Nandi', 'Narok',
    'Homa Bay', 'Migori', 'Kisii', 'Siaya', 'Trans Nzoia', 'Uasin Gishu',
    'Vihiga', 'Bomet', 'Busia', 'Elgeyo Marakwet', 'Isiolo',
    'Kirinyaga', 'Kwale', 'Laikipia', 'Lamu', 'Makueni', 'Mandera',
    'Marsabit', 'Murang\'a', 'Nyandarua', 'Samburu', 'Taita Taveta',
    'Tana River', 'Tharaka Nithi', 'Turkana', 'Wajir', 'West Pokot'
  ].sort();

  const deliveryTimeOptions = [
    { value: 'anytime', label: 'Anytime' },
    { value: 'morning', label: 'Morning (8AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { value: 'evening', label: 'Evening (5PM - 8PM)' }
  ];

  // Load addresses and stats on mount
  useEffect(() => {
    fetchAddresses();
    fetchAddressStats();
    loadRecentlyUsed();
    loadFavorites();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        setArchivedAddresses(data.archived || []);
      } else {
        // Mock data for development
        setAddresses([
          {
            id: 1,
            label: 'home',
            fullName: 'John Kamau',
            phoneNumber: '0712345678',
            alternativePhone: '0722334455',
            email: 'john@example.com',
            county: 'Nairobi',
            town: 'Westlands',
            streetAddress: 'Waiyaki Way',
            building: 'Mara Building',
            floor: '3rd Floor',
            apartmentNumber: '301',
            landmark: 'Near ABC Place',
            deliveryInstructions: 'Call upon arrival',
            latitude: '-1.2667',
            longitude: '36.8167',
            isDefault: true,
            isFavorite: true,
            allowWeekendDelivery: true,
            preferredDeliveryTime: 'afternoon',
            usageCount: 15,
            lastUsed: '2025-10-08',
            createdAt: '2025-01-15'
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      showError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressStats = async () => {
    try {
      const response = await fetch('/api/addresses/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddressStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const loadRecentlyUsed = () => {
    const recent = addresses
      .filter(addr => addr.lastUsed)
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, 3);
    setRecentlyUsed(recent);
  };

  const loadFavorites = () => {
    const favs = addresses.filter(addr => addr.isFavorite);
    setFavorites(favs);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Name must be at least 3 characters';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^(?:254|\+254|0)?[17]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Please enter a valid Kenyan phone number';
    }
    
    if (formData.alternativePhone && !/^(?:254|\+254|0)?[17]\d{8}$/.test(formData.alternativePhone.replace(/\s/g, ''))) {
      errors.alternativePhone = 'Please enter a valid Kenyan phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.county) {
      errors.county = 'County is required';
    }
    
    if (!formData.town.trim()) {
      errors.town = 'Town/City is required';
    }
    
    if (!formData.streetAddress.trim()) {
      errors.streetAddress = 'Street address is required';
    } else if (formData.streetAddress.trim().length < 5) {
      errors.streetAddress = 'Please provide a more detailed address';
    }

    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showError('Please fix the errors in the form');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const url = editingId 
        ? `/api/addresses/${editingId}` 
        : '/api/addresses';
      
      const method = editingId ? 'PUT' : 'POST';
      
      // Format phone numbers
      const formattedData = {
        ...formData,
        phoneNumber: formatPhoneNumber(formData.phoneNumber),
        alternativePhone: formData.alternativePhone ? formatPhoneNumber(formData.alternativePhone) : null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formattedData)
      });

      if (response.ok) {
        const savedAddress = await response.json();
        
        if (editingId) {
          setAddresses(prev => 
            prev.map(addr => addr.id === editingId ? savedAddress : addr)
          );
          showSuccess('Address updated successfully');
        } else {
          setAddresses(prev => [...prev, savedAddress]);
          showSuccess('Address added successfully');
        }
        
        resetForm();
        setShowForm(false);
        await fetchAddressStats();
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      showError('An error occurred while saving the address');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      alternativePhone: address.alternativePhone || '',
      email: address.email || '',
      county: address.county,
      town: address.town,
      streetAddress: address.streetAddress,
      building: address.building || '',
      floor: address.floor || '',
      apartmentNumber: address.apartmentNumber || '',
      landmark: address.landmark || '',
      deliveryInstructions: address.deliveryInstructions || '',
      latitude: address.latitude || '',
      longitude: address.longitude || '',
      isDefault: address.isDefault || false,
      isFavorite: address.isFavorite || false,
      allowWeekendDelivery: address.allowWeekendDelivery !== false,
      preferredDeliveryTime: address.preferredDeliveryTime || 'anytime',
      accessCode: address.accessCode || '',
      gateCode: address.gateCode || '',
      notes: address.notes || ''
    });
    setEditingId(address.id);
    setShowForm(true);
    setValidationErrors({});
    clearMessages();
  };

  const handleDelete = async (id) => {
    const address = addresses.find(a => a.id === id);
    
    if (address?.isDefault) {
      showError('Cannot delete default address. Please set another address as default first.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        showSuccess('Address deleted successfully');
        await fetchAddressStats();
      } else {
        showError('Failed to delete address');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      showError('An error occurred while deleting the address');
    }
  };

  const handleArchive = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}/archive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const archived = addresses.find(a => a.id === id);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
        setArchivedAddresses(prev => [...prev, archived]);
        showSuccess('Address archived successfully');
      }
    } catch (err) {
      console.error('Error archiving address:', err);
      showError('Failed to archive address');
    }
  };

  const handleUnarchive = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}/unarchive`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const unarchived = archivedAddresses.find(a => a.id === id);
        setArchivedAddresses(prev => prev.filter(addr => addr.id !== id));
        setAddresses(prev => [...prev, unarchived]);
        showSuccess('Address restored successfully');
      }
    } catch (err) {
      console.error('Error unarchiving address:', err);
      showError('Failed to restore address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const response = await fetch(`/api/addresses/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAddresses(prev =>
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
          }))
        );
        showSuccess('Default address updated');
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      showError('Failed to set default address');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const address = addresses.find(a => a.id === id);
      const response = await fetch(`/api/addresses/${id}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isFavorite: !address.isFavorite })
      });

      if (response.ok) {
        setAddresses(prev =>
          prev.map(addr => 
            addr.id === id ? { ...addr, isFavorite: !addr.isFavorite } : addr
          )
        );
        loadFavorites();
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleDuplicate = (address) => {
    setFormData({
      ...address,
      fullName: `${address.fullName} (Copy)`,
      isDefault: false
    });
    setEditingId(null);
    setShowForm(true);
    clearMessages();
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          showSuccess('Location captured successfully');
        },
        (error) => {
          showError('Unable to get your location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      showError('Geolocation is not supported by your browser');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Label', 'Full Name', 'Phone', 'Email', 'County', 'Town', 'Street Address', 'Building', 'Is Default'],
      ...addresses.map(addr => [
        addr.label,
        addr.fullName,
        addr.phoneNumber,
        addr.email || '',
        addr.county,
        addr.town,
        addr.streetAddress,
        addr.building || '',
        addr.isDefault ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'addresses.csv';
    a.click();
    showSuccess('Addresses exported successfully');
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedAddresses.length} addresses?`)) return;

    try {
      await Promise.all(
        selectedAddresses.map(id =>
          fetch(`/api/addresses/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        )
      );

      setAddresses(prev => prev.filter(addr => !selectedAddresses.includes(addr.id)));
      setSelectedAddresses([]);
      setShowBulkActions(false);
      showSuccess('Selected addresses deleted');
    } catch (err) {
      showError('Failed to delete some addresses');
    }
  };

  const toggleAddressSelection = (id) => {
    setSelectedAddresses(prev =>
      prev.includes(id) ? prev.filter(addr => addr !== id) : [...prev, id]
    );
  };

  const selectAllAddresses = () => {
    setSelectedAddresses(getFilteredAddresses().map(addr => addr.id));
  };

  const deselectAllAddresses = () => {
    setSelectedAddresses([]);
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+254${cleaned.substring(1)}`;
    return `+254${cleaned}`;
  };

  const resetForm = () => {
    setFormData({
      label: 'home',
      fullName: '',
      phoneNumber: '',
      alternativePhone: '',
      email: '',
      county: '',
      town: '',
      streetAddress: '',
      building: '',
      floor: '',
      apartmentNumber: '',
      landmark: '',
      deliveryInstructions: '',
      latitude: '',
      longitude: '',
      isDefault: false,
      isFavorite: false,
      allowWeekendDelivery: true,
      preferredDeliveryTime: 'anytime',
      accessCode: '',
      gateCode: '',
      notes: ''
    });
    setEditingId(null);
    setValidationErrors({});
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const getLabelIcon = (label) => {
    switch (label) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getFilteredAddresses = () => {
    let filtered = showArchived ? archivedAddresses : addresses;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(addr =>
        addr.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.phoneNumber.includes(searchQuery) ||
        addr.streetAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.town.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addr.county.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter
    if (filterType !== 'all') {
      if (filterType === 'favorites') {
        filtered = filtered.filter(addr => addr.isFavorite);
      } else {
        filtered = filtered.filter(addr => addr.label === filterType);
      }
    }

    // Apply sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastUsed || b.createdAt) - new Date(a.lastUsed || a.createdAt));
        break;
      case 'name':
        filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case 'county':
        filtered.sort((a, b) => a.county.localeCompare(b.county));
        break;
      case 'default':
        filtered.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        break;
      case 'usage':
        filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredAddresses = getFilteredAddresses();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-700">{success}</p>
          </div>
          <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Navigation className="w-7 h-7 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Address Book</h2>
          </div>
          <p className="text-gray-600 mt-1">
            {filteredAddresses.length} {filteredAddresses.length === 1 ? 'address' : 'addresses'}
            {searchQuery && ' found'}
          </p>
        </div>

        {showActions && mode === 'full' && !showForm && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Check className="w-4 h-4" />
              {showBulkActions ? 'Cancel' : 'Select'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards - Only in full mode */}
      {mode === 'full' && !showForm && addressStats && Object.keys(addressStats).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Favorites</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Recent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{recentlyUsed.length}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Archived</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{archivedAddresses.length}</p>
          </div>
        </div>
      )}

      {/* Recently Used - Only in full mode */}
      {mode === 'full' && !showForm && recentlyUsed.length > 0 && !showArchived && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recently Used
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyUsed.map(addr => (
              <div
                key={addr.id}
                onClick={() => allowSelection && onSelectAddress && onSelectAddress(addr)}
                className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getLabelIcon(addr.label)}
                    <span className="font-semibold text-gray-900 capitalize text-sm">{addr.label}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">{addr.fullName}</p>
                <p className="text-xs text-gray-600">{addr.town}, {addr.county}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last used {new Date(addr.lastUsed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Label Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Label *
              </label>
              <div className="flex gap-3">
                {['home', 'work', 'other'].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, label }))}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                      formData.label === label
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getLabelIcon(label)}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Kamau"
                  />
                  {validationErrors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0712345678"
                  />
                  {validationErrors.phoneNumber && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternative Phone
                  </label>
                  <input
                    type="tel"
                    name="alternativePhone"
                    value={formData.alternativePhone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.alternativePhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0722334455"
                  />
                  {validationErrors.alternativePhone && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.alternativePhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County *
                  </label>
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.county ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select County</option>
                    {allCounties.map(county => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                  {validationErrors.county && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.county}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Town/City *
                  </label>
                  {kenyanCounties[formData.county] ? (
                    <select
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.town ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Town</option>
                      {kenyanCounties[formData.county].map(town => (
                        <option key={town} value={town}>{town}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.town ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter town/city"
                    />
                  )}
                  {validationErrors.town && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.town}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.streetAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Waiyaki Way, near ABC Place"
                />
                {validationErrors.streetAddress && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.streetAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Name
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mara Building"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3rd Floor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apt/Unit Number
                  </label>
                  <input
                    type="text"
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="301"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark (Nearby)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Near ABC Place, Opposite XYZ Mall"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="-1.2667"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="36.8167"
                    readOnly
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <MapPinned className="w-4 h-4" />
                Use My Current Location
              </button>
            </div>

            {/* Delivery Details */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Delivery Preferences
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Delivery Time
                  </label>
                  <select
                    name="preferredDeliveryTime"
                    value={formData.preferredDeliveryTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {deliveryTimeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gate Code
                    </label>
                    <input
                      type="text"
                      name="gateCode"
                      value={formData.gateCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Code
                    </label>
                    <input
                      type="text"
                      name="accessCode"
                      value={formData.accessCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., A#5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions
                  </label>
                  <textarea
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Call upon arrival, Leave with security, Ring bell twice, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any other important information"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowWeekendDelivery"
                    name="allowWeekendDelivery"
                    checked={formData.allowWeekendDelivery}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="allowWeekendDelivery" className="text-sm text-gray-700">
                    Allow weekend deliveries
                  </label>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 font-medium">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  name="isFavorite"
                  checked={formData.isFavorite}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isFavorite" className="text-sm text-gray-700 font-medium">
                  Add to favorites for quick access
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      {!showForm && addresses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search addresses, names, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
                <option value="favorites">Favorites</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A-Z</option>
                <option value="county">County</option>
                <option value="default">Default First</option>
                <option value="usage">Most Used</option>
              </select>

              {archivedAddresses.length > 0 && (
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showArchived
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedAddresses.length} selected
              </span>

              <button
                onClick={handleBulkDelete}
                disabled={selectedAddresses.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Delete Selected
              </button>

              <button
                onClick={selectAllAddresses}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All
              </button>

              <button
                onClick={deselectAllAddresses}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {filteredAddresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' 
                ? 'No Addresses Found'
                : showArchived 
                  ? 'No Archived Addresses'
                  : 'No Addresses Saved Yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : showArchived
                  ? 'You haven\'t archived any addresses'
                  : 'Add your first address to get started'
              }
            </p>
            {showActions && !searchQuery && filterType === 'all' && !showArchived && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Your First Address
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {filteredAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={selectedAddressId === address.id}
                isBulkSelected={selectedAddresses.includes(address.id)}
                showBulkActions={showBulkActions}
                allowSelection={allowSelection}
                showActions={showActions}
                showArchived={showArchived}
                onSelect={() => onSelectAddress && onSelectAddress(address)}
                onEdit={() => handleEdit(address)}
                onDelete={() => handleDelete(address.id)}
                onSetDefault={() => handleSetDefault(address.id)}
                onToggleFavorite={() => handleToggleFavorite(address.id)}
                onDuplicate={() => handleDuplicate(address)}
                onArchive={() => handleArchive(address.id)}
                onUnarchive={() => handleUnarchive(address.id)}
                onBulkToggle={() => toggleAddressSelection(address.id)}
                getLabelIcon={getLabelIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Address Card Component
const AddressCard = ({
  address,
  isSelected,
  isBulkSelected,
  showBulkActions,
  allowSelection,
  showActions,
  showArchived,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  onToggleFavorite,
  onDuplicate,
  onArchive,
  onUnarchive,
  onBulkToggle,
  getLabelIcon
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`p-5 bg-white border-2 rounded-lg transition-all relative ${
        isSelected
          ? 'border-blue-600 shadow-md ring-2 ring-blue-100'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      } ${allowSelection && !showBulkActions ? 'cursor-pointer' : ''}`}
      onClick={() => !showBulkActions && allowSelection && onSelect()}
    >
      {/* Bulk Selection Checkbox */}
      {showBulkActions && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isBulkSelected}
            onChange={(e) => {
              e.stopPropagation();
              onBulkToggle();
            }}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className={`flex items-start justify-between ${showBulkActions ? 'ml-8' : ''}`}>
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {getLabelIcon(address.label)}
            <span className="font-semibold text-gray-900 capitalize">
              {address.label}
            </span>
            
            {address.isDefault && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Default
              </span>
            )}
            
            {address.isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            )}
            
            {isSelected && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Selected
              </span>
            )}

            {showArchived && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                Archived
              </span>
            )}
          </div>

          {/* Address Details */}
          <div className="text-gray-700 space-y-1">
            <p className="font-medium text-lg">{address.fullName}</p>
            
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{address.phoneNumber}</span>
              {address.alternativePhone && (
                <span className="text-gray-500">• {address.alternativePhone}</span>
              )}
            </div>

            {address.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{address.email}</span>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm mt-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{address.streetAddress}</p>
                {address.building && (
                  <p>
                    {address.building}
                    {address.floor && `, ${address.floor}`}
                    {address.apartmentNumber && `, Unit ${address.apartmentNumber}`}
                  </p>
                )}
                {address.landmark && (
                  <p className="text-gray-500 italic">Near: {address.landmark}</p>
                )}
                <p className="font-medium">{address.town}, {address.county}</p>
              </div>
            </div>

            {address.deliveryInstructions && (
              <div className="flex items-start gap-2 text-sm mt-2 bg-yellow-50 p-2 rounded">
                <MessageSquare className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{address.deliveryInstructions}</p>
              </div>
            )}

            {address.preferredDeliveryTime && address.preferredDeliveryTime !== 'anytime' && (
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <Clock className="w-3 h-3" />
                <span>Preferred: {address.preferredDeliveryTime}</span>
              </div>
            )}

            {address.usageCount > 0 && (
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Used {address.usageCount} times
                </span>
                {address.lastUsed && (
                  <span>
                    Last: {new Date(address.lastUsed).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && !showBulkActions && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`p-2 rounded-lg transition-colors ${
                address.isFavorite
                  ? 'text-yellow-500 hover:bg-yellow-50'
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }`}
              title={address.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${address.isFavorite ? 'fill-yellow-500' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit address"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>

                    {!address.isDefault && !showArchived && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetDefault();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Set as Default
                      </button>
                    )}

                    {address.latitude && address.longitude && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps?q=${address.latitude},${address.longitude}`, '_blank');
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Map className="w-4 h-4" />
                        View on Map
                      </button>
                    )}

                    {!showArchived ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnarchive();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Restore
                      </button>
                    )}

                    {!address.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      {showActions && !address.isDefault && !showBulkActions && !showArchived && (
        <div className="mt-3 pt-3 border-t flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault();
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Set as Default
          </button>
          {address.latitude && address.longitude && (
            <>
              <span className="text-gray-300">•</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.google.com/maps?q=${address.latitude},${address.longitude}`, '_blank');
                }}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View on Map
                <ExternalLink className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;