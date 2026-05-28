import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Bike, ArrowRight, Heart } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import SeatAvailability from './SeatAvailability';
import { TERRAIN_CONFIG, EVENT_TYPE_CONFIG } from '../../data/cyclingMockData';

const EventCard = ({ event, compact = false, onBookNow }) => {
  const eventDate = new Date(event.start_datetime);
  const formattedDate = eventDate.toLocaleDateString('en-KE', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });
  const formattedTime = eventDate.toLocaleTimeString('en-KE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
        <Link to={`/events/${event.slug}`} className="block">
          {/* Image */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={event.photos?.[0]?.url || event.photos?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder-event.jpg'}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <DifficultyBadge difficulty={event.difficulty} size="sm" />
              {event.charity_name && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">
                  CHARITY
                </span>
              )}
            </div>
            
            {/* Price Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg">
              <span className="text-sm font-bold text-gray-900">KSh {event.price_per_person.toLocaleString()}</span>
              {event.member_price < event.price_per_person && (
                <span className="block text-[10px] text-green-600 font-medium">
                  Member: KSh {event.member_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Date Badge */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {event.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.meeting_point.split(',')[0]}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.estimated_duration_hours}h
              </span>
              <span className="flex items-center gap-1">
                <Bike className="w-3 h-3" />
                {event.distance_km}km
              </span>
            </div>

            <SeatAvailability 
              current={event.current_participants} 
              max={event.max_participants} 
              size="sm"
            />
          </div>
        </Link>

        {/* Action Bar */}
        <div className="px-4 pb-4 pt-2 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookNow?.(event);
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            Book Now
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  // Full size card
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
      <Link to={`/events/${event.slug}`} className="block">
        <div className="relative h-56 overflow-hidden">
          <img
            src={event.photos?.[0]?.url || event.photos?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1/placeholder-event.jpg'}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <DifficultyBadge difficulty={event.difficulty} size="md" />
            {event.charity_name && (
              <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                CHARITY RIDE
              </span>
            )}
            {event.is_recurring && (
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                {event.recurrence_pattern}
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg">
            <span className="text-lg font-bold text-gray-900">KSh {event.price_per_person.toLocaleString()}</span>
            {event.member_price < event.price_per_person && (
              <span className="block text-xs text-green-600 font-semibold">
                Members: KSh {event.member_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 text-white/90 text-sm mb-2">
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <Calendar className="w-4 h-4" />
                {formattedDate} at {formattedTime}
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <Clock className="w-4 h-4" />
                {event.estimated_duration_hours}h
              </span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
              {event.title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.short_description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              {event.meeting_point}
            </span>
            <span className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-orange-500" />
              {event.distance_km}km
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              {event.current_participants}/{event.max_participants}
            </span>
          </div>

          <SeatAvailability 
            current={event.current_participants} 
            max={event.max_participants} 
            size="md"
          />

          {event.guide_included && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {event.guide_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{event.guide_name}</p>
                <p className="text-xs text-gray-500">{event.guide_certifications[0]}</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="px-5 pb-5 pt-2 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookNow?.(event);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          Book Your Spot
          <ArrowRight className="w-5 h-5" />
        </button>
        <button className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-orange-300 transition-all">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;