import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft, MapPin, Star, Shield, Bike, Check, Heart,
  Share2, Calendar, Clock, ArrowRight, Info, User, MessageCircle
} from 'lucide-react';
import bikeService from '../../services/bikeService';
import { MOCK_EVENTS, BIKE_CATEGORY_CONFIG, FRAME_SIZE_CONFIG } from '../../data/cyclingMockData';

const BikeDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [rentalDuration, setRentalDuration] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
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
          <Link to="/bikes" className="text-orange-600 font-semibold hover:underline">Browse All Bikes</Link>
        </div>
      </div>
    );
  }

  const isPlatform = bike.owner_type === 'platform';
  const price = rentalDuration === 'hour' ? bike.hourly_rate : rentalDuration === 'day' ? bike.daily_rate : rentalDuration === 'week' ? bike.weekly_rate : bike.daily_rate;

  const relatedEvents = MOCK_EVENTS.filter(e => {
    if (e.bike_included !== false) return false;
    const terrainMap = {
      'road': 'road',
      'mtb_trail': 'mtb',
      'gravel': 'gravel',
      'mixed': bike.category
    };
    return terrainMap[e.terrain] === bike.category || e.terrain === 'mixed';
  }).slice(0, 2);

  return (
    <>
      <Helmet>
        <title>{bike.name} - Rent {bike.brand} {bike.model} - Oshocks</title>
        <meta name="description" content={`Rent ${bike.name} in Nairobi. ${bike.description} KSh ${bike.daily_rate.toLocaleString()}/day.`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <Link to="/bikes" className="hover:text-orange-600 transition-colors">Bikes</Link>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-gray-900 font-medium truncate">{bike.name}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-7">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="relative h-72 md:h-96">
                  <img
                    src={bike.images[activeImage]}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isPlatform && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                        PLATFORM
                      </span>
                    )}
                    {bike.condition === 'new' && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                        NEW
                      </span>
                    )}
                    {bike.is_verified && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                        VERIFIED
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 p-4">
                  {bike.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === idx ? 'border-orange-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability Banner */}
              {!bike.is_available && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-red-900">Currently Booked</p>
                    <p className="text-sm text-red-700">
                      {bike.next_available_after 
                        ? `This bike is unavailable until ${new Date(bike.next_available_after).toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                        : 'This bike is currently unavailable for rental.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{bike.name}</h1>
                    <p className="text-gray-500">{bike.brand} {bike.model} {bike.year}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48 z-20">
                          <button 
                            onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            Copy Link
                          </button>
                          <button 
                            onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, '_blank'); setShowShareMenu(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                          >
                            WhatsApp
                          </button>
                        </div>
                      )}
                    </button>
                    <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-900">{bike.rating}</span>
                  <span className="text-gray-500">({bike.review_count} reviews)</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">{bike.total_rentals} rentals</span>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">{bike.description}</p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="font-semibold text-gray-900 capitalize">{bike.category}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Frame Size</p>
                    <p className="font-semibold text-gray-900 uppercase">{bike.frame_size}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Wheel Size</p>
                    <p className="font-semibold text-gray-900">{bike.wheel_size}"</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Condition</p>
                    <p className="font-semibold text-gray-900 capitalize">{bike.condition}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Min Rental</p>
                    <p className="font-semibold text-gray-900">{bike.min_rental_hours}h</p>
                  </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Max Rental</p>
                        <p className="font-semibold text-gray-900">{bike.max_rental_days} days</p>
                    </div>
                    {bike.monthly_rate && (
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-600 mb-1">Monthly Rate</p>
                        <p className="font-semibold text-green-900">KSh {bike.monthly_rate.toLocaleString()}</p>
                        </div>
                    )}
                    {bike.instant_book !== undefined && (
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-600 mb-1">Booking</p>
                        <p className="font-semibold text-blue-900">{bike.instant_book ? 'Instant Book' : 'Request to Book'}</p>
                        </div>
                    )}
                    </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {bike.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100 capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                {bike.rules && (
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Rental Rules</h3>
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-sm text-yellow-800 whitespace-pre-line">{bike.rules}</p>
                    </div>
                  </div>
                )}

                {/* Insurance */}
                {bike.insurance_included && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900">Insurance Included</p>
                      <p className="text-xs text-purple-600">Basic coverage included in rental price</p>
                    </div>
                  </div>
                )}

                {/* Owner */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {bike.owner_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{bike.owner_name}</h4>
                       <p className="text-sm text-gray-500">
                        {isPlatform ? 'Official Platform Partner' : `Rating: ${bike.owner_rating}★ • Response: ~${bike.response_time_hours || 2}h`}
                        </p>
                    </div>
                    {!isPlatform && (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Events You Can Use This Bike For</h3>
                  <div className="space-y-3">
                    {relatedEvents.map(evt => (
                      <Link
                        key={evt.id}
                        to={`/events/${evt.slug}`}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors group"
                      >
                        <img src={evt.photos[0]} alt={evt.title} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{evt.title}</h4>
                          <p className="text-sm text-gray-500">{evt.distance_km}km • {evt.difficulty}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">KSh {evt.price_per_person.toLocaleString()}</p>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">Rental Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">KSh {price.toLocaleString()}</span>
                      <span className="text-gray-500">/{rentalDuration}</span>
                    </div>
                  </div>

                  {/* Duration Selector */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {['hour', 'day', 'week'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setRentalDuration(dur)}
                        className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                          rentalDuration === dur
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>

                  {/* Date Picker */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {!startDate && (
                      <p className="text-xs text-orange-600 mt-1">Please select a start date</p>
                    )}
                  </div>

                  {/* Pickup Info */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Pickup Location</p>
                      <p className="text-sm text-blue-700">{bike.location_address}</p>
                      <p className="text-xs text-blue-600 mt-1 capitalize">{bike.pickup_type} pickup</p>
                    </div>
                  </div>

                  {/* Deposit */}
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 mb-6 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Security Deposit</p>
                      <p className="text-sm text-yellow-700">KSh {bike.security_deposit.toLocaleString()} (refundable)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => bike.is_available && navigate(`/bikes/${bike.slug}/rent`)}
                    disabled={!bike.is_available}
                    className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      bike.is_available
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {bike.is_available ? (
                      <>
                        Proceed to Rent
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5" />
                        {bike.next_available_after 
                          ? `Available After ${new Date(bike.next_available_after).toLocaleDateString()}`
                          : 'Currently Unavailable'}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    Free cancellation up to 24h before pickup
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{rentalDuration}ly rate</span>
                      <span className="font-medium">KSh {price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform fee (15%)</span>
                      <span className="font-medium">KSh {Math.round(price * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance (optional)</span>
                      <span className="font-medium">KSh 200</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Owner receives</span>
                        <span>KSh {Math.round(price * 0.85).toLocaleString()}</span>
                      </div>
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

export default BikeDetailsPage;
