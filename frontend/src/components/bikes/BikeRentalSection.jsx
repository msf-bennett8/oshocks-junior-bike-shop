import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bike, ChevronRight, Filter, ArrowRight, MapPin, Star, Shield } from 'lucide-react';
import BikeCard from './BikeCard';
import { MOCK_BIKES } from '../../data/cyclingMockData';

const BikeRentalSection = ({ onRentNow }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Bikes' },
    { key: 'road', label: 'Road' },
    { key: 'mtb', label: 'Mountain' },
    { key: 'gravel', label: 'Gravel' },
    { key: 'ebike', label: 'E-Bike' },
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'kids', label: 'Kids' },
  ];

  const filteredBikes = activeCategory === 'all' 
    ? MOCK_BIKES 
    : MOCK_BIKES.filter(bike => bike.category === activeCategory);

  const featuredBikes = filteredBikes.slice(0, 6);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Bike className="w-3.5 h-3.5" />
              Peer-to-Peer & Platform Rentals
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Rent a Bike</h2>
            <p className="text-gray-600 mt-2 max-w-xl">
              Rent premium bikes from our shop or from local owners. Road, MTB, gravel, e-bikes — find the perfect ride for your adventure.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/list-bike" 
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-all whitespace-nowrap"
            >
              List Your Bike
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/bikes" 
              className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all whitespace-nowrap"
            >
              Browse All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0 w-full mb-8">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{MOCK_BIKES.length}+</p>
              <p className="text-xs text-gray-600">Bikes Available</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {(MOCK_BIKES.reduce((sum, b) => sum + b.rating, 0) / MOCK_BIKES.length).toFixed(1)}★
              </p>
              <p className="text-xs text-gray-600">Avg Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {Math.round((MOCK_BIKES.filter(b => b.is_verified).length / MOCK_BIKES.length) * 100)}%
              </p>
              <p className="text-xs text-gray-600">Verified Bikes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {[...new Set(MOCK_BIKES.map(b => b.location_address?.split(',')[0]).filter(Boolean))].length}
              </p>
              <p className="text-xs text-gray-600">Locations</p>
            </div>
          </div>
        </div>

        {/* Bikes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBikes.map(bike => (
            <BikeCard 
              key={bike.id} 
              bike={bike} 
              compact 
              onRentNow={onRentNow}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Own a bike? List it on our platform and earn when others rent it.
          </p>
          <Link
            to="/list-bike"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Start Earning - List Your Bike
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BikeRentalSection;
