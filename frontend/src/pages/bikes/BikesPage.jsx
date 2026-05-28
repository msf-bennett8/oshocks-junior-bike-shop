import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Bike, Filter, Search, SlidersHorizontal, MapPin, Star,
  ChevronRight, ArrowRight, X, Grid3X3, List
} from 'lucide-react';
import BikeCard from '../../components/bikes/BikeCard';
import { MOCK_BIKES, BIKE_CATEGORY_CONFIG } from '../../data/cyclingMockData';

const BikesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeOwner, setActiveOwner] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    { key: 'all', label: 'All Bikes' },
    { key: 'road', label: 'Road' },
    { key: 'mtb', label: 'Mountain' },
    { key: 'gravel', label: 'Gravel' },
    { key: 'ebike', label: 'E-Bike' },
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'kids', label: 'Kids' },
  ];

  const ownerFilters = [
    { key: 'all', label: 'All Owners' },
    { key: 'platform', label: 'Oshocks Platform' },
    { key: 'user', label: 'Peer Owners' },
  ];

  const priceRanges = [
    { key: 'all', label: 'All Prices' },
    { key: 'under_1000', label: 'Under KSh 1,000/day' },
    { key: '1000_2000', label: 'KSh 1,000 - 2,000/day' },
    { key: '2000_3000', label: 'KSh 2,000 - 3,000/day' },
    { key: 'over_3000', label: 'Over KSh 3,000/day' },
  ];

  const filteredBikes = MOCK_BIKES.filter(bike => {
    const searchMatch = !searchQuery ||
      bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bike.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = activeCategory === 'all' || bike.category === activeCategory;
    const ownerMatch = activeOwner === 'all' || bike.owner_type === activeOwner;

    let priceMatch = true;
    if (priceRange === 'under_1000') priceMatch = bike.daily_rate < 1000;
    else if (priceRange === '1000_2000') priceMatch = bike.daily_rate >= 1000 && bike.daily_rate <= 2000;
    else if (priceRange === '2000_3000') priceMatch = bike.daily_rate > 2000 && bike.daily_rate <= 3000;
    else if (priceRange === 'over_3000') priceMatch = bike.daily_rate > 3000;

    return searchMatch && categoryMatch && ownerMatch && priceMatch;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.daily_rate - b.daily_rate;
    if (sortBy === 'price_high') return b.daily_rate - a.daily_rate;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popular') return b.total_rentals - a.total_rentals;
    return 0;
  });

  const platformCount = MOCK_BIKES.filter(b => b.owner_type === 'platform').length;
  const peerCount = MOCK_BIKES.filter(b => b.owner_type === 'user').length;

  return (
    <>
      <Helmet>
        <title>Rent a Bike - Peer-to-Peer & Platform Rentals - Oshocks</title>
        <meta name="description" content="Rent premium bikes in Kenya. Road, MTB, gravel, e-bikes from verified owners and Oshocks platform." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/20">
                <Bike className="w-4 h-4 text-orange-400" />
                {MOCK_BIKES.length}+ Bikes Available
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Rent a Bike</h1>
              <p className="text-lg text-gray-300 mb-6">
                Premium bikes from our shop and verified local owners. Road, MTB, gravel, e-bikes — find your perfect ride.
              </p>

              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bikes by name, brand, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white/20 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    <h3 className="font-bold text-gray-900">Filters</h3>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Category</h4>
                    <div className="space-y-2">
                      {categories.map(cat => (
                        <button
                          key={cat.key}
                          onClick={() => setActiveCategory(cat.key)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeCategory === cat.key
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Bike className="w-4 h-4" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Owner Type */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Owner</h4>
                    <div className="space-y-2">
                      {ownerFilters.map(owner => (
                        <button
                          key={owner.key}
                          onClick={() => setActiveOwner(owner.key)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeOwner === owner.key
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                          {owner.label}
                          <span className="ml-auto text-xs text-gray-400">
                            {owner.key === 'all' ? MOCK_BIKES.length : owner.key === 'platform' ? platformCount : peerCount}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Price Per Day</h4>
                    <div className="space-y-2">
                      {priceRanges.map(range => (
                        <button
                          key={range.key}
                          onClick={() => setPriceRange(range.key)}
                          className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                            priceRange === range.key
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Marketplace Stats</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Platform Bikes</span>
                        <span className="font-semibold text-gray-900">{platformCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Peer Bikes</span>
                        <span className="font-semibold text-gray-900">{peerCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Rating</span>
                        <span className="font-semibold text-gray-900">4.7★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Mobile Filters */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 shadow-sm"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters {activeCategory !== 'all' || activeOwner !== 'all' || priceRange !== 'all' ? '(Active)' : ''}
                </button>

                {showMobileFilters && (
                  <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Category</h4>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              activeCategory === cat.key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Owner</h4>
                      <div className="flex flex-wrap gap-2">
                        {ownerFilters.map(owner => (
                          <button
                            key={owner.key}
                            onClick={() => setActiveOwner(owner.key)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              activeOwner === owner.key ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {owner.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveCategory('all'); setActiveOwner('all'); setPriceRange('all'); }}
                      className="w-full py-2 text-sm text-orange-600 font-semibold"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredBikes.length}</span> bikes available
                  </p>
                  <div className="flex items-center gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="popular">Most Rented</option>
                    </select>
                    <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* List Your Bike CTA */}
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">Own a bike? Earn when others rent it.</p>
                    <p className="text-sm text-green-700">List your bike and earn up to KSh 12,000/month</p>
                  </div>
                  <Link
                    to="/list-bike"
                    className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all whitespace-nowrap"
                  >
                    List Your Bike
                  </Link>
                </div>

                {/* Bikes Grid/List */}
                {filteredBikes.length > 0 ? (
                  <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
                    : "space-y-4"
                  }>
                    {filteredBikes.map(bike => (
                      <BikeCard
                        key={bike.id}
                        bike={bike}
                        compact={viewMode === 'grid'}
                        onRentNow={(bike) => window.location.href = `/bikes/${bike.slug}/rent`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                    <Bike className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bikes found</h3>
                    <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                    <button
                      onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveOwner('all'); setPriceRange('all'); }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BikesPage;