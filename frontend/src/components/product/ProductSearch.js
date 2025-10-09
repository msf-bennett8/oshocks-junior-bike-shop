import { useState, useEffect, useRef } from 'react';
import {
  Search, X, TrendingUp, Clock, Star, Filter, Sliders,
  MapPin, DollarSign, Tag, Package, ChevronRight, Loader
} from 'lucide-react';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Advanced filter states
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
    seller: '',
    rating: 0,
    inStock: false,
    freeShipping: false,
    onSale: false
  });

  // Mock data
  const mockProducts = [
    {
      id: 1,
      name: 'Mountain Bike Pro X500',
      category: 'Bicycles',
      price: 45000,
      originalPrice: 55000,
      rating: 4.5,
      reviews: 128,
      seller: 'Oshocks Junior',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=100',
      inStock: true,
      freeShipping: true,
      condition: 'new',
      tags: ['mountain bike', 'professional', '21-speed', 'suspension']
    },
    {
      id: 2,
      name: 'Road Racing Bike Elite',
      category: 'Bicycles',
      price: 65000,
      originalPrice: null,
      rating: 4.8,
      reviews: 95,
      seller: 'Oshocks Junior',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=100',
      inStock: true,
      freeShipping: true,
      condition: 'new',
      tags: ['road bike', 'racing', 'carbon fiber', 'lightweight']
    },
    {
      id: 3,
      name: 'Kids Bicycle 16" Rainbow',
      category: 'Bicycles',
      price: 12500,
      originalPrice: 15000,
      rating: 4.6,
      reviews: 203,
      seller: 'BikeWorld Kenya',
      location: 'Mombasa',
      image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=100',
      inStock: true,
      freeShipping: false,
      condition: 'new',
      tags: ['kids bike', 'children', 'training wheels', 'colorful']
    },
    {
      id: 4,
      name: 'Professional Bike Helmet',
      category: 'Accessories',
      price: 3500,
      originalPrice: null,
      rating: 4.7,
      reviews: 456,
      seller: 'Oshocks Junior',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1562438120-3f78a7d69a50?w=100',
      inStock: true,
      freeShipping: false,
      condition: 'new',
      tags: ['helmet', 'safety', 'certified', 'adjustable']
    },
    {
      id: 5,
      name: 'Hydraulic Disc Brakes Set',
      category: 'Parts',
      price: 8500,
      originalPrice: 10000,
      rating: 4.9,
      reviews: 89,
      seller: 'Oshocks Junior',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      inStock: true,
      freeShipping: true,
      condition: 'new',
      tags: ['brakes', 'hydraulic', 'disc brake', 'performance']
    },
    {
      id: 6,
      name: 'LED Bike Light Set',
      category: 'Accessories',
      price: 2500,
      originalPrice: null,
      rating: 4.4,
      reviews: 312,
      seller: 'Cycle Accessories KE',
      location: 'Kisumu',
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=100',
      inStock: true,
      freeShipping: false,
      condition: 'new',
      tags: ['lights', 'LED', 'night riding', 'rechargeable']
    },
    {
      id: 7,
      name: 'Bike Repair Tool Kit',
      category: 'Accessories',
      price: 4200,
      originalPrice: 5000,
      rating: 4.6,
      reviews: 178,
      seller: 'Oshocks Junior',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=100',
      inStock: true,
      freeShipping: false,
      condition: 'new',
      tags: ['tools', 'repair', 'maintenance', 'portable']
    },
    {
      id: 8,
      name: 'Carbon Fiber Water Bottle Cage',
      category: 'Accessories',
      price: 1800,
      originalPrice: null,
      rating: 4.3,
      reviews: 267,
      seller: 'BikeWorld Kenya',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1523516845897-e0c5e0c47b0b?w=100',
      inStock: false,
      freeShipping: false,
      condition: 'new',
      tags: ['bottle cage', 'carbon fiber', 'lightweight', 'durable']
    },
    {
      id: 9,
      name: 'Electric Mountain Bike E-Pro',
      category: 'Bicycles',
      price: 125000,
      originalPrice: null,
      rating: 4.9,
      reviews: 67,
      seller: 'Electric Bikes Kenya',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=100',
      inStock: true,
      freeShipping: true,
      condition: 'new',
      tags: ['electric bike', 'e-bike', 'battery powered', 'eco-friendly']
    },
    {
      id: 10,
      name: 'Bike Lock Heavy Duty',
      category: 'Accessories',
      price: 2800,
      originalPrice: 3500,
      rating: 4.5,
      reviews: 421,
      seller: 'Security Plus KE',
      location: 'Nairobi',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
      inStock: true,
      freeShipping: false,
      condition: 'new',
      tags: ['lock', 'security', 'anti-theft', 'heavy duty']
    }
  ];

  const mockTrendingSearches = [
    'mountain bike',
    'electric bike',
    'bike helmet',
    'kids bicycle',
    'bike accessories',
    'road bike',
    'bike lights',
    'bike lock'
  ];

  useEffect(() => {
    // Load recent searches from memory
    const stored = ['bike helmet', 'mountain bike', 'kids bicycle'];
    setRecentSearches(stored);
    setTrendingSearches(mockTrendingSearches);
  }, []);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic with debouncing
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, filters]);

  const performSearch = (query) => {
    setIsSearching(true);
    setShowResults(true);

    // Simulate API call
    setTimeout(() => {
      let results = mockProducts.filter(product => {
        const matchesQuery =
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

        const matchesCategory = !filters.category || product.category === filters.category;
        const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
        const matchesLocation = !filters.location || product.location === filters.location;
        const matchesSeller = !filters.seller || product.seller.toLowerCase().includes(filters.seller.toLowerCase());
        const matchesRating = !filters.rating || product.rating >= filters.rating;
        const matchesStock = !filters.inStock || product.inStock;
        const matchesShipping = !filters.freeShipping || product.freeShipping;
        const matchesSale = !filters.onSale || product.originalPrice !== null;

        return matchesQuery && matchesCategory && matchesMinPrice && matchesMaxPrice &&
               matchesLocation && matchesSeller && matchesRating && matchesStock &&
               matchesShipping && matchesSale;
      });

      setSearchResults(results);

      // Generate suggestions
      const uniqueTags = [...new Set(results.flatMap(p => p.tags))];
      setSuggestions(uniqueTags.slice(0, 5));

      setIsSearching(false);
    }, 500);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      seller: '',
      rating: 0,
      inStock: false,
      freeShipping: false,
      onSale: false
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== '' && v !== false && v !== 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search for bikes, parts, accessories, brands..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <Loader className="w-5 h-5 text-orange-600 animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-6 py-4 rounded-xl border-2 transition-colors flex items-center gap-2 ${
              showAdvancedFilters
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  <option value="Bicycles">Bicycles</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Parts">Parts</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (KSh)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (KSh)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="500000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Locations</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kisumu">Kisumu</option>
                  <option value="Nakuru">Nakuru</option>
                </select>
              </div>

              {/* Seller */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seller
                </label>
                <input
                  type="text"
                  value={filters.seller}
                  onChange={(e) => handleFilterChange('seller', e.target.value)}
                  placeholder="Seller name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="0">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.freeShipping}
                    onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Free Shipping</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-96 overflow-y-auto z-40"
          >
            {searchQuery.trim().length === 0 ? (
              <div className="p-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-700">Recent Searches</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <h4 className="text-sm font-semibold text-gray-700">Trending Searches</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(term)}
                        className="px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-700 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(tag)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                      {searchResults.length} Results Found
                    </h4>
                    {searchResults.map(product => (
                      <a
                        key={product.id}
                        href={`#product-${product.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">
                            {product.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{product.category}</span>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{product.seller}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-gray-900">
                              KSh {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                KSh {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                            {product.freeShipping && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Free Shipping
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No products found matching your search.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Try clearing filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Active Filters ({activeFiltersCount})
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                Category: {filters.category}
                <button onClick={() => handleFilterChange('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.minPrice && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                Min: KSh {filters.minPrice}
                <button onClick={() => handleFilterChange('minPrice', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                Max: KSh {filters.maxPrice}
                <button onClick={() => handleFilterChange('maxPrice', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.location && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                Location: {filters.location}
                <button onClick={() => handleFilterChange('location', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.inStock && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                In Stock
                <button onClick={() => handleFilterChange('inStock', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.freeShipping && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                Free Shipping
                <button onClick={() => handleFilterChange('freeShipping', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.onSale && (
              <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 flex items-center gap-1">
                On Sale
                <button onClick={() => handleFilterChange('onSale', false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;