import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Calendar, MapPin, Clock, Users, Bike, ArrowRight,
  Check, CreditCard, Shield, AlertTriangle, Minus, Plus, Info, X,
  Phone, Wallet, Loader, Package, Wrench
} from 'lucide-react';
import { MOCK_EVENTS } from '../../data/cyclingMockData';
import BikeSelectionModal from '../../components/bikes/BikeSelectionModal';
import EventResourceSelector from '../../components/resources/EventResourceSelector';
import SelectedResourceChips from '../../components/resources/SelectedResourceChips';
import { useEventBooking } from '../../hooks/useEventBooking';
import eventService from '../../services/eventService';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

// ─── Helper Components ───
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
  const { user } = useAuth();

  // Step management
  const [step, setStep] = useState(1);

  // Event data
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use custom booking hook
  const booking = useEventBooking(event);

  // Payment state is managed by useEventBooking hook
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [showAddNewCard, setShowAddNewCard] = useState(false);
  const [loadingSavedCards, setLoadingSavedCards] = useState(false);
  
  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventService.getEvent(slug);
        setEvent(response.data?.data);
      } catch (error) {
        console.error('Failed to fetch event:', error);
        const mockEvent = MOCK_EVENTS.find(e => e.slug === slug);
        setEvent(mockEvent);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  // Load saved cards
  const loadSavedCards = async () => {
    setLoadingSavedCards(true);
    try {
      const response = await paymentService.getSavedCards();
      if (response.success && response.data.length > 0) {
        setSavedCards(response.data);
        setSelectedSavedCard(response.data[0]);
        setShowAddNewCard(false);
      } else {
        setSavedCards([]);
        setShowAddNewCard(true);
      }
    } catch (error) {
      console.error('Failed to load saved cards:', error);
      setSavedCards([]);
      setShowAddNewCard(true);
    } finally {
      setLoadingSavedCards(false);
    }
  };

  useEffect(() => {
    if (step === 4 && user) {
      loadSavedCards();
      if (user?.phone && !mpesaPhone) {
        setMpesaPhone(user.phone);
      }
    }
  }, [step, user]);

  // ─── All hooks and derived values BEFORE any conditional return ───

  const eventDate = event ? new Date(event.start_datetime) : null;
  const formattedDate = eventDate ? eventDate.toLocaleDateString('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  const steps = [
    { number: 1, label: 'Participants' },
    { number: 2, label: 'Bike & Equipment' },
    { number: 3, label: 'Details' },
    { number: 4, label: 'Payment' }
  ];

  // ─── Calculate all prices from booking hook ───
  const {
    participants, setParticipants,
    bikeOption, setBikeOption,
    selectedBike, setSelectedBike,
    showBikeModal, setShowBikeModal,
    bikeRentalPrice, bikeSecurityDeposit,
    selectedResources, setSelectedResources,
    showResourceSelector, setShowResourceSelector,
    resourcesTotalPrice,
    addResource, removeResource, updateResourceQuantity,
    eventAddOns, toggleEventAddOn,
    transportPrice, eventInsurancePrice, nutritionPrice,
    emergencyContact, setEmergencyContact,
    waiverAgreed, setWaiverAgreed,
    paymentMethod, setPaymentMethod,
    mpesaPhone, setMpesaPhone,
    actionLoading, setActionLoading,
    basePrice, groupDiscount, total,
    eventDurationDays,
    resetBikeSelection,
  } = booking;

  // ─── Handle Bike Selection ───
  const handleBikeSelect = useCallback((selection) => {
    booking.setSelectedBike(selection.bike);
    // Merge resource add-ons from bike modal into our selected resources
    if (selection.resourceAddOns?.length > 0) {
      selection.resourceAddOns.forEach(item => {
        booking.addResource(item.resourceItem, item.quantity);
      });
    }
    booking.setShowBikeModal(false);
  }, [booking]);

  // ─── Handle Resource Selection ───
  const handleResourceConfirm = useCallback(({ resources }) => {
    // Clear existing resources first, then add all from modal
    booking.setSelectedResources([]);
    // Use setTimeout to ensure clear happens before add
    setTimeout(() => {
      if (resources && resources.length > 0) {
        resources.forEach(item => {
          booking.addResource(item.resourceItem, item.quantity);
        });
      }
    }, 0);
    booking.setShowResourceSelector(false);
  }, [booking]);

  // ─── Payment Handler ───
  const handlePayment = useCallback(async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);

      // Build registration payload
      const payload = {
        participant_count: participants,
        add_ons: {
          transport: eventAddOns.transport,
          insurance: eventAddOns.insurance,
          nutrition: eventAddOns.nutrition,
        },
        bike_included: bikeOption === 'included',
        bike_rental_id: bikeOption === 'rent' ? selectedBike?.id : null,
        bike_add_ons: bikeOption === 'rent' ? selectedResources.map(r => ({
          resource_item_id: r.resourceItem.id,
          quantity: r.quantity,
        })) : null,
        resource_bookings: selectedResources.map(r => ({
          resource_item_id: r.resourceItem.id,
          quantity: r.quantity,
          start_datetime: event.start_datetime,
          end_datetime: event.end_datetime,
        })),
        emergency_contact_name: emergencyContact.name,
        emergency_contact_phone: emergencyContact.phone,
        waiver_signed: waiverAgreed,
      };

      const regResponse = await eventService.registerForEvent(slug, payload);
      const regData = regResponse.data || {};
      if (!regData.success) {
        throw new Error(regData.message || 'Registration failed');
      }

      const regCode = regData.data?.registration_code;
      const amountDue = regData.data?.amount_due;

      if (!regData.data?.payment_required || amountDue <= 0) {
        navigate('/my-event-bookings', {
          state: { success: true, message: 'Registration confirmed!' }
        });
        return;
      }

      // Process payment
      if (paymentMethod === 'mpesa') {
        const mpesaResponse = await eventService.initiateEventMpesa({
          registration_code: regCode,
          phone_number: mpesaPhone || user?.phone || ''
        });

        if (mpesaResponse.data?.success) {
          const paymentId = mpesaResponse.data?.data?.payment_id;
          paymentService.pollPaymentStatus(
            paymentId,
            (status) => {
              if (status === 'completed') {
                navigate('/my-event-bookings', {
                  state: { success: true, message: 'Payment successful! Registration confirmed.' }
                });
              } else if (status === 'failed') {
                alert('Payment failed. Please try again.');
                setActionLoading(false);
              }
            }
          );
        }
      } else if (paymentMethod === 'card') {
        const cardInit = await eventService.initiateEventCard({
          registration_code: regCode,
          email: user?.email
        });
        if (cardInit.data?.success && cardInit.data?.data?.authorization_url) {
          window.location.href = cardInit.data.data.authorization_url;
        }
      } else if (paymentMethod === 'cod') {
        const codResponse = await eventService.eventCod({
          registration_code: regCode
        });
        if (codResponse.data?.success) {
          navigate('/my-event-bookings', {
            state: { success: true, message: 'Spot reserved! Pay at the event.' }
          });
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setActionLoading(false);
    }
  }, [actionLoading, participants, eventAddOns, bikeOption, selectedBike, selectedResources, event, slug, mpesaPhone, user, navigate, paymentMethod, setActionLoading]);

  // ─── Conditional returns AFTER all hooks ───
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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

            {/* ═══════════════════════════════════════════════════════
                STEP 1: PARTICIPANTS
                ═══════════════════════════════════════════════════════ */}
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

            {/* ═══════════════════════════════════════════════════════
                STEP 2: BIKE & EQUIPMENT (REWRITTEN)
                ═══════════════════════════════════════════════════════ */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Bike & Equipment</h2>

                {/* ─── Bike Options ─── */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Choose Your Bike</h3>
                  <div className="space-y-3">
                    {/* Own Bike */}
                    <button
                      onClick={() => { setBikeOption('own'); setSelectedBike(null); setSelectedResources([]); }}
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

                    {/* Bike Included */}
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

                    {/* Rent a Bike */}
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
                        <p className="text-sm text-gray-500">Choose from our rental fleet with real availability</p>
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
                      <div className="flex items-center gap-3">
                        <img src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url} alt={selectedBike.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{selectedBike.name}</p>
                          <p className="text-sm text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                          <p className="text-sm font-bold text-orange-600">
                            KSh {bikeRentalPrice.toLocaleString()}
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

                      <button
                        onClick={() => setShowBikeModal(true)}
                        className="mt-3 text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Bike className="w-4 h-4" />
                        Browse more bikes or change equipment
                      </button>
                    </div>
                  )}

                  {/* Prompt to select bike */}
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

                {/* ─── Resources & Equipment Section ─── */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Resources & Equipment
                    </h3>
                    <button
                      onClick={() => setShowResourceSelector(true)}
                      className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {selectedResources.length > 0 ? 'Manage' : 'Add'} Equipment
                    </button>
                  </div>

                  {/* Selected Resources Chips */}
                  {selectedResources.length > 0 ? (
                    <div className="mb-4">
                      <SelectedResourceChips
                        selectedResources={selectedResources}
                        onRemove={removeResource}
                        onQuantityChange={updateResourceQuantity}
                        eventDurationDays={eventDurationDays}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                      <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">No additional equipment selected</p>
                      <button
                        onClick={() => setShowResourceSelector(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Browse Equipment & Services
                      </button>
                    </div>
                  )}

                  {/* Resources Total */}
                  {selectedResources.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Equipment & Services Total</span>
                        <span className="font-bold text-orange-600">KSh {resourcesTotalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── Event Add-ons (Transport, Insurance, Nutrition) ─── */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Event Add-ons</h3>
                  <div className="space-y-3">
                    {event.transport_provided && (
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        eventAddOns.transport ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={eventAddOns.transport}
                          onChange={() => toggleEventAddOn('transport')}
                          className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Transport to Start Point</p>
                          <p className="text-sm text-gray-500">Pickup from your location</p>
                        </div>
                        <span className="font-bold text-gray-900">+KSh {(event.transport_price || 0).toLocaleString()}</span>
                      </label>
                    )}

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      eventAddOns.insurance ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={eventAddOns.insurance}
                        onChange={() => toggleEventAddOn('insurance')}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Ride Insurance</p>
                        <p className="text-sm text-gray-500">Coverage for accidents and bike damage</p>
                      </div>
                      <span className="font-bold text-gray-900">+KSh 200</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      eventAddOns.nutrition ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="checkbox"
                        checked={eventAddOns.nutrition}
                        onChange={() => toggleEventAddOn('nutrition')}
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

                {/* ─── Running Total ─── */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Total</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event Base</span>
                      <span>KSh {basePrice.toLocaleString()}</span>
                    </div>
                    {bikeRentalPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bike Rental</span>
                        <span>KSh {bikeRentalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {resourcesTotalPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Equipment & Services</span>
                        <span>KSh {resourcesTotalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {transportPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Transport</span>
                        <span>KSh {transportPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {eventInsurancePrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Insurance</span>
                        <span>KSh {eventInsurancePrice.toLocaleString()}</span>
                      </div>
                    )}
                    {nutritionPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nutrition</span>
                        <span>KSh {nutritionPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {groupDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Group Discount</span>
                        <span>-KSh {groupDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900">Total</span>
                        <span className="text-orange-600">KSh {total.toLocaleString()}</span>
                      </div>
                    </div>
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
                    disabled={bikeOption === 'rent' && !selectedBike}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                STEP 3: DETAILS
                ═══════════════════════════════════════════════════════ */}
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

            {/* ═══════════════════════════════════════════════════════
                STEP 4: PAYMENT & FULL SUMMARY
                ═══════════════════════════════════════════════════════ */}
            {step === 4 && (
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  
                  {/* Full Summary Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-orange-500" />
                      Booking Summary
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Event Details */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Event</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow label="Event" value={event.title} />
                          <CompactRow label="Date" value={formattedDate} />
                          <CompactRow label="Duration" value={`${eventDurationDays} day${eventDurationDays > 1 ? 's' : ''}`} />
                          <CompactRow label="Meeting Point" value={event.meeting_point} />
                          <CompactRow label="Distance" value={`${event.distance_km} km`} />
                          <CompactRow label="Difficulty" value={event.difficulty} />
                        </div>
                      </div>

                      {/* Riders */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">Riders</h3>
                        <div className="space-y-1 text-sm">
                          <CompactRow label="Number of Riders" value={participants} />
                          <CompactRow label="Emergency Contact" value={emergencyContact.name || '—'} />
                          <CompactRow label="Emergency Phone" value={emergencyContact.phone || '—'} />
                          <CompactRow label="Waiver Signed" value={waiverAgreed ? 'Yes ✓' : 'No ✗'} highlight={waiverAgreed} />
                          {participants >= event.group_discount_threshold && (
                            <CompactRow label="Group Discount" value={`${event.group_discount_percent}% off applied!`} highlight />
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
                              bikeOption === 'own' ? 'I have my own bike' :
                              bikeOption === 'included' ? 'Bike included in event' :
                              bikeOption === 'rent' && selectedBike ? `Rent: ${selectedBike.name}` :
                              'No bike selected'
                            }
                          />
                          {bikeOption === 'rent' && selectedBike && (
                            <>
                              <CompactRow label="Rental Duration" value={`${eventDurationDays} day${eventDurationDays > 1 ? 's' : ''} × ${participants} rider${participants > 1 ? 's' : ''}`} />
                              <CompactRow label="Daily Rate" value={`KSh ${(selectedBike.daily_rate || 0).toLocaleString()}`} />
                            </>
                          )}
                          {selectedResources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-xs text-gray-500 font-medium block mb-1">Selected Equipment:</span>
                              <div className="space-y-1">
                                {selectedResources.map(({ resourceItem, quantity }) => (
                                  <div key={resourceItem.id} className="flex justify-between items-center px-2 py-1 bg-white rounded border border-gray-100">
                                    <span className="text-xs text-gray-600">{resourceItem.name}</span>
                                    <span className="text-xs font-bold text-gray-900">×{quantity}</span>
                                  </div>
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
                          <CompactRow label="Transport" value={eventAddOns.transport ? `✓ (+KSh ${transportPrice.toLocaleString()})` : '—'} highlight={eventAddOns.transport} />
                          <CompactRow label="Insurance" value={eventAddOns.insurance ? `✓ (+KSh ${eventInsurancePrice.toLocaleString()})` : '—'} highlight={eventAddOns.insurance} />
                          <CompactRow label="Nutrition" value={eventAddOns.nutrition ? `✓ (+KSh ${nutritionPrice.toLocaleString()})` : '—'} highlight={eventAddOns.nutrition} />
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
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
                        {resourcesTotalPrice > 0 && (
                          <div className="bg-white rounded-lg p-2 border border-gray-100">
                            <span className="text-xs text-gray-500 block">Equipment</span>
                            <span className="font-bold text-gray-900">KSh {resourcesTotalPrice.toLocaleString()}</span>
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
                        {groupDiscount > 0 && (
                          <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                            <span className="text-xs text-green-600 block">Discount</span>
                            <span className="font-bold text-green-700">-KSh {groupDiscount.toLocaleString()}</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'mpesa' ? 'border-orange-600 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="M-Pesa" className="h-12 w-auto mx-auto mb-2 object-contain" />
                          <div className="text-sm text-gray-600">M-Pesa STK</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'card' ? 'border-orange-600 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <img src="/assets/images/visa-logo.svg" alt="Visa" className="h-8 w-auto object-contain" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 w-auto object-contain" />
                          </div>
                          <div className="text-sm text-gray-600">Card</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'cod' ? 'border-orange-600 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-sm text-gray-600">Pay at Event</div>
                        </div>
                      </button>
                    </div>

                    {paymentMethod === 'mpesa' && (
                      <div className="mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h3 className="font-semibold text-green-900 mb-2">How M-Pesa Payment Works:</h3>
                          <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                            <li>Enter your M-Pesa phone number below</li>
                            <li>You'll receive an STK push notification on your phone</li>
                            <li>Enter your M-Pesa PIN to complete payment</li>
                            <li>You'll receive a confirmation SMS immediately</li>
                          </ol>
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">M-Pesa Phone Number *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent border-gray-300"
                            placeholder="0712345678"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="mb-6">
                        {loadingSavedCards ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader className="w-6 h-6 animate-spin text-orange-600 mr-2" />
                            <span className="text-sm text-gray-600">Checking for saved cards...</span>
                          </div>
                        ) : savedCards.length > 0 && !showAddNewCard ? (
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Your Saved Cards</h3>
                            <div className="space-y-2 mb-4">
                              {savedCards.map((card, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setSelectedSavedCard(card)}
                                  className={`w-full p-4 border-2 rounded-lg flex items-center justify-between transition ${
                                    selectedSavedCard?.authorization_code === card.authorization_code
                                      ? 'border-orange-500 bg-orange-50'
                                      : 'border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <CreditCard className="w-6 h-6 text-gray-600" />
                                    <div className="text-left">
                                      <p className="font-medium">•••• •••• •••• {card.card_last4}</p>
                                      <p className="text-xs text-gray-500">Expires {card.card_expiry_month}/{card.card_expiry_year}</p>
                                    </div>
                                  </div>
                                  {selectedSavedCard?.authorization_code === card.authorization_code && <Check className="w-5 h-5 text-orange-600" />}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => { setShowAddNewCard(true); setSelectedSavedCard(null); }}
                                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-600 hover:border-orange-300"
                              >
                                Use a different card
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-1">Secure Card Payment</h3>
                            <p className="text-sm text-blue-700">
                              You'll be redirected to our secure payment partner (Paystack) to complete your card payment.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-900 mb-2">Pay at Event</h3>
                          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>Your spot is reserved</li>
                            <li>Pay with cash or M-Pesa at the event check-in</li>
                            <li>Please arrive 15 minutes early to complete payment</li>
                            <li>Have exact change ready</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(3)}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={actionLoading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            {paymentMethod === 'cod' ? 'Reserve Spot' : `Pay KSh ${total.toLocaleString()}`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4">
                  <div className="lg:sticky lg:top-24 space-y-4">
                    
                    {/* Quick Overview */}
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
                        {resourcesTotalPrice > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Equipment</span>
                            <span className="font-medium">KSh {resourcesTotalPrice.toLocaleString()}</span>
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
                        {groupDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="font-medium text-xs">Discount</span>
                            <span className="font-medium text-xs">-KSh {groupDiscount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t-2 border-orange-100">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-orange-600">KSh {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Selected Resources Mini Card */}
                    {selectedResources.length > 0 && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Equipment</h3>
                        <div className="space-y-2">
                          {selectedResources.map(({ resourceItem, quantity }) => (
                            <div key={resourceItem.id} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 truncate">{resourceItem.name}</span>
                              <span className="font-medium">×{quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bike Details */}
                    {bikeOption === 'rent' && selectedBike && (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Bike</h3>
                        <div className="flex items-center gap-3">
                          <img src={selectedBike.images?.[0] || selectedBike.photos?.[0]?.url} alt={selectedBike.name} className="w-14 h-14 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{selectedBike.name}</h4>
                            <p className="text-xs text-gray-500">{selectedBike.brand} {selectedBike.model}</p>
                            <p className="text-xs text-orange-600 font-semibold">KSh {(selectedBike.daily_rate || 0).toLocaleString()}/day</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rider Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Rider Info</h3>
                      <div className="space-y-2 text-sm">
                        <CompactRow label="Emergency" value={emergencyContact.name || '—'} />
                        <CompactRow label="Phone" value={emergencyContact.phone || '—'} />
                        <CompactRow label="Waiver" value={waiverAgreed ? '✓ Signed' : '✗ Not signed'} highlight={waiverAgreed} />
                      </div>
                    </div>

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

        {/* ─── Modals ─── */}
        <BikeSelectionModal
          isOpen={showBikeModal}
          onClose={() => setShowBikeModal(false)}
          onSelect={handleBikeSelect}
          event={event}
          participants={participants}
          initialSelectedBike={selectedBike}
          initialSelectedResources={selectedResources}
        />

        <EventResourceSelector
          isOpen={showResourceSelector}
          onClose={() => setShowResourceSelector(false)}
          onConfirm={handleResourceConfirm}
          event={event}
          participants={participants}
          initialSelectedResources={selectedResources.map(r => ({
            ...r.resourceItem,
            quantity: r.quantity,
          }))}
          selectedBike={selectedBike}
        />
      </div>
    </>
  );
};

export default EventBookingPage;
