import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, ShoppingCart, Star, TrendingUp, Package, Shield, Truck, Search, Grid, List, SlidersHorizontal, X, ArrowRight, Zap, Award, Eye, Bell, Mail, CheckCircle, ChevronDown } from 'lucide-react';

const NewArrivalsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [filters, setFilters] = useState({
    priceRange: 'all',
    category: 'all',
    brand: 'all',
    availability: 'all'
  });

  const sampleProducts = [
    {
      id: 1,
      name: 'Trek Domane AL 2 Disc 2024',
      price: 125000,
      image: '🚴',
      category: 'Road Bikes',
      brand: 'Trek',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      stock: 8,
      rating: 4.9,
      reviews: 3,
      features: ['Carbon fork', 'Disc brakes', 'Shimano Claris'],
      colors: ['Black', 'Blue', 'Red'],
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'Just Arrived',
      trending: true
    },
    {
      id: 2,
      name: 'Specialized Rockhopper Elite 29 2024',
      price: 98000,
      image: '🚵',
      category: 'Mountain Bikes',
      brand: 'Specialized',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      stock: 12,
      rating: 4.8,
      reviews: 7,
      features: ['29" wheels', 'Air fork', 'Dropper post ready'],
      colors: ['Black', 'Green'],
      sizes: ['S', 'M', 'L'],
      badge: 'Hot Seller',
      trending: true
    },
    {
      id: 3,
      name: 'Giant Revolt Advanced 2024',
      price: 185000,
      image: '🚴',
      category: 'Gravel Bikes',
      brand: 'Giant',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      stock: 5,
      rating: 5.0,
      reviews: 2,
      features: ['Carbon frame', 'Tubeless ready', 'Gravel geometry'],
      colors: ['Silver', 'Black'],
      sizes: ['M', 'L', 'XL'],
      badge: 'New Today',
      trending: false
    },
    {
      id: 4,
      name: 'Cannondale Trail 8 2024',
      price: 72000,
      image: '🚵',
      category: 'Mountain Bikes',
      brand: 'Cannondale',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      stock: 15,
      rating: 4.6,
      reviews: 12,
      features: ['SmartForm frame', 'SR Suntour fork', '27.5" wheels'],
      colors: ['Blue', 'Orange', 'Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'Best Value',
      trending: true
    },
    {
      id: 5,
      name: 'Scott Aspect 970 2024',
      price: 89000,
      image: '🚵',
      category: 'Mountain Bikes',
      brand: 'Scott',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      stock: 10,
      rating: 4.7,
      reviews: 8,
      features: ['29" wheels', 'Syncros components', 'Internal routing'],
      colors: ['Black', 'White'],
      sizes: ['M', 'L', 'XL'],
      badge: 'Limited Stock',
      trending: false
    },
    {
      id: 6,
      name: 'Bianchi Via Nirone 7 2024',
      price: 115000,
      image: '🚴',
      category: 'Road Bikes',
      brand: 'Bianchi',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      stock: 6,
      rating: 4.8,
      reviews: 5,
      features: ['Celeste color', 'Carbon fork', 'Shimano 105'],
      colors: ['Celeste', 'Black'],
      sizes: ['S', 'M', 'L'],
      badge: 'Premium',
      trending: true
    },
    {
      id: 7,
      name: 'Trek Marlin 8 2024',
      price: 95000,
      image: '🚵',
      category: 'Mountain Bikes',
      brand: 'Trek',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      stock: 14,
      rating: 4.9,
      reviews: 15,
      features: ['RockShox fork', 'Dropper post', 'Tubeless ready'],
      colors: ['Red', 'Blue', 'Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'Customer Favorite',
      trending: true
    },
    {
      id: 8,
      name: 'Giant Contend AR 4 2024',
      price: 108000,
      image: '🚴',
      category: 'Road Bikes',
      brand: 'Giant',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      stock: 9,
      rating: 4.7,
      reviews: 6,
      features: ['Disc brakes', 'Endurance geometry', 'Shimano Tiagra'],
      colors: ['Black', 'Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'New',
      trending: false
    },
    {
      id: 9,
      name: 'Merida Big Nine 300 2024',
      price: 78000,
      image: '🚵',
      category: 'Mountain Bikes',
      brand: 'Merida',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      stock: 11,
      rating: 4.6,
      reviews: 9,
      features: ['29" wheels', 'Shimano Deore', 'Lightweight frame'],
      colors: ['Green', 'Black'],
      sizes: ['M', 'L', 'XL'],
      badge: 'New',
      trending: false
    },
    {
      id: 10,
      name: 'Specialized Allez Elite 2024',
      price: 135000,
      image: '🚴',
      category: 'Road Bikes',
      brand: 'Specialized',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      stock: 7,
      rating: 4.9,
      reviews: 4,
      features: ['E5 Premium aluminum', 'Shimano 105', 'Carbon fork'],
      colors: ['Red', 'Black', 'White'],
      sizes: ['S', 'M', 'L', 'XL'],
      badge: 'New Today',
      trending: true
    },
    {
      id: 11,
      name: 'BMX Race Pro 2024',
      price: 42000,
      image: '🚲',
      category: 'BMX Bikes',
      brand: 'Haro',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      stock: 20,
      rating: 4.5,
      reviews: 11,
      features: ['Chromoly frame', 'Race geometry', '20" wheels'],
      colors: ['Blue', 'Black', 'Yellow'],
      sizes: ['Junior', 'Expert', 'Pro'],
      badge: 'New',
      trending: false
    },
    {
      id: 12,
      name: 'Electric Bike Urban Commuter 2024',
      price: 215000,
      image: '⚡',
      category: 'Electric Bikes',
      brand: 'RadPower',
      isNew: true,
      arrivalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      stock: 4,
      rating: 5.0,
      reviews: 6,
      features: ['750W motor', '50km range', 'LCD display'],
      colors: ['Black', 'Silver'],
      sizes: ['One Size'],
      badge: 'Exclusive',
      trending: true
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      setIsLoading(false);
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, searchQuery, products]);

  const applyFilters = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.brand !== 'all') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    if (filters.priceRange !== 'all') {
      const ranges = {
        'under-50k': [0, 50000],
        '50k-100k': [50000, 100000],
        '100k-150k': [100000, 150000],
        '150k-plus': [150000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange];
      filtered = filtered.filter(product => product.price >= min && product.price < max);
    }

    if (filters.availability !== 'all') {
      if (filters.availability === 'in-stock') {
        filtered = filtered.filter(product => product.stock > 0);
      } else if (filters.availability === 'low-stock') {
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= 5);
      }
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.arrivalDate - a.arrivalDate);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
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
      brand: 'all',
      availability: 'all'
    });
    setSearchQuery('');
  };

  const handleNotifyMe = (product) => {
    setSelectedProduct(product);
    setShowNotifyModal(true);
  };

  const submitNotification = (e) => {
    e.preventDefault();
    setShowNotifyModal(false);
    setNotifyEmail('');
    alert(`You'll be notified when ${selectedProduct.name} is back in stock!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatArrivalDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const categories = ['all', 'Road Bikes', 'Mountain Bikes', 'Gravel Bikes', 'Electric Bikes', 'BMX Bikes'];
  const brands = ['all', 'Trek', 'Specialized', 'Giant', 'Cannondale', 'Scott', 'Bianchi', 'Merida', 'Haro', 'RadPower'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading new arrivals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute text-9xl top-10 right-10 animate-pulse" />
          <Sparkles className="absolute text-7xl bottom-10 left-10 animate-pulse" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold">Fresh from the Factory</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              NEW ARRIVALS 2024
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-2">
              Latest Models <span className="text-yellow-300">Just Landed</span>
            </p>
            <p className="text-xl text-blue-100 mb-6">
              Be the first to ride the newest bikes from top brands
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>Fresh Stock Weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Premium Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Full Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {products.length}
              </div>
              <div className="text-sm text-gray-600">New Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {products.filter(p => p.trending).length}
              </div>
              <div className="text-sm text-gray-600">Trending Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {brands.length - 1}
              </div>
              <div className="text-sm text-gray-600">Top Brands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-600">Authentic</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search new arrivals..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="flex-1 md:flex-initial px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> new products
            </p>
            {(filters.category !== 'all' || filters.brand !== 'all' || filters.priceRange !== 'all' || filters.availability !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
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
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Brand</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="brand"
                          checked={filters.brand === brand}
                          onChange={() => handleFilterChange('brand', brand)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === 'all'}
                        onChange={() => handleFilterChange('priceRange', 'all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Prices</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === 'under-50k'}
                        onChange={() => handleFilterChange('priceRange', 'under-50k')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Under KES 50,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '50k-100k'}
                        onChange={() => handleFilterChange('priceRange', '50k-100k')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">KES 50,000 - 100,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '100k-150k'}
                        onChange={() => handleFilterChange('priceRange', '100k-150k')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">KES 100,000 - 150,000</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange === '150k-plus'}
                        onChange={() => handleFilterChange('priceRange', '150k-plus')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">KES 150,000+</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={filters.availability === 'all'}
                        onChange={() => handleFilterChange('availability', 'all')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">All Products</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={filters.availability === 'in-stock'}
                        onChange={() => handleFilterChange('availability', 'in-stock')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="availability"
                        checked={filters.availability === 'low-stock'}
                        onChange={() => handleFilterChange('availability', 'low-stock')}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Limited Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm hover:shadow-xl transition-all overflow-hidden group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'}`}>
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-200 aspect-square flex items-center justify-center text-6xl">
                        {product.image}
                      </div>
                      
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.badge === 'New Today' ? 'bg-green-500 text-white' :
                          product.badge === 'Hot Seller' ? 'bg-red-500 text-white' :
                          product.badge === 'Just Arrived' ? 'bg-blue-500 text-white' :
                          product.badge === 'Premium' ? 'bg-purple-500 text-white' :
                          product.badge === 'Exclusive' ? 'bg-yellow-500 text-gray-900' :
                          'bg-gray-800 text-white'
                        }`}>
                          {product.badge}
                        </span>
                      </div>

                      {product.trending && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-orange-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                          </div>
                        </div>
                      )}

                      <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg opacity-0 group-hover:opacity-100">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>

                      <button className="absolute bottom-3 left-3 bg-white text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-100 transition-all shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Quick View
                      </button>
                    </div>

                    <div className="p-4 flex-1">
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-600 uppercase">{product.brand}</span>
                          <span className="text-xs text-gray-500">{formatArrivalDate(product.arrivalDate)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{product.category}</p>
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
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      <ul className="text-xs text-gray-600 mb-3 space-y-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mb-3">
                        <div className="text-xs text-gray-600 mb-1">Colors:</div>
                        <div className="flex gap-2">
                          {product.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: color.toLowerCase() === 'black' ? '#000' :
                                                color.toLowerCase() === 'white' ? '#fff' :
                                                color.toLowerCase() === 'blue' ? '#3b82f6' :
                                                color.toLowerCase() === 'red' ? '#ef4444' :
                                                color.toLowerCase() === 'green' ? '#10b981' :
                                                color.toLowerCase() === 'orange' ? '#f97316' :
                                                color.toLowerCase() === 'yellow' ? '#eab308' :
                                                color.toLowerCase() === 'silver' ? '#d1d5db' :
                                                color.toLowerCase() === 'celeste' ? '#7dd3c0' :
                                                '#6b7280'
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-1">Sizes:</div>
                        <div className="flex gap-2 flex-wrap">
                          {product.sizes.map((size, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {product.stock > 0 ? (
                            <>
                              {product.stock <= 5 ? (
                                <span className="text-xs text-orange-600 font-semibold">
                                  Only {product.stock} left in stock!
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  In Stock ({product.stock} available)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-red-600 font-semibold">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {product.stock > 0 ? (
                          <>
                            <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                              <ShoppingCart className="w-5 h-5" />
                              Add to Cart
                            </button>
                            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleNotifyMe(product)}
                            className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                          >
                            <Bell className="w-5 h-5" />
                            Notify Me
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Shop New Arrivals?
            </h2>
            <p className="text-lg text-gray-600">
              Get the latest and greatest cycling technology
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Latest Technology</h3>
              <p className="text-sm text-gray-600">
                2024 models with cutting-edge features and improvements
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Top Brands</h3>
              <p className="text-sm text-gray-600">
                Official dealers for Trek, Specialized, Giant, and more
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Full Warranty</h3>
              <p className="text-sm text-gray-600">
                Complete manufacturer warranty on all new arrivals
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">
                Free nationwide shipping on all new arrival bikes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Zap className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Be First to Know About New Arrivals
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Subscribe to get instant notifications when we add new bikes and gear
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
            />
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              Notify Me
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-4">
            Join 15,000+ cyclists getting early access to new products
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Brands
            </h2>
            <p className="text-lg text-gray-600">
              Shop the latest from world-class manufacturers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Trek', 'Specialized', 'Giant', 'Cannondale', 'Scott'].map((brand) => (
              <a
                key={brand}
                href={`/brands/${brand.toLowerCase()}`}
                className="bg-white rounded-lg p-8 text-center hover:shadow-lg transition-all group"
              >
                <div className="text-4xl mb-3">🚴</div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {brand}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <details className="bg-gray-50 rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  When do you add new products?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                We receive new stock weekly from our suppliers. Most new arrivals are added on Monday and Thursday mornings. Subscribe to our newsletter to be notified immediately when new products arrive.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Are new arrivals covered by warranty?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! All new arrival bikes come with full manufacturer warranty, typically ranging from 1-5 years depending on the brand and model. We also offer extended warranty options at checkout.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Can I pre-order upcoming models?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Absolutely! Contact our customer service team or use the "Notify Me" feature on product pages. We'll reach out when pre-orders open and reserve your bike with a small deposit.
              </p>
            </details>

            <details className="bg-gray-50 rounded-lg shadow-sm p-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <h3 className="text-lg font-semibold text-gray-900">
                  Do you offer assembly service for new bikes?
                </h3>
                <ChevronDown className="w-5 h-5 text-gray-400 transform group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! All bikes are professionally assembled and tuned before delivery at no extra cost. We also provide a free first service within 30 days of purchase to ensure everything is running perfectly.
              </p>
            </details>
          </div>
        </div>
      </div>

      {showNotifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowNotifyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
              <Bell className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Get Notified
              </h3>
              <p className="text-gray-600">
                We'll email you when <span className="font-semibold">{selectedProduct?.name}</span> is back in stock
              </p>
            </div>

            <form onSubmit={submitNotification}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Notify Me When Available
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Oshocks Junior</h3>
              <p className="text-sm mb-4">
                Kenya's premier cycling marketplace with the latest bikes and gear.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="/bikes" className="hover:text-white transition-colors">Bikes</a></li>
                <li><a href="/accessories" className="hover:text-white transition-colors">Accessories</a></li>
                <li><a href="/clearance" className="hover:text-white transition-colors">Clearance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="/returns" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="/warranty" className="hover:text-white transition-colors">Warranty</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@oshocksjunior.com
                </li>
                <li>Nairobi, Kenya</li>
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

export default NewArrivalsPage;