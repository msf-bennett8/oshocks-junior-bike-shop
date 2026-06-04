import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, Calendar, Clock, MapPin, Shield, Check, CreditCard,
  ArrowRight, Bike, User, Phone, Info, AlertTriangle
} from 'lucide-react';
import bikeService from '../../services/bikeService';

const BikeRentalPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [waiverSigned, setWaiverSigned] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [insuranceOptIn, setInsuranceOptIn] = useState(true);
  const [deliveryOptIn, setDeliveryOptIn] = useState(false);
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBike = async () => {
      try {
        setLoading(true);
        const response = await bikeService.getBike(slug);
        const bikeData = response.data?.data || response.data;
        setBike(bikeData);
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

  // Calculate rental details
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const days = start && end ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : 1;
  const baseTotal = bike.daily_rate * days;
  const platformFee = Math.round(baseTotal * 0.15);
  const insuranceFee = insuranceOptIn ? 200 * days : 0;
  const deliveryFee = deliveryOptIn ? bike.delivery_fee : 0;
  const grandTotal = baseTotal + platformFee + insuranceFee + deliveryFee;
  const ownerPayout = baseTotal - platformFee;

  const steps = [
    { number: 1, label: 'Dates' },
    { number: 2, label: 'Details' },
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
                {/* Step 1: Dates */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Rental Dates</h2>

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

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Time</label>
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="08:00">8:00 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>

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
                        onClick={() => setStep(2)}
                        disabled={!startDate || !endDate}
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
                              onChange={(e) => setWaiverSigned(e.target.checked)}
                              className="w-5 h-5 text-orange-500 rounded"
                            />
                            <span className="text-sm font-semibold text-yellow-900">I agree to the rental terms</span>
                          </label>
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
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!waiverSigned}
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
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Payment</h2>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-6">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-blue-500" />
                        <p className="text-sm text-blue-700">
                          Demo page. Production will integrate Paystack/M-Pesa for payment processing.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <button className="w-full p-4 rounded-xl border-2 border-orange-500 bg-orange-50 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">M-Pesa</p>
                          <p className="text-sm text-gray-500">STK Push to your phone</p>
                        </div>
                        <Check className="w-5 h-5 text-orange-500 ml-auto" />
                      </button>

                      <button className="w-full p-4 rounded-xl border-2 border-gray-200 flex items-center gap-4 opacity-50">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900">Card Payment</p>
                          <p className="text-sm text-gray-500">Paystack secure checkout</p>
                        </div>
                      </button>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => alert(`Demo: Rental confirmed!\n\nBike: ${bike.name}\nDates: ${startDate} to ${endDate}\nTotal: KSh ${grandTotal.toLocaleString()}\n\nIn production, this processes M-Pesa payment and sends confirmation.`)}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Shield className="w-5 h-5" />
                        Pay KSh {grandTotal.toLocaleString()}
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

                  <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{days} day{days > 1 ? 's' : ''} @ KSh {bike.daily_rate.toLocaleString()}</span>
                      <span className="font-medium">KSh {baseTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee</span>
                      <span className="font-medium">KSh {platformFee.toLocaleString()}</span>
                    </div>
                    {insuranceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-medium">KSh {insuranceFee.toLocaleString()}</span>
                      </div>
                    )}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">KSh {deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    {bike.monthly_rate && days >= 28 && (
                      <div className="flex justify-between text-green-700">
                        <span className="text-green-600">Monthly discount applied</span>
                        <span className="font-medium">-KSh {Math.round(baseTotal * 0.1).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-orange-600">KSh {grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-700 text-center">
                      Owner receives <span className="font-bold">KSh {ownerPayout.toLocaleString()}</span> after rental
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Deposit: KSh {bike.security_deposit.toLocaleString()} (held)</span>
                    </div>
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