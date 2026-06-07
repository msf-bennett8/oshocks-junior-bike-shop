import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Calendar, Clock, MapPin, Shield, Check, CreditCard,
  ArrowRight, Bike, User, Phone, Info, AlertTriangle, FileText,
  Hourglass, Timer, CalendarDays, CalendarRange, Ban, Wallet, Loader
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import TermsAcceptanceModal from '../../components/legal/TermsAcceptanceModal';

const BikeRentalPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);

  // Redirect to login if not authenticated when trying to book
  useEffect(() => {
    if (step === 3 && !isAuthenticated) {
      navigate('/login', { state: { returnTo: `/bikes/${slug}/rent` } });
    }
  }, [step, isAuthenticated, slug, navigate]);
  const [bookingType, setBookingType] = useState('daily'); // hourly, daily, weekly, monthly
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [numberOfHours, setNumberOfHours] = useState(4);
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);
  const [deliveryOptIn, setDeliveryOptIn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [showAddNewCard, setShowAddNewCard] = useState(false);
  const [loadingSavedCards, setLoadingSavedCards] = useState(false);
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [nextAvailableAfter, setNextAvailableAfter] = useState(null);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        setLoading(true);
        const response = await bikeService.getBike(slug);
        const bikeData = response.data?.data || response.data;
        setBike(bikeData);
        
        // If bike is already known to be unavailable, set initial state
        if (bikeData.is_available === false) {
          setIsAvailable(false);
          setNextAvailableAfter(bikeData.next_available_after || null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch bike:', err);
        setError('Failed to load bike details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBike();
  }, [slug]);

    // Load saved cards when on payment step
  useEffect(() => {
    const loadSavedCards = async () => {
      if (step !== 3) return;
      try {
        setLoadingSavedCards(true);
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

    loadSavedCards();
  }, [step]);

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!startDate || !endDate || !bike) return;
      
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      
      try {
        const startDateTime = bookingType === 'hourly' 
          ? `${startDate}T${startTime}:00`
          : `${startDate}T00:00:00`;
        const endDateTime = bookingType === 'hourly'
          ? `${startDate}T${endTime}:00`
          : `${endDate}T23:59:59`;
          
        const response = await bikeService.checkAvailability(bike.listing_code, startDateTime, endDateTime);
        const data = response.data?.data || response.data;
        
        setIsAvailable(data?.available !== false);
        setNextAvailableAfter(data?.next_available_after || null);
      } catch (err) {
        console.error('Availability check failed:', err);
        setAvailabilityError('Could not verify availability. Please try again.');
      } finally {
        setAvailabilityLoading(false);
      }
    };
    
    checkAvailability();
  }, [startDate, endDate, startTime, endTime, bookingType, bike]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bike details...</p>
        </div>
      </div>
    );
  }

  if (error || !bike) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error ? 'Error' : 'Bike Not Found'}</h1>
          <p className="text-gray-500 mb-4">{error || 'This bike is no longer available.'}</p>
          <Link to="/bikes" className="text-orange-600 font-semibold hover:underline">Browse Bikes</Link>
        </div>
      </div>
    );
  }

  // Calculate rental details based on booking type
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  // Ensure all values are numbers, not strings
  const hourlyRate = parseFloat(bike?.hourly_rate) || 0;
  const dailyRate = parseFloat(bike?.daily_rate) || 0;
  const weeklyRate = parseFloat(bike?.weekly_rate) || 0;
  const monthlyRate = parseFloat(bike?.monthly_rate) || 0;
  const bikeDeliveryFee = parseFloat(bike?.delivery_fee) || 0;
  const bikeSecurityDeposit = parseFloat(bike?.security_deposit) || 0;
  
  let duration = 1;
  let baseTotal = 0;
  let rateUsed = dailyRate;
  
  if (bookingType === 'hourly' && hourlyRate > 0) {
    duration = parseInt(numberOfHours) || 1;
    baseTotal = hourlyRate * duration;
    rateUsed = hourlyRate;
  } else if (bookingType === 'daily') {
    duration = start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : 1;
    baseTotal = dailyRate * duration;
    rateUsed = dailyRate;
  } else if (bookingType === 'weekly' && weeklyRate > 0) {
    duration = parseInt(numberOfWeeks) || 1;
    baseTotal = weeklyRate * duration;
    rateUsed = weeklyRate;
  } else if (bookingType === 'monthly' && monthlyRate > 0) {
    duration = parseInt(numberOfMonths) || 1;
    baseTotal = monthlyRate * duration;
    rateUsed = monthlyRate;
  } else {
    // Fallback to daily
    duration = start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : 1;
    baseTotal = dailyRate * duration;
  }
  
  // Ensure all calculations use numbers
  baseTotal = parseFloat(baseTotal.toFixed(2));
  const insuranceFee = insuranceOptIn ? 200 * duration : 0;
  const deliveryFee = deliveryOptIn ? bikeDeliveryFee : 0;
  const securityDeposit = bikeSecurityDeposit;
  
  // Down payment for weekly+ rentals (50% of total rental fee)
  const requiresDownPayment = bookingType === 'weekly' || bookingType === 'monthly';
  const downPayment = requiresDownPayment ? Math.round(baseTotal * 0.5) : 0;
  
  // User sees: bike rental + insurance + delivery + down payment (if applicable)
  // NO platform fee shown to user
  const grandTotal = baseTotal + insuranceFee + deliveryFee + downPayment;
  
  // Total amount user needs to pay now (includes refundable deposit)
  const totalWithDeposit = grandTotal + securityDeposit;

  // Handle checkout - now just advances to payment step (Step 3 handles payment inline)
  const handleCheckout = async () => {
    setStep(3);
  };

  const steps = [
    { number: 1, label: 'Dates & Duration' },
    { number: 2, label: 'Details & Terms' },
    { number: 3, label: 'Payment' }
  ];

  return (
    <>
      <Helmet>
        <title>Rent {bike.name} - Oshocks Bike Rental</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(`/bikes/${slug}`)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Bike
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Rental</h1>
            <p className="text-gray-500">{bike.name}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((s, idx) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.number ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s.number ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${step > s.number ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="md:col-span-2">
                {/* Step 1: Dates & Duration */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Rental Duration & Dates</h2>

                    {/* Booking Type Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {[
                        { key: 'hourly', label: 'Hourly', icon: Timer, available: bike?.hourly_rate },
                        { key: 'daily', label: 'Daily', icon: CalendarDays, available: true },
                        { key: 'weekly', label: 'Weekly', icon: CalendarRange, available: bike?.weekly_rate },
                        { key: 'monthly', label: 'Monthly', icon: Calendar, available: bike?.monthly_rate },
                      ].map((type) => (
                        <button
                          key={type.key}
                          onClick={() => type.available && setBookingType(type.key)}
                          disabled={!type.available}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            bookingType === type.key
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : type.available
                                ? 'border-gray-200 hover:border-orange-300 text-gray-700'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <type.icon className={`w-6 h-6 ${bookingType === type.key ? 'text-orange-500' : type.available ? 'text-gray-500' : 'text-gray-300'}`} />
                          <span className="text-sm font-semibold">{type.label}</span>
                          {!type.available && <span className="text-[10px] text-gray-400">N/A</span>}
                        </button>
                      ))}
                    </div>

                    {/* Hourly Booking Inputs */}
                    {bookingType === 'hourly' && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value); }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => {
                                setStartTime(e.target.value);
                                // Auto-calculate end time
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const endDate = new Date();
                                endDate.setHours(hours + numberOfHours, minutes);
                                const endHours = String(endDate.getHours()).padStart(2, '0');
                                const endMins = String(endDate.getMinutes()).padStart(2, '0');
                                setEndTime(`${endHours}:${endMins}`);
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">End Time (Auto)</label>
                            <input
                              type="time"
                              value={endTime}
                              readOnly
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Hours</label>
                          <input
                            type="number"
                            min="1"
                            max="24"
                            value={numberOfHours}
                            onChange={(e) => {
                              const hours = Math.max(1, Math.min(24, parseInt(e.target.value) || 1));
                              setNumberOfHours(hours);
                              // Auto-calculate end time from start time
                              if (startTime) {
                                const [startHours, startMinutes] = startTime.split(':').map(Number);
                                const endDate = new Date();
                                endDate.setHours(startHours + hours, startMinutes);
                                const endHours = String(endDate.getHours()).padStart(2, '0');
                                const endMins = String(endDate.getMinutes()).padStart(2, '0');
                                setEndTime(`${endHours}:${endMins}`);
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Daily Booking Inputs */}
                    {bookingType === 'daily' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Weekly Booking Inputs */}
                    {bookingType === 'weekly' && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Weeks</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={numberOfWeeks}
                            onChange={(e) => setNumberOfWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Monthly Booking Inputs */}
                    {bookingType === 'monthly' && (
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Months</label>
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={numberOfMonths}
                            onChange={(e) => setNumberOfMonths(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Availability Status */}
                    {availabilityLoading && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                        <p className="text-sm text-blue-700">Checking availability...</p>
                      </div>
                    )}
                    
                    {!isAvailable && !availabilityLoading && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
                        <div className="flex items-start gap-3">
                          <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Bike Not Available</p>
                            <p className="text-sm text-red-700">
                              {nextAvailableAfter 
                                ? `This bike is booked until ${new Date(nextAvailableAfter).toLocaleDateString()}. Please select dates after this.`
                                : 'This bike is not available for the selected dates. Please choose different dates.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {availabilityError && (
                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-700">{availabilityError}</p>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">Pickup Location</p>
                          <p className="text-sm text-blue-700">{bike.location_address}</p>
                          <p className="text-xs text-blue-600 mt-1 capitalize">{bike.pickup_type} pickup</p>
                          {bike.response_time_hours && !bike.instant_book && (
                            <p className="text-xs text-blue-600 mt-1">Owner responds within ~{bike.response_time_hours}h</p>
                          )}
                        </div>
                        {bike.instant_book && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            INSTANT
                          </span>
                        )}
                      </div>
                    </div>

                    {bike.delivery_fee > 0 && (
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all mb-6 ${
                        deliveryOptIn ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={deliveryOptIn}
                          onChange={(e) => setDeliveryOptIn(e.target.checked)}
                          className="w-5 h-5 text-orange-500 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Delivery to My Location</p>
                          <p className="text-sm text-gray-500">We'll deliver the bike to you</p>
                        </div>
                        <span className="font-bold text-gray-900">+KSh {bike.delivery_fee.toLocaleString()}</span>
                      </label>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => { setFieldErrors({}); setStep(2); }}
                        disabled={!startDate || (bookingType === 'daily' && !endDate) || !isAvailable || availabilityLoading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Renter Details</h2>

                    {/* Terms of Service Enforcement */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900 mb-2">Terms of Renting</p>
                          <p className="text-sm text-blue-700 mb-4">
                            You must accept our Terms of Renting before proceeding. This covers your responsibilities as a renter, liability, and return policies.
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setTermsModalOpen(true)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                              Read Terms
                            </button>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => {
                                  if (!termsAccepted && !e.target.checked) {
                                    // Already unchecked, do nothing
                                    return;
                                  }
                                  if (!termsAccepted) {
                                    // Trying to check without reading terms
                                    setFieldErrors({ terms: 'Please click "Read Terms" to review and accept the Terms of Renting.' });
                                    return;
                                  }
                                  // Only allow unchecking if already accepted
                                  setTermsAccepted(e.target.checked);
                                  setFieldErrors(prev => ({ ...prev, terms: null }));
                                }}
                                className="w-5 h-5 text-blue-500 rounded"
                              />
                              <span className="text-sm font-semibold text-blue-900">I accept the Terms of Renting</span>
                            </label>
                          </div>
                          {fieldErrors.auth && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              {fieldErrors.auth}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <TermsAcceptanceModal
                      isOpen={termsModalOpen}
                      onClose={() => setTermsModalOpen(false)}
                      termsType="renting"
                      onAccept={async () => {
                        setTermsAccepted(true);
                        setFieldErrors(prev => ({ ...prev, terms: null }));
                        try {
                          await bikeService.acceptTerms('renting');
                        } catch (err) {
                          console.error('Terms accept API error:', err);
                        }
                      }}
                    />

                    {/* Waiver */}
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-900 mb-2">Rental Agreement & Waiver</p>
                          <p className="text-sm text-yellow-700 mb-4">
                            I agree to rent this bike in good condition and return it by the agreed date. I accept liability for damage caused by negligence. I will wear a helmet at all times while riding.
                          </p>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={waiverSigned}
                              onChange={(e) => {
                                setWaiverSigned(e.target.checked);
                                if (e.target.checked) setFieldErrors(prev => ({ ...prev, waiver: null }));
                              }}
                              className="w-5 h-5 text-orange-500 rounded"
                            />
                            <span className="text-sm font-semibold text-yellow-900">I agree to the rental terms</span>
                          </label>
                          {fieldErrors.waiver && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              {fieldErrors.waiver}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ID Verification */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-2">ID Verification</p>
                          <p className="text-sm text-gray-600 mb-3">
                            For security, we require ID verification for bike rentals. Upload a photo of your national ID or passport.
                          </p>
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
                            <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Click to upload ID (Demo)</p>
                          </div>
                          <label className="flex items-center gap-3 mt-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={idVerified}
                              onChange={(e) => setIdVerified(e.target.checked)}
                              className="w-5 h-5 text-orange-500 rounded"
                            />
                            <span className="text-sm text-gray-700">I've uploaded my ID (demo check)</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Insurance - conditional based on bike.insurance_included */}
                    {bike.insurance_included ? (
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 mb-6 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-semibold text-purple-900">Insurance Included</p>
                          <p className="text-sm text-purple-600">Basic coverage is included in your rental price</p>
                        </div>
                        <Check className="w-5 h-5 text-purple-500 ml-auto" />
                      </div>
                    ) : (
                      <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all mb-6 ${
                        insuranceOptIn ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={insuranceOptIn}
                          onChange={(e) => setInsuranceOptIn(e.target.checked)}
                          className="w-5 h-5 text-green-500 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">Add Insurance</p>
                          <p className="text-sm text-gray-500">Coverage for theft, damage, and accidents</p>
                        </div>
                        <span className="font-bold text-gray-900">KSh 200/day</span>
                      </label>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => { setFieldErrors({}); setStep(1); }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={async () => {
                          if (!isAuthenticated) {
                            setFieldErrors({ auth: 'Please sign in to proceed with booking.' });
                            setTimeout(() => {
                              navigate('/login', { state: { returnTo: `/bikes/${slug}/rent` } });
                            }, 1500);
                            return;
                          }
                          if (!termsAccepted) {
                            setFieldErrors({ terms: 'Please read and accept the Terms of Renting before proceeding.' });
                            return;
                          }
                          if (!waiverSigned) {
                            setFieldErrors({ waiver: 'Please agree to the rental terms and waiver.' });
                            return;
                          }
                          try {
                            await bikeService.acceptTerms('renting');
                          } catch (err) {
                            console.error('Terms accept API error:', err);
                          }
                          setStep(3);
                        }}
                        disabled={!waiverSigned || !termsAccepted}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        Continue to Payment
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>

                    {checkoutError && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{checkoutError}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'mpesa'
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg"
                            alt="M-Pesa"
                            className="h-12 w-auto mx-auto mb-2 object-contain"
                          />
                          <div className="text-sm text-gray-600">M-Pesa STK</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg flex items-center justify-center transition ${
                          paymentMethod === 'card'
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-300 hover:border-gray-400'
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
                          paymentMethod === 'cod'
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-sm text-gray-600">Pay at Pickup</div>
                        </div>
                      </button>
                    </div>

                    {/* M-Pesa Payment */}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          M-Pesa Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={mpesaPhone}
                            onChange={(e) => {
                              setMpesaPhone(e.target.value);
                              if (e.target.value) setFieldErrors(prev => ({ ...prev, mpesaPhone: null }));
                            }}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.mpesaPhone ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="0712345678"
                          />
                        </div>
                        {fieldErrors.mpesaPhone && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {fieldErrors.mpesaPhone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Payment */}
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

                    {/* Cash on Delivery / Pay at Pickup */}
                    {paymentMethod === 'cod' && (
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-900 mb-2">Pay at Pickup</h3>
                          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>Your bike is reserved</li>
                            <li>Pay with cash or M-Pesa at the pickup location</li>
                            <li>Please arrive 15 minutes early to complete payment</li>
                            <li>Have exact change ready</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => { setFieldErrors({}); setCheckoutError(null); setStep(2); }}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={async () => {
                          if (checkoutLoading) return;

                          // Check authentication before booking
                          if (!user) {
                            setCheckoutError('Please sign in to complete your booking. Redirecting to login...');
                            setTimeout(() => {
                              navigate('/login', { state: { returnTo: `/bikes/${slug}/rent` } });
                            }, 2000);
                            return;
                          }

                          // Check bike is available before booking
                          if (!bike?.is_active || bike?.listing_status !== 'approved') {
                            setCheckoutError('This bike is not available for rent. Please choose another bike.');
                            return;
                          }

                          // Validate fields before proceeding
                          const errors = {};
                          if (paymentMethod === 'mpesa' && !mpesaPhone && !user?.phone) {
                            errors.mpesaPhone = 'Please enter your M-Pesa phone number.';
                          }
                          if (Object.keys(errors).length > 0) {
                            setFieldErrors(errors);
                            return;
                          }

                          setFieldErrors({});
                          setCheckoutError(null);
                          setCheckoutLoading(true);

                          try {
                            // Step 1: Create booking
                            const startDateTime = bookingType === 'hourly'
                              ? `${startDate}T${startTime}:00`
                              : `${startDate}T00:00:00`;
                            const endDateTime = bookingType === 'hourly'
                              ? `${startDate}T${endTime}:00`
                              : `${endDate}T23:59:59`;

                            const bookingData = {
                              listing_code: bike.listing_code,
                              start_datetime: startDateTime,
                              end_datetime: endDateTime,
                              duration_days: bookingType === 'daily' ? duration : bookingType === 'hourly' ? 1 : bookingType === 'weekly' ? numberOfWeeks * 7 : numberOfMonths * 30,
                              duration_type: bookingType,
                              duration_hours: bookingType === 'hourly' ? numberOfHours : null,
                              insurance_opt_in: insuranceOptIn,
                              delivery_opt_in: deliveryOptIn,
                              payment_method: paymentMethod,
                            };

                            const response = await bikeService.createBooking(bookingData);
                            const bookingCode = response.data?.data?.booking_code || response.data?.booking_code;

                            if (!bookingCode) {
                              throw new Error('Failed to create booking');
                            }

                            // Step 2: Process payment based on method
                            if (paymentMethod === 'mpesa') {
                              const mpesaResponse = await bikeService.initiateBikeRentalMpesa({
                                booking_code: bookingCode,
                                phone_number: mpesaPhone || user?.phone || ''
                              });

                              if (mpesaResponse.data?.success) {
                                const paymentId = mpesaResponse.data?.data?.payment_id;
                                const isMock = mpesaResponse.data?.data?.mock;

                                if (isMock) {
                                  console.log('🧪 Mock M-Pesa payment — auto-completing in 5 seconds...');
                                }

                                // Poll for payment status
                                paymentService.pollPaymentStatus(
                                  paymentId,
                                  (status) => {
                                    if (status === 'completed') {
                                      navigate('/bike-rental-success', {
                                        state: { success: true, message: 'Payment successful! Booking confirmed.', bookingCode }
                                      });
                                    } else if (status === 'failed') {
                                      setCheckoutError('Payment failed. Please try again.');
                                      setCheckoutLoading(false);
                                    }
                                  }
                                );
                              }
                            } else if (paymentMethod === 'card') {
                              if (selectedSavedCard && !showAddNewCard) {
                                // Charge saved card
                                const cardResponse = await paymentService.chargeSavedCard({
                                  order_id: null,
                                  email: user?.email,
                                  authorization_code: selectedSavedCard.authorization_code
                                });
                                // Fallback to Paystack redirect
                                const cardInit = await bikeService.initiateBikeRentalCard({
                                  booking_code: bookingCode,
                                  email: user?.email
                                });
                                if (cardInit.data?.success && cardInit.data?.data?.authorization_url) {
                                  window.location.href = cardInit.data.data.authorization_url;
                                }
                              } else {
                                // New card - redirect to Paystack
                                const cardInit = await bikeService.initiateBikeRentalCard({
                                  booking_code: bookingCode,
                                  email: user?.email
                                });
                                if (cardInit.data?.success && cardInit.data?.data?.authorization_url) {
                                  window.location.href = cardInit.data.data.authorization_url;
                                }
                              }
                            } else if (paymentMethod === 'cod') {
                              const codResponse = await bikeService.bikeRentalCod({
                                booking_code: bookingCode
                              });
                              if (codResponse.data?.success) {
                                navigate('/bike-rental-success', {
                                  state: { success: true, message: 'Booking reserved! Pay at pickup.', bookingCode }
                                });
                              }
                            }

                          } catch (err) {
                            setCheckoutError(err.response?.data?.error || err.response?.data?.message || err.message || 'Payment failed. Please try again.');
                            setCheckoutLoading(false);
                          }
                        }}
                        disabled={checkoutLoading}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {checkoutLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            {paymentMethod === 'cod' ? 'Reserve Bike' : `Pay KSh ${totalWithDeposit.toLocaleString()}`}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={bike.images[0]} alt={bike.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{bike.name}</h4>
                      <p className="text-xs text-gray-500">{bike.brand} {bike.model}</p>
                    </div>
                  </div>

                  {/* USER-FACING PRICING ONLY - No commission breakdown */}
                  <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {bookingType === 'hourly' ? `${numberOfHours} hour${numberOfHours > 1 ? 's' : ''}` :
                         bookingType === 'daily' ? `${duration} day${duration > 1 ? 's' : ''}` :
                         bookingType === 'weekly' ? `${numberOfWeeks} week${numberOfWeeks > 1 ? 's' : ''}` :
                         `${numberOfMonths} month${numberOfMonths > 1 ? 's' : ''}`}
                        {' '}@ KSh {Number(rateUsed).toLocaleString()}/{bookingType === 'hourly' ? 'hr' : bookingType === 'daily' ? 'day' : bookingType === 'weekly' ? 'wk' : 'mo'}
                      </span>
                      <span className="font-medium">KSh {Number(baseTotal).toLocaleString()}</span>
                    </div>
                    {insuranceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-medium">KSh {Number(insuranceFee).toLocaleString()}</span>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">KSh {Number(deliveryFee).toLocaleString()}</span>
                      </div>
                    )}
                    {requiresDownPayment && (
                      <div className="flex justify-between text-orange-700">
                        <span className="text-orange-600">Down Payment (50%)</span>
                        <span className="font-medium">KSh {Number(downPayment).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900">Rental Total</span>
                    <span className="text-2xl font-bold text-orange-600">KSh {Number(grandTotal).toLocaleString()}</span>
                  </div>

                  {/* Security Deposit - shown separately */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 mb-3">
                    <div className="flex items-center gap-2 text-xs text-yellow-700">
                      <Shield className="w-4 h-4" />
                      <span>+ Security Deposit: KSh {Number(securityDeposit).toLocaleString()} (refundable on return)</span>
                    </div>
                  </div>

                  {/* Total amount to pay now */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">Amount to Pay Now</span>
                      <span className="font-bold text-green-700 text-lg">KSh {Number(totalWithDeposit).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Includes refundable security deposit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BikeRentalPage;