import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Grid, List, Star, ShoppingCart, Heart, X } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const productsPerPage = 12;

  // Mock product data - Replace with API call to your Laravel backend
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'Mountain Bike Pro X500',
        category: 'bicycles',
        price: 45000,
        originalPrice: 55000,
        rating: 4.5,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400',
        seller: 'Oshocks Junior',
        inStock: true,
        featured: true,
        description: 'Professional mountain bike with 21-speed gear system'
      },
      {
        id: 2,
        name: 'Road Racing Bike Elite',
        category: 'bicycles',
        price: 65000,
        originalPrice: null,
        rating: 4.8,
        reviews: 95,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400',
        seller: 'Oshocks Junior',
        inStock: true,
        featured: true,
        description: 'Lightweight carbon fiber road bike for speed enthusiasts'
      },
      {
        id: 3,
        name: 'Kids Bicycle 16" Rainbow',
        category: 'bicycles',
        price: 12500,
        originalPrice: 15000,
        rating: 4.6,
        reviews: 203,
        image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400',
        seller: 'BikeWorld Kenya',
        inStock: true,
        featured: false,
        description: 'Colorful and safe bicycle for children aged 4-7'
      },
      {
        id: 4,
        name: 'Professional Bike Helmet',
        category: 'accessories',
        price: 3500,
        originalPrice: null,
        rating: 4.7,
        reviews: 456,
        image: 'https://images.unsplash.com/photo-1562438120-3f78a7d69a50?w=400',
        seller: 'Oshocks Junior',
        inStock: true,
        featured: false,
        description: 'Certified safety helmet with adjustable fit system'
      },
      {
        id: 5,
        name: 'Hydraulic Disc Brakes Set',
        category: 'parts',
        price: 8500,
        originalPrice: 10000,
        rating: 4.9,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        seller: 'Oshocks Junior',
        inStock: true,
        featured: true,
        description: 'High-performance hydraulic disc brake system'
      },
      {
        id: 6,
        name: 'LED Bike Light Set',
        category: 'accessories',
        price: 2500,
        originalPrice: null,
        rating: 4.4,
        reviews: 312,
        image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=400',
        seller: 'Cycle Accessories KE',
        inStock: true,
        featured: false,
        description: 'Front and rear LED lights with multiple modes'
      },
      {
        id: 7,
        name: 'Bike Repair Tool Kit',
        category: 'accessories',
        price: 4200,
        originalPrice: 5000,
        rating: 4.6,
        reviews: 178,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400',
        seller: 'Oshocks Junior',
        inStock: true,
        featured: false,
        description: 'Complete 16-piece professional tool kit'
      },
      {
        id: 8,
        name: 'Carbon Fiber Water Bottle Cage',
        category: 'accessories',
        price: 1800,
        originalPrice: null,
        rating: 4.3,
        reviews: 267,
        image: 'https://images.unsplash.com/photo-1523516845897-e0c5e0c47b0b?w=400',
        seller: 'BikeWorld Kenya',
        inStock: false,
        featured: false,
        description: 'Lightweight and durable bottle holder'
      }
    ];

    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy, products]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product) => {
    // Implement cart logic - typically dispatch to Redux/Context
    console.log('Added to cart:', product);
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for bikes, parts, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 lg:hidden"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-white'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="space-y-2">
                  {['all', 'bicycles', 'accessories', 'parts'].map(cat => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Price Range (KSh)</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>KSh 0</span>
                    <span>KSh {priceRange.max.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <h4 className="font-semibold mb-3">Availability</h4>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                  <span className="ml-2">In Stock Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {currentProducts.map(product => (
                    <div
                      key={product.id}
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                        viewMode === 'list' ? 'flex gap-4 p-4' : 'overflow-hidden'
                      }`}
                    >
                      <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : 'relative'}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className={`w-full object-cover ${viewMode === 'list' ? 'h-48 rounded' : 'h-56'}`}
                        />
                        {product.featured && (
                          <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                        >
                          <Heart
                            className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                          />
                        </button>
                      </div>

                      <div className={viewMode === 'list' ? 'flex-1 flex flex-col' : 'p-4'}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-orange-600 cursor-pointer">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.seller}</p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex">
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

                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              KSh {product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                KSh {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`flex gap-2 ${viewMode === 'list' ? 'mt-auto' : ''}`}>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                              product.inStock
                                ? 'bg-orange-600 text-white hover:bg-orange-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-orange-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductList;