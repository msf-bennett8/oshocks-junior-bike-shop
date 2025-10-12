import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Star, ShoppingCart, Heart, Package, Wrench, Zap, Shield, TrendingUp, SlidersHorizontal, X } from 'lucide-react';

const SparePartsAndAccessories = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Mock data - Replace with API calls
  const categories = [
    { id: 'all', name: 'All Products', icon: Package, count: 247 },
    { id: 'brakes', name: 'Brakes & Components', icon: Shield, count: 45 },
    { id: 'drivetrain', name: 'Drivetrain', icon: Zap, count: 62 },
    { id: 'wheels', name: 'Wheels & Tires', icon: TrendingUp, count: 38 },
    { id: 'handlebars', name: 'Handlebars & Grips', icon: Wrench, count: 28 },
    { id: 'saddles', name: 'Saddles & Seatposts', icon: Package, count: 31 },
    { id: 'pedals', name: 'Pedals', icon: Package, count: 24 },
    { id: 'lights', name: 'Lights & Reflectors', icon: Zap, count: 19 }
  ];

  const brands = [
    'Shimano', 'SRAM', 'Campagnolo', 'Continental', 'Michelin', 
    'Maxxis', 'Park Tool', 'Topeak', 'Knog', 'Cateye'
  ];

  const products = [
    {
      id: 1,
      name: 'Shimano Deore XT M8100 12-Speed Cassette',
      category: 'drivetrain',
      brand: 'Shimano',
      price: 12500,
      originalPrice: 15000,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      rating: 4.8,
      reviews: 124,
      inStock: true,
      stockCount: 15,
      compatibility: 'MTB, 12-speed',
      weight: '461g',
      featured: true,
      tags: ['bestseller', 'premium']
    },
    {
      id: 2,
      name: 'Hydraulic Disc Brake Set - Front & Rear',
      category: 'brakes',
      brand: 'Shimano',
      price: 8900,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      rating: 4.6,
      reviews: 89,
      inStock: true,
      stockCount: 8,
      compatibility: 'Universal',
      weight: '850g',
      featured: false,
      tags: ['new-arrival']
    },
    {
      id: 3,
      name: 'Continental Grand Prix 5000 Tire 700x25c',
      category: 'wheels',
      brand: 'Continental',
      price: 4200,
      originalPrice: 5000,
      image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400',
      rating: 4.9,
      reviews: 256,
      inStock: true,
      stockCount: 32,
      compatibility: 'Road bikes',
      weight: '230g',
      featured: true,
      tags: ['bestseller', 'top-rated']
    },
    {
      id: 4,
      name: 'Ergonomic Bike Saddle - Gel Padded',
      category: 'saddles',
      brand: 'Topeak',
      price: 2800,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
      rating: 4.4,
      reviews: 67,
      inStock: true,
      stockCount: 21,
      compatibility: 'Universal',
      weight: '325g',
      featured: false,
      tags: ['comfort']
    },
    {
      id: 5,
      name: 'USB Rechargeable LED Bike Light Set',
      category: 'lights',
      brand: 'Knog',
      price: 1500,
      originalPrice: 2000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      rating: 4.7,
      reviews: 143,
      inStock: true,
      stockCount: 45,
      compatibility: 'Universal',
      weight: '120g',
      featured: true,
      tags: ['bestseller', 'eco-friendly']
    },
    {
      id: 6,
      name: 'Aluminum Alloy Platform Pedals',
      category: 'pedals',
      brand: 'Shimano',
      price: 3200,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      rating: 4.5,
      reviews: 92,
      inStock: true,
      stockCount: 18,
      compatibility: 'MTB/BMX',
      weight: '380g',
      featured: false,
      tags: ['durable']
    },
    {
      id: 7,
      name: 'Carbon Fiber Handlebar 720mm',
      category: 'handlebars',
      brand: 'SRAM',
      price: 6500,
      originalPrice: 7800,
      image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
      rating: 4.6,
      reviews: 54,
      inStock: true,
      stockCount: 9,
      compatibility: 'MTB',
      weight: '185g',
      featured: false,
      tags: ['lightweight', 'premium']
    },
    {
      id: 8,
      name: 'Bike Chain - 116 Links',
      category: 'drivetrain',
      brand: 'Shimano',
      price: 1800,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
      rating: 4.7,
      reviews: 178,
      inStock: true,
      stockCount: 67,
      compatibility: '11-speed',
      weight: '256g',
      featured: false,
      tags: ['essential']
    },
    {
      id: 9,
      name: 'Mountain Bike Tire 27.5" x 2.35"',
      category: 'wheels',
      brand: 'Maxxis',
      price: 3500,
      originalPrice: 4200,
      image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=400',
      rating: 4.8,
      reviews: 201,
      inStock: true,
      stockCount: 28,
      compatibility: 'MTB',
      weight: '890g',
      featured: true,
      tags: ['bestseller', 'all-terrain']
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return b.reviews - a.reviews;
    }
  });

  const toggleWishlist = (id) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange([0, 50000]);
    setSortBy('popular');
  };

  const ProductCard = ({ product, view }) => {
    const isGrid = view === 'grid';
    
    return (
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden ${
          isGrid ? '' : 'flex gap-4'
        }`}
        onMouseEnter={() => setHoveredProduct(product.id)}
        onMouseLeave={() => setHoveredProduct(null)}
      >
        <div className={`relative ${isGrid ? 'w-full' : 'w-48 flex-shrink-0'}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`${isGrid ? 'w-full h-56' : 'w-full h-full'} object-cover`}
          />
          
          {product.tags.includes('bestseller') && (
            <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
              Bestseller
            </div>
          )}
          
          {product.originalPrice && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}

          <button
            onClick={() => toggleWishlist(product.id)}
            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        <div className={`p-4 ${isGrid ? '' : 'flex-1'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {product.brand}
            </span>
            {product.inStock ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                In Stock ({product.stockCount})
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Out of Stock
              </span>
            )}
          </div>

          <h3 className={`font-semibold mb-2 ${isGrid ? 'line-clamp-2 h-12' : ''}`}>
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {product.rating} ({product.reviews})
            </span>
          </div>

          <div className={`mb-3 ${isGrid ? 'space-y-1' : 'grid grid-cols-2 gap-2'}`}>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Package className="w-3 h-3" />
              {product.compatibility}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="w-3 h-3" />
              {product.weight}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-orange-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className={`flex gap-2 ${isGrid ? '' : 'mt-4'}`}>
            <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Spare Parts & Accessories</h1>
          <p className="text-orange-100">Quality components for every ride</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and View Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search parts, accessories, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Reset
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === cat.id
                          ? 'bg-orange-50 text-orange-600 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Brands</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-orange-50 text-orange-600 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    All Brands
                  </button>
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBrand === brand
                          ? 'bg-orange-50 text-orange-600 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{sortedProducts.length}</span> products
              </p>
            </div>

            {sortedProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} view={viewMode} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartsAndAccessories;