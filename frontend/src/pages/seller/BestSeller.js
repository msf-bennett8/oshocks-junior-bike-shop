import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Grid3x3, LayoutGrid, Heart, ShoppingCart, Star, TrendingUp, Eye, ChevronDown, X, Filter } from 'lucide-react';

const BestSeller = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('sales');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minRating, setMinRating] = useState(0);

  // Mock bestseller products data
  const mockProducts = [
    {
      id: 1,
      name: 'Mountain King Pro 29"',
      category: 'Mountain Bikes',
      brand: 'Trek',
      price: 125000,
      originalPrice: 150000,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      rating: 4.8,
      reviews: 234,
      sales: 1250,
      inStock: true,
      discount: 17,
      features: ['29" Wheels', 'Carbon Frame', 'Shimano Deore']
    },
    {
      id: 2,
      name: 'City Cruiser Elite',
      category: 'City Bikes',
      brand: 'Giant',
      price: 45000,
      originalPrice: 55000,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
      rating: 4.6,
      reviews: 189,
      sales: 980,
      inStock: true,
      discount: 18,
      features: ['Comfortable Seat', '7-Speed', 'City Design']
    },
    {
      id: 3,
      name: 'Road Racer X1',
      category: 'Road Bikes',
      brand: 'Specialized',
      price: 185000,
      originalPrice: 220000,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      rating: 4.9,
      reviews: 456,
      sales: 1560,
      inStock: true,
      discount: 16,
      features: ['Carbon Fiber', 'Aero Design', '22-Speed']
    },
    {
      id: 4,
      name: 'Kids BMX Champion',
      category: 'Kids Bikes',
      brand: 'Mongoose',
      price: 28000,
      originalPrice: 35000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      rating: 4.7,
      reviews: 312,
      sales: 1120,
      inStock: true,
      discount: 20,
      features: ['Durable Frame', 'Training Wheels', 'Safety Grips']
    },
    {
      id: 5,
      name: 'Electric Commuter Pro',
      category: 'E-Bikes',
      brand: 'Rad Power',
      price: 295000,
      originalPrice: 350000,
      image: 'https://images.unsplash.com/photo-1591993715414-b2f1e8ff4fc6?w=400',
      rating: 4.8,
      reviews: 198,
      sales: 850,
      inStock: true,
      discount: 16,
      features: ['750W Motor', '60km Range', 'LCD Display']
    },
    {
      id: 6,
      name: 'Hybrid Pathfinder',
      category: 'Hybrid Bikes',
      brand: 'Cannondale',
      price: 95000,
      originalPrice: 110000,
      image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400',
      rating: 4.5,
      reviews: 167,
      sales: 720,
      inStock: true,
      discount: 14,
      features: ['Versatile Design', 'Disc Brakes', '21-Speed']
    },
    {
      id: 7,
      name: 'Fat Tire Explorer',
      category: 'Fat Bikes',
      brand: 'Surly',
      price: 155000,
      originalPrice: 180000,
      image: 'https://images.unsplash.com/photo-1475666675596-cca2035b3d79?w=400',
      rating: 4.6,
      reviews: 143,
      sales: 650,
      inStock: true,
      discount: 14,
      features: ['4" Wide Tires', 'All-Terrain', 'Steel Frame']
    },
    {
      id: 8,
      name: 'Folding Compact 20"',
      category: 'Folding Bikes',
      brand: 'Dahon',
      price: 65000,
      originalPrice: 75000,
      image: 'https://images.unsplash.com/photo-1511994714008-b6fa96f075e7?w=400',
      rating: 4.4,
      reviews: 201,
      sales: 890,
      inStock: true,
      discount: 13,
      features: ['Folds in Seconds', 'Portable', 'Lightweight']
    }
  ];

  const categories = ['all', 'Mountain Bikes', 'Road Bikes', 'City Bikes', 'E-Bikes', 'Kids Bikes', 'Hybrid Bikes', 'Fat Bikes', 'Folding Bikes'];
  const brands = ['Trek', 'Giant', 'Specialized', 'Mongoose', 'Rad Power', 'Cannondale', 'Surly', 'Dahon'];
  const sortOptions = [
    { value: 'sales', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'discount', label: 'Biggest Discount' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, selectedCategory, priceRange, sortBy, selectedBrands, minRating, products]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Price range filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'sales':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 500000]);
    setSelectedBrands([]);
    setMinRating(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bestsellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Best Sellers</h1>
          </div>
          <p className="text-orange-100 text-lg">Top-rated bikes loved by our customers</p>
          <div className="mt-4 flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {products.reduce((sum, p) => sum + p.sales, 0).toLocaleString()} sold
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              Highly rated products
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bestsellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="5000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatPrice(0)}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brands
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 0].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                          {rating > 0 ? (
                            <>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{rating}+</span>
                            </>
                          ) : (
                            <span className="text-sm">All Ratings</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredProducts.length} of {products.length} bestsellers
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-lg transition group ${
                  viewMode === 'list' ? 'flex gap-4' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-48 h-48' : 'h-64'
                }`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                      -{product.discount}%
                    </div>
                  )}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishlist.includes(product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {product.sales} sold
                  </div>
                </div>

                {/* Product Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
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
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      <Eye className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Badge */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-orange-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:scale-110 transition">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BestSeller;