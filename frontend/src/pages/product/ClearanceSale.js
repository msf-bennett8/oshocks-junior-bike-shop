import React, { useState, useEffect } from 'react';
import { Tag, Heart, ShoppingCart, Filter, TrendingDown, Clock, Package, Star, ChevronDown, X, ArrowRight, Zap, Award, Shield, Truck, Search, Grid, List, SlidersHorizontal, Phone, Mail, MapPin } from 'lucide-react';

const ClearanceSalePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('discount');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    priceRange: 'all',
    category: 'all',
    discount: 'all',
    condition: 'all'
  });

  // Sample clearance products
  const sampleProducts = [
    {
      id: 1,
      name: 'Trek Marlin 5 Mountain Bike',
      originalPrice: 85000,
      salePrice: 51000,
      discount: 40,
      image: '🚵',
      category: 'Mountain Bikes',
      condition: 'New - Display Model',
      stock: 3,
      rating: 4.5,
      reviews: 24,
      features: ['27.5" wheels', 'Aluminum frame', '21-speed Shimano'],
      soldCount: 12
    },
    {
      id: 2,
      name: 'Giant Escape 3 Hybrid Bike',
      originalPrice: 65000,
      salePrice: 42250,
      discount: 35,
      image: '🚴',
      category: 'Hybrid Bikes',
      condition: 'New',
      stock: 5,
      rating: 4.3,
      reviews: 18,
      features: ['700c wheels', 'Lightweight aluminum', '21-speed'],
      soldCount: 8
    },
    {
      id: 3,
      name: 'Specialized Sirrus X 2.0',
      originalPrice: 95000,
      salePrice: 52250,
      discount: 45,
      image: '🚴',
      category: 'Fitness Bikes',
      condition: 'New - Last Season',
      stock: 2,
      rating: 4.7,
      reviews: 31,
      features: ['Future Shock suspension', 'Hydraulic disc brakes', 'Carbon fork'],
      soldCount: 15
    },
    {
      id: 4,
      name: 'BMX Freestyle Pro',
      originalPrice: 35000,
      salePrice: 21000,
      discount: 40,
      image: '🚲',
      category: 'BMX Bikes',
      condition: 'New',
      stock: 8,
      rating: 4.4,
      reviews: 12,
      features: ['20" wheels', 'Chromoly frame', '360° gyro brake'],
      soldCount: 20
    },
    {
      id: 5,
      name: "Kids' Balance Bike - Red",
      originalPrice: 12000,
      salePrice: 6000,
      discount: 50,
      image: '🚲',
      category: 'Kids Bikes',
      condition: 'New',
      stock: 10,
      rating: 4.8,
      reviews: 45,
      features: ['12" wheels', 'No pedals', 'Adjustable seat'],
      soldCount: 35
    },
    {
      id: 6,
      name: 'Road Bike Helmet - Aero',
      originalPrice: 8500,
      salePrice: 4250,
      discount: 50,
      image: '🪖',
      category: 'Helmets',
      condition: 'New',
      stock: 15,
      rating: 4.6,
      reviews: 28,
      features: ['MIPS technology', 'Aerodynamic design', 'Multiple vents'],
      soldCount: 42
    },
    {
      id: 7,
      name: 'Bike Repair Tool Kit',
      originalPrice: 5500,
      salePrice: 2750,
      discount: 50,
      image: '🔧',
      category: 'Accessories',
      condition: 'New',
      stock: 25,
      rating: 4.5,
      reviews: 67,
      features: ['15 essential tools', 'Portable case', 'Multi-tool included'],
      soldCount: 58
    },
    {
      id: 8,
      name: 'LED Bike Light Set',
      originalPrice: 3200,
      salePrice: 1600,
      discount: 50,
      image: '💡',
      category: 'Accessories',
      condition: 'New',
      stock: 30,
      rating: 4.7,
      reviews: 89,
      features: ['USB rechargeable', 'Waterproof', 'Front & rear lights'],
      soldCount: 76
    },
    {
      id: 9,
      name: 'Cycling Jersey - Pro Team',
      originalPrice: 4500,
      salePrice: 2250,
      discount: 50,
      image: '👕',
      category: 'Apparel',
      condition: 'New - Last Season',
      stock: 12,
      rating: 4.4,
      reviews: 34,
      features: ['Moisture-wicking', 'Back pockets', 'UPF 50+'],
      soldCount: 28
    },
    {
      id: 10,
      name: 'Mountain Bike Gloves',
      originalPrice: 2800,
      salePrice: 1400,
      discount: 50,
      image: '🧤',
      category: 'Apparel',
      condition: 'New',
      stock: 20,
      rating: 4.3,
      reviews: 23,
      features: ['Padded palms', 'Touchscreen compatible', 'Breathable mesh'],
      soldCount: 31
    },
    {
      id: 11,
      name: 'Bike Water Bottle & Cage',
      originalPrice: 1500,
      salePrice: 750,
      discount: 50,
      image: '🚰',
      category: 'Accessories',
      condition: 'New',
      stock: 40,
      rating: 4.6,
      reviews: 52,
      features: ['BPA-free bottle', 'Aluminum cage', '750ml capacity'],
      soldCount: 94
    },
    {
      id: 12,
      name: 'Bike Lock - Heavy Duty',
      originalPrice: 4200,
      salePrice: 2100,
      discount: 50,
      image: '🔒',
      category: 'Accessories',
      condition: 'New',
      stock: 18,
      rating: 4.8,
      reviews: 41,
      features: ['Hardened steel', 'Key & combination', 'Weather resistant'],
      soldCount: 37
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, sortBy, searchQuery, products]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        'under-5k': [0, 5000],
        '5k-20k': [5000, 20000],
        '20k-50k': [20000, 50000],
        '50k-plus': [50000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange];
      filtered = filtered.filter(product => product.salePrice >= min && product.salePrice < max);
    }

    // Discount filter
    if (filters.discount !== 'all') {
      const minDiscount = parseInt(filters.discount);
      filtered = filtered.filter(product => product.discount >= minDiscount);
    }

    // Condition filter
    if (filters.condition !== 'all') {
      filtered = filtered.filter(product => product.condition.includes(filters.condition));
    }

    // Sorting
    switch (sortBy) {
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case 'popular':
        filtered.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: 'all',
      category: 'all',
      discount: 'all',
      condition: 'all'
    });
    setSearchQuery('');
  };

  const categories = ['all', 'Mountain Bikes', 'Hybrid Bikes', 'Fitness Bikes', 'BMX Bikes', 'Kids Bikes', 'Helmets', 'Accessories', 'Apparel'];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading clearance deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-12 text-9xl font-bold -top-10 -right-10">SALE</div>
          <div className="absolute transform -rotate-12 text-9xl font-bold -bottom-10 -left-10">50%</div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4 animate-pulse">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-semibold">Limited Time Offer</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              CLEARANCE SALE
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              Up to <span className="text-yellow-300 text-5xl">50% OFF</span>
            </p>
            <p className="text-xl text-red-100 mb-6">
              Final stock clearance - Once they're gone, they're gone!
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Limited Time Only</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>While Stocks Last</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                <span>Lowest Prices Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Authentic Products</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Free Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Quality Guarantee</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Tag className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clearance items..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 md:flex-initial px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products found
            </p>
            {(filters.category !== 'all' || filters.priceRange !== 'all' || filters.discount !== 'all' || filters.condition !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="md:hidden text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category}
                          onChange={() => handleFilterChange('category', category)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === 'all'}
                        onChange={() => handleFilterChange('priceRange', 'all')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">All Prices</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === 'under-5k'}
                        onChange={() => handleFilterChange('priceRange', 'under-5k')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Under KES 5,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '5k-20k'}
                        onChange={() => handleFilterChange('priceRange', '5k-20k')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">KES 5,000 - 20,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '20k-50k'}
                        onChange={() => handleFilterChange('priceRange', '20k-50k')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">KES 20,000 - 50,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '50k-plus'}
                        onChange={() => handleFilterChange('priceRange', '50k-plus')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">KES 50,000+</span>
                    </label>
                  </div>
                </div>

                {/* Discount Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Discount</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.discount === 'all'}
                        onChange={() => handleFilterChange('discount', 'all')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">All Discounts</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.discount === '50'}
                        onChange={() => handleFilterChange('discount', '50')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">50% or more</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.discount === '40'}
                        onChange={() => handleFilterChange('discount', '40')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">40% or more</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.discount === '30'}
                        onChange={() => handleFilterChange('discount', '30')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">30% or more</span>
                    </label>
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Condition</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={filters.condition === 'all'}
                        onChange={() => handleFilterChange('condition', 'all')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">All Conditions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={filters.condition === 'New'}
                        onChange={() => handleFilterChange('condition', 'New')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">New</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={filters.condition === 'Display'}
                        onChange={() => handleFilterChange('condition', 'Display')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Display Model</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="condition"
                        checked={filters.condition === 'Last Season'}
                        onChange={() => handleFilterChange('condition', 'Last Season')}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Last Season</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'}`}>
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-square flex items-center justify-center text-6xl">
                        {product.image}
                      </div>
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </div>
                      <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-md">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                      {product.stock <= 5 && (
                        <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Only {product.stock} left!
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex-1">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">{product.category}</span>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">{product.condition}</p>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.reviews})</span>
                      </div>

                      <ul className="text-xs text-gray-600 mb-3 space-y-1">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-green-600">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-red-600">
                            {formatPrice(product.salePrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          You save {formatPrice(product.originalPrice - product.salePrice)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </button>
                        <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>

                      {product.soldCount > 10 && (
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>{product.soldCount} sold in last 7 days</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Why Shop Clearance Section */}
      <div className="bg-white py-16 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Shop Our Clearance Sale?
            </h2>
            <p className="text-lg text-gray-600">
              Massive savings on quality cycling products
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Unbeatable Prices</h3>
              <p className="text-sm text-gray-600">
                Save up to 50% on premium cycling gear and accessories
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-sm text-gray-600">
                All products are authentic and come with warranty
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">
                Enjoy free delivery on all clearance items nationwide
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Limited Stock</h3>
              <p className="text-sm text-gray-600">
                Final clearance - grab them before they're gone forever
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Don't Miss Out on Future Sales!
          </h2>
          <p className="text-lg text-red-100 mb-8">
            Subscribe to our newsletter and be the first to know about exclusive deals and clearance events
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            />
            <button className="px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
          <p className="text-sm text-red-100 mt-4">
            Join 10,000+ subscribers getting exclusive deals
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Clearance Sale FAQs
            </h2>
            <p className="text-lg text-gray-600">
              Common questions about our clearance sale
            </p>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Are clearance items covered by warranty?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! All clearance items come with the same manufacturer warranty as regular-priced products. New items have full warranty, while display models may have limited warranty terms.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Can I return clearance items?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes, our standard 14-day return policy applies to clearance items. Items must be in original condition with tags attached. Final sale items are clearly marked and cannot be returned.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  How long will the clearance sale last?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                The clearance sale runs while stocks last. Some items may sell out quickly, so we recommend purchasing soon to avoid disappointment. New clearance items are added regularly.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Do you offer free shipping on clearance items?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! We offer free nationwide delivery on all clearance items. For orders in Nairobi, delivery typically takes 1-2 business days. Other regions may take 3-5 business days.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Are clearance products authentic?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Absolutely! All our products, including clearance items, are 100% authentic and sourced directly from authorized distributors. We guarantee the quality and authenticity of every item we sell.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Oshocks Junior</h3>
              <p className="text-sm mb-4">
                Kenya's premier cycling marketplace with unbeatable clearance deals.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/bikes" className="hover:text-white transition-colors">Bikes</a></li>
                <li><a href="/accessories" className="hover:text-white transition-colors">Accessories</a></li>
                <li><a href="/clearance" className="hover:text-white transition-colors">Clearance Sale</a></li>
                <li><a href="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +254 700 000 000
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  sales@oshocksjunior.com
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Oshocks Junior Bike Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClearanceSalePage;