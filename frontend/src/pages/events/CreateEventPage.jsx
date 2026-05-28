import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, ChevronRight, Check, Calendar, MapPin, Clock, Users,
  Bike, DollarSign, Shield, Info, Upload, Plus, X, Trophy, Heart,
  GraduationCap, Building2, Lock, Palette, PartyPopper, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  DIFFICULTY_CONFIG, TERRAIN_CONFIG, EVENT_TYPE_CONFIG, BIKE_CATEGORY_CONFIG
} from '../../data/cyclingMockData';

const EVENT_TYPES = [
  { key: 'group_ride', label: 'Group Ride', icon: Users },
  { key: 'race', label: 'Race', icon: Trophy },
  { key: 'charity', label: 'Charity', icon: Heart },
  { key: 'training', label: 'Training', icon: GraduationCap },
  { key: 'social', label: 'Social', icon: PartyPopper },
  { key: 'corporate', label: 'Corporate', icon: Building2 },
  { key: 'private', label: 'Private', icon: Lock },
  { key: 'theme', label: 'Theme', icon: Palette },
];

const DIFFICULTIES = [
  { key: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { key: 'casual', label: 'Casual', color: 'bg-blue-500' },
  { key: 'intermediate', label: 'Intermediate', color: 'bg-orange-500' },
  { key: 'advanced', label: 'Advanced', color: 'bg-red-500' },
  { key: 'expert', label: 'Expert', color: 'bg-purple-500' },
];

const TERRAINS = [
  { key: 'road', label: 'Road' },
  { key: 'gravel', label: 'Gravel' },
  { key: 'mtb_trail', label: 'MTB Trail' },
  { key: 'mixed', label: 'Mixed' },
];

const REFUND_POLICIES = [
  { key: 'full_24h', label: 'Full refund 24h before' },
  { key: 'full_48h', label: 'Full refund 48h before' },
  { key: 'tiered', label: 'Tiered (7d/3d/0d)' },
  { key: 'full_anytime', label: 'Full refund anytime' },
  { key: 'corporate', label: 'Corporate (custom)' },
];

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Route & Schedule' },
  { id: 3, label: 'Pricing & Capacity' },
  { id: 4, label: 'Guide & Logistics' },
  { id: 5, label: 'Review & Publish' },
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user, getEffectiveRole } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    short_description: '',
    description: '',
    event_type: 'group_ride',
    difficulty: 'beginner',
    terrain: 'road',
    theme_name: '',
    charity_name: '',
    charity_url: '',
    
    // Step 2: Route & Schedule
    route_name: '',
    route_description: '',
    distance_km: '',
    elevation_gain_m: '',
    estimated_duration_hours: '',
    meeting_point: '',
    start_datetime: '',
    end_datetime: '',
    registration_deadline: '',
    is_recurring: false,
    recurrence_pattern: '',
    
    // Step 3: Pricing & Capacity
    max_participants: '',
    min_participants: '',
    price_per_person: '',
    member_price: '',
    early_bird_price: '',
    early_bird_deadline: '',
    group_discount_threshold: 5,
    group_discount_percent: 10,
    
    // Step 4: Guide & Logistics
    guide_included: true,
    guide_name: '',
    guide_bio: '',
    guide_certifications: [],
    bike_included: false,
    included_bike_category: '',
    transport_provided: false,
    transport_price: '',
    equipment_provided: [],
    required_equipment: [],
    cancellation_policy: '',
    weather_policy: '',
    refund_policy: 'full_24h',
    
    // Step 5: Photos
    photos: [],
  });

  const [certInput, setCertInput] = useState('');
  const [equipInput, setEquipInput] = useState('');
  const [requiredInput, setRequiredInput] = useState('');

  const effectiveRole = getEffectiveRole?.() || user?.role || 'user';
  const isAuthorized = ['admin', 'super_admin'].includes(effectiveRole);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addTag = (field, value, setInput) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setInput('');
  };

  const removeTag = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.event_type === 'charity' && !formData.charity_name.trim()) newErrors.charity_name = 'Charity name is required';
      if (formData.event_type === 'theme' && !formData.theme_name.trim()) newErrors.theme_name = 'Theme name is required';
    }
    if (step === 2) {
      if (!formData.meeting_point.trim()) newErrors.meeting_point = 'Meeting point is required';
      if (!formData.start_datetime) newErrors.start_datetime = 'Start date is required';
      if (!formData.end_datetime) newErrors.end_datetime = 'End date is required';
      if (!formData.distance_km) newErrors.distance_km = 'Distance is required';
      if (!formData.estimated_duration_hours) newErrors.estimated_duration_hours = 'Duration is required';
      if (formData.start_datetime && formData.end_datetime && new Date(formData.start_datetime) >= new Date(formData.end_datetime)) {
        newErrors.end_datetime = 'End must be after start';
      }
    }
    if (step === 3) {
      if (!formData.max_participants) newErrors.max_participants = 'Max participants required';
      if (!formData.price_per_person && formData.price_per_person !== 0) newErrors.price_per_person = 'Price is required';
      if (formData.member_price && Number(formData.member_price) > Number(formData.price_per_person)) {
        newErrors.member_price = 'Member price cannot exceed regular price';
      }
    }
    if (step === 4) {
      if (formData.guide_included && !formData.guide_name.trim()) newErrors.guide_name = 'Guide name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate slug from title
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // In real implementation: POST /api/events
    console.log('Creating event:', { ...formData, slug });
    
    setIsSubmitting(false);
    navigate('/events');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">Only administrators can create events.</p>
          <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all">
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep > step.id ? 'bg-green-500 text-white' :
                currentStep === step.id ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                'bg-gray-200 text-gray-400'
              }`}>
                {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs font-medium mt-2 ${
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full ${
                currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Nairobi City Night Ride"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description *</label>
        <input
          type="text"
          value={formData.short_description}
          onChange={(e) => updateField('short_description', e.target.value)}
          placeholder="One-line summary for cards and listings"
          maxLength={120}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
            errors.short_description ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        <p className="text-xs text-gray-400 mt-1">{formData.short_description.length}/120</p>
        {errors.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Detailed description of the event experience..."
          rows={5}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Event Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EVENT_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => updateField('event_type', type.key)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  formData.event_type === type.key
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {formData.event_type === 'charity' && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 space-y-4">
          <h4 className="font-semibold text-purple-900 flex items-center gap-2">
            <Heart className="w-4 h-4" /> Charity Details
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charity Name *</label>
            <input
              type="text"
              value={formData.charity_name}
              onChange={(e) => updateField('charity_name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.charity_name ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.charity_name && <p className="text-red-500 text-sm mt-1">{errors.charity_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charity URL</label>
            <input
              type="url"
              value={formData.charity_url}
              onChange={(e) => updateField('charity_url', e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      )}

      {formData.event_type === 'theme' && (
        <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
          <h4 className="font-semibold text-pink-900 flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4" /> Theme Details
          </h4>
          <input
            type="text"
            value={formData.theme_name}
            onChange={(e) => updateField('theme_name', e.target.value)}
            placeholder="e.g., Halloween Spooktacular Ride"
            className={`w-full px-4 py-2 border rounded-lg ${errors.theme_name ? 'border-red-300' : 'border-gray-200'}`}
          />
          {errors.theme_name && <p className="text-red-500 text-sm mt-1">{errors.theme_name}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty Level *</label>
        <div className="flex flex-wrap gap-3">
          {DIFFICULTIES.map(diff => (
            <button
              key={diff.key}
              onClick={() => updateField('difficulty', diff.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                formData.difficulty === diff.key
                  ? 'ring-2 ring-offset-2 ring-gray-400 text-white ' + diff.color
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${diff.color}`} />
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Terrain *</label>
        <div className="flex flex-wrap gap-3">
          {TERRAINS.map(t => (
            <button
              key={t.key}
              onClick={() => updateField('terrain', t.key)}
              className={`px-4 py-2.5 rounded-full font-medium transition-all ${
                formData.terrain === t.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Route Name</label>
        <input
          type="text"
          value={formData.route_name}
          onChange={(e) => updateField('route_name', e.target.value)}
          placeholder="e.g., Ngong Hills Ridge Trail"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Route Description</label>
        <textarea
          value={formData.route_description}
          onChange={(e) => updateField('route_description', e.target.value)}
          placeholder="Describe the route highlights, landmarks, and what riders will see..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km) *</label>
          <div className="relative">
            <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.distance_km}
              onChange={(e) => updateField('distance_km', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.distance_km ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.distance_km && <p className="text-red-500 text-sm mt-1">{errors.distance_km}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Elevation Gain (m)</label>
          <input
            type="number"
            min="0"
            value={formData.elevation_gain_m}
            onChange={(e) => updateField('elevation_gain_m', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (hours) *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.estimated_duration_hours}
              onChange={(e) => updateField('estimated_duration_hours', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.estimated_duration_hours ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.estimated_duration_hours && <p className="text-red-500 text-sm mt-1">{errors.estimated_duration_hours}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Point *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.meeting_point}
            onChange={(e) => updateField('meeting_point', e.target.value)}
            placeholder="e.g., Oshocks Shop, Ngong Road"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.meeting_point ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.meeting_point && <p className="text-red-500 text-sm mt-1">{errors.meeting_point}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.start_datetime}
            onChange={(e) => updateField('start_datetime', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.start_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.start_datetime && <p className="text-red-500 text-sm mt-1">{errors.start_datetime}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.end_datetime}
            onChange={(e) => updateField('end_datetime', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.end_datetime ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.end_datetime && <p className="text-red-500 text-sm mt-1">{errors.end_datetime}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
        <input
          type="datetime-local"
          value={formData.registration_deadline}
          onChange={(e) => updateField('registration_deadline', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <input
          type="checkbox"
          id="is_recurring"
          checked={formData.is_recurring}
          onChange={(e) => updateField('is_recurring', e.target.checked)}
          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
        />
        <div>
          <label htmlFor="is_recurring" className="font-semibold text-gray-900 cursor-pointer">This is a recurring event</label>
          <p className="text-sm text-gray-500">e.g., Every Saturday, Weekly, Monthly</p>
        </div>
      </div>

      {formData.is_recurring && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Recurrence Pattern</label>
          <input
            type="text"
            value={formData.recurrence_pattern}
            onChange={(e) => updateField('recurrence_pattern', e.target.value)}
            placeholder="e.g., Every Saturday"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Participants *</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={formData.max_participants}
              onChange={(e) => updateField('max_participants', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.max_participants ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.max_participants && <p className="text-red-500 text-sm mt-1">{errors.max_participants}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Min Participants</label>
          <input
            type="number"
            min="1"
            value={formData.min_participants}
            onChange={(e) => updateField('min_participants', e.target.value)}
            placeholder="Event proceeds only if reached"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Price Per Person (KSh) *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.price_per_person}
              onChange={(e) => updateField('price_per_person', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.price_per_person ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.price_per_person && <p className="text-red-500 text-sm mt-1">{errors.price_per_person}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Member Price (KSh)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.member_price}
              onChange={(e) => updateField('member_price', e.target.value)}
              placeholder="Discounted price for members"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.member_price ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.member_price && <p className="text-red-500 text-sm mt-1">{errors.member_price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Early Bird Price (KSh)</label>
          <input
            type="number"
            min="0"
            value={formData.early_bird_price}
            onChange={(e) => updateField('early_bird_price', e.target.value)}
            placeholder="Optional discount price"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Early Bird Deadline</label>
          <input
            type="datetime-local"
            value={formData.early_bird_deadline}
            onChange={(e) => updateField('early_bird_deadline', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Group Discount
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Group Size</label>
            <input
              type="number"
              min="2"
              value={formData.group_discount_threshold}
              onChange={(e) => updateField('group_discount_threshold', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.group_discount_percent}
              onChange={(e) => updateField('group_discount_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
        <input
          type="checkbox"
          id="guide_included"
          checked={formData.guide_included}
          onChange={(e) => updateField('guide_included', e.target.checked)}
          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
        />
        <label htmlFor="guide_included" className="font-semibold text-gray-900 cursor-pointer">Guide Included</label>
      </div>

      {formData.guide_included && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guide Name *</label>
            <input
              type="text"
              value={formData.guide_name}
              onChange={(e) => updateField('guide_name', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.guide_name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.guide_name && <p className="text-red-500 text-sm mt-1">{errors.guide_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guide Bio</label>
            <textarea
              value={formData.guide_bio}
              onChange={(e) => updateField('guide_bio', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('guide_certifications', certInput, setCertInput))}
                placeholder="Add certification and press Enter"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                onClick={() => addTag('guide_certifications', certInput, setCertInput)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.guide_certifications.map((cert, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-orange-200 text-orange-700 rounded-full text-sm">
                  {cert}
                  <button onClick={() => removeTag('guide_certifications', i)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
        <input
          type="checkbox"
          id="bike_included"
          checked={formData.bike_included}
          onChange={(e) => updateField('bike_included', e.target.checked)}
          className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
        />
        <div>
          <label htmlFor="bike_included" className="font-semibold text-gray-900 cursor-pointer">Bike Included</label>
          <p className="text-sm text-gray-500">Participants don't need to bring their own bike</p>
        </div>
      </div>

      {formData.bike_included && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bike Category</label>
          <select
            value={formData.included_bike_category}
            onChange={(e) => updateField('included_bike_category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select bike category...</option>
            {Object.entries(BIKE_CATEGORY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
        <input
          type="checkbox"
          id="transport_provided"
          checked={formData.transport_provided}
          onChange={(e) => updateField('transport_provided', e.target.checked)}
          className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
        />
        <div>
          <label htmlFor="transport_provided" className="font-semibold text-gray-900 cursor-pointer">Transport Provided</label>
          <p className="text-sm text-gray-500">Transport to start point available</p>
        </div>
      </div>

      {formData.transport_provided && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Transport Price (KSh)</label>
          <input
            type="number"
            min="0"
            value={formData.transport_price}
            onChange={(e) => updateField('transport_price', e.target.value)}
            placeholder="0 for free"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Equipment Provided</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={equipInput}
            onChange={(e) => setEquipInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('equipment_provided', equipInput, setEquipInput))}
            placeholder="e.g., helmet, lights, gloves"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={() => addTag('equipment_provided', equipInput, setEquipInput)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.equipment_provided.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm">
              {item.replace(/_/g, ' ')}
              <button onClick={() => removeTag('equipment_provided', i)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Required Equipment</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={requiredInput}
            onChange={(e) => setRequiredInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('required_equipment', requiredInput, setRequiredInput))}
            placeholder="e.g., closed_shoes, water_bottle"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={() => addTag('required_equipment', requiredInput, setRequiredInput)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.required_equipment.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm">
              {item.replace(/_/g, ' ')}
              <button onClick={() => removeTag('required_equipment', i)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Refund Policy</label>
        <select
          value={formData.refund_policy}
          onChange={(e) => updateField('refund_policy', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {REFUND_POLICIES.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</label>
        <textarea
          value={formData.cancellation_policy}
          onChange={(e) => updateField('cancellation_policy', e.target.value)}
          placeholder="Describe your cancellation and refund terms..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Weather Policy</label>
        <textarea
          value={formData.weather_policy}
          onChange={(e) => updateField('weather_policy', e.target.value)}
          placeholder="What happens if it rains? e.g., Postponed in heavy rain..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Event Photos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
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
      </div>

      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-orange-500" />
          Event Preview
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Title</span>
            <span className="font-semibold text-gray-900">{formData.title || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Type</span>
            <span className="font-semibold text-gray-900 capitalize">{formData.event_type.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Difficulty</span>
            <span className="font-semibold text-gray-900 capitalize">{formData.difficulty}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold text-gray-900">
              {formData.start_datetime ? new Date(formData.start_datetime).toLocaleDateString('en-KE') : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Price</span>
            <span className="font-semibold text-gray-900">KSh {formData.price_per_person ? Number(formData.price_per_person).toLocaleString() : '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Capacity</span>
            <span className="font-semibold text-gray-900">{formData.max_participants || '—'} participants</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Distance</span>
            <span className="font-semibold text-gray-900">{formData.distance_km ? `${formData.distance_km}km` : '—'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Meeting Point</span>
            <span className="font-semibold text-gray-900">{formData.meeting_point || '—'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Before Publishing</p>
          <p className="text-sm text-yellow-700 mt-1">
            Review all details carefully. Once published, participants can start booking. You can edit most fields later.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Create Event - Oshocks</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                to="/events"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Event</h1>
                <p className="text-sm text-gray-500">Fill in the details to publish a cycling event</p>
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
            {currentStep === 5 && renderStep5()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  currentStep === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Publish Event
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEventPage;