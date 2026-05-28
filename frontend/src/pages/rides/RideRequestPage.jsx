import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MapPin, Calendar, Users, Bike, ArrowRight, ChevronLeft, Clock,
  Mountain, Route, Trees, Blend, Check, Info, Send
} from 'lucide-react';
import { DIFFICULTY_CONFIG, TERRAIN_CONFIG } from '../../data/cyclingMockData';
import BikeSelectionModal from '../../components/bikes/BikeSelectionModal';

const RideRequestPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    preferred_date: '',
    flexibility_days: 0,
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

  const handleSubmit = () => {
    setSubmitted(true);
    // In production: POST to /api/ride-requests
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-2">
            We've received your ride request. Our team will review and send you a quote within 24 hours.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Request ID: <span className="font-mono font-semibold">RDR-2026-{String(Math.floor(Math.random() * 99999)).padStart(5, '0')}</span>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/events')}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Browse Events
            </button>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setFormData({ title: '', description: '', preferred_date: '', flexibility_days: 0, group_size: 1, difficulty: 'beginner', terrain: 'road', distance_km: 20, duration_hours: 2, bike_rental_needed: false, pickup_needed: false, pickup_address: '', budget_estimate: '', contact_phone: '' }); setSelectedBikeData(null); setShowBikeModal(false); }}
              className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ride Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="e.g., Weekend Family Ride in Karura"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Tell us more about what you're looking for..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={formData.preferred_date}
                        onChange={(e) => updateField('preferred_date', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date Flexibility (days)</label>
                      <input
                        type="number"
                        min="0"
                        max="14"
                        value={formData.flexibility_days}
                        onChange={(e) => updateField('flexibility_days', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
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
                          updateField('group_size', isNaN(val) ? 1 : Math.max(1, val));
                        }}
                        className="w-14 h-8 text-center font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => updateField('group_size', formData.group_size + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.preferred_date}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Distance (km)</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.distance_km}
                      onChange={(e) => updateField('distance_km', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Duration (hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.duration_hours}
                      onChange={(e) => updateField('duration_hours', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
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
                    onClick={() => setStep(3)}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address</label>
                      <input
                        type="text"
                        value={formData.pickup_address}
                        onChange={(e) => updateField('pickup_address', e.target.value)}
                        placeholder="Your address or preferred pickup location"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Estimate (KSh)</label>
                    <input
                      type="number"
                      value={formData.budget_estimate}
                      onChange={(e) => updateField('budget_estimate', e.target.value)}
                      placeholder="Optional - helps us tailor the quote"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => updateField('contact_phone', e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
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

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Title</p>
                    <p className="font-semibold text-gray-900">{formData.title}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{formData.preferred_date}</p>
                      <p className="text-sm text-gray-500">±{formData.flexibility_days} days flexible</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Group Size</p>
                      <p className="font-semibold text-gray-900">{formData.group_size} riders</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Difficulty</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.difficulty}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Terrain</p>
                      <p className="font-semibold text-gray-900 capitalize">{formData.terrain.replace(/_/g, ' ')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Distance</p>
                      <p className="font-semibold text-gray-900">{formData.distance_km}km</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                      <p className="font-semibold text-gray-900">{formData.duration_hours} hours</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Options</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.bike_rental_needed && selectedBikeData && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                          Bike: {selectedBikeData.bike.name}
                        </span>
                      )}
                      {formData.bike_rental_needed && !selectedBikeData && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">Bike Rental (pending selection)</span>
                      )}
                      {formData.pickup_needed && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">Transport</span>
                      )}
                      {formData.budget_estimate && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">Budget: KSh {formData.budget_estimate}</span>
                      )}
                    </div>
                  </div>
                </div>

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
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
