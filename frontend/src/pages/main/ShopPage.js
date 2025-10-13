import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../../redux/slices/productSlice';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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
  const observerTarget = useRef(null);

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
    // Only reset to page 1 when filters change (not when page increments)
    if (filters.page === 1) {
      dispatch(fetchProducts({ ...filters, replace: true }));
    } else {
      dispatch(fetchProducts({ ...filters, replace: false }));
    }
  }, [dispatch, filters]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && !loading && pagination?.hasMore) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [loading, pagination?.hasMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerTarget.current) observer.observe(observerTarget.current);
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [handleObserver]);

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
                  <ProductCardSkeleton key={i} />
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
            <code className="bg-gray-100 px-2 py-1 rounded">http://127.0.0.1:8000</code>
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
            Showing {products.length} {pagination?.total ? `of ${pagination.total}` : ''} products
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
                      {categories && categories.length > 0 ? (
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
                      ) : (
                        <p className="text-sm text-gray-500 italic">No categories available</p>
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
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  
                  {/* Loading skeletons while fetching more */}
                  {loading && products.length > 0 && (
                    <>
                      {[1, 2, 3].map(i => (
                        <ProductCardSkeleton key={`skeleton-${i}`} />
                      ))}
                    </>
                  )}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={observerTarget} className="h-10 flex items-center justify-center">
                  {loading && products.length > 0 && (
                    <div className="text-gray-500 text-sm">Loading more products...</div>
                  )}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
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
              {categories && categories.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No categories available</p>
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

// Product Card Skeleton Component
const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`} 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image_url || product.images?.[0] ? (
          <img
            src={product.image_url || product.images?.[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">🚴</div>';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-6xl">
            🚴
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow">
            ⭐ Featured
          </span>
        )}
        
        {/* Discount Badge */}
        {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            {Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)}% OFF
          </span>
        )}
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
        <div className="flex items-center gap-2 mb-2">
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
        {product.stock !== undefined && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 10 
                ? 'In Stock' 
                : product.stock > 0
                ? `Only ${product.stock} left`
                : 'Out of Stock'
              }
            </span>
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mt-2">
            Brand: <span className="font-medium">{product.brand}</span>
          </p>
        )}
      </div>
    </Link>
  );
};

export default ShopPage;
