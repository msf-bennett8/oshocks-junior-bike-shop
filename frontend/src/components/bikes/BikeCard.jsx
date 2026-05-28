import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Shield, Bike, ArrowRight, Heart } from 'lucide-react';
import { BIKE_CATEGORY_CONFIG, FRAME_SIZE_CONFIG } from '../../data/cyclingMockData';

const BikeCard = ({ bike, compact = false, onRentNow }) => {
  const isPlatform = bike.owner_type === 'platform';

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
        <Link to={`/bikes/${bike.slug}`} className="block">
          <div className="relative h-36 overflow-hidden">
            <img 
              src={bike.images[0]} 
              alt={bike.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1.5">
              {isPlatform && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow">
                  PLATFORM
                </span>
              )}
              {bike.condition === 'new' && (
                <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow">
                  NEW
                </span>
              )}
            </div>

            {/* Price */}
            <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow">
              <span className="text-sm font-bold text-gray-900">KSh {bike.daily_rate.toLocaleString()}</span>
              <span className="text-[10px] text-gray-500 block">/day</span>
            </div>
          </div>

          <div className="p-3">
            <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {bike.name}
            </h3>
            
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {bike.location_address ? (bike.location_address.split(',')[0] || bike.location_address) : 'Location TBD'}
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                {bike.rating}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bike className="w-3.5 h-3.5 text-gray-600" />
                </div>
                <span className="text-[10px] text-gray-600">{BIKE_CATEGORY_CONFIG[bike.category]?.label || bike.category}</span>
              </div>
              <span className="text-[10px] text-gray-500">{bike.total_rentals} rentals</span>
            </div>
          </div>
        </Link>

        <div className="px-3 pb-3 pt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRentNow?.(bike);
            }}
            className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-1"
          >
            Rent Now
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
      <Link to={`/bikes/${bike.slug}`} className="block">
        <div className="relative h-52 overflow-hidden">
          <img 
            src={bike.images[0]} 
            alt={bike.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4 flex gap-2">
            {isPlatform && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                PLATFORM VERIFIED
              </span>
            )}
            {bike.condition === 'new' && (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                BRAND NEW
              </span>
            )}
            {bike.condition === 'excellent' && (
              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                EXCELLENT
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg">
            <span className="text-lg font-bold text-gray-900">KSh {bike.daily_rate.toLocaleString()}</span>
            <span className="text-xs text-gray-500 block">per day</span>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">
              {bike.name}
            </h3>
            <p className="text-white/80 text-sm">{bike.brand} {bike.model} {bike.year}</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bike.description}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{bike.location_address.split(',')[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bike className="w-4 h-4 text-orange-500" />
              <span>{bike.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Deposit: KSh {bike.security_deposit.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{bike.rating} ({bike.review_count} reviews)</span>
            </div>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {bike.owner_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{bike.owner_name}</p>
              <p className="text-xs text-gray-500">
                {isPlatform ? 'Official Platform Partner' : `Owner Rating: ${bike.owner_rating}`}
              </p>
            </div>
            {bike.is_verified && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                VERIFIED
              </span>
            )}
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bike.features.slice(0, 4).map((feature, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md border border-orange-100">
                {feature.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 pt-2 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRentNow?.(bike);
          }}
          className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          Rent This Bike
          <ArrowRight className="w-5 h-5" />
        </button>
        <button className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-orange-300 transition-all">
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default BikeCard;
