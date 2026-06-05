import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Calendar, MapPin, Clock, Users, Bike, ArrowRight,
  Check, CreditCard, Shield, AlertTriangle, Minus, Plus, Info, X
} from 'lucide-react';
import { MOCK_EVENTS, MOCK_BIKES } from '../../data/cyclingMockData';
import BikeSelectionModal from '../../components/bikes/BikeSelectionModal';

// Helper component for summary rows (full width)
const SummaryRow = ({ label, value, highlight = false, discount = false }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className={`font-semibold text-sm text-right max-w-[60%] break-words ${
      discount ? 'text-green-600' : highlight ? 'text-orange-600' : 'text-gray-900'
    }`}>
      {value}
    </span>
  </div>
);

// Helper component for compact summary rows (2-column layout)
const CompactRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-500 text-xs">{label}</span>
    <span className={`font-medium text-xs text-right max-w-[65%] break-words ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
      {value}
    </span>
  </div>
);

const EventBookingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [participants, setParticipants] = useState(1);
  const [bikeOption, setBikeOption] = useState('own'); // 'own', 'rent', 'included'
  const [selectedBike, setSelectedBike] = useState(null);
  const [showBikeModal, setShowBikeModal] = useState(false);
  const [bikeAddOns, setBikeAddOns] = useState({
    helmet: false,
    lights: false,
    lock: false,
    repair_kit: false,
    water_bottle: false,
    gloves: false
  });
  const [addOns, setAddOns] = useState({
    transport: false,
    insurance: false,
    nutrition: false
  });
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState({ name: '', phone: '' });

  const event = MOCK_EVENTS.find(e => e.slug === slug);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <Link to="/events" className="text-orange-600 font-semibold hover:underline">Back to Events</Link>
        </div>
      </div>
    );
  }

  const availableBikes = MOCK_BIKES.filter(b => b.category === (event.included_bike_category_id ? 'road' : b.category));

  // Calculate event duration in days
  const eventStart = new Date(event.start_datetime);
  const eventEnd = new Date(event.end_datetime);
  const eventDurationDays = Math.max(1, Math.ceil((eventEnd - eventStart) / (1000 * 60 * 60 * 24)));

  const basePrice = event.price_per_person * participants;
  
  // Bike rental pricing (from modal selection)
  const bikeRentalPrice = bikeOption === 'rent' && selectedBike ? 
    (selectedBike.daily_rate * eventDurationDays * participants) : 0;
  const bikeAddOnsPrice = bikeOption === 'rent' && selectedBike ? 
    Object.entries(bikeAddOns).reduce((sum, [key, checked]) => {
      if (!checked) return sum;
      const prices = { helmet: 200, lights: 150, lock: 100, repair_kit: 100, water_bottle: 50, gloves: 150 };
      return sum + (prices[key] || 0) * participants;
    }, 0) : 0;
  const bikeInsurancePrice = bikeOption === 'rent' && selectedBike && selectedBike.insurance_included !== true ? 
    (200 * eventDurationDays * participants) : 0;
  
  const transportPrice = addOns.transport && event.transport_provided ? event.transport_price * participants : 0;
  const eventInsurancePrice = addOns.insurance ? 200 * participants : 0;
  const nutritionPrice = addOns.nutrition ? 300 * participants : 0;
  const groupDiscount = participants >= event.group_discount_threshold 
    ? Math.round(basePrice * (event.group_discount_percent / 100)) 
    : 0;
  const total = basePrice + bikeRentalPrice + bikeAddOnsPrice + bikeInsurancePrice + transportPrice + eventInsurancePrice + nutritionPrice - groupDiscount;

  const eventDate = new Date(event.start_datetime);
  const formattedDate = eventDate.toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const steps = [
    { number: 1, label: 'Participants' },
    { number: 2, label: 'Bike & Add-ons' },
    { number: 3, label: 'Details' },
    { number: 4, label: 'Payment' }
  ];

  return (
    <>
      <Helmet>
        <title>Book {event.title} - Oshocks</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(`/events/${slug}`)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Event
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Book Your Spot</h1>
            <p className="text-gray-500">{event.title}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, idx) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.number
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${
                    step >= s.number ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                      step > s.number ? 'bg-orange-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Participants */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">How many riders?</h2>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    disabled={participants <= 1}
                    className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={participants}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 1 : parseInt(e.target.value, 10);
                      setParticipants(isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    className="w-16 h-10 text-center font-bold text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg tabular-nums"
                  />
                  <button
                    onClick={() => setParticipants(participants + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all active:scale-95"
                  >
                    +
                  </button>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Group Discount</p>
                      <p className="text-sm text-blue-700">
                        {participants >= event.group_discount_threshold
                          ? `You qualify for ${event.group_discount_percent}% group discount!`
                          : `Book ${event.group_discount_threshold}+ riders for ${event.group_discount_percent}% off`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Bike & Add-ons */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Bike & Extras</h2>

                {/* Bike Options */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Choose Your Bike</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => { setBikeOption('own'); setSelectedBike(null); }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        bikeOption === 'own'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        bikeOption === 'own' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Bike className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">I have my own bike</p>
                        <p className="text-sm text-gray-500">Bring your own bicycle to the event</p>
                      </div>
                      {bikeOption === 'own' && <Check className="w-5 h-5 text-orange-500 ml-auto" />}
                    </button>

                    {event.bike_included && (
                      <button
                        onClick={() => { setBikeOption('included'); setSelectedBike(null); }}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          bikeOption === 'included'
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          bikeOption === 'included' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Bike Included</p>
                          <p className="text-sm text-gray-500">Event includes bike rental in the price</p>
                        </div>
                        {bikeOption === 'included' && <Check className="w-5 h-5 text-orange-500 ml-auto" />}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setBikeOption('rent');
                        setShowBikeModal(true);
                      }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        bikeOption === 'rent'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        bikeOption === 'rent' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Bike className="w-6 h-6" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900">Rent a Bike</p>
                        <p className="text-sm text-gray-500">Choose from our rental fleet</p>
                      </div>
                      {bikeOption === 'rent' && selectedBike ? (
                        <div className="text-right">
                          <Check className="w-5 h-5 text-orange-500 ml-auto mb-1" />
                          <p className="text-xs text-orange-600 font-semibold">{selectedBike.name}</p>
                        </div>
                      ) : bikeOption === 'rent' ? (
                        <Check className="w-5 h-5 text-orange-500 ml-auto" />
                      ) : null}
                    </button>
                  </div>

                  {/* Selected Bike Summary */}
                  {bikeOption === 'rent' && selectedBike && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={selectedBike.images[0]} alt={selectedBike.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{selectedBike.name}</p>
                          <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                          <p className="text-sm font-bold text-orange-600">
                            KSh {(selectedBike.daily_rate * eventDurationDays * participants).toLocaleString()} 
                            <span className="text-xs text-gray-500 font-normal"> for {eventDurationDays} day{eventDurationDays > 1 ? 's' : ''}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setShowBikeModal(true)}
                          className="px-3 py-1.5 bg-white border border-orange-300 rounded-lg text-sm font-semibold text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                      
                      {/* Show selected add-ons */}
                      {Object.entries(bikeAddOns).some(([_, v]) => v) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Object.entries(bikeAddOns).filter(([_, v]) => v).map(([key]) => (
                            <span key={key} className="px-2 py-1 bg-white text-orange-700 text-xs rounded-full border border-orange-200">
                              {key.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={() => setShowBikeModal(true)}
                        className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Bike className="w-4 h-4" />
                        Browse more bikes or change add-ons
                      </button>
                    </div>
                  )}

                  {/* Prompt to select bike if rent chosen but none selected */}
                  {bikeOption === 'rent' && !selectedBike && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                      <Bike className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-700 mb-2">No bike selected yet</p>
                      <button
                        onClick={() => setShowBikeModal(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Browse Available Bikes
                      </button>
                    </div>
                  )}
                </div>

                {/* Add-ons */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Add-ons</h3>
                  <div className="space-y-3">
                    {event.transport_provided && (
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        addOns.transport ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={addOns.transport}
                          onChange={(e) => setAddOns({ ...addOns, transport: e.target.checked })}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Transport to Start Point</p>
                          <p className="text-sm text-gray-500">Pickup from your location</p>
                        </div>
                        <span className="font-bold text-gray-900">+KSh {event.transport_price.toLocaleString()}</span>
                      </label>
                    )}

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      addOns.insurance ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={addOns.insurance}
                        onChange={(e) => setAddOns({ ...addOns, insurance: e.target.checked })}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Ride Insurance</p>
                        <p className="text-sm text-gray-500">Coverage for accidents and bike damage</p>
                      </div>
                      <span className="font-bold text-gray-900">+KSh 200</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      addOns.nutrition ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={addOns.nutrition}
                        onChange={(e) => setAddOns({ ...addOns, nutrition: e.target.checked })}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Nutrition Pack</p>
                        <p className="text-sm text-gray-500">Energy bars, gels, and hydration</p>
                      </div>
                      <span className="font-bold text-gray-900">+KSh 300</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Rider Details</h2>

                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                </div>

                {/* Waiver */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-8">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-2">Waiver & Release</p>
                      <p className="text-sm text-yellow-700 mb-4">
                        I understand that cycling involves risks including injury or death. I assume all risks and release Oshocks, guides, and partners from liability. I confirm I am in good health and fit to participate.
                      </p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={waiverAgreed}
                          onChange={(e) => setWaiverAgreed(e.target.checked)}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-semibold text-yellow-900">I agree to the waiver and terms</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!waiverAgreed || !emergencyContact.name || !emergencyContact.phone}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Payment & Full Summary */}
            {step === 4 && (
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Column: Payment + Compact Summary */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  
                  {/* Compact Summary Card - Desktop Optimized */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-orange-500" />
                      Booking Summary
                    </h2>

                    {/* Two-column grid for summary sections on desktop */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Event Details */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Event</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow label="Event" value={event.title} />
                          <CompactRow label="Date" value={formattedDate} />
                          <CompactRow label="Duration" value={`${eventDurationDays} day${eventDurationDays > 1 ? 's' : ''}`} />
                          <CompactRow label="Distance" value={`${event.distance_km} km`} />
                          <CompactRow label="Difficulty" value={event.difficulty} />
                        </div>
                      </div>

                      {/* Participants & Rider Details */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Riders</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow label="Riders" value={participants} />
                          <CompactRow label="Emergency Contact" value={emergencyContact.name || '—'} />
                          <CompactRow label="Emergency Phone" value={emergencyContact.phone || '—'} />
                          <CompactRow label="Waiver" value={waiverAgreed ? '✓ Signed' : '✗ Not signed'} highlight={waiverAgreed} />
                          {participants >= event.group_discount_threshold && (
                            <CompactRow label="Discount" value={`${event.group_discount_percent}% off`} highlight />
                          )}
                        </div>
                      </div>

                      {/* Bike & Equipment */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Bike & Equipment</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow 
                            label="Bike" 
                            value={
                              bikeOption === 'own' ? 'Own bike' :
                              bikeOption === 'included' ? 'Included' :
                              bikeOption === 'rent' && selectedBike ? `${selectedBike.name}` : 'Not selected'
                            } 
                          />
                          {bikeOption === 'rent' && selectedBike && (
                            <CompactRow label="Rate" value={`KSh ${selectedBike.daily_rate.toLocaleString()}/day`} />
                          )}
                          {bikeOption === 'rent' && Object.entries(bikeAddOns).some(([_, v]) => v) && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 font-medium">Add-ons:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(bikeAddOns).filter(([_, v]) => v).map(([key]) => (
                                  <span key={key} className="px-2 py-0.5 bg-white text-orange-700 text-xs rounded-full border border-orange-200 capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Event Add-ons */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Add-ons</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow 
                            label="Transport" 
                            value={addOns.transport ? `✓ (+KSh ${transportPrice.toLocaleString()})` : '—'} 
                            highlight={addOns.transport}
                          />
                          <CompactRow 
                            label="Insurance" 
                            value={addOns.insurance ? `✓ (+KSh ${eventInsurancePrice.toLocaleString()})` : '—'} 
                            highlight={addOns.insurance}
                          />
                          <CompactRow 
                            label="Nutrition" 
                            value={addOns.nutrition ? `✓ (+KSh ${nutritionPrice.toLocaleString()})` : '—'} 
                            highlight={addOns.nutrition}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown - Compact Horizontal */}
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Price Breakdown</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white rounded-lg p-2 border border-gray-100">
                          <span className="text-xs text-gray-500 block">Base</span>
                          <span className="font-bold text-gray-900">KSh {basePrice.toLocaleString()}</span>
                        </div>
                        {bikeRentalPrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Bike</span>
                            <span className="font-bold text-gray-900">KSh {bikeRentalPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {bikeAddOnsPrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Equip</span>
                            <span className="font-bold text-gray-900">KSh {bikeAddOnsPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {transportPrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Transport</span>
                            <span className="font-bold text-gray-900">KSh {transportPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {eventInsurancePrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Insurance</span>
                            <span className="font-bold text-gray-900">KSh {eventInsurancePrice.toLocaleString()}</span>
                          </div>
                        )}
                        {nutritionPrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Nutrition</span>
                            <span className="font-bold text-gray-900">KSh {nutritionPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {participants >= event.group_discount_threshold && (
                          <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                            <span className="text-xs text-green-600 block">Discount</span>
                            <span className="font-bold text-green-700">-KSh {Math.round(basePrice * (event.group_discount_percent / 100)).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="bg-orange-50 rounded-lg p-2 border border-orange-200 col-span-2 sm:col-span-1">
                          <span className="text-xs text-orange-600 block">Total</span>
                          <span className="font-bold text-orange-600 text-lg">KSh {total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>

                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        <p className="text-xs text-blue-700">
                          Demo page. Production integrates with Paystack/M-Pesa.
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      <button className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-sm">M-Pesa</p>
                          <p className="text-xs text-gray-500">STK Push</p>
                        </div>
                        <Check className="w-4 h-4 text-orange-500 ml-auto" />
                      </button>

                      <button className="p-4 rounded-xl border-2 border-gray-200 flex items-center gap-3 opacity-50">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-sm">Card</p>
                          <p className="text-xs text-gray-500">Paystack</p>
                        </div>
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(3)}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => alert('Demo: Booking confirmed! In production, this processes payment via Paystack/M-Pesa.')}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Shield className="w-5 h-5" />
                        Pay KSh {total.toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Compact Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4">
                  <div className="lg:sticky lg:top-24 space-y-4">
                    {/* Quick Overview Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Order Overview</h3>
                      
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                        <img 
                          src={event.photos?.[0]?.url || event.photos?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder-event.jpg'} 
                          alt={event.title}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-gray-500">{formattedDate}</p>
                          <p className="text-xs text-gray-500">{participants} rider{participants > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Base</span>
                          <span className="font-medium">KSh {basePrice.toLocaleString()}</span>
                        </div>
                        {bikeRentalPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Bike</span>
                            <span className="font-medium">KSh {bikeRentalPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {bikeAddOnsPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Equip</span>
                            <span className="font-medium">KSh {bikeAddOnsPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {transportPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Transport</span>
                            <span className="font-medium">KSh {transportPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {eventInsurancePrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Insurance</span>
                            <span className="font-medium">KSh {eventInsurancePrice.toLocaleString()}</span>
                          </div>
                        )}
                        {nutritionPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Nutrition</span>
                            <span className="font-medium">KSh {nutritionPrice.toLocaleString()}</span>
                          </div>
                        )}
                        {participants >= event.group_discount_threshold && (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium text-xs">Discount</span>
                            <span className="font-medium text-xs">-KSh {Math.round(basePrice * (event.group_discount_percent / 100)).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t-2 border-orange-100">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-orange-600">KSh {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Bike Details Mini Card */}
                    {bikeOption === 'rent' && selectedBike && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Bike Details</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={selectedBike.images?.[0]} 
                            alt={selectedBike.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{selectedBike.name}</h4>
                            <p className="text-xs text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                          </div>
                        </div>
                        {Object.entries(bikeAddOns).some(([_, v]) => v) && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(bikeAddOns).filter(([_, v]) => v).map(([key]) => (
                              <span key={key} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200 capitalize">
                                {key.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rider Details Mini Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Rider Info</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Emergency</span>
                          <span className="font-medium text-gray-900">{emergencyContact.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Phone</span>
                          <span className="font-medium text-gray-900">{emergencyContact.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Waiver</span>
                          <span className={`font-medium ${waiverAgreed ? 'text-green-600' : 'text-red-500'}`}>
                            {waiverAgreed ? '✓ Signed' : '✗ Not signed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {waiverAgreed && emergencyContact.name && emergencyContact.phone && (
                      <div className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center">
                        <p className="text-sm text-green-700 font-semibold">✓ Ready to complete booking</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Bike Selection Modal */}
        <BikeSelectionModal
          isOpen={showBikeModal}
          onClose={() => setShowBikeModal(false)}
          onSelect={(selection) => {
            setSelectedBike(selection.bike);
            setBikeAddOns(selection.addOns);
            // Merge bike insurance into event addOns
            if (selection.insurance) {
              setAddOns(prev => ({ ...prev, insurance: true }));
            }
          }}
          event={event}
          participants={participants}
        />
      </div>
    </>
  );
};

export default EventBookingPage;