import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { items: products, categories, loading, error, pagination } = useSelector(
    (state) => state.products
  );

  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'latest',
    page: 1,
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const [loadedImages, setLoadedImages] = useState(new Set());

  const handleImageLoad = (productId) => {
    setLoadedImages(prev => new Set([...prev, productId]));
  };

  // Helper function to safely extract error messages
  const getErrorMessage = (error) => {
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.exception) return error.exception;
    if (error.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred. Please try again.';
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    // Always fetch products with replace: true to show only current page
    dispatch(fetchProducts({ ...filters, replace: true }));
  }, [dispatch, filters]);

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({ ...prev, category: categoryId, page: 1 }));
    setShowCategoryModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({ ...prev, sort: sortValue, page: 1 }));
    setShowSortModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryName = () => {
    if (!filters.category) return 'All Categories';
    const category = categories?.find(cat => cat.id === filters.category);
    return category ? category.name : 'All Categories';
  };

  const getSortName = () => {
    const sortOptions = {
      'latest': 'Latest',
      'price_low': 'Price: Low to High',
      'price_high': 'Price: High to Low',
      'popular': 'Most Popular'
    };
    return sortOptions[filters.sort] || 'Latest';
  };

  // Show full skeleton only on initial load
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen py-4 md:py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="mb-4 md:mb-8">
            <div className="h-8 md:h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Mobile Filter Bar Skeleton */}
          <div className="lg:hidden mb-4 space-y-3">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar Skeleton */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ProductCardSkeleton key={i} delay={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
          <p className="text-sm text-gray-500 mb-4">
            Please check your backend connection at:<br />
            <code className="bg-gray-100 px-2 py-1 rounded">https://oshocks-junior-bike-shop-backend.onrender.com/api/v1</code>
          </p>
          <button 
            onClick={() => {
              dispatch(fetchCategories());
              dispatch(fetchProducts(filters));
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 md:py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Shop Bicycles & Accessories</h1>
          <p className="text-gray-600 text-sm md:text-base">
            {loading ? (
              <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse"></span>
            ) : (
              <>Showing {products.length} {pagination?.total ? `of ${pagination.total}` : ''} products</>
            )}
          </p>
        </div>

        {/* Mobile Filter Bar */}
        <div className="lg:hidden mb-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="font-medium text-sm">Categories</span>
              <span className="text-xs text-purple-600 font-semibold truncate ml-2">{getCategoryName()}</span>
            </button>
            
            <button
              onClick={() => setShowSortModal(true)}
              className="flex-1 flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-xs text-purple-600 font-semibold truncate ml-2">{getSortName()}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md sticky top-24" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Filters</h2>
              </div>
              
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                <div className="p-6">
                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleCategoryChange('')}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                          filters.category === '' 
                            ? 'bg-purple-600 text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        All Categories
                      </button>
                      {!categories || categories.length === 0 ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.category === category.id 
                                ? 'bg-purple-600 text-white' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    >
                      <option value="latest">Latest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 && !loading ? (
              <div className="bg-white rounded-lg shadow-md text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No Products Found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    // Show skeletons during loading
                    [1, 2, 3, 4, 5, 6].map(i => (
                      <ProductCardSkeleton key={`skeleton-${i}`} delay={i} />
                    ))
                  ) : (
                    // Show actual products
                    products.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product}
                        onImageLoad={() => handleImageLoad(product.id)}
                        isImageLoaded={loadedImages.has(product.id)}
                      />
                    ))
                  )}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && !loading && (
                  <div className="flex justify-center mt-8 gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className={`px-4 py-2 rounded-lg border transition ${
                        filters.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (filters.page <= 3) {
                        page = i + 1;
                      } else if (filters.page >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = filters.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg border transition ${
                            page === filters.page
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.totalPages}
                      className={`px-4 py-2 rounded-lg border transition ${
                        filters.page === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Pagination Skeleton */}
                {loading && pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal (Mobile) */}
      {showCategoryModal && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-bold">Categories</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  filters.category === '' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {!categories || categories.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      filters.category === category.id 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sort Modal (Mobile) */}
      {showSortModal && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Sort By</h3>
              <button 
                onClick={() => setShowSortModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {[
                { value: 'latest', label: 'Latest' },
                { value: 'price_low', label: 'Price: Low to High' },
                { value: 'price_high', label: 'Price: High to Low' },
                { value: 'popular', label: 'Most Popular' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    filters.sort === option.value 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Product Card Skeleton Component with staggered animation
const ProductCardSkeleton = ({ delay = 0 }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      style={{ animationDelay: `${delay * 50}ms` }}
    >
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse"></div>
      
      <div className="p-4 space-y-3">
        {/* Title skeleton - 2 lines to match min-h-[3.5rem] */}
        <div className="space-y-2 min-h-[3.5rem]">
          <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
        </div>
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        
        {/* Stock badge skeleton */}
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        
        {/* Brand skeleton */}
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onImageLoad, isImageLoaded }) => {
  const { addToCart, loading: cartLoading } = useCart();
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Check if product is in wishlist
  const inWishlist = isInWishlist(product.id, product.variants?.[0]?.id || product.colors?.[0]?.id);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    setIsAdding(true);
    
    try {
      // Check if product has variants
      const variant = product.variants?.[0] || product.colors?.[0];
      
      const result = await addToCart(product, 1, variant);
      
      if (result.success) {
        // Optional: Show success toast/notification
        alert('✅ Added to cart!');
      } else {
        alert('❌ ' + result.error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Product Image */}
      <div className="relative pb-[75%] overflow-hidden bg-gray-100">
        {product.image_url || product.images?.[0]?.image_url ? (
          <>
            {/* Thumbnail - loads first, blurred */}
            {!isImageLoaded && (product.images?.[0]?.thumbnail_url || product.image_url) && (
              <img
                src={product.images?.[0]?.thumbnail_url || product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover blur-sm"
              />
            )}
            {/* Full resolution - loads after, crisp */}
            <img
              src={product.images?.[0]?.image_url || product.image_url}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={onImageLoad}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">🚴</div>';
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">
            🚴
          </div>
        )}

        {/* Badges - Top Left */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-2">
          {product.is_new_arrival && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">NEW</span>
          )}
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
              -{Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Featured Badge - Top Right (below wishlist) */}
        {product.is_featured && (
          <span className="absolute top-16 sm:top-20 right-2 sm:right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
            ⭐ Featured
          </span>
        )}

        {/* Wishlist Heart - Top Right Corner (like ProductDetails) */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            setIsTogglingWishlist(true);
            
            try {
              const variant = product.variants?.[0] || product.colors?.[0];
              const result = await toggleWishlist(product, variant);
              
              if (!result.success) {
                alert('❌ ' + result.error);
              }
            } catch (error) {
              console.error('Error toggling wishlist:', error);
              alert('❌ Failed to update wishlist');
            } finally {
              setIsTogglingWishlist(false);
            }
          }}
          disabled={isTogglingWishlist}
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-lg z-10 ${
            inWishlist
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:text-red-600 hover:bg-red-50'
          } ${isTogglingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isTogglingWishlist ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6" 
              fill={inWishlist ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        
        {/* Rating */}
        {(product.rating || product.reviews_count) && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400 text-sm">
              {'⭐'.repeat(Math.round(product.rating || 4))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviews_count || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-bold text-purple-600">
            KSh {Number(product.price).toLocaleString()}
          </span>
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="text-sm text-gray-400 line-through">
              KSh {Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-3">
          {product.quantity !== undefined && (
            <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
              product.quantity > 10 
                ? 'bg-green-100 text-green-800' 
                : product.quantity > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.quantity > 10 
                ? 'In Stock' 
                : product.quantity > 0
                ? `Only ${product.quantity} left!`
                : 'Out of Stock'
              }
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0 || isAdding}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
              product.quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : product.quantity === 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* Buy Now / Checkout Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (product.quantity === 0) {
                alert('❌ Product is out of stock');
                return;
              }
              
              // Add to cart first, then go to checkout
              handleAddToCart(e);
              
              // Navigate to checkout after a brief delay
              setTimeout(() => {
                window.location.href = '/checkout';
              }, 500);
            }}
            disabled={product.quantity === 0}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
              product.quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Buy Now</span>
          </button>
        </div>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mt-3">
            Brand: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ShopPage; 