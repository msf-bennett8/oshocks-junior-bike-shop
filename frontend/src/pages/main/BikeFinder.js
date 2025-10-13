import React, { useState, useEffect, useCallback } from 'react';
import { Search, Bike, Filter, X, Users, Mountain, Zap, Baby, Heart, ShoppingCart, Star, TrendingUp, CheckCircle, AlertCircle, Sliders, Truck, Shield, RotateCcw } from 'lucide-react';

const BikeFinder = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedSize, setSelectedSize] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const [filteredBikes, setFilteredBikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bike categories with icons
  const categories = [
    { id: 'all', name: 'All Bikes', icon: Bike, count: 150 },
    { id: 'kids', name: "Kids' Bikes", icon: Baby, count: 45 },
    { id: 'mountain', name: 'Mountain Bikes', icon: Mountain, count: 38 },
    { id: 'road', name: 'Road Bikes', icon: Bike, count: 28 },
    { id: 'electric', name: 'Electric Bikes', icon: Zap, count: 22 },
    { id: 'bmx', name: 'BMX', icon: Users, count: 17 }
  ];

  // Popular brands
  const brands = [
    'All Brands',
    'Trek',
    'Giant',
    'Specialized',
    'Cannondale',
    'Scott',
    'Merida',
    'Raleigh',
    'Mongoose',
    'Schwinn',
    'Huffy'
  ];

  // Bike sizes
  const sizes = [
    { id: 'all', label: 'All Sizes' },
    { id: '12', label: '12" (2-4 years)' },
    { id: '16', label: '16" (4-6 years)' },
    { id: '20', label: '20" (6-9 years)' },
    { id: '24', label: '24" (9-12 years)' },
    { id: 'xs', label: 'XS (Adult)' },
    { id: 's', label: 'S (Adult)' },
    { id: 'm', label: 'M (Adult)' },
    { id: 'l', label: 'L (Adult)' },
    { id: 'xl', label: 'XL (Adult)' }
  ];

  // Features/Filters
  const features = [
    'Disc Brakes',
    'Suspension',
    'Gears (21+)',
    'Lightweight Frame',
    'Quick Release',
    'Kickstand Included',
    'Training Wheels',
    'Front Basket',
    'Rear Rack',
    'Fenders'
  ];

  // Sample bike data
  const bikes = [
    {
      id: 1,
      name: 'Trek Precaliber 16',
      category: 'kids',
      brand: 'Trek',
      price: 18500,
      originalPrice: 22000,
      size: '16',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500',
      rating: 4.8,
      reviews: 127,
      inStock: true,
      features: ['Training Wheels', 'Kickstand Included', 'Front Basket'],
      description: 'Perfect starter bike for young riders aged 4-6 years',
      isNew: false,
      isBestseller: true,
      discount: 16
    },
    {
      id: 2,
      name: 'Giant Talon 2 29er',
      category: 'mountain',
      brand: 'Giant',
      price: 65000,
      originalPrice: 75000,
      size: 'm',
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500',
      rating: 4.9,
      reviews: 203,
      inStock: true,
      features: ['Disc Brakes', 'Suspension', 'Gears (21+)', 'Lightweight Frame'],
      description: 'Premium mountain bike for serious trail riders',
      isNew: true,
      isBestseller: true,
      discount: 13
    },
    {
      id: 3,
      name: 'Specialized Sirrus X 2.0',
      category: 'road',
      brand: 'Specialized',
      price: 58000,
      originalPrice: 58000,
      size: 'l',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500',
      rating: 4.7,
      reviews: 156,
      inStock: true,
      features: ['Disc Brakes', 'Gears (21+)', 'Lightweight Frame', 'Rear Rack'],
      description: 'Versatile fitness bike for urban commuting',
      isNew: false,
      isBestseller: false,
      discount: 0
    },
    {
      id: 4,
      name: 'Cannondale Quick Neo',
      category: 'electric',
      brand: 'Cannondale',
      price: 125000,
      originalPrice: 140000,
      size: 'm',
      image: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=500',
      rating: 4.9,
      reviews: 89,
      inStock: true,
      features: ['Disc Brakes', 'Lightweight Frame', 'Rear Rack', 'Fenders'],
      description: 'Electric assist bike for effortless riding',
      isNew: true,
      isBestseller: true,
      discount: 11
    },
    {
      id: 5,
      name: 'Mongoose Legion L20',
      category: 'bmx',
      brand: 'Mongoose',
      price: 24500,
      originalPrice: 28000,
      size: '20',
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500',
      rating: 4.6,
      reviews: 94,
      inStock: true,
      features: ['Lightweight Frame', 'Quick Release'],
      description: 'Street-ready BMX for tricks and stunts',
      isNew: false,
      isBestseller: false,
      discount: 13
    },
    {
      id: 6,
      name: 'Schwinn Koen 20"',
      category: 'kids',
      brand: 'Schwinn',
      price: 15500,
      originalPrice: 15500,
      size: '20',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      rating: 4.5,
      reviews: 112,
      inStock: true,
      features: ['Kickstand Included', 'Front Basket', 'Training Wheels'],
      description: 'Classic design for growing kids aged 6-9',
      isNew: false,
      isBestseller: false,
      discount: 0
    },
    {
      id: 7,
      name: 'Scott Aspect 970',
      category: 'mountain',
      brand: 'Scott',
      price: 72000,
      originalPrice: 85000,
      size: 'l',
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=500',
      rating: 4.8,
      reviews: 178,
      inStock: false,
      features: ['Disc Brakes', 'Suspension', 'Gears (21+)', 'Quick Release'],
      description: 'Competition-ready mountain bike',
      isNew: false,
      isBestseller: true,
      discount: 15
    },
    {
      id: 8,
      name: 'Huffy Nel Lusso 24"',
      category: 'kids',
      brand: 'Huffy',
      price: 19500,
      originalPrice: 22500,
      size: '24',
      image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500',
      rating: 4.4,
      reviews: 86,
      inStock: true,
      features: ['Front Basket', 'Kickstand Included', 'Rear Rack'],
      description: 'Stylish cruiser for pre-teens',
      isNew: false,
      isBestseller: false,
      discount: 13
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      applyFilters();
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedBrand, priceRange, selectedSize, searchQuery, selectedFeatures, sortBy]);

  const applyFilters = () => {
    let filtered = [...bikes];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bike => bike.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(bike => bike.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Price range filter
    filtered = filtered.filter(bike => 
      bike.price >= priceRange[0] && bike.price <= priceRange[1]
    );

    // Size filter
    if (selectedSize !== 'all') {
      filtered = filtered.filter(bike => bike.size === selectedSize);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(bike =>
        bike.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bike.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Features filter
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter(bike =>
        selectedFeatures.every(feature => bike.features.includes(feature))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default: // popularity
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredBikes(filtered);
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleWishlist = (bikeId) => {
    setWishlist(prev =>
      prev.includes(bikeId)
        ? prev.filter(id => id !== bikeId)
        : [...prev, bikeId]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange([0, 100000]);
    setSelectedSize('all');
    setSearchQuery('');
    setSelectedFeatures([]);
    setSortBy('popularity');
  };

  const formatPrice = (price) => {
    return `KES ${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Finding the perfect bikes for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <Bike className="w-12 h-12 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold">Bike Finder</h1>
          </div>
          <p className="text-center text-blue-100 text-lg mb-6">
            Find Your Perfect Ride - Browse {bikes.length}+ Bikes
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by brand, model, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs opacity-75">({category.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand === 'All Brands' ? 'all' : brand.toLowerCase()}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Features Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Features
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              <div className="pt-6 border-t border-gray-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Sliders className="w-4 h-4" />
                    Filters
                  </button>
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredBikes.length}</span> bikes found
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    Sort by:
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                      <option value="discount">Best Discount</option>
                    </select>
                  </label>

                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'all' || selectedBrand !== 'all' || selectedFeatures.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory('all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand('all')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedFeatures.map(feature => (
                    <span key={feature} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {feature}
                      <button onClick={() => toggleFeature(feature)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bike Grid */}
            {filteredBikes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bikes found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredBikes.map((bike) => (
                  <div key={bike.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Image */}
                    <div className="relative">
                      <img
                        src={bike.image}
                        alt={bike.name}
                        className="w-full h-64 object-cover"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {bike.isNew && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                            NEW
                          </span>
                        )}
                        {bike.isBestseller && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            BESTSELLER
                          </span>
                        )}
                        {bike.discount > 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            -{bike.discount}%
                          </span>
                        )}
                      </div>
                      {/* Wishlist */}
                      <button
                        onClick={() => toggleWishlist(bike.id)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart
                          className={`w-5 h-5 ${wishlist.includes(bike.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                      {/* Stock Status */}
                      {!bike.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="px-4 py-2 bg-red-600 text-white font-semibold rounded">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Brand & Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 uppercase">
                          {bike.brand}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {bike.category}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {bike.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3">
                        {bike.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(bike.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {bike.rating} ({bike.reviews})
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {bike.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {feature}
                          </span>
                        ))}
                        {bike.features.length > 3 && (
                          <span className="px-2 py-1 text-blue-600 text-xs">
                            +{bike.features.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(bike.price)}
                          </div>
                          {bike.originalPrice > bike.price && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(bike.originalPrice)}
                            </div>
                          )}
                        </div>
                        <button
                          disabled={!bike.inStock}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                            bike.inStock
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredBikes.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    3
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white border-t border-gray-200 py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-600">All bikes inspected and certified</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">Within Nairobi on orders over KES 10,000</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Warranty Protected</h3>
              <p className="text-sm text-gray-600">6-12 months warranty on all bikes</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-sm text-gray-600">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-blue-100 mb-6">
            Our expert team is here to help you find the perfect bike for your needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Chat with Expert
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Bike Size Guide
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Compare Bikes
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Exclusive Deals</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for special offers and new arrivals
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Oshocks Junior Bike Shop. All rights reserved. Kenya's Premier Cycling Marketplace.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="/about" className="hover:text-white transition-colors">About Us</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            <a href="/shipping-policy" className="hover:text-white transition-colors">Shipping</a>
            <a href="/return-policy" className="hover:text-white transition-colors">Returns</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BikeFinder;