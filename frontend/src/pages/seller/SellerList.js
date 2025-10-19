import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Package, TrendingUp, Award, ChevronDown, Grid, List, X } from 'lucide-react';

const SellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [filters, setFilters] = useState({
    location: '',
    minRating: 0,
    verified: false,
    productRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const mockSellers = [
      {
        id: 1,
        name: 'Oshocks Junior Bike Shop',
        description: 'Premium cycling equipment and accessories. Your trusted partner for quality bikes.',
        logo: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
        rating: 4.9,
        reviewCount: 1247,
        totalProducts: 450,
        location: 'Nairobi, Kenya',
        verified: true,
        joinedDate: '2023-01',
        responseTime: '2 hours',
        categories: ['Mountain Bikes', 'Road Bikes', 'Accessories'],
        badge: 'Top Seller',
        salesCount: 5420
      },
      {
        id: 2,
        name: 'Velocity Cycles Kenya',
        description: 'Specialized in high-performance racing bikes and professional cycling gear.',
        logo: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400',
        rating: 4.7,
        reviewCount: 892,
        totalProducts: 320,
        location: 'Mombasa, Kenya',
        verified: true,
        joinedDate: '2023-03',
        responseTime: '4 hours',
        categories: ['Racing Bikes', 'Helmets', 'Apparel'],
        badge: 'Featured',
        salesCount: 3210
      },
      {
        id: 3,
        name: 'Trek & Trail Outfitters',
        description: 'Adventure cycling equipment for mountain trails and rough terrain enthusiasts.',
        logo: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400',
        rating: 4.8,
        reviewCount: 654,
        totalProducts: 280,
        location: 'Nakuru, Kenya',
        verified: true,
        joinedDate: '2023-05',
        responseTime: '3 hours',
        categories: ['Mountain Bikes', 'Gear', 'Parts'],
        badge: 'Rising Star',
        salesCount: 2150
      },
      {
        id: 4,
        name: 'Urban Pedal Solutions',
        description: 'City bikes and commuter cycling solutions. Making urban cycling accessible.',
        logo: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?w=400',
        rating: 4.6,
        reviewCount: 423,
        totalProducts: 180,
        location: 'Kisumu, Kenya',
        verified: true,
        joinedDate: '2023-07',
        responseTime: '5 hours',
        categories: ['City Bikes', 'Locks', 'Lights'],
        badge: null,
        salesCount: 1580
      },
      {
        id: 5,
        name: 'Pro Cycling Hub',
        description: 'Professional grade cycling components and maintenance services.',
        logo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
        rating: 4.9,
        reviewCount: 1089,
        totalProducts: 520,
        location: 'Nairobi, Kenya',
        verified: true,
        joinedDate: '2022-11',
        responseTime: '1 hour',
        categories: ['Components', 'Tools', 'Services'],
        badge: 'Top Seller',
        salesCount: 6340
      },
      {
        id: 6,
        name: 'Kids Cycle World',
        description: 'Specialized in children\'s bikes and safety equipment for young riders.',
        logo: 'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?w=400',
        rating: 4.5,
        reviewCount: 567,
        totalProducts: 150,
        location: 'Eldoret, Kenya',
        verified: false,
        joinedDate: '2023-08',
        responseTime: '6 hours',
        categories: ['Kids Bikes', 'Safety Gear', 'Accessories'],
        badge: null,
        salesCount: 890
      },
      {
        id: 7,
        name: 'E-Bike Revolution',
        description: 'Electric bicycles and modern cycling technology for the future of transport.',
        logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        rating: 4.8,
        reviewCount: 734,
        totalProducts: 95,
        location: 'Nairobi, Kenya',
        verified: true,
        joinedDate: '2023-06',
        responseTime: '3 hours',
        categories: ['E-Bikes', 'Batteries', 'Chargers'],
        badge: 'Featured',
        salesCount: 1920
      },
      {
        id: 8,
        name: 'Spare Parts Central',
        description: 'Comprehensive inventory of bike parts and replacement components.',
        logo: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
        rating: 4.4,
        reviewCount: 389,
        totalProducts: 680,
        location: 'Thika, Kenya',
        verified: true,
        joinedDate: '2023-04',
        responseTime: '4 hours',
        categories: ['Parts', 'Tires', 'Chains'],
        badge: null,
        salesCount: 2780
      }
    ];

    setTimeout(() => {
      setSellers(mockSellers);
      setFilteredSellers(mockSellers);
      setLoading(false);
    }, 800);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = [...sellers];

    // Search filter
    if (searchTerm) {
      result = result.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      result = result.filter(seller =>
        seller.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(seller => seller.rating >= filters.minRating);
    }

    // Verified filter
    if (filters.verified) {
      result = result.filter(seller => seller.verified);
    }

    // Product range filter
    if (filters.productRange) {
      switch (filters.productRange) {
        case 'small':
          result = result.filter(seller => seller.totalProducts < 200);
          break;
        case 'medium':
          result = result.filter(seller => seller.totalProducts >= 200 && seller.totalProducts < 400);
          break;
        case 'large':
          result = result.filter(seller => seller.totalProducts >= 400);
          break;
        default:
          break;
      }
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'products':
        result.sort((a, b) => b.totalProducts - a.totalProducts);
        break;
      case 'sales':
        result.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
        break;
      default:
        break;
    }

    setFilteredSellers(result);
  }, [searchTerm, filters, sortBy, sellers]);

  const clearFilters = () => {
    setFilters({
      location: '',
      minRating: 0,
      verified: false,
      productRange: ''
    });
    setSearchTerm('');
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Top Seller':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Featured':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rising Star':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Our Sellers</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Browse through {sellers.length} trusted cycling shops across Kenya
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sellers by name, description, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg border ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg border ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="products">Most Products</option>
                    <option value="sales">Most Sales</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Nairobi"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating: {filters.minRating > 0 ? filters.minRating.toFixed(1) : 'Any'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Product Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Range</label>
                  <select
                    value={filters.productRange}
                    onChange={(e) => setFilters({ ...filters, productRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="small">Small (&lt;200)</option>
                    <option value="medium">Medium (200-400)</option>
                    <option value="large">Large (400+)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Verified Sellers Only</span>
                </label>

                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredSellers.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{sellers.length}</span> sellers
          </p>
        </div>

        {/* Sellers Grid/List */}
        {filteredSellers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => window.location.href = `/seller/${seller.id}`}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'p-6' : 'overflow-hidden'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={seller.logo}
                        alt={seller.name}
                        className="w-full h-full object-cover"
                      />
                      {seller.badge && (
                        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(seller.badge)}`}>
                          {seller.badge}
                        </div>
                      )}
                      {seller.verified && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{seller.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{seller.description}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{seller.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({seller.reviewCount} reviews)</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {seller.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          {seller.totalProducts} Products
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TrendingUp className="w-4 h-4" />
                          {seller.salesCount.toLocaleString()} Sales
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {seller.categories.slice(0, 3).map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex gap-6">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img
                          src={seller.logo}
                          alt={seller.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        {seller.verified && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                            <Award className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{seller.name}</h3>
                            {seller.badge && (
                              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(seller.badge)}`}>
                                {seller.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-lg text-gray-900">{seller.rating}</span>
                            <span className="text-gray-500">({seller.reviewCount})</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{seller.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {seller.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-4 h-4" />
                            {seller.totalProducts} Products
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            {seller.salesCount.toLocaleString()} Sales
                          </div>
                          <div className="text-sm text-gray-600">
                            Responds in {seller.responseTime}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {seller.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerList;