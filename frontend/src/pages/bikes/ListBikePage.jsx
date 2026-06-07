import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, ChevronRight, Check, Bike, Upload, X, Plus,
  DollarSign, MapPin, Clock, Shield, AlertCircle, Star,
  Tag, Settings, FileText, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import listBikeService from '../../services/listBikeService';
import EventActionModal from '../../components/events/EventActionModal';
import TermsAcceptanceModal from '../../components/legal/TermsAcceptanceModal';
import bikeService from '../../services/bikeService';
import {
  BIKE_CATEGORY_CONFIG, FRAME_SIZE_CONFIG
} from '../../data/cyclingMockData';

const CATEGORIES = [
  { key: 'road', label: 'Road Bike' },
  { key: 'mtb', label: 'Mountain Bike' },
  { key: 'gravel', label: 'Gravel Bike' },
  { key: 'ebike', label: 'E-Bike' },
  { key: 'hybrid', label: 'Hybrid' },
  { key: 'kids', label: 'Kids Bike' },
  { key: 'cargo', label: 'Cargo Bike' },
  { key: 'tandem', label: 'Tandem' },
];

const CONDITIONS = [
  { key: 'new', label: 'New', color: 'bg-green-500' },
  { key: 'excellent', label: 'Excellent', color: 'bg-blue-500' },
  { key: 'good', label: 'Good', color: 'bg-yellow-500' },
  { key: 'fair', label: 'Fair', color: 'bg-orange-500' },
];

const FRAME_SIZES = [
  { key: 'xs', label: 'XS' },
  { key: 's', label: 'S' },
  { key: 'm', label: 'M' },
  { key: 'l', label: 'L' },
  { key: 'xl', label: 'XL' },
  { key: 'xxl', label: 'XXL' },
];

const WHEEL_SIZES = [
  { key: '20', label: '20"' },
  { key: '24', label: '24"' },
  { key: '26', label: '26"' },
  { key: '27.5', label: '27.5"' },
  { key: '29', label: '29"' },
  { key: '700c', label: '700c' },
];

const PICKUP_TYPES = [
  { key: 'shop', label: 'Shop Drop-off', desc: 'Drop at Oshocks shop' },
  { key: 'owner_location', label: 'My Location', desc: 'Renter picks up from me' },
  { key: 'delivery', label: 'I Deliver', desc: 'I can deliver to renter' },
];

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Bike },
  { id: 2, label: 'Pricing', icon: DollarSign },
  { id: 3, label: 'Location & Rules', icon: MapPin },
  { id: 4, label: 'Photos & Publish', icon: ImageIcon },
];

const ListBikePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [featureInput, setFeatureInput] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdListingCode, setCreatedListingCode] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'road',
    frame_size: 'm',
    wheel_size: '700c',
    condition: 'good',
    description: '',
    
    // Step 2: Pricing
    hourly_rate: '',
    daily_rate: '',
    weekly_rate: '',
    monthly_rate: '',
    security_deposit: '',
    min_rental_hours: 1,
    max_rental_days: 7,
    
    // Step 3: Location & Rules
    location_address: '',
    pickup_type: 'owner_location',
    delivery_fee: '',
    availability_calendar_type: 'always',
    instant_book: true,
    response_time_hours: 2,
    rules: '',
    cancellation_policy: 'Full refund if cancelled 24h before pickup. 50% refund within 24h. No refund for no-show.',
    insurance_included: false,
    
    // Step 4: Photos
    photos: [],
    features: [],
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
    setFeatureInput('');
  };

  const removeFeature = (index) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_IMAGES = 10;

    const validFiles = [];
    const uploadErrors = [];

    if (photoPreview.length + files.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} photos allowed. You have ${photoPreview.length} already.`);
      e.target.value = '';
      return;
    }

    files.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        uploadErrors.push(`${file.name}: Only JPG, PNG, WebP allowed`);
        return;
      }
      if (file.size < 1024 && file.type.startsWith('image/')) {
        uploadErrors.push(`${file.name}: File appears corrupted (too small)`);
        return;
      }
      if (file.size > MAX_SIZE) {
        uploadErrors.push(`${file.name}: Exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        return;
      }
      validFiles.push(file);
    });

    if (uploadErrors.length > 0) {
      alert(uploadErrors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPhotoPreview(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...validFiles] }));
    }

    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 4) {
      if (photoPreview.length === 0) {
        newErrors.photos = 'At least one photo is required';
      }
    }
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Bike name is required';
      if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
      if (!formData.model.trim()) newErrors.model = 'Model is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      const yearNum = Number(formData.year);
      const currentYear = new Date().getFullYear();
      if (!yearNum || yearNum < 1990 || yearNum > currentYear + 1) {
        newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
      }
    }
    if (step === 2) {
      if (!formData.daily_rate) newErrors.daily_rate = 'Daily rate is required';
      if (!formData.security_deposit) newErrors.security_deposit = 'Security deposit is required';
      if (Number(formData.min_rental_hours) > Number(formData.max_rental_days) * 24) {
        newErrors.max_rental_days = 'Max rental must exceed min hours';
      }
    }
    if (step === 3) {
      if (!formData.location_address.trim()) newErrors.location_address = 'Location is required';
      if (formData.pickup_type === 'delivery' && !formData.delivery_fee && formData.delivery_fee !== 0) {
        newErrors.delivery_fee = 'Delivery fee is required when offering delivery';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

    const handleSubmit = async () => {
      if (!validateStep(currentStep)) return;

      // Check terms acceptance before submitting
      if (!termsAccepted) {
        setTermsModalOpen(true);
        setSubmitError('Please read and accept the Terms of Listing before publishing your bike.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Build flat form data object for listBikeService
        const listingPayload = {
          name: formData.name,
          brand: formData.brand,
          model: formData.model,
          year: Number(formData.year),
          category: formData.category,
          frame_size: formData.frame_size,
          wheel_size: formData.wheel_size,
          bike_condition: formData.condition,
          description: formData.description,
          hourly_rate: formData.hourly_rate ? Number(formData.hourly_rate) : null,
          daily_rate: Number(formData.daily_rate),
          weekly_rate: formData.weekly_rate ? Number(formData.weekly_rate) : null,
          monthly_rate: formData.monthly_rate ? Number(formData.monthly_rate) : null,
          security_deposit: Number(formData.security_deposit),
          min_rental_hours: Number(formData.min_rental_hours),
          max_rental_days: Number(formData.max_rental_days),
          location_address: formData.location_address,
          location_lat: null,
          location_lng: null,
          pickup_type: formData.pickup_type,
          delivery_fee: formData.delivery_fee ? Number(formData.delivery_fee) : null,
          instant_book: formData.instant_book,
          response_time_hours: formData.response_time_hours ? Number(formData.response_time_hours) : null,
          rental_rules: formData.rules || null,
          cancellation_policy: formData.cancellation_policy || null,
          insurance_included: formData.insurance_included,
          bike_features: formData.features || [],
          owner_type: 'user',
        };

        // Pass File objects directly — listBikeService handles FormData + multipart
        const photoFiles = formData.photos.filter(p => p instanceof File);

        const response = await listBikeService.createListing(listingPayload, photoFiles);

        if (response.data?.success) {
          const listingCode = response.data?.listing_code || response.data?.data?.listing_code;
          setCreatedListingCode(listingCode);
          setShowSuccessModal(true);
          setIsSubmitting(false);
        } else {
          throw new Error(response.data?.message || 'Failed to list bike');
        }
      } catch (error) {
        console.error('Bike listing error:', error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to list bike. Please try again.';
        const errorCode = error.response?.data?.code;

        // If backend rejected due to terms not accepted, show terms modal
        if (errorCode === 'TERMS_NOT_ACCEPTED' || error.response?.status === 403) {
          setTermsModalOpen(true);
          setTermsAccepted(false);
        }

        setSubmitError(errorMsg);
        setIsSubmitting(false);
      }
    };


    const handleCloseModal = () => {
      setShowSuccessModal(false);
      setCreatedListingCode(null);
      navigate('/bikes');
    };

    const handleCreateAnother = () => {
      setShowSuccessModal(false);
      setCreatedListingCode(null);
      // Reset form to step 1
      setCurrentStep(1);
      setFormData({
        name: '', brand: '', model: '', year: new Date().getFullYear(),
        category: 'road', frame_size: 'm', wheel_size: '700c', condition: 'good', description: '',
        hourly_rate: '', daily_rate: '', weekly_rate: '', monthly_rate: '',
        security_deposit: '', min_rental_hours: 1, max_rental_days: 7,
        location_address: '', pickup_type: 'owner_location', delivery_fee: '',
        instant_book: true, response_time_hours: 2, rules: '',
        cancellation_policy: 'Full refund if cancelled 24h before pickup. 50% refund within 24h. No refund for no-show.',
        insurance_included: false, photos: [], features: [],
      });
      setPhotoPreview([]);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to list your bike for rent.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep > step.id ? 'bg-green-500 text-white' :
                  currentStep === step.id ? 'bg-green-500 text-white ring-4 ring-green-100' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium mt-2 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bike Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g., Trek Domane AL 2"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Brand *</label>
          <input
            type="text"
            value={formData.brand}
            onChange={(e) => updateField('brand', e.target.value)}
            placeholder="e.g., Trek"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Model *</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => updateField('model', e.target.value)}
            placeholder="e.g., Domane AL 2"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.model ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) => updateField('year', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.year ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => updateField('category', cat.key)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  formData.category === cat.key
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Frame Size</label>
          <div className="flex flex-wrap gap-2">
            {FRAME_SIZES.map(size => (
              <button
                key={size.key}
                onClick={() => updateField('frame_size', size.key)}
                className={`w-12 h-12 rounded-xl font-bold text-sm transition-all ${
                  formData.frame_size === size.key
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Wheel Size</label>
          <select
            value={formData.wheel_size}
            onChange={(e) => updateField('wheel_size', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {WHEEL_SIZES.map(ws => (
              <option key={ws.key} value={ws.key}>{ws.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
          <div className="space-y-2">
            {CONDITIONS.map(cond => (
              <button
                key={cond.key}
                onClick={() => updateField('condition', cond.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  formData.condition === cond.key
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${cond.color}`} />
                {cond.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe your bike, its condition, what it's best used for, any special features..."
          rows={4}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="e.g., disc_brakes, carbon_fork, tubeless"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={addFeature}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.features.map((feat, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm">
              {feat.replace(/_/g, ' ')}
              <button onClick={() => removeFeature(i)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate (KSh)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => updateField('hourly_rate', e.target.value)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate (KSh) *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.daily_rate}
              onChange={(e) => updateField('daily_rate', e.target.value)}
              placeholder="Required"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.daily_rate ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.daily_rate && <p className="text-red-500 text-sm mt-1">{errors.daily_rate}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate (KSh)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.weekly_rate}
              onChange={(e) => updateField('weekly_rate', e.target.value)}
              placeholder="Optional"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate (KSh)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.monthly_rate}
              onChange={(e) => updateField('monthly_rate', e.target.value)}
              placeholder="Optional"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Security Deposit (KSh) *</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.security_deposit}
              onChange={(e) => updateField('security_deposit', e.target.value)}
              placeholder="Refundable amount held during rental"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.security_deposit ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.security_deposit && <p className="text-red-500 text-sm mt-1">{errors.security_deposit}</p>}
          <p className="text-xs text-gray-500 mt-1">This amount is held during rental and released when bike is returned in good condition.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Hours</label>
            <input
              type="number"
              min="1"
              value={formData.min_rental_hours}
              onChange={(e) => updateField('min_rental_hours', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Days</label>
            <input
              type="number"
              min="1"
              value={formData.max_rental_days}
              onChange={(e) => updateField('max_rental_days', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.max_rental_days ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.max_rental_days && <p className="text-red-500 text-sm mt-1">{errors.max_rental_days}</p>}
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Earnings Estimate</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Platform Fee</p>
            <p className="font-bold text-blue-900">15%</p>
          </div>
          <div>
            <p className="text-gray-500">You Keep</p>
            <p className="font-bold text-green-700">85%</p>
          </div>
          <div>
            <p className="text-gray-500">Est. per day</p>
            <p className="font-bold text-gray-900">KSh {formData.daily_rate ? Math.round(formData.daily_rate * 0.85).toLocaleString() : '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Est. per week</p>
            <p className="font-bold text-gray-900">KSh {formData.weekly_rate ? Math.round(formData.weekly_rate * 0.85).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.location_address}
            onChange={(e) => updateField('location_address', e.target.value)}
            placeholder="e.g., Kilimani, Nairobi"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.location_address ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.location_address && <p className="text-red-500 text-sm mt-1">{errors.location_address}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Pickup Type *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PICKUP_TYPES.map(pt => (
            <button
              key={pt.key}
              onClick={() => updateField('pickup_type', pt.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.pickup_type === pt.key
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold ${formData.pickup_type === pt.key ? 'text-green-700' : 'text-gray-900'}`}>
                {pt.label}
              </p>
              <p className="text-sm text-gray-500 mt-1">{pt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {formData.pickup_type === 'delivery' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Fee (KSh) *</label>
          <input
            type="number"
            min="0"
            value={formData.delivery_fee}
            onChange={(e) => updateField('delivery_fee', e.target.value)}
            placeholder="What you charge for delivery"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.delivery_fee ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.delivery_fee && <p className="text-red-500 text-sm mt-1">{errors.delivery_fee}</p>}
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <input
          type="checkbox"
          id="instant_book"
          checked={formData.instant_book}
          onChange={(e) => updateField('instant_book', e.target.checked)}
          className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
        />
        <div>
          <label htmlFor="instant_book" className="font-semibold text-gray-900 cursor-pointer">Enable Instant Book</label>
          <p className="text-sm text-gray-500">Renters can book immediately without your approval</p>
        </div>
      </div>

      {!formData.instant_book && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Response Time (hours)</label>
          <input
            type="number"
            min="1"
            max="72"
            value={formData.response_time_hours}
            onChange={(e) => updateField('response_time_hours', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">How quickly you typically respond to rental requests</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Rental Rules</label>
        <textarea
          value={formData.rules}
          onChange={(e) => updateField('rules', e.target.value)}
          placeholder="Any rules renters should know? e.g., No off-road use, must wear helmet, clean before return..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</label>
        <textarea
          value={formData.cancellation_policy}
          onChange={(e) => updateField('cancellation_policy', e.target.value)}
          placeholder="Your cancellation and refund policy..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <input
          type="checkbox"
          id="insurance_included"
          checked={formData.insurance_included}
          onChange={(e) => updateField('insurance_included', e.target.checked)}
          className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
        />
        <div>
          <label htmlFor="insurance_included" className="font-semibold text-gray-900 cursor-pointer">Insurance Included</label>
          <p className="text-sm text-gray-500">Basic insurance is included in the rental price at no extra cost to renter</p>
        </div>
      </div>
    </div>
  );

    const renderStep4 = () => {
    const fmt = (v) => v || '—';
    const fmtNum = (v) => v ? Number(v).toLocaleString() : '—';
    const fmtBool = (v) => v ? 'Yes' : 'No';

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Photos Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Bike Photos</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
              id="bike-photo-upload"
            />
            <label htmlFor="bike-photo-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP only — max 10MB each. At least 3 photos recommended.</p>
            </label>
          </div>
          {photoPreview.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
              {photoPreview.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {photoPreview.length < 3 && (
            <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Add at least {3 - photoPreview.length} more photo{photoPreview.length === 2 ? '' : 's'} for better visibility
            </p>
          )}
          {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
        </div>

        {/* FULL LISTING PREVIEW */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bike className="w-5 h-5 text-green-500" />
            Complete Listing Summary
          </h3>

          {/* Step 1: Basic Info */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">Basic Info</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Name" value={fmt(formData.name)} />
              <SummaryRow label="Brand / Model / Year" value={`${fmt(formData.brand)} ${fmt(formData.model)} ${fmt(formData.year)}`} />
              <SummaryRow label="Category" value={fmt(formData.category)} />
              <SummaryRow label="Frame Size" value={fmt(formData.frame_size).toUpperCase()} />
              <SummaryRow label="Wheel Size" value={fmt(formData.wheel_size)} />
              <SummaryRow label="Condition" value={fmt(formData.condition)} />
              <SummaryRow label="Description" value={fmt(formData.description)} />
              <SummaryRow label="Features" value={formData.features.join(', ') || '—'} />
            </div>
          </div>

          {/* Step 2: Pricing */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">Pricing</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Hourly Rate" value={formData.hourly_rate ? `KSh ${fmtNum(formData.hourly_rate)}` : '—'} />
              <SummaryRow label="Daily Rate" value={formData.daily_rate ? `KSh ${fmtNum(formData.daily_rate)}` : '—'} />
              <SummaryRow label="Weekly Rate" value={formData.weekly_rate ? `KSh ${fmtNum(formData.weekly_rate)}` : '—'} />
              <SummaryRow label="Monthly Rate" value={formData.monthly_rate ? `KSh ${fmtNum(formData.monthly_rate)}` : '—'} />
              <SummaryRow label="Security Deposit" value={formData.security_deposit ? `KSh ${fmtNum(formData.security_deposit)}` : '—'} />
              <SummaryRow label="Min Rental" value={`${fmtNum(formData.min_rental_hours)} hours`} />
              <SummaryRow label="Max Rental" value={`${fmtNum(formData.max_rental_days)} days`} />
            </div>
          </div>

          {/* Step 3: Location & Rules */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">Location & Rules</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Location" value={fmt(formData.location_address)} />
              <SummaryRow label="Pickup Type" value={fmt(formData.pickup_type).replace(/_/g, ' ')} />
              {formData.pickup_type === 'delivery' && (
                <SummaryRow label="Delivery Fee" value={formData.delivery_fee ? `KSh ${fmtNum(formData.delivery_fee)}` : '—'} />
              )}
              <SummaryRow label="Instant Book" value={fmtBool(formData.instant_book)} />
              {!formData.instant_book && (
                <SummaryRow label="Response Time" value={`${fmtNum(formData.response_time_hours)} hours`} />
              )}
              <SummaryRow label="Rental Rules" value={fmt(formData.rules)} />
              <SummaryRow label="Cancellation Policy" value={fmt(formData.cancellation_policy)} />
              <SummaryRow label="Insurance Included" value={fmtBool(formData.insurance_included)} />
            </div>
          </div>

          {/* System Fields */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Fields</h4>
            <div className="space-y-2 text-sm bg-gray-100/50 rounded-xl p-4 border border-gray-200">
              <SummaryRow label="Status" value="pending_review (auto)" />
              <SummaryRow label="Total Rentals" value="0 (auto)" />
              <SummaryRow label="Rating" value="0 (auto)" />
              <SummaryRow label="Reviews" value="0 (auto)" />
              <SummaryRow label="Verified" value="false (auto)" />
              <SummaryRow label="Active" value="false (auto)" />
              {/* TODO: implement when backend ready: location_lat, location_lng, owner_id, owner_name, owner_rating, is_verified, is_active */}
              <p className="text-[10px] text-gray-400 italic mt-2">
                Map coordinates, owner details, verification status, and approval workflow will be added when backend integration is complete.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-2">Terms of Listing</p>
              <p className="text-sm text-blue-700 mb-3">
                Before listing your bike, you must read and accept our Terms of Listing. This covers platform commission, lister responsibilities, and payout policies.
              </p>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    if (!termsAccepted && !e.target.checked) return;
                    if (!termsAccepted) {
                      setTermsModalOpen(true);
                      return;
                    }
                    setTermsAccepted(e.target.checked);
                    setSubmitError(null);
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">
                  I have read and accept the Terms of Listing
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Error Display */}
        {submitError && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Before Publishing</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your bike will be reviewed within 24 hours. Once approved, it will be visible to all renters. You can edit details anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Helper component for summary rows
  const SummaryRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900 text-right max-w-[60%] break-words">{value}</span>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>List Your Bike - Earn from Your Ride - Oshocks</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/bikes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">List Your Bike</h1>
                <p className="text-sm text-gray-500">Start earning by renting out your bike</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {renderStepIndicator()}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || photoPreview.length < 1 || !termsAccepted}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      List My Bike
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms Acceptance Modal */}
      <TermsAcceptanceModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        termsType="listing"
        onAccept={async () => {
          setTermsAccepted(true);
          setSubmitError(null);
          try {
            await bikeService.acceptTerms('listing');
          } catch (err) {
            console.error('Terms accept API error:', err);
          }
        }}
      />

      {/* Success Modal */}
      {showSuccessModal && createdListingCode && (
        <EventActionModal
          actionType="bike_listed"
          code={createdListingCode}
          onClose={handleCloseModal}
          onCreateAnother={handleCreateAnother}
        />
      )}
    </>
  );
};

export default ListBikePage;