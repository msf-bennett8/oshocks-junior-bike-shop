import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, MapPin, Clock, Users, Bike, ArrowRight, Heart,
  Share2, ChevronLeft, Star, Shield, Check, X, Info,
  Trophy, PartyPopper, GraduationCap, Building2, Lock, Palette
} from 'lucide-react';
import DifficultyBadge from '../../components/cycling/DifficultyBadge';
import SeatAvailability from '../../components/cycling/SeatAvailability';
import {
  MOCK_EVENTS,
  DIFFICULTY_CONFIG,
  TERRAIN_CONFIG,
  EVENT_TYPE_CONFIG
} from '../../data/cyclingMockData';

const EventDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const event = MOCK_EVENTS.find(e => e.slug === slug);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-500 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.start_datetime);
  const formattedDate = eventDate.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const endDate = new Date(event.end_datetime);
  const durationHours = Math.round((endDate - eventDate) / (1000 * 60 * 60));

  const seatsRemaining = event.max_participants - event.current_participants;
  const percentFull = (event.current_participants / event.max_participants) * 100;

  const relatedEvents = MOCK_EVENTS.filter(e =>
    e.id !== event.id &&
    (e.difficulty === event.difficulty || e.terrain === event.terrain)
  ).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{event.title} - Oshocks Cycling Events</title>
        <meta name="description" content={event.short_description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <Link to="/events" className="hover:text-orange-600 transition-colors">Events</Link>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-gray-900 font-medium truncate">{event.title}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Images & Details */}
            <div className="lg:col-span-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="relative h-64 md:h-96">
                  <img
                    src={event.photos[activeImage]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <DifficultyBadge difficulty={event.difficulty} size="md" />
                    {event.charity_name && (
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                        CHARITY
                      </span>
                    )}
                    {event.is_recurring && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {event.recurrence_pattern}
                      </span>
                    )}
                  </div>

                  {/* Image Navigation */}
                  {event.photos.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {event.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            activeImage === idx ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {event.photos.length > 1 && (
                  <div className="flex gap-2 p-4">
                    {event.photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          activeImage === idx ? 'border-orange-500' : 'border-transparent'
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-700">{event.rating}</span>
                      <span>({event.review_count} reviews)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                      {showShareMenu && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-48 z-20">
                          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Copy Link</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Share on WhatsApp</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Share on Twitter</button>
                        </div>
                      )}
                    </button>
                    <button className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      <Heart className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">{event.description}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm font-bold text-gray-900">{formattedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <Bike className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="text-sm font-bold text-gray-900">{event.distance_km}km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-bold text-gray-900">{durationHours}h</p>
                    </div>
                  </div>
                </div>

                {/* Route Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Route</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-gray-900">Meeting Point</span>
                    </div>
                    <p className="text-gray-600 mb-4">{event.meeting_point}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Bike className="w-5 h-5 text-orange-500" />
                      <span className="font-semibold text-gray-900">Route Description</span>
                    </div>
                    <p className="text-gray-600">{event.route_description}</p>
                  </div>
                </div>

                {/* What's Included */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.equipment_provided.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Equipment */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">What to Bring</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.required_equipment.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Info className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 capitalize">{item.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guide Info */}
                {event.guide_included && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Your Guide</h3>
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {event.guide_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{event.guide_name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{event.guide_bio}</p>
                        <div className="flex flex-wrap gap-1">
                          {event.guide_certifications.map((cert, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      Cancellation Policy
                    </h4>
                    <p className="text-sm text-gray-600">{event.cancellation_policy}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-orange-500" />
                      Weather Policy
                    </h4>
                    <p className="text-sm text-gray-600">{event.weather_policy}</p>
                  </div>
                </div>
              </div>

              {/* Related Events */}
              {relatedEvents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {relatedEvents.map(evt => (
                      <Link
                        key={evt.id}
                        to={`/events/${evt.slug}`}
                        className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img src={evt.photos[0]} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute top-2 left-2">
                            <DifficultyBadge difficulty={evt.difficulty} size="sm" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">{evt.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">KSh {evt.price_per_person.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Price per person</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">KSh {event.price_per_person.toLocaleString()}</span>
                    </div>
                    {event.member_price < event.price_per_person && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-semibold">
                          Members save KSh {(event.price_per_person - event.member_price).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">
                          Member price: KSh {event.member_price.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <SeatAvailability
                    current={event.current_participants}
                    max={event.max_participants}
                    size="lg"
                  />

                  {/* Bike Rental Option */}
                  {event.bike_included ? (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Bike Included</p>
                        <p className="text-xs text-green-600">No need to bring your own</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Bring Your Own Bike</p>
                      <p className="text-xs text-blue-600 mb-2">Or rent one from our marketplace</p>
                      <Link
                        to="/bikes"
                        className="text-xs text-orange-600 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Browse Rental Bikes <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {/* Transport Option */}
                  {event.transport_provided && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center gap-3">
                      <Check className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-semibold text-purple-800">Transport Available</p>
                        <p className="text-xs text-purple-600">+ KSh {event.transport_price.toLocaleString()} per person</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/events/${event.slug}/book`)}
                    disabled={seatsRemaining <= 0}
                    className={`w-full mt-6 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      seatsRemaining > 0
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {seatsRemaining > 0 ? (
                      <>
                        Book Your Spot
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      'Sold Out'
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-3">
                    Registration closes {new Date(event.registration_deadline).toLocaleDateString('en-KE')}
                  </p>
                </div>

                {/* Charity Info */}
                {event.charity_name && (
                  <div className="bg-purple-50 rounded-2xl border border-purple-200 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-purple-500" />
                      <h4 className="font-bold text-purple-900">Charity Ride</h4>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">
                      Supporting: <span className="font-semibold">{event.charity_name}</span>
                    </p>
                    <p className="text-xs text-purple-600">
                      A portion of proceeds goes to this cause.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailsPage;