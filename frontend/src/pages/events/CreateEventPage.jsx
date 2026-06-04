import { useState, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, ChevronRight, Check, Calendar, MapPin, Clock, Users,
  Bike, DollarSign, Shield, Info, Upload, Plus, X, Trophy, Heart,
  GraduationCap, Building2, Lock, Palette, PartyPopper, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import EventActionModal from '../../components/events/EventActionModal';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEventCode, setCreatedEventCode] = useState(null);
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

    // System fields — backend auto-generates event_code, sets organizer_id, status, etc.
    status: 'open',
    current_participants: 0,
    rating: 0,
    review_count: 0,
    meeting_lat: null,
    meeting_lng: null,
    route_gpx_url: null,
    tags: [],
    badge_earned_id: null,
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
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_IMAGES = 10;

    const validFiles = [];
    const errors = [];

    if (photoPreview.length + files.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} photos allowed. You have ${photoPreview.length} already.`);
      e.target.value = '';
      return;
    }

    files.forEach(file => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Only JPG, PNG, WebP allowed`);
        return;
      }
      
      // Check for zip bomb / suspiciously small file with large dimensions
      if (file.size < 1024 && file.type.startsWith('image/')) {
        errors.push(`${file.name}: File appears corrupted (too small)`);
        return;
      }

      // Check max size
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: Exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPhotoPreview(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...validFiles] }));
    }

    e.target.value = ''; // Reset input
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
      if (!formData.start_datetime) newErrors.start_datetime = 'Start date & time is required';
      if (!formData.end_datetime) newErrors.end_datetime = 'End date & time is required';
      if (!formData.distance_km) newErrors.distance_km = 'Distance is required';
      if (!formData.estimated_duration_hours) newErrors.estimated_duration_hours = 'Duration is required';
      if (formData.start_datetime && formData.end_datetime && new Date(formData.start_datetime) >= new Date(formData.end_datetime)) {
        newErrors.end_datetime = 'End date must be after start date';
      }
      // Registration deadline must be before event start
      if (formData.registration_deadline && formData.start_datetime) {
        if (new Date(formData.registration_deadline) >= new Date(formData.start_datetime)) {
          newErrors.registration_deadline = 'Registration deadline must be before event starts';
        }
      }
      // Recurring event validation
      if (formData.is_recurring && !formData.recurrence_pattern.trim()) {
        newErrors.recurrence_pattern = 'Please describe the recurrence pattern (e.g., Every Saturday)';
      }
    }
    if (step === 3) {
      if (!formData.max_participants) {
        newErrors.max_participants = 'Maximum participants is required';
      } else if (Number(formData.max_participants) < 1) {
        newErrors.max_participants = 'Must allow at least 1 participant';
      }
      
      if (formData.min_participants && Number(formData.min_participants) > Number(formData.max_participants)) {
        newErrors.min_participants = 'Minimum cannot exceed maximum participants';
      }
      
      if (!formData.price_per_person && formData.price_per_person !== 0) {
        newErrors.price_per_person = 'Price per person is required';
      } else if (Number(formData.price_per_person) < 0) {
        newErrors.price_per_person = 'Price cannot be negative';
      }
      
      if (formData.member_price && Number(formData.member_price) > Number(formData.price_per_person)) {
        newErrors.member_price = 'Member price cannot exceed regular price';
      }
      
      // Early bird must be cheaper than regular price
      if (formData.early_bird_price && Number(formData.early_bird_price) >= Number(formData.price_per_person)) {
        newErrors.early_bird_price = 'Early bird price must be less than regular price';
      }
      
      // Early bird deadline must be before event start
      if (formData.early_bird_price && !formData.early_bird_deadline) {
        newErrors.early_bird_deadline = 'Early bird deadline is required when early bird price is set';
      }
      if (formData.early_bird_deadline && formData.start_datetime) {
        if (new Date(formData.early_bird_deadline) >= new Date(formData.start_datetime)) {
          newErrors.early_bird_deadline = 'Early bird deadline must be before event start';
        }
      }
      
      // Group discount validation
      if (formData.group_discount_threshold > 0) {
        if (Number(formData.group_discount_threshold) > Number(formData.max_participants)) {
          newErrors.group_discount_threshold = 'Group size cannot exceed max participants';
        }
        if (!formData.group_discount_percent || Number(formData.group_discount_percent) <= 0) {
          newErrors.group_discount_percent = 'Discount percentage is required';
        }
        if (formData.group_discount_percent > 100) {
          newErrors.group_discount_percent = 'Discount cannot exceed 100%';
        }
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

      try {
        // Separate image files from other data
        const imageFiles = formData.photos.filter(p => p instanceof File);
        
        // Build plain data payload (no base64 conversion — send files directly)
        const payload = {
          title: formData.title,
          short_description: formData.short_description || null,
          description: formData.description || null,
          event_type: formData.event_type,
          difficulty: formData.difficulty,
          terrain: formData.terrain,
          theme_name: formData.theme_name || null,
          charity_name: formData.charity_name || null,
          charity_url: formData.charity_url || null,
          route_name: formData.route_name || null,
          route_description: formData.route_description || null,
          distance_km: Number(formData.distance_km),
          elevation_gain_m: formData.elevation_gain_m ? Number(formData.elevation_gain_m) : null,
          estimated_duration_hours: Number(formData.estimated_duration_hours),
          meeting_point: formData.meeting_point,
          meeting_lat: formData.meeting_lat || null,
          meeting_lng: formData.meeting_lng || null,
          start_datetime: formData.start_datetime,
          end_datetime: formData.end_datetime,
          registration_deadline: formData.registration_deadline || null,
          is_recurring: formData.is_recurring || false,
          recurrence_pattern: formData.recurrence_pattern || null,
          max_participants: Number(formData.max_participants),
          min_participants: formData.min_participants ? Number(formData.min_participants) : null,
          price_per_person: Number(formData.price_per_person),
          member_price: formData.member_price ? Number(formData.member_price) : null,
          early_bird_price: formData.early_bird_price ? Number(formData.early_bird_price) : null,
          early_bird_deadline: formData.early_bird_deadline || null,
          group_discount_threshold: formData.group_discount_threshold ? Number(formData.group_discount_threshold) : null,
          group_discount_percent: formData.group_discount_percent ? Number(formData.group_discount_percent) : null,
          guide_included: formData.guide_included || false,
          guide_name: formData.guide_name || null,
          guide_bio: formData.guide_bio || null,
          guide_certifications: formData.guide_certifications || [],
          bike_included: formData.bike_included || false,
          included_bike_category: formData.included_bike_category || null,
          transport_provided: formData.transport_provided || false,
          transport_price: formData.transport_price ? Number(formData.transport_price) : null,
          equipment_provided: formData.equipment_provided || [],
          required_equipment: formData.required_equipment || [],
          refund_policy: formData.refund_policy || null,
          cancellation_policy: formData.cancellation_policy || null,
          weather_policy: formData.weather_policy || null,
          tags: formData.tags || [],
          route_gpx_url: formData.route_gpx_url || null,
          badge_earned_id: formData.badge_earned_id || null,
        };

        // Send FormData with actual File objects
        const response = await eventService.createEvent(payload, imageFiles);

        if (response.data?.success) {
          const eventCode = response.data?.event_code;
          setCreatedEventCode(eventCode);
          setShowSuccessModal(true);
          setIsSubmitting(false);
        } else {
          throw new Error(response.data?.message || 'Failed to create event');
        }
      } catch (error) {
        console.error('Event creation error:', error);
        alert(error.response?.data?.message || error.message || 'Failed to create event. Please try again.');
        setIsSubmitting(false);
      }
    };

    const handleCloseModal = () => {
      setShowSuccessModal(false);
      setCreatedEventCode(null);
      navigate('/events');
    };

    const handleCreateAnother = () => {
      setShowSuccessModal(false);
      setCreatedEventCode(null);
      // Reset form to step 1
      setCurrentStep(1);
      setFormData({
        // Step 1: Basic Info
        title: '', short_description: '', description: '', event_type: 'group_ride',
        difficulty: 'beginner', terrain: 'road', theme_name: '', charity_name: '', charity_url: '',
        // Step 2: Route & Schedule
        route_name: '', route_description: '', distance_km: '', elevation_gain_m: '',
        estimated_duration_hours: '', meeting_point: '', start_datetime: '', end_datetime: '',
        registration_deadline: '', is_recurring: false, recurrence_pattern: '',
        // Step 3: Pricing & Capacity
        max_participants: '', min_participants: '', price_per_person: '', member_price: '',
        early_bird_price: '', early_bird_deadline: '', group_discount_threshold: '', group_discount_percent: '',
        // Step 4: Guide & Logistics
        guide_included: false, guide_name: '', guide_bio: '', guide_certifications: [],
        bike_included: false, included_bike_category: '', transport_provided: false, transport_price: '',
        equipment_provided: [], required_equipment: [],
        cancellation_policy: '', weather_policy: '', refund_policy: '',
        // Step 5: Photos
        photos: [],
        // System fields
        status: 'open', current_participants: 0, rating: 0, review_count: 0,
        meeting_lat: null, meeting_lng: null, route_gpx_url: null, tags: [], badge_earned_id: null,
      });
      setPhotoPreview([]);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <Fragment key={step.id}>
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
          </Fragment>
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
          maxLength={100}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{formData.title.length}/100</span>
          {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
        </div>
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
          onChange={(e) => {
            let value = e.target.value;
            // Auto-replace comma + space/letter with arrow as user types
            value = value.replace(/,\s*([^,])/g, ' → $1');
            updateField('route_description', value);
          }}
          placeholder="Describe the route: Ngong Road, Kilimani, CBD..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Separate locations by a comma — arrows appear automatically
        </p>
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
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.early_bird_price ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.early_bird_price && <p className="text-red-500 text-sm mt-1">{errors.early_bird_price}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Early Bird Deadline</label>
          <input
            type="datetime-local"
            value={formData.early_bird_deadline}
            onChange={(e) => updateField('early_bird_deadline', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.early_bird_deadline ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.early_bird_deadline && <p className="text-red-500 text-sm mt-1">{errors.early_bird_deadline}</p>}
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
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.group_discount_threshold ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.group_discount_threshold && <p className="text-red-500 text-xs mt-1">{errors.group_discount_threshold}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.group_discount_percent}
              onChange={(e) => updateField('group_discount_percent', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.group_discount_percent ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.group_discount_percent && <p className="text-red-500 text-xs mt-1">{errors.group_discount_percent}</p>}
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

  const renderStep5 = () => {
    // Price tier display helper
    const getPriceBreakdown = () => {
      const prices = [];
      if (formData.early_bird_price && formData.early_bird_deadline) {
        prices.push({ label: 'Early Bird', price: formData.early_bird_price, deadline: formData.early_bird_deadline });
      }
      if (formData.member_price) {
        prices.push({ label: 'Member', price: formData.member_price });
      }
      prices.push({ label: 'Standard', price: formData.price_per_person || '—' });
      return prices;
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
    const fmt = (v) => v || '—';
    const fmtNum = (v) => v ? Number(v).toLocaleString() : '—';
    const fmtBool = (v) => v ? 'Yes' : 'No';

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Photos Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Event Photos</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP only — max 10MB each</p>
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

        {/* FULL EVENT SUMMARY */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-500" />
            Complete Event Summary
          </h3>

          {/* Step 1: Basic Info */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Basic Info</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Title" value={fmt(formData.title)} />
              <SummaryRow label="Short Description" value={fmt(formData.short_description)} />
              <SummaryRow label="Event Type" value={formData.event_type.replace(/_/g, ' ')} />
              <SummaryRow label="Difficulty" value={fmt(formData.difficulty)} />
              <SummaryRow label="Terrain" value={fmt(formData.terrain)} />
              {formData.event_type === 'charity' && <SummaryRow label="Charity" value={fmt(formData.charity_name)} />}
              {formData.event_type === 'theme' && <SummaryRow label="Theme" value={fmt(formData.theme_name)} />}
            </div>
          </div>

          {/* Step 2: Route & Schedule */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Route & Schedule</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Route Name" value={fmt(formData.route_name)} />
              <SummaryRow label="Route Description" value={fmt(formData.route_description)} />
              <SummaryRow label="Distance" value={formData.distance_km ? `${fmtNum(formData.distance_km)} km` : '—'} />
              <SummaryRow label="Elevation Gain" value={formData.elevation_gain_m ? `${fmtNum(formData.elevation_gain_m)} m` : '—'} />
              <SummaryRow label="Duration" value={formData.estimated_duration_hours ? `${fmtNum(formData.estimated_duration_hours)} hours` : '—'} />
              <SummaryRow label="Meeting Point" value={fmt(formData.meeting_point)} />
              <SummaryRow label="Start" value={formatDate(formData.start_datetime)} />
              <SummaryRow label="End" value={formatDate(formData.end_datetime)} />
              <SummaryRow label="Registration Deadline" value={formatDate(formData.registration_deadline)} />
              <SummaryRow label="Recurring" value={fmtBool(formData.is_recurring)} />
              {formData.is_recurring && <SummaryRow label="Recurrence" value={fmt(formData.recurrence_pattern)} />}
            </div>
          </div>

          {/* Step 3: Pricing & Capacity */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Pricing & Capacity</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Max Participants" value={fmtNum(formData.max_participants)} />
              <SummaryRow label="Min Participants" value={fmtNum(formData.min_participants)} />
              
              <div className="py-2 border-b border-gray-100">
                <span className="text-gray-500 block mb-2">Pricing Tiers</span>
                <div className="space-y-1.5">
                  {getPriceBreakdown().map((tier, i) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium text-gray-600">{tier.label}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">KSh {fmtNum(tier.price)}</span>
                        {tier.deadline && <span className="block text-[10px] text-gray-400">until {formatDate(tier.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.group_discount_threshold > 0 && (
                <SummaryRow 
                  label="Group Discount" 
                  value={`${formData.group_discount_percent}% off for groups of ${formData.group_discount_threshold}+`} 
                />
              )}
            </div>
          </div>

          {/* Step 4: Guide & Logistics */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-3">Guide & Logistics</h4>
            <div className="space-y-2 text-sm bg-white rounded-xl p-4 border border-gray-100">
              <SummaryRow label="Guide Included" value={fmtBool(formData.guide_included)} />
              {formData.guide_included && (
                <>
                  <SummaryRow label="Guide Name" value={fmt(formData.guide_name)} />
                  <SummaryRow label="Guide Bio" value={fmt(formData.guide_bio)} />
                  <SummaryRow label="Certifications" value={formData.guide_certifications.join(', ') || '—'} />
                </>
              )}
              <SummaryRow label="Bike Included" value={fmtBool(formData.bike_included)} />
              {formData.bike_included && <SummaryRow label="Bike Category" value={fmt(formData.included_bike_category)} />}
              <SummaryRow label="Transport Provided" value={fmtBool(formData.transport_provided)} />
              {formData.transport_provided && <SummaryRow label="Transport Price" value={`KSh ${fmtNum(formData.transport_price)}`} />}
              <SummaryRow label="Equipment Provided" value={formData.equipment_provided.join(', ') || '—'} />
              <SummaryRow label="Required Equipment" value={formData.required_equipment.join(', ') || '—'} />
              <SummaryRow label="Refund Policy" value={fmt(formData.refund_policy)} />
              <SummaryRow label="Cancellation Policy" value={fmt(formData.cancellation_policy)} />
              <SummaryRow label="Weather Policy" value={fmt(formData.weather_policy)} />
            </div>
          </div>

          {/* System Fields (Auto-set) */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">System Fields</h4>
            <div className="space-y-2 text-sm bg-gray-100/50 rounded-xl p-4 border border-gray-200">
              <SummaryRow label="Status" value="open (auto)" />
              <SummaryRow label="Current Bookings" value="0 (auto)" />
              <SummaryRow label="Rating" value="0 (auto)" />
              <SummaryRow label="Reviews" value="0 (auto)" />
              {/* TODO: implement when backend ready: event_code, organizer_id, meeting_lat/lng, route_gpx_url, tags, badge_earned_id */}
              <p className="text-[10px] text-gray-400 italic mt-2">
                Event code, organizer ID, map coordinates, GPX route, tags, and badges will be added when backend integration is complete.
              </p>
            </div>
          </div>
        </div>

        {/* Publish Warning */}
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

      {/* Success Modal */}
      {showSuccessModal && createdEventCode && (
        <EventActionModal
          actionType="event_created"
          code={createdEventCode}
          onClose={handleCloseModal}
          onCreateAnother={handleCreateAnother}
        />
      )}
    </>
  );
};

export default CreateEventPage;