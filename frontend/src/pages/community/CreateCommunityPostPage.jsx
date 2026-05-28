import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, ChevronRight, Check, Camera, Upload, X, Plus,
  MapPin, Clock, TrendingUp, Zap, Flame, Navigation, Bike,
  Calendar, Hash, Smile, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_EVENTS } from '../../data/cyclingMockData';

const MOODS = [
  { key: 'amazing', label: 'Amazing', emoji: '🤩' },
  { key: 'good', label: 'Good', label: 'Good', emoji: '😊' },
  { key: 'tired', label: 'Tired', emoji: '😅' },
  { key: 'challenging', label: 'Challenging', emoji: '💪' },
  { key: 'epic', label: 'Epic', emoji: '🔥' },
];

const VISIBILITY_OPTIONS = [
  { key: 'public', label: 'Public', desc: 'Everyone can see' },
  { key: 'followers', label: 'Followers', desc: 'Only your followers' },
  { key: 'private', label: 'Private', desc: 'Only you' },
];

const STEPS = [
  { id: 1, label: 'Ride Info' },
  { id: 2, label: 'Stats' },
  { id: 3, label: 'Story & Photos' },
  { id: 4, label: 'Review & Share' },
];

const CreateCommunityPostPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [photoCaptions, setPhotoCaptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [gearInput, setGearInput] = useState('');

  const [formData, setFormData] = useState({
    // Step 1
    title: '',
    event_id: '',
    ride_date: '',
    ride_type: 'solo',
    
    // Step 2
    ride_distance_km: '',
    ride_duration_minutes: '',
    elevation_gain_m: '',
    avg_speed_kmh: '',
    max_speed_kmh: '',
    calories_burned: '',
    
    // Step 3
    content: '',
    mood: 'good',
    bike_used: '',
    gear: [],
    photos: [],
    tags: [],
    visibility: 'public',
    allow_comments: true,
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().replace(/^#/, '')] }));
    setTagInput('');
  };

  const removeTag = (index) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const addGear = () => {
    if (!gearInput.trim()) return;
    setFormData(prev => ({ ...prev, gear: [...prev.gear, gearInput.trim()] }));
    setGearInput('');
  };

  const removeGear = (index) => {
    setFormData(prev => ({ ...prev, gear: prev.gear.filter((_, i) => i !== index) }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotoPreview(prev => [...prev, ...newPreviews]);
    setPhotoCaptions(prev => [...prev, ...files.map(() => '')]);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
    setPhotoCaptions(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const updatePhotoCaption = (index, caption) => {
    setPhotoCaptions(prev => prev.map((c, i) => i === index ? caption : c));
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.ride_date) newErrors.ride_date = 'Ride date is required';
    }
    if (step === 2) {
      if (!formData.ride_distance_km) newErrors.ride_distance_km = 'Distance is required';
      if (!formData.ride_duration_minutes) newErrors.ride_duration_minutes = 'Duration is required';
    }
    if (step === 3) {
      if (!formData.content.trim()) newErrors.content = 'Story is required';
      if (photoPreview.length === 0) newErrors.photos = 'At least one photo is required';
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
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Creating post:', {
      ...formData,
      photo_captions: photoCaptions,
      user_name: user?.name || 'Anonymous',
      created_at: new Date().toISOString()
    });
    
    setIsSubmitting(false);
    navigate('/community');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-500 mb-6">You need to be logged in to share your ride story.</p>
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
              <span className={`text-xs font-medium mt-2 ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ride Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Epic Ngong Hills Sunrise Ride!"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Linked Event (optional)</label>
        <select
          value={formData.event_id}
          onChange={(e) => updateField('event_id', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">No event — solo ride</option>
          {MOCK_EVENTS.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ride Date *</label>
          <input
            type="date"
            value={formData.ride_date}
            onChange={(e) => updateField('ride_date', e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.ride_date ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.ride_date && <p className="text-red-500 text-sm mt-1">{errors.ride_date}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ride Type</label>
          <select
            value={formData.ride_type}
            onChange={(e) => updateField('ride_type', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="solo">Solo Ride</option>
            <option value="group">Group Ride</option>
            <option value="race">Race</option>
            <option value="training">Training</option>
            <option value="leisure">Leisure</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km) *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.ride_distance_km}
              onChange={(e) => updateField('ride_distance_km', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.ride_distance_km ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ride_distance_km && <p className="text-red-500 text-sm mt-1">{errors.ride_distance_km}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={formData.ride_duration_minutes}
              onChange={(e) => updateField('ride_duration_minutes', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                errors.ride_duration_minutes ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.ride_duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.ride_duration_minutes}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Elevation Gain (m)</label>
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.elevation_gain_m}
              onChange={(e) => updateField('elevation_gain_m', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Avg Speed (km/h)</label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.avg_speed_kmh}
              onChange={(e) => updateField('avg_speed_kmh', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Speed (km/h)</label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.max_speed_kmh}
              onChange={(e) => updateField('max_speed_kmh', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Calories Burned</label>
          <div className="relative">
            <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={formData.calories_burned}
              onChange={(e) => updateField('calories_burned', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">How did it go? *</label>
        <div className="flex flex-wrap gap-3 mb-4">
          {MOODS.map(mood => (
            <button
              key={mood.key}
              onClick={() => updateField('mood', mood.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                formData.mood === mood.key
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <span className="text-lg">{mood.emoji}</span>
              <span className="text-sm font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Story *</label>
        <textarea
          value={formData.content}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Tell us about your ride experience... What did you see? How did you feel? Any challenges or highlights?"
          rows={6}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
            errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bike Used</label>
        <div className="relative">
          <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={formData.bike_used}
            onChange={(e) => updateField('bike_used', e.target.value)}
            placeholder="e.g., Trek Domane AL 2"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Gear Used</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={gearInput}
            onChange={(e) => setGearInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGear())}
            placeholder="e.g., Garmin Edge, Giro helmet"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button onClick={addGear} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.gear.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {item}
              <button onClick={() => removeGear(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Photos *</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="post-photo-upload"
          />
          <label htmlFor="post-photo-upload" className="cursor-pointer">
            <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Click to upload photos</p>
            <p className="text-xs text-gray-400 mt-1">At least 1 photo required. Max 5MB each.</p>
          </label>
        </div>
        {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}

        {photoPreview.length > 0 && (
          <div className="space-y-3 mt-4">
            {photoPreview.map((preview, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={photoCaptions[i] || ''}
                  onChange={(e) => updatePhotoCaption(i, e.target.value)}
                  placeholder="Photo caption (optional)"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add hashtag and press Enter"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button onClick={addTag} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Hash className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200">
              #{tag}
              <button onClick={() => removeTag(i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Visibility</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VISIBILITY_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => updateField('visibility', opt.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                formData.visibility === opt.key
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className={`font-semibold ${formData.visibility === opt.key ? 'text-orange-700' : 'text-gray-900'}`}>
                {opt.label}
              </p>
              <p className="text-sm text-gray-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <input
          type="checkbox"
          id="allow_comments"
          checked={formData.allow_comments}
          onChange={(e) => updateField('allow_comments', e.target.checked)}
          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
        />
        <label htmlFor="allow_comments" className="font-semibold text-gray-900 cursor-pointer">Allow Comments</label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Smile className="w-5 h-5 text-orange-500" />
          Post Preview
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Title</span>
            <span className="font-semibold text-gray-900">{formData.title || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold text-gray-900">{formData.ride_date || '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Distance</span>
            <span className="font-semibold text-gray-900">{formData.ride_distance_km ? `${formData.ride_distance_km}km` : '—'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Duration</span>
            <span className="font-semibold text-gray-900">
              {formData.ride_duration_minutes ? `${Math.floor(formData.ride_duration_minutes / 60)}h ${formData.ride_duration_minutes % 60}m` : '—'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Mood</span>
            <span className="font-semibold text-gray-900 capitalize">{formData.mood}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Photos</span>
            <span className="font-semibold text-gray-900">{photoPreview.length} photo{photoPreview.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Visibility</span>
            <span className="font-semibold text-gray-900 capitalize">{formData.visibility}</span>
          </div>
        </div>
      </div>

      {photoPreview.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photoPreview.map((preview, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={preview} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Before Sharing</p>
          <p className="text-sm text-yellow-700 mt-1">
            Your post will be visible to the community based on your visibility settings. Make sure you're happy with the photos and story!
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Share Your Ride - Oshocks Community</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/community" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Share Your Ride</h1>
                <p className="text-sm text-gray-500">Tell the community about your cycling adventure</p>
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
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Share Ride
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

export default CreateCommunityPostPage;