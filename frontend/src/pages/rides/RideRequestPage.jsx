import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MapPin, Calendar, Users, Bike, ArrowRight, ChevronLeft, Clock,
  Mountain, Route, Trees, Blend, Check, Info, Send
} from 'lucide-react';
import EventActionModal from '../../components/events/EventActionModal';
import { DIFFICULTY_CONFIG, TERRAIN_CONFIG } from '../../data/cyclingMockData';
import BikeSelectionModal from '../../components/bikes/BikeSelectionModal';
import customRideService from '../../services/customRideService';

import { useAuth } from '../../context/AuthContext';

const RideRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferred_date: '',
    date_flexibility_days: 0,
    group_size: 1,
    difficulty: 'beginner',
    terrain: 'road',
    distance_km: 20,
    duration_hours: 2,
    bike_rental_needed: false,
    pickup_needed: false,
    pickup_address: '',
    budget_estimate: '',
    contact_phone: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [selectedBikeData, setSelectedBikeData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (stepNum) => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (stepNum === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Ride title is required';
      } else if (formData.title.trim().length < 5) {
        newErrors.title = 'Title must be at least 5 characters';
      } else if (formData.title.trim().length > 100) {
        newErrors.title = 'Title must be under 100 characters';
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Please describe your ride request';
      } else if (formData.description.trim().length < 20) {
        newErrors.description = 'Description must be at least 20 characters';
      }

      if (!formData.preferred_date) {
        newErrors.preferred_date = 'Preferred date is required';
      } else {
        const preferredDate = new Date(formData.preferred_date);
        if (preferredDate < today) {
          newErrors.preferred_date = 'Date cannot be in the past';
        }
      }

      if (formData.date_flexibility_days < 0 || formData.date_flexibility_days > 14) {
        newErrors.date_flexibility_days = 'Flexibility must be between 0 and 14 days';
      }

      if (!formData.group_size || formData.group_size < 1) {
        newErrors.group_size = 'Group size must be at least 1';
      } else if (formData.group_size > 50) {
        newErrors.group_size = 'For groups over 50, please contact us directly';
      }
    }

    if (stepNum === 2) {
      if (!formData.distance_km || formData.distance_km < 1) {
        newErrors.distance_km = 'Distance must be at least 1 km';
      } else if (formData.distance_km > 200) {
        newErrors.distance_km = 'For rides over 200km, please contact us directly';
      }

      if (!formData.duration_hours || formData.duration_hours < 1) {
        newErrors.duration_hours = 'Duration must be at least 1 hour';
      } else if (formData.duration_hours > 12) {
        newErrors.duration_hours = 'For rides over 12 hours, please contact us directly';
      }

      // Sanity: avg speed check
      if (formData.distance_km && formData.duration_hours) {
        const avgSpeed = formData.distance_km / formData.duration_hours;
        if (avgSpeed > 50) {
          newErrors.distance_km = 'That would mean over 50km/h average — please check distance/duration';
        } else if (avgSpeed < 5 && formData.distance_km > 5) {
          newErrors.duration_hours = 'That seems very slow — please check duration';
        }
      }
    }

    if (stepNum === 3) {
      if (formData.budget_estimate) {
        const budget = Number(formData.budget_estimate);
        if (budget < 0) {
          newErrors.budget_estimate = 'Budget cannot be negative';
        } else if (budget > 1000000) {
          newErrors.budget_estimate = 'Budget seems too high — please check';
        }
      }

      if (formData.contact_phone) {
        const phoneClean = formData.contact_phone.replace(/[\s\-\(\)]/g, '');
        if (!/^\+?[0-9]{10,15}$/.test(phoneClean)) {
          newErrors.contact_phone = 'Please enter a valid phone number (e.g., +254 712 345 678)';
        }
      }

      if (formData.pickup_needed && !formData.pickup_address.trim()) {
        newErrors.pickup_address = 'Pickup address is required when transport is needed';
      }

      if (formData.bike_rental_needed && !selectedBikeData) {
        newErrors.bike_rental = 'Please select a bike or uncheck bike rental';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const difficulties = ['beginner', 'casual', 'intermediate', 'advanced', 'expert'];
  const terrains = [
    { key: 'road', label: 'Road', icon: Route },
    { key: 'gravel', label: 'Gravel', icon: Mountain },
    { key: 'mtb_trail', label: 'MTB Trail', icon: Trees },
    { key: 'mixed', label: 'Mixed', icon: Blend },
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBikeRentalToggle = (checked) => {
    updateField('bike_rental_needed', checked);
    if (checked) {
      setShowBikeModal(true);
    } else {
      setSelectedBikeData(null);
    }
  };

  const handleBikeSelect = (bikeData) => {
    setSelectedBikeData(bikeData);
    setShowBikeModal(false);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdRequestCode, setCreatedRequestCode] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizeAddOnKey = (key) => {
        const map = {
          helmet: 'helmet',
          lights: 'lights',
          lock: 'lock',
          repair_kit: 'repair_kit',
          water_bottle: 'bottle',
          gloves: 'gloves',
        };
        return map[key] || key;
      };

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        preferred_date: formData.preferred_date,
        date_flexible: formData.date_flexibility_days > 0,
        date_flexibility_days: Number(formData.date_flexibility_days) || 0,
        group_size: Number(formData.group_size),
        rider_count: Number(formData.group_size),
        difficulty: formData.difficulty,
        terrain: formData.terrain,
        distance_km: formData.distance_km ? Number(formData.distance_km) : null,
        duration_hours: formData.duration_hours ? Number(formData.duration_hours) : null,
        bike_model: selectedBikeData?.bike?.name?.trim() || null,
        bike_size: selectedBikeData?.frameSize?.trim() || null,
        add_ons: selectedBikeData?.addOns
          ? Object.entries(selectedBikeData.addOns)
              .filter(([_, v]) => v)
              .map(([k]) => normalizeAddOnKey(k))
          : [],
        base_rental_price: Number(selectedBikeData?.baseRental) || 0,
        add_ons_price: Number(selectedBikeData?.addOnsTotal) || 0,
        insurance_price: Number(selectedBikeData?.insurance) || 0,
        transport_price: 0,
        security_deposit: Number(selectedBikeData?.deposit) || 0,
        total_price: Number(selectedBikeData?.grandTotal) || 0,
        budget_estimate: formData.budget_estimate ? Number(formData.budget_estimate) : null,
        insurance_included: !!selectedBikeData?.insurance,
        transport_included: formData.pickup_needed,
        transport_notes: formData.pickup_needed ? formData.pickup_address?.trim() || null : null,
        contact_phone: formData.contact_phone?.trim(),
        guest_name: user?.name?.trim() || user?.username?.trim() || null,
        guest_email: user?.email?.trim() || null,
        guest_phone: formData.contact_phone?.trim() || null,
      };

      const imageFiles = formData.images?.filter(f => f instanceof File) || [];

      const response = await customRideService.createRequest(payload, imageFiles);

      if (response.data?.success) {
        const requestCode = response.data.data?.request_id;
        setCreatedRequestCode(requestCode);
        setShowSuccessModal(true);
      } else {
        setErrors({ submit: response.data?.message || 'Submission failed.' });
      }
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        const fieldErrors = {};
        Object.entries(validationErrors).forEach(([field, messages]) => {
          fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.response?.data?.message || err.message || 'Network error.' });
      }
      console.error('Ride request submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCreatedRequestCode(null);
    navigate('/events');
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedRequestCode(null);
    setStep(1);
    setFormData({
      title: '',
      description: '',
      preferred_date: '',
      date_flexibility_days: 0,
      group_size: 1,
      difficulty: 'beginner',
      terrain: 'road',
      distance_km: 20,
      duration_hours: 2,
      bike_rental_needed: false,
      pickup_needed: false,
      pickup_address: '',
      budget_estimate: '',
      contact_phone: ''
    });
    setSelectedBikeData(null);
    setShowBikeModal(false);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Request a Custom Ride - Oshocks</title>
        <meta name="description" content="Can't find the perfect ride? Tell us your vision and we'll organize a custom cycling adventure for you." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Custom Ride</h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Can't find the perfect ride? Tell us your vision — destination, group size, difficulty — 
              and our team will plan and guide your custom cycling adventure.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
              {[
                { number: 1, label: 'Basics' },
                { number: 2, label: 'Preferences' },
                { number: 3, label: 'Extras' },
                { number: 4, label: 'Review' }
              ].map((s, idx, arr) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.number ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s.number ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > s.number ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ride Basics</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ride Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g., Weekend Family Ride in Karura"
                      maxLength={100}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{formData.title.length}/100</span>
                      {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Tell us more about what you're looking for... destination, experience level, special requests..."
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{formData.description.length} chars</span>
                      {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date *</label>
                      <input
                        type="date"
                        value={formData.preferred_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateField('preferred_date', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.preferred_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.preferred_date && <p className="text-red-500 text-sm mt-1">{errors.preferred_date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date Flexibility (days) ±</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={formData.date_flexibility_days}
                        onChange={(e) => updateField('date_flexibility_days', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.date_flexibility_days ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.date_flexibility_days && <p className="text-red-500 text-sm mt-1">{errors.date_flexibility_days}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size *</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={formData.group_size}
                        onChange={(e) => updateField('group_size', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('group_size', Math.max(1, formData.group_size - 1))}
                        disabled={formData.group_size <= 1}
                        className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.group_size}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                          updateField('group_size', isNaN(val) ? 1 : Math.max(1, Math.min(50, val)));
                        }}
                        className={`w-14 h-8 text-center font-bold text-gray-900 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm tabular-nums ${
                          errors.group_size ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => updateField('group_size', Math.min(50, formData.group_size + 1))}
                        className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                    {errors.group_size && <p className="text-red-500 text-sm mt-1">{errors.group_size}</p>}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => { if (validateStep(1)) setStep(2); }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ride Preferences</h2>

                {/* Difficulty */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {difficulties.map(diff => (
                      <button
                        key={diff}
                        onClick={() => updateField('difficulty', diff)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.difficulty === diff
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${DIFFICULTY_CONFIG[diff]?.color || 'bg-gray-400'}`} />
                        <p className="text-sm font-semibold capitalize">{diff}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terrain */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preferred Terrain</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {terrains.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.key}
                          onClick={() => updateField('terrain', t.key)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            formData.terrain === t.key
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                          <p className="text-sm font-semibold">{t.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distance & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Distance (km) *</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.distance_km}
                      onChange={(e) => updateField('distance_km', parseInt(e.target.value) || 1)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.distance_km ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.distance_km && <p className="text-red-500 text-sm mt-1">{errors.distance_km}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Duration (hours) *</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.duration_hours}
                      onChange={(e) => updateField('duration_hours', parseInt(e.target.value) || 1)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.duration_hours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.duration_hours && <p className="text-red-500 text-sm mt-1">{errors.duration_hours}</p>}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { if (validateStep(2)) setStep(3); }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Extras */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Additional Options</h2>

                <div className="space-y-4 mb-6">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.bike_rental_needed ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.bike_rental_needed}
                      onChange={(e) => handleBikeRentalToggle(e.target.checked)}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Bike Rental Needed</p>
                      <p className="text-sm text-gray-500">We will include bike options in your quote</p>
                    </div>
                    <Bike className="w-6 h-6 text-gray-400" />
                  </label>

                  {formData.bike_rental_needed && selectedBikeData && (
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3">
                        <img src={selectedBikeData.bike.images[0]} alt={selectedBikeData.bike.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{selectedBikeData.bike.name}</p>
                          <p className="text-sm text-gray-600">{selectedBikeData.bike.brand} {selectedBikeData.bike.model}</p>
                          <p className="text-sm font-semibold text-orange-600 mt-1">KSh {selectedBikeData.grandTotal.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => setShowBikeModal(true)}
                          className="px-3 py-1.5 text-sm font-semibold text-orange-600 bg-white border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.bike_rental_needed && !selectedBikeData && (
                    <button
                      onClick={() => setShowBikeModal(true)}
                      className="w-full p-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Bike className="w-5 h-5" />
                      Select a Bike
                    </button>
                  )}

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.pickup_needed ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.pickup_needed}
                      onChange={(e) => updateField('pickup_needed', e.target.checked)}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Pickup/Transport Needed</p>
                      <p className="text-sm text-gray-500">We can arrange transport to the ride start</p>
                    </div>
                    <MapPin className="w-6 h-6 text-gray-400" />
                  </label>

                  {formData.pickup_needed && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address *</label>
                      <input
                        type="text"
                        value={formData.pickup_address}
                        onChange={(e) => updateField('pickup_address', e.target.value)}
                        placeholder="Your address or preferred pickup location"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          errors.pickup_address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.pickup_address && <p className="text-red-500 text-sm mt-1">{errors.pickup_address}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Estimate (KSh)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.budget_estimate}
                      onChange={(e) => updateField('budget_estimate', e.target.value)}
                      placeholder="Optional - helps us tailor the quote"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.budget_estimate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.budget_estimate && <p className="text-red-500 text-sm mt-1">{errors.budget_estimate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone *</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => updateField('contact_phone', e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        errors.contact_phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
                  </div>

                  {formData.bike_rental_needed && errors.bike_rental && (
                    <p className="text-red-500 text-sm">{errors.bike_rental}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { if (validateStep(3)) setStep(4); }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Review Request
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Request</h2>

                {/* Quick Options Summary */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.bike_rental_needed && selectedBikeData && (
                    <>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                        {selectedBikeData.bike.name}
                      </span>
                      {selectedBikeData.addOns && Object.entries(selectedBikeData.addOns).filter(([_, v]) => v).map(([key]) => {
                        const addOnLabels = { helmet: 'Helmet', lights: 'Lights', lock: 'Lock', repair_kit: 'Repair Kit', water_bottle: 'Bottle', gloves: 'Gloves' };
                        return (
                          <span key={key} className="px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-full font-medium">
                            + {addOnLabels[key] || key}
                          </span>
                        );
                      })}
                      {selectedBikeData.insurance && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">Insured</span>
                      )}
                    </>
                  )}
                  {formData.bike_rental_needed && !selectedBikeData && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">Bike Rental (pending)</span>
                  )}
                  {formData.pickup_needed && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">Transport</span>
                  )}
                  {formData.budget_estimate && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">Budget: KSh {Number(formData.budget_estimate).toLocaleString()}</span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {/* Step 1 Summary */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Ride Basics</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</p>
                        <p className="font-semibold text-gray-900">{formData.title}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{formData.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Preferred Date</p>
                          <p className="font-semibold text-gray-900">{formData.preferred_date ? new Date(formData.preferred_date).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                          <p className="text-sm text-gray-500">±{formData.date_flexibility_days} days flexible</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Group Size</p>
                          <p className="font-semibold text-gray-900">{formData.group_size} riders</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Summary */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                        <p className="font-semibold text-gray-900 capitalize">{formData.difficulty}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Terrain</p>
                        <p className="font-semibold text-gray-900 capitalize">{formData.terrain.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Distance</p>
                        <p className="font-semibold text-gray-900">{formData.distance_km} km</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                        <p className="font-semibold text-gray-900">{formData.duration_hours} hours</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Summary */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Additional Options</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bike Rental</p>
                        {formData.bike_rental_needed && selectedBikeData ? (
                          <div className="space-y-2">
                            <p className="font-semibold text-gray-900">{selectedBikeData.bike.name}</p>
                            <p className="text-sm text-gray-600">{selectedBikeData.bike.brand} {selectedBikeData.bike.model} • Size {selectedBikeData.frameSize?.toUpperCase() || selectedBikeData.bike.frame_size.toUpperCase()}</p>
                            
                            {/* Price Breakdown */}
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Price Breakdown</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Base Rental</span>
                                  <span className="font-medium">KSh {selectedBikeData.baseRental?.toLocaleString() || '—'}</span>
                                </div>
                                
                                {/* Add-ons */}
                                {selectedBikeData.addOns && Object.entries(selectedBikeData.addOns).filter(([_, v]) => v).length > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Add-ons</span>
                                    <span className="font-medium">KSh {selectedBikeData.addOnsTotal?.toLocaleString() || '—'}</span>
                                  </div>
                                )}
                                {selectedBikeData.addOns && Object.entries(selectedBikeData.addOns).filter(([_, v]) => v).map(([key, _]) => {
                                  const addOnLabels = { helmet: 'Helmet', lights: 'Bike Lights', lock: 'U-Lock', repair_kit: 'Repair Kit', water_bottle: 'Water Bottle', gloves: 'Cycling Gloves' };
                                  const addOnPrices = { helmet: 200, lights: 150, lock: 100, repair_kit: 100, water_bottle: 50, gloves: 150 };
                                  return (
                                    <div key={key} className="flex justify-between text-xs text-gray-500 pl-2">
                                      <span>• {addOnLabels[key] || key}</span>
                                      <span>KSh {(addOnPrices[key] * formData.group_size).toLocaleString()}</span>
                                    </div>
                                  );
                                })}
                                
                                {/* Insurance */}
                                {selectedBikeData.insurance && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Insurance</span>
                                    <span className="font-medium">KSh {selectedBikeData.insurance?.toLocaleString() || '—'}</span>
                                  </div>
                                )}
                                
                                <div className="border-t border-gray-200 pt-1 mt-1">
                                  <div className="flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-orange-600">KSh {selectedBikeData.grandTotal?.toLocaleString() || '—'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Security Deposit */}
                            <p className="text-xs text-gray-500 mt-1">
                              Security deposit: KSh {selectedBikeData.deposit?.toLocaleString() || '—'} (refundable)
                            </p>
                          </div>
                        ) : formData.bike_rental_needed ? (
                          <p className="font-semibold text-orange-600">Needed (bike selection pending)</p>
                        ) : (
                          <p className="font-semibold text-gray-900">Not needed</p>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transport</p>
                        <p className="font-semibold text-gray-900">
                          {formData.pickup_needed
                            ? `Yes — ${formData.pickup_address || 'Address not provided'}`
                            : 'Not needed'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Budget Estimate</p>
                          <p className="font-semibold text-gray-900">{formData.budget_estimate ? `KSh ${Number(formData.budget_estimate).toLocaleString()}` : 'Not specified'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contact Phone</p>
                          <p className="font-semibold text-gray-900">{formData.contact_phone || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Fields */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Fields</h3>
                    <div className="p-4 bg-gray-100/50 rounded-xl border border-gray-200">
                      <p className="text-sm text-gray-600">
                        Status: <span className="font-semibold">reviewing (auto)</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted by: <span className="font-semibold">{user?.name || user?.email || 'Guest'}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 italic mt-2">
                        Request ID and server timestamp will be generated on submission.
                      </p>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-4">
                    <p className="text-sm text-red-600 font-medium">{errors.submit}</p>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-8">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      We'll send you a detailed quote within 24 hours. No commitment required until you accept the quote.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { if (validateStep(3)) handleSubmit(); }}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdRequestCode && (
        <EventActionModal
          actionType="ride_created"
          code={createdRequestCode}
          onClose={handleCloseModal}
          onCreateAnother={handleCreateAnother}
        />
      )}

      <BikeSelectionModal
        isOpen={showBikeModal}
        onClose={() => setShowBikeModal(false)}
        onSelect={handleBikeSelect}
        event={{
          title: formData.title || 'Custom Ride Request',
          terrain: formData.terrain,
          start_datetime: formData.preferred_date,
          end_datetime: formData.preferred_date
        }}
        participants={formData.group_size}
      />
    </>
  );
};

export default RideRequestPage;
